# Windows Slide Reordering Drag And Drop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make slide reordering reliable on Windows by replacing fragile native HTML5 drag/drop behavior with explicit pointer-based slide reorder controls.

**Architecture:** Extract reorder calculations into a small domain helper, then use pointer events on dedicated drag handles in `SlideList` and `SlideGrid`. Keep `ProjectScreen` as the owner of slide order mutation and persistence through the existing `onProjectChange(updateProject)` flow.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Tauri WebView2 on Windows.

---

## Related Documents

- Task: `docs/tasks/0007-slide-reordering-windows.md`
- Current list UI: `src/features/project/SlideList.tsx`
- Current grid UI: `src/features/project/SlideGrid.tsx`
- Current reorder owner: `src/features/project/ProjectScreen.tsx`

## Root Cause Hypothesis

The current reordering uses native HTML5 drag/drop on `<button draggable>`. That can be unreliable in Windows WebView2, especially with interactive descendants, buttons as drag sources, and `dataTransfer` behavior. A pointer-based implementation avoids `dataTransfer` and makes list/grid behavior consistent across platforms.

## File Structure

- Create: `src/domain/reorder.ts`
  - Own `moveItem` and `reorderByPointerTarget` helpers.
- Create: `src/domain/reorder.test.ts`
  - Unit tests for moving up, down, first, last, same index, and invalid indexes.
- Modify: `src/features/project/ProjectScreen.tsx`
  - Replace local `moveSlide` with domain helper and preserve selected slide.
- Create: `src/features/project/usePointerReorder.ts`
  - Shared pointer reorder hook for list and grid.
- Create: `src/features/project/usePointerReorder.test.tsx`
  - Hook/component harness tests for start, enter target, end, and cancel.
- Modify: `src/features/project/SlideList.tsx`
  - Remove HTML5 drag/drop, add dedicated pointer drag handle.
- Modify: `src/features/project/SlideGrid.tsx`
  - Remove HTML5 drag/drop, add dedicated pointer drag handle.
- Modify: `src/App.css`
  - Add dragging/drop-target visual states and touch-action/cursor styles.
- Modify: `docs/tasks/0007-slide-reordering-windows.md`
  - Link this plan and update status when implemented.

## Subtask Strategy

Use one worker subagent for the implementation because the write scope is cohesive:

- Worker owns `src/domain/reorder.ts`, `src/domain/reorder.test.ts`, `src/features/project/usePointerReorder.ts`, `src/features/project/usePointerReorder.test.tsx`, `SlideList.tsx`, `SlideGrid.tsx`, `ProjectScreen.tsx`, and related CSS.
- Main agent reviews diff, runs verification, fixes integration issues, updates task status, commits, and pushes.
- The worker must not touch annotation or fullscreen task documents.

## Task 1: Add Reorder Domain Helper

**Files:**
- Create: `src/domain/reorder.ts`
- Create: `src/domain/reorder.test.ts`
- Modify: `src/features/project/ProjectScreen.tsx`

- [ ] **Step 1: Write failing helper tests**

Create `src/domain/reorder.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { moveItem, selectedIndexAfterMove } from "./reorder";

describe("moveItem", () => {
  const slides = ["a", "b", "c", "d"];

  it("moves an item down", () => {
    expect(moveItem(slides, 1, 3)).toEqual(["a", "c", "d", "b"]);
  });

  it("moves an item up", () => {
    expect(moveItem(slides, 3, 1)).toEqual(["a", "d", "b", "c"]);
  });

  it("keeps the list unchanged for same index and invalid indexes", () => {
    expect(moveItem(slides, 2, 2)).toEqual(slides);
    expect(moveItem(slides, -1, 2)).toEqual(slides);
    expect(moveItem(slides, 1, 99)).toEqual(slides);
  });
});

describe("selectedIndexAfterMove", () => {
  it("keeps the moved slide selected", () => {
    expect(selectedIndexAfterMove(1, 1, 3)).toBe(3);
  });

  it("shifts selection when another slide moves across it", () => {
    expect(selectedIndexAfterMove(2, 0, 3)).toBe(1);
    expect(selectedIndexAfterMove(1, 3, 0)).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run src/domain/reorder.test.ts
```

Expected: fail because `src/domain/reorder.ts` does not exist.

- [ ] **Step 3: Implement helper**

Create `src/domain/reorder.ts`:

```ts
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item === undefined) {
    return items;
  }
  next.splice(to, 0, item);
  return next;
}

export function selectedIndexAfterMove(
  selectedIndex: number,
  from: number,
  to: number,
) {
  if (from === to) {
    return selectedIndex;
  }
  if (selectedIndex === from) {
    return to;
  }
  if (from < selectedIndex && to >= selectedIndex) {
    return selectedIndex - 1;
  }
  if (from > selectedIndex && to <= selectedIndex) {
    return selectedIndex + 1;
  }
  return selectedIndex;
}
```

- [ ] **Step 4: Use helper in ProjectScreen**

Replace local `moveSlide` in `src/features/project/ProjectScreen.tsx` with `moveItem`.

```ts
import { moveItem } from "../../domain/reorder";
```

Then:

```ts
function moveSlide(project: Project, from: number, to: number) {
  const slides = moveItem(project.slides, from, to);
  return slides === project.slides ? project : { ...project, slides };
}
```

- [ ] **Step 5: Verify Task 1**

```bash
pnpm vitest run src/domain/reorder.test.ts
pnpm test
pnpm build
```

Expected: all pass.

## Task 2: Add Shared Pointer Reorder Hook

**Files:**
- Create: `src/features/project/usePointerReorder.ts`
- Create: `src/features/project/usePointerReorder.test.tsx`

- [ ] **Step 1: Write failing hook test**

Create `src/features/project/usePointerReorder.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePointerReorder } from "./usePointerReorder";

function Harness({ onReorder = vi.fn() }: { onReorder?: (from: number, to: number) => void }) {
  const reorder = usePointerReorder({ itemCount: 3, onReorder });

  return (
    <div>
      {[0, 1, 2].map((index) => (
        <div
          data-dragging={reorder.draggingIndex === index}
          data-over={reorder.overIndex === index}
          key={index}
          onPointerEnter={() => reorder.handlePointerEnter(index)}
        >
          <button
            aria-label={`Drag slide ${index + 1}`}
            onPointerCancel={reorder.handlePointerCancel}
            onPointerDown={(event) => reorder.handlePointerDown(event, index)}
            onPointerUp={reorder.handlePointerUp}
            type="button"
          />
        </div>
      ))}
    </div>
  );
}

describe("usePointerReorder", () => {
  it("reorders from the started index to the entered index on pointer up", () => {
    const onReorder = vi.fn();
    render(<Harness onReorder={onReorder} />);

    fireEvent.pointerDown(screen.getByLabelText("Drag slide 1"), {
      pointerId: 1,
    });
    fireEvent.pointerEnter(screen.getByLabelText("Drag slide 3").parentElement!);
    fireEvent.pointerUp(screen.getByLabelText("Drag slide 1"));

    expect(onReorder).toHaveBeenCalledWith(0, 2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run src/features/project/usePointerReorder.test.tsx
```

Expected: fail because the hook does not exist.

- [ ] **Step 3: Implement hook**

Create `src/features/project/usePointerReorder.ts`:

```ts
import { useState, type PointerEvent } from "react";

type UsePointerReorderInput = {
  itemCount: number;
  onReorder: (from: number, to: number) => void;
};

export function usePointerReorder({
  itemCount,
  onReorder,
}: UsePointerReorderInput) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function reset() {
    setDraggingIndex(null);
    setOverIndex(null);
  }

  function handlePointerDown(
    event: PointerEvent<HTMLElement>,
    index: number,
  ) {
    if (index < 0 || index >= itemCount) {
      return;
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    setDraggingIndex(index);
    setOverIndex(index);
  }

  function handlePointerEnter(index: number) {
    if (draggingIndex === null || index < 0 || index >= itemCount) {
      return;
    }
    setOverIndex(index);
  }

  function handlePointerUp() {
    if (
      draggingIndex !== null &&
      overIndex !== null &&
      draggingIndex !== overIndex
    ) {
      onReorder(draggingIndex, overIndex);
    }
    reset();
  }

  return {
    draggingIndex,
    overIndex,
    handlePointerCancel: reset,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
  };
}
```

- [ ] **Step 4: Verify Task 2**

```bash
pnpm vitest run src/features/project/usePointerReorder.test.tsx
pnpm test
pnpm build
```

Expected: all pass.

## Task 3: Replace SlideList HTML5 Drag/Drop

**Files:**
- Modify: `src/features/project/SlideList.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Update SlideList to use pointer handle**

Replace `draggable`, `onDragStart`, `onDragOver`, and `onDrop` with `usePointerReorder`.

Use this structure:

```tsx
const reorder = usePointerReorder({
  itemCount: slides.length,
  onReorder,
});
```

For each list item:

```tsx
const dragging = reorder.draggingIndex === index;
const over = reorder.overIndex === index && reorder.draggingIndex !== null;
```

Add classes:

```ts
[
  "slide-list-item",
  selectedIndex === index ? "slide-list-item--active" : "",
  dragging ? "slide-list-item--dragging" : "",
  over ? "slide-list-item--drop-target" : "",
]
```

Make the handle a real button:

```tsx
<button
  aria-label={`Drag slide ${index + 1}`}
  className="drag-handle"
  onClick={(event) => event.stopPropagation()}
  onPointerCancel={reorder.handlePointerCancel}
  onPointerDown={(event) => reorder.handlePointerDown(event, index)}
  onPointerUp={reorder.handlePointerUp}
  type="button"
>
  ::
</button>
```

Put `onPointerEnter={() => reorder.handlePointerEnter(index)}` on the slide list item.

- [ ] **Step 2: Add list drag CSS**

Update `src/App.css`:

```css
.drag-handle {
  width: 20px;
  height: 24px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-dim);
  cursor: grab;
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.slide-list-item--dragging {
  opacity: 0.55;
}

.slide-list-item--drop-target {
  outline: 1px solid var(--color-accent);
  outline-offset: -1px;
  background: var(--color-accent-dim);
}
```

- [ ] **Step 3: Verify Task 3**

```bash
pnpm test
pnpm build
```

Expected: all pass.

## Task 4: Replace SlideGrid HTML5 Drag/Drop

**Files:**
- Modify: `src/features/project/SlideGrid.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Update SlideGrid to use pointer handle**

Use the same `usePointerReorder` hook in `SlideGrid`.

Remove:

- `draggable`
- `onDragStart`
- `onDragOver`
- `onDrop`

Add a small handle inside each grid item:

```tsx
<button
  aria-label={`Drag slide ${index + 1}`}
  className="slide-grid-drag-handle"
  onClick={(event) => event.stopPropagation()}
  onPointerCancel={reorder.handlePointerCancel}
  onPointerDown={(event) => reorder.handlePointerDown(event, index)}
  onPointerUp={reorder.handlePointerUp}
  type="button"
>
  ::
</button>
```

Add `onPointerEnter={() => reorder.handlePointerEnter(index)}` to the grid item.

- [ ] **Step 2: Add grid drag CSS**

Update `src/App.css`:

```css
.slide-grid-item {
  position: relative;
}

.slide-grid-drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  background: rgba(8, 8, 11, 0.76);
  color: var(--color-muted);
  cursor: grab;
  touch-action: none;
}

.slide-grid-item--dragging {
  opacity: 0.55;
}

.slide-grid-item--drop-target .slide-thumbnail {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}
```

- [ ] **Step 3: Verify Task 4**

```bash
pnpm test
pnpm build
```

Expected: all pass.

## Task 5: Preserve Selection And Persistence

**Files:**
- Modify: `src/features/project/ProjectScreen.tsx`
- Modify: `src/domain/reorder.test.ts`

- [ ] **Step 1: Update selected slide after reorder**

In `ProjectScreen`, after `onProjectChange(moveSlide(...))`, also call:

```ts
onSelectSlide(selectedIndexAfterMove(selectedIndex, from, to));
```

Import:

```ts
import { moveItem, selectedIndexAfterMove } from "../../domain/reorder";
```

- [ ] **Step 2: Verify project persistence path**

The current `handleProjectChange` in `App.tsx` already calls `updateProject(project)`. No new persistence API is needed. Confirm `ProjectScreen` still calls `onProjectChange` with the reordered `slides` array.

- [ ] **Step 3: Run full local verification**

```bash
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

Expected: all pass.

## Task 6: Manual Windows Verification

**Files:**
- Modify: `docs/tasks/0007-slide-reordering-windows.md`

- [ ] **Step 1: Run Tauri app on Windows**

Use the Windows build or `pnpm tauri dev` on Windows.

- [ ] **Step 2: Verify list reordering**

Use a project with at least five slides.

Check:

- Move slide 1 to position 3.
- Move last slide to position 1.
- Move a middle slide one position up.
- Cancel a drag by releasing without entering another item.

- [ ] **Step 3: Verify grid reordering**

Repeat the same cases in the grid.

- [ ] **Step 4: Verify persistence**

Close and reopen the project. Confirm the reordered slide sequence remains.

- [ ] **Step 5: Update task status**

In `docs/tasks/0007-slide-reordering-windows.md`, update:

```md
## Status

Implemented.
```

Add an implementation summary and the commands/manual checks that passed.

## Final Verification

Before claiming completion:

```bash
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
git status --short --branch
```

Expected:

- Tests pass.
- Build passes.
- Rust check and tests pass.
- Working tree contains only intentional docs or release changes.

## Commit Plan

Use small commits:

```bash
git add src/domain/reorder.ts src/domain/reorder.test.ts src/features/project/ProjectScreen.tsx
git commit -m "Add slide reorder helpers"

git add src/features/project/usePointerReorder.ts src/features/project/usePointerReorder.test.tsx src/features/project/SlideList.tsx src/features/project/SlideGrid.tsx src/App.css
git commit -m "Fix slide reordering with pointer drag handles"

git add docs/tasks/0007-slide-reordering-windows.md
git commit -m "Document slide reordering verification"
```
