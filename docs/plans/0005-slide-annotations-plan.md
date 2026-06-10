# Slide Annotations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a persistent annotation layer over each HTML slide so users can add, edit, hide, show, and restore annotations without modifying slide source files.

**Architecture:** Store annotation data as project-owned JSON in `Project.slides[].annotations`, with relative coordinates so annotations survive resizing and fullscreen. Render the slide iframe and a React-Konva overlay inside a shared slide viewport. Route all annotation changes through existing `updateProject` autosave behavior.

**Tech Stack:** Tauri 2, React 19, TypeScript, Vitest, `konva`, `react-konva`.

**Implementation Status:** Implemented in task `docs/tasks/0005-slide-annotations.md`. Verification evidence is recorded in the task file.

**Scope Amendment:** Annotation editing is intentionally limited to windowed presenter mode with app chrome visible. Project setup mode no longer exposes annotation controls, and fullscreen presenter mode remains presentation-only.

---

## Related Documents

- Task: `docs/tasks/0005-slide-annotations.md`
- Decision: `docs/decisions/0001-annotation-layer-boundary.md`
- Current model: `src/domain/project.ts`
- Current persistence bridge: `src/domain/projectStore.ts`
- Tauri persistence: `src-tauri/src/project_store.rs`
- Current presenter: `src/features/presenter/PresenterScreen.tsx`

## File Structure

- Modify: `package.json`
  - Add `konva` and `react-konva`.
- Modify: `src/domain/project.ts`
  - Replace the placeholder `AnnotationLayerRef` usage with first-version annotation data on each slide.
- Create: `src/domain/annotations.ts`
  - Own annotation constructors, relative coordinate helpers, update helpers, and type guards.
- Create: `src/domain/annotations.test.ts`
  - Verify IDs, defaults, coordinate conversion, and immutable updates.
- Modify: `src-tauri/src/project_store.rs`
  - Add Rust annotation structs with serde defaults so old project files still load.
- Create or extend: Rust tests in `src-tauri/src/project_store.rs`
  - Verify old projects without slide annotations deserialize.
- Create: `src/features/annotations/AnnotationLayer.tsx`
  - Render React-Konva stage and annotation objects.
- Create: `src/features/annotations/AnnotationLayer.test.tsx`
  - Component coverage with mocked `react-konva` primitives if jsdom cannot render canvas directly.
- Create: `src/features/annotations/AnnotationToolbar.tsx`
  - Controls for mode, visibility, object creation, colors, and delete.
- Create: `src/features/annotations/AnnotationToolbar.test.tsx`
  - Verify mode, visibility, add, color, and delete callbacks.
- Create: `src/components/SlideViewport.tsx`
  - Shared iframe plus overlay layout used by project preview and presenter.
- Modify: `src/features/project/ProjectScreen.tsx`
  - Add annotation toolbar and editing mode around the selected slide preview.
- Modify: `src/features/presenter/PresenterScreen.tsx`
  - Show annotations in view mode and expose a compact annotation mode toggle.
- Modify: `src/App.css`
  - Add viewport, toolbar, and annotation overlay styles.
- Modify: existing tests that render `Project`, `Slide`, `ProjectScreen`, or `PresenterScreen`:
  - `src/App.test.tsx`
  - `src/features/presenter/PresenterScreen.test.tsx` if that file is created by this plan.

## Data Model

Use relative values for coordinates and dimensions.

```ts
export type AnnotationColor =
  | "#fff59d"
  | "#d32f2f"
  | "#2e7d32"
  | "#1976d2"
  | "#f57c00";

export type AnnotationBase = {
  id: string;
  x: number;
  y: number;
  color: AnnotationColor;
};

export type StickyNoteAnnotation = AnnotationBase & {
  type: "sticky-note";
  width: number;
  height: number;
  text: string;
};

export type TextBoxAnnotation = AnnotationBase & {
  type: "text-box";
  width: number;
  height: number;
  text: string;
};

export type RectangleAnnotation = AnnotationBase & {
  type: "rectangle";
  width: number;
  height: number;
  fillColor: string;
};

export type ArrowAnnotation = AnnotationBase & {
  type: "arrow";
  endX: number;
  endY: number;
  strokeWidth: number;
};

export type SlideAnnotation =
  | StickyNoteAnnotation
  | TextBoxAnnotation
  | RectangleAnnotation
  | ArrowAnnotation;

export type Slide = {
  id: string;
  title: string;
  filePath: string;
  thumbnailPath?: string | null;
  missing?: boolean;
  annotations: SlideAnnotation[];
};
```

Keep `Project.annotations` only if existing migration compatibility requires it during implementation. New annotation data should live on `Slide.annotations`.

## Task 1: Install Dependencies And Add Annotation Types

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `src/domain/project.ts`
- Create: `src/domain/annotations.ts`
- Create: `src/domain/annotations.test.ts`

- [ ] **Step 1: Install Konva dependencies**

Run:

```bash
pnpm add konva react-konva
```

Expected: `package.json` and `pnpm-lock.yaml` include both packages.

- [ ] **Step 2: Write failing annotation constructor and coordinate tests**

Create `src/domain/annotations.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  createAnnotation,
  denormalizeBox,
  normalizeBox,
  updateSlideAnnotation,
} from "./annotations";
import type { Slide } from "./project";

describe("annotations", () => {
  it("creates sticky notes with relative defaults", () => {
    const annotation = createAnnotation("sticky-note", {
      id: "annotation-1",
      x: 0.25,
      y: 0.5,
      color: "#fff59d",
    });

    expect(annotation).toEqual({
      id: "annotation-1",
      type: "sticky-note",
      x: 0.25,
      y: 0.5,
      width: 0.2,
      height: 0.15,
      text: "New note",
      color: "#fff59d",
    });
  });

  it("normalizes and denormalizes boxes against the slide viewport", () => {
    expect(
      normalizeBox(
        { x: 192, y: 108, width: 384, height: 216 },
        { width: 1920, height: 1080 },
      ),
    ).toEqual({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 });

    expect(
      denormalizeBox(
        { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
        { width: 1920, height: 1080 },
      ),
    ).toEqual({ x: 192, y: 108, width: 384, height: 216 });
  });

  it("updates one annotation without mutating the slide", () => {
    const slide: Slide = {
      id: "slide-1",
      title: "Slide 1",
      filePath: "/tmp/slide.html",
      thumbnailPath: null,
      annotations: [
        createAnnotation("text-box", {
          id: "a1",
          x: 0.1,
          y: 0.2,
          color: "#1976d2",
        }),
      ],
    };

    const updated = updateSlideAnnotation(slide, {
      ...slide.annotations[0],
      x: 0.3,
    });

    expect(updated).not.toBe(slide);
    expect(updated.annotations[0].x).toBe(0.3);
    expect(slide.annotations[0].x).toBe(0.1);
  });
});
```

- [ ] **Step 3: Run the failing test**

Run:

```bash
pnpm vitest run src/domain/annotations.test.ts
```

Expected: fail because `src/domain/annotations.ts` does not exist.

- [ ] **Step 4: Add project annotation types**

Modify `src/domain/project.ts` so `Slide` owns annotations:

```ts
export type DisplaySettings = {
  mode: "embedded" | "fullscreen";
};

export type AnnotationColor =
  | "#fff59d"
  | "#d32f2f"
  | "#2e7d32"
  | "#1976d2"
  | "#f57c00";

export type AnnotationBase = {
  id: string;
  x: number;
  y: number;
  color: AnnotationColor;
};

export type StickyNoteAnnotation = AnnotationBase & {
  type: "sticky-note";
  width: number;
  height: number;
  text: string;
};

export type TextBoxAnnotation = AnnotationBase & {
  type: "text-box";
  width: number;
  height: number;
  text: string;
};

export type RectangleAnnotation = AnnotationBase & {
  type: "rectangle";
  width: number;
  height: number;
  fillColor: string;
};

export type ArrowAnnotation = AnnotationBase & {
  type: "arrow";
  endX: number;
  endY: number;
  strokeWidth: number;
};

export type SlideAnnotation =
  | StickyNoteAnnotation
  | TextBoxAnnotation
  | RectangleAnnotation
  | ArrowAnnotation;

export type Slide = {
  id: string;
  title: string;
  filePath: string;
  thumbnailPath?: string | null;
  missing?: boolean;
  annotations: SlideAnnotation[];
};

export type Project = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  slides: Slide[];
  displaySettings: DisplaySettings;
};

export type ProjectSummary = {
  id: string;
  title: string;
  slideCount: number;
  updatedAt: string;
  thumbnailPath?: string | null;
};
```

- [ ] **Step 5: Add annotation domain helpers**

Create `src/domain/annotations.ts`:

```ts
import type {
  AnnotationColor,
  Slide,
  SlideAnnotation,
} from "./project";

export type AnnotationKind = SlideAnnotation["type"];

export type ViewportSize = {
  width: number;
  height: number;
};

export type PixelBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RelativeBox = PixelBox;

type CreateAnnotationInput = {
  id: string;
  x: number;
  y: number;
  color: AnnotationColor;
};

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function round(value: number) {
  return Number(value.toFixed(4));
}

export function normalizeBox(box: PixelBox, viewport: ViewportSize): RelativeBox {
  return {
    x: round(clamp(box.x / viewport.width)),
    y: round(clamp(box.y / viewport.height)),
    width: round(clamp(box.width / viewport.width)),
    height: round(clamp(box.height / viewport.height)),
  };
}

export function denormalizeBox(
  box: RelativeBox,
  viewport: ViewportSize,
): PixelBox {
  return {
    x: Math.round(box.x * viewport.width),
    y: Math.round(box.y * viewport.height),
    width: Math.round(box.width * viewport.width),
    height: Math.round(box.height * viewport.height),
  };
}

export function createAnnotation(
  type: AnnotationKind,
  input: CreateAnnotationInput,
): SlideAnnotation {
  if (type === "arrow") {
    return {
      id: input.id,
      type,
      x: input.x,
      y: input.y,
      endX: clamp(input.x + 0.18),
      endY: input.y,
      strokeWidth: 4,
      color: input.color,
    };
  }

  if (type === "rectangle") {
    return {
      id: input.id,
      type,
      x: input.x,
      y: input.y,
      width: 0.2,
      height: 0.15,
      fillColor: "transparent",
      color: input.color,
    };
  }

  return {
    id: input.id,
    type,
    x: input.x,
    y: input.y,
    width: 0.2,
    height: 0.15,
    text: type === "sticky-note" ? "New note" : "New text",
    color: input.color,
  };
}

export function updateSlideAnnotation(
  slide: Slide,
  annotation: SlideAnnotation,
): Slide {
  return {
    ...slide,
    annotations: slide.annotations.map((candidate) =>
      candidate.id === annotation.id ? annotation : candidate,
    ),
  };
}

export function deleteSlideAnnotation(slide: Slide, annotationId: string): Slide {
  return {
    ...slide,
    annotations: slide.annotations.filter(
      (annotation) => annotation.id !== annotationId,
    ),
  };
}
```

- [ ] **Step 6: Update slide creation defaults**

Modify every `Slide` creation site to include `annotations: []`:

- `src/domain/projectStore.ts`
- `src-tauri/src/project_store.rs`
- affected tests and fixtures

For browser memory import in `src/domain/projectStore.ts`, slide creation should include:

```ts
{
  id: `${Date.now()}-${filePath}`,
  title: titleFromPath(filePath),
  filePath,
  thumbnailPath: null,
  missing: false,
  annotations: [],
}
```

- [ ] **Step 7: Verify Task 1**

Run:

```bash
pnpm vitest run src/domain/annotations.test.ts
pnpm build
```

Expected: both pass.

- [ ] **Step 8: Commit Task 1**

```bash
git add package.json pnpm-lock.yaml src/domain/project.ts src/domain/annotations.ts src/domain/annotations.test.ts src/domain/projectStore.ts src-tauri/src/project_store.rs
git commit -m "Add annotation domain model"
```

## Task 2: Persist Annotations In Tauri Projects

**Files:**
- Modify: `src-tauri/src/project_store.rs`
- Modify: `src/domain/projectStore.ts`
- Create or extend tests near persistence code.

- [ ] **Step 1: Write Rust deserialization test for older project files**

Add a test module case in `src-tauri/src/project_store.rs`:

```rust
#[test]
fn deserializes_project_without_slide_annotations() {
    let json = r#"{
      "id": "p1",
      "title": "Deck",
      "createdAt": "1",
      "updatedAt": "1",
      "slides": [
        {
          "id": "s1",
          "title": "Slide",
          "filePath": "/tmp/slide.html",
          "thumbnailPath": null
        }
      ],
      "displaySettings": { "mode": "embedded" }
    }"#;

    let project: Project = serde_json::from_str(json).expect("project parses");

    assert_eq!(project.slides[0].annotations.len(), 0);
}
```

- [ ] **Step 2: Run Rust test to verify it fails**

Run:

```bash
cargo test --manifest-path src-tauri/Cargo.toml deserializes_project_without_slide_annotations
```

Expected: fail because `Slide.annotations` is not yet defined with a default, or because types are missing.

- [ ] **Step 3: Add Rust annotation structs**

Modify `src-tauri/src/project_store.rs`:

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "type")]
pub enum SlideAnnotation {
    #[serde(rename = "sticky-note")]
    StickyNote {
        id: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        text: String,
        color: String,
    },
    #[serde(rename = "text-box")]
    TextBox {
        id: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        text: String,
        color: String,
    },
    #[serde(rename = "rectangle")]
    Rectangle {
        id: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        fill_color: String,
        color: String,
    },
    #[serde(rename = "arrow")]
    Arrow {
        id: String,
        x: f64,
        y: f64,
        end_x: f64,
        end_y: f64,
        stroke_width: f64,
        color: String,
    },
}
```

Update `Slide`:

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Slide {
    pub id: String,
    pub title: String,
    pub file_path: String,
    pub thumbnail_path: Option<String>,
    #[serde(default)]
    pub missing: bool,
    #[serde(default)]
    pub annotations: Vec<SlideAnnotation>,
}
```

Update `import_html_slides` to set:

```rust
annotations: Vec::new(),
```

- [ ] **Step 4: Remove or ignore old project-level annotation refs**

If `Project.annotations` still exists only as an extension point, make it backward-compatible and not required:

```rust
#[serde(default)]
pub annotations: Vec<AnnotationLayerRef>,
```

If the TypeScript model no longer exposes it, ensure old project JSON can still deserialize in Rust and then serialize without breaking the app.

- [ ] **Step 5: Verify Task 2**

Run:

```bash
cargo test --manifest-path src-tauri/Cargo.toml
pnpm build
```

Expected: both pass.

- [ ] **Step 6: Commit Task 2**

```bash
git add src-tauri/src/project_store.rs src/domain/projectStore.ts src/domain/project.ts
git commit -m "Persist slide annotations in project data"
```

## Task 3: Build The Shared Slide Viewport

**Files:**
- Create: `src/components/SlideViewport.tsx`
- Create: `src/components/SlideViewport.test.tsx`
- Modify: `src/App.css`
- Modify: `src/features/presenter/PresenterScreen.tsx`

- [ ] **Step 1: Write failing viewport render test**

Create `src/components/SlideViewport.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SlideViewport from "./SlideViewport";

describe("SlideViewport", () => {
  it("renders the iframe and overlay in the same named viewport", () => {
    render(
      <SlideViewport
        slideTitle="Slide 1"
        src="/slide.html"
        overlay={<div data-testid="annotation-overlay" />}
      />,
    );

    expect(screen.getByTitle("Slide 1")).toHaveClass("slide-frame");
    expect(screen.getByTestId("annotation-overlay")).toBeInTheDocument();
    expect(screen.getByLabelText("Slide viewport")).toHaveClass("slide-viewport");
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
pnpm vitest run src/components/SlideViewport.test.tsx
```

Expected: fail because `SlideViewport` does not exist.

- [ ] **Step 3: Implement shared viewport**

Create `src/components/SlideViewport.tsx`:

```tsx
import type { ReactNode } from "react";

type SlideViewportProps = {
  missing?: boolean;
  missingPath?: string;
  overlay?: ReactNode;
  slideTitle: string;
  src: string;
};

function SlideViewport({
  missing = false,
  missingPath,
  overlay,
  slideTitle,
  src,
}: SlideViewportProps) {
  return (
    <div aria-label="Slide viewport" className="slide-viewport">
      {missing ? (
        <div className="missing-slide">
          <h2>Slide file missing</h2>
          {missingPath && <p>{missingPath}</p>}
        </div>
      ) : src ? (
        <iframe className="slide-frame" src={src} title={slideTitle} />
      ) : (
        <div className="missing-slide">
          <h2>No slide selected</h2>
        </div>
      )}
      {overlay}
    </div>
  );
}

export default SlideViewport;
```

- [ ] **Step 4: Add viewport CSS**

Modify `src/App.css`:

```css
.slide-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #000;
}

.slide-viewport .slide-frame {
  position: absolute;
  inset: 0;
}
```

Keep existing `.slide-frame` sizing rules that make the iframe fill the stage.

- [ ] **Step 5: Use viewport in presenter**

In `src/features/presenter/PresenterScreen.tsx`, replace the inline iframe/missing block with:

```tsx
<SlideViewport
  missing={slide?.missing}
  missingPath={slide?.filePath}
  slideTitle={slide?.title ?? "No slide selected"}
  src={src}
/>
```

- [ ] **Step 6: Verify Task 3**

Run:

```bash
pnpm vitest run src/components/SlideViewport.test.tsx
pnpm test
pnpm build
```

Expected: all pass.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/components/SlideViewport.tsx src/components/SlideViewport.test.tsx src/features/presenter/PresenterScreen.tsx src/App.css
git commit -m "Add shared slide viewport"
```

## Task 4: Add Annotation Toolbar State And Controls

**Files:**
- Create: `src/features/annotations/AnnotationToolbar.tsx`
- Create: `src/features/annotations/AnnotationToolbar.test.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Write failing toolbar test**

Create `src/features/annotations/AnnotationToolbar.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AnnotationToolbar from "./AnnotationToolbar";

describe("AnnotationToolbar", () => {
  it("toggles annotation mode and visibility", () => {
    const onModeChange = vi.fn();
    const onVisibilityChange = vi.fn();

    render(
      <AnnotationToolbar
        color="#fff59d"
        mode="view"
        onAdd={vi.fn()}
        onColorChange={vi.fn()}
        onDeleteSelected={vi.fn()}
        onModeChange={onModeChange}
        onVisibilityChange={onVisibilityChange}
        selectedId={null}
        visible={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Annotate" }));
    fireEvent.click(screen.getByRole("switch", { name: "Show annotations" }));

    expect(onModeChange).toHaveBeenCalledWith("annotate");
    expect(onVisibilityChange).toHaveBeenCalledWith(false);
  });

  it("adds annotation objects and deletes the selected object", () => {
    const onAdd = vi.fn();
    const onDeleteSelected = vi.fn();

    render(
      <AnnotationToolbar
        color="#fff59d"
        mode="annotate"
        onAdd={onAdd}
        onColorChange={vi.fn()}
        onDeleteSelected={onDeleteSelected}
        onModeChange={vi.fn()}
        onVisibilityChange={vi.fn()}
        selectedId="a1"
        visible={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add sticky note" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete selected annotation" }));

    expect(onAdd).toHaveBeenCalledWith("sticky-note");
    expect(onDeleteSelected).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
pnpm vitest run src/features/annotations/AnnotationToolbar.test.tsx
```

Expected: fail because toolbar does not exist.

- [ ] **Step 3: Implement toolbar**

Create `src/features/annotations/AnnotationToolbar.tsx` with this public API:

```tsx
import type { AnnotationColor } from "../../domain/project";
import type { AnnotationKind } from "../../domain/annotations";
import Button from "../../components/Button";

export type AnnotationMode = "view" | "annotate";

type AnnotationToolbarProps = {
  color: AnnotationColor;
  mode: AnnotationMode;
  onAdd: (type: AnnotationKind) => void;
  onColorChange: (color: AnnotationColor) => void;
  onDeleteSelected: () => void;
  onModeChange: (mode: AnnotationMode) => void;
  onVisibilityChange: (visible: boolean) => void;
  selectedId: string | null;
  visible: boolean;
};

const colors: AnnotationColor[] = [
  "#fff59d",
  "#d32f2f",
  "#2e7d32",
  "#1976d2",
  "#f57c00",
];

function AnnotationToolbar(props: AnnotationToolbarProps) {
  return (
    <div className="annotation-toolbar">
      <Button
        onClick={() =>
          props.onModeChange(props.mode === "view" ? "annotate" : "view")
        }
        size="small"
        variant={props.mode === "annotate" ? "primary" : "secondary"}
      >
        Annotate
      </Button>
      <label className="annotation-toggle">
        <span>Show annotations</span>
        <input
          aria-label="Show annotations"
          checked={props.visible}
          onChange={(event) => props.onVisibilityChange(event.target.checked)}
          role="switch"
          type="checkbox"
        />
      </label>
      <Button onClick={() => props.onAdd("sticky-note")} size="small">
        Add sticky note
      </Button>
      <Button onClick={() => props.onAdd("text-box")} size="small">
        Add text box
      </Button>
      <Button onClick={() => props.onAdd("rectangle")} size="small">
        Add rectangle
      </Button>
      <Button onClick={() => props.onAdd("arrow")} size="small">
        Add arrow
      </Button>
      <div className="annotation-colors" aria-label="Annotation colors">
        {colors.map((color) => (
          <button
            aria-label={`Use color ${color}`}
            className={
              color === props.color
                ? "annotation-swatch annotation-swatch--active"
                : "annotation-swatch"
            }
            key={color}
            onClick={() => props.onColorChange(color)}
            style={{ backgroundColor: color }}
            type="button"
          />
        ))}
      </div>
      <Button
        disabled={!props.selectedId}
        onClick={props.onDeleteSelected}
        size="small"
      >
        Delete selected annotation
      </Button>
    </div>
  );
}

export default AnnotationToolbar;
```

- [ ] **Step 4: Add toolbar styles**

Add compact, utilitarian styles to `src/App.css`:

```css
.annotation-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.annotation-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-muted);
  font-size: 12px;
}

.annotation-colors {
  display: inline-flex;
  gap: 4px;
}

.annotation-swatch {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
}

.annotation-swatch--active {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

- [ ] **Step 5: Verify Task 4**

Run:

```bash
pnpm vitest run src/features/annotations/AnnotationToolbar.test.tsx
pnpm test
pnpm build
```

Expected: all pass.

- [ ] **Step 6: Commit Task 4**

```bash
git add src/features/annotations/AnnotationToolbar.tsx src/features/annotations/AnnotationToolbar.test.tsx src/App.css
git commit -m "Add annotation toolbar controls"
```

## Task 5: Render Read-Only Annotation Layer

**Files:**
- Create: `src/features/annotations/AnnotationLayer.tsx`
- Create: `src/features/annotations/AnnotationLayer.test.tsx`
- Modify: `src/features/presenter/PresenterScreen.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Mock react-konva for component tests**

In `src/features/annotations/AnnotationLayer.test.tsx`, mock Konva primitives as simple React components:

```tsx
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { SlideAnnotation } from "../../domain/project";
import AnnotationLayer from "./AnnotationLayer";

vi.mock("react-konva", () => {
  const Node = ({
    children,
    name,
  }: {
    children?: ReactNode;
    name?: string;
  }) => <div data-testid={name}>{children}</div>;

  return {
    Stage: Node,
    Layer: Node,
    Rect: Node,
    Text: Node,
    Arrow: Node,
    Group: Node,
    Circle: Node,
    Transformer: Node,
  };
});

describe("AnnotationLayer", () => {
  it("renders saved annotations when visible", () => {
    const annotations: SlideAnnotation[] = [
      {
        id: "note-1",
        type: "sticky-note",
        x: 0.1,
        y: 0.1,
        width: 0.2,
        height: 0.15,
        text: "Update this",
        color: "#fff59d",
      },
    ];

    render(
      <AnnotationLayer
        annotations={annotations}
        mode="view"
        onChange={vi.fn()}
        onSelect={vi.fn()}
        selectedId={null}
        size={{ width: 1000, height: 500 }}
        visible={true}
      />,
    );

    expect(screen.getByText("Update this")).toBeInTheDocument();
  });

  it("hides annotations without deleting them", () => {
    render(
      <AnnotationLayer
        annotations={[]}
        mode="view"
        onChange={vi.fn()}
        onSelect={vi.fn()}
        selectedId={null}
        size={{ width: 1000, height: 500 }}
        visible={false}
      />,
    );

    expect(screen.queryByTestId("annotation-stage")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
pnpm vitest run src/features/annotations/AnnotationLayer.test.tsx
```

Expected: fail because `AnnotationLayer` does not exist.

- [ ] **Step 3: Implement read-only layer**

Create `src/features/annotations/AnnotationLayer.tsx`:

```tsx
import { Arrow, Group, Layer, Rect, Stage, Text } from "react-konva";

import type { SlideAnnotation } from "../../domain/project";
import type { AnnotationMode } from "./AnnotationToolbar";

type AnnotationLayerProps = {
  annotations: SlideAnnotation[];
  mode: AnnotationMode;
  onChange: (annotation: SlideAnnotation) => void;
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  size: { width: number; height: number };
  visible: boolean;
};

function px(value: number, total: number) {
  return value * total;
}

function AnnotationLayer({
  annotations,
  mode,
  onSelect,
  size,
  visible,
}: AnnotationLayerProps) {
  if (!visible || size.width <= 0 || size.height <= 0) {
    return null;
  }

  const editable = mode === "annotate";

  return (
    <Stage
      className="annotation-stage"
      data-testid="annotation-stage"
      height={size.height}
      name="annotation-stage"
      width={size.width}
    >
      <Layer>
        {annotations.map((annotation) => {
          if (annotation.type === "arrow") {
            return (
              <Arrow
                draggable={editable}
                fill={annotation.color}
                key={annotation.id}
                onClick={() => onSelect(annotation.id)}
                points={[
                  px(annotation.x, size.width),
                  px(annotation.y, size.height),
                  px(annotation.endX, size.width),
                  px(annotation.endY, size.height),
                ]}
                pointerLength={12}
                pointerWidth={12}
                stroke={annotation.color}
                strokeWidth={annotation.strokeWidth}
              />
            );
          }

          const x = px(annotation.x, size.width);
          const y = px(annotation.y, size.height);
          const width = px(annotation.width, size.width);
          const height = px(annotation.height, size.height);

          if (annotation.type === "rectangle") {
            return (
              <Rect
                draggable={editable}
                fill={annotation.fillColor}
                height={height}
                key={annotation.id}
                onClick={() => onSelect(annotation.id)}
                stroke={annotation.color}
                strokeWidth={3}
                width={width}
                x={x}
                y={y}
              />
            );
          }

          return (
            <Group
              draggable={editable}
              key={annotation.id}
              onClick={() => onSelect(annotation.id)}
              x={x}
              y={y}
            >
              {annotation.type === "sticky-note" && (
                <Rect
                  fill={annotation.color}
                  height={height}
                  shadowBlur={8}
                  width={width}
                />
              )}
              <Text
                fill={annotation.type === "text-box" ? annotation.color : "#1f2933"}
                fontSize={18}
                padding={10}
                text={annotation.text}
                width={width}
              />
            </Group>
          );
        })}
      </Layer>
    </Stage>
  );
}

export default AnnotationLayer;
```

- [ ] **Step 4: Add overlay CSS**

Add to `src/App.css`:

```css
.annotation-stage {
  position: absolute;
  inset: 0;
  z-index: 5;
}
```

- [ ] **Step 5: Verify Task 5**

Run:

```bash
pnpm vitest run src/features/annotations/AnnotationLayer.test.tsx
pnpm test
pnpm build
```

Expected: all pass.

- [ ] **Step 6: Commit Task 5**

```bash
git add src/features/annotations/AnnotationLayer.tsx src/features/annotations/AnnotationLayer.test.tsx src/App.css
git commit -m "Render slide annotations overlay"
```

## Task 6: Wire Annotation State Into Project And Presenter Screens

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/project/ProjectScreen.tsx`
- Modify: `src/features/presenter/PresenterScreen.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add project update helper**

In `src/App.tsx`, add a helper that updates the selected slide and autosaves via existing `handleProjectChange`:

```ts
function handleSlideChange(slideIndex: number, slide: Slide) {
  if (!activeProject) {
    return;
  }

  const slides = activeProject.slides.map((candidate, index) =>
    index === slideIndex ? slide : candidate,
  );

  void handleProjectChange({ ...activeProject, slides });
}
```

Import `Slide` from `src/domain/project.ts`.

- [ ] **Step 2: Pass slide change callback to screens**

Update `ProjectScreen` props:

```ts
onSlideChange: (slideIndex: number, slide: Slide) => void;
```

Update `PresenterScreen` props:

```ts
onSlideChange: (slideIndex: number, slide: Slide) => void;
```

Pass `handleSlideChange` from `App.tsx` to both screens.

- [ ] **Step 3: Add state for annotation mode and visibility**

In `ProjectScreen.tsx` and `PresenterScreen.tsx`, add:

```ts
const [annotationMode, setAnnotationMode] = useState<AnnotationMode>("view");
const [annotationsVisible, setAnnotationsVisible] = useState(true);
const [annotationColor, setAnnotationColor] =
  useState<AnnotationColor>("#fff59d");
const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(
  null,
);
```

- [ ] **Step 4: Add selected slide preview to project screen**

Render a preview area above or beside `SlideGrid` for the selected slide, using `SlideViewport`, `AnnotationToolbar`, and `AnnotationLayer`. Use existing app density and avoid creating nested cards.

Use:

```tsx
const selectedSlide = project.slides[selectedIndex];
```

Then render only when a slide exists.

- [ ] **Step 5: Add annotation overlay in presenter**

In `PresenterScreen`, wrap the current slide iframe with `SlideViewport` and pass `AnnotationLayer` as `overlay`.

Keep normal presentation navigation intact. In annotate mode, stop stage/overlay interactions from advancing slides.

- [ ] **Step 6: Verify Task 6**

Run:

```bash
pnpm test
pnpm build
```

Expected: all pass.

- [ ] **Step 7: Commit Task 6**

```bash
git add src/App.tsx src/features/project/ProjectScreen.tsx src/features/presenter/PresenterScreen.tsx src/App.css
git commit -m "Wire annotations into slide screens"
```

## Task 7: Implement Create, Move, Resize, Recolor, Delete

**Files:**
- Modify: `src/features/annotations/AnnotationLayer.tsx`
- Modify: `src/features/project/ProjectScreen.tsx`
- Modify: `src/features/presenter/PresenterScreen.tsx`
- Modify: `src/domain/annotations.ts`
- Modify: `src/domain/annotations.test.ts`

- [ ] **Step 1: Add tests for deletion and recolor helpers**

Extend `src/domain/annotations.test.ts` with:

```ts
import {
  deleteSlideAnnotation,
  recolorSlideAnnotation,
} from "./annotations";

it("deletes annotations immutably", () => {
  const slide: Slide = {
    id: "slide-1",
    title: "Slide 1",
    filePath: "/tmp/slide.html",
    thumbnailPath: null,
    annotations: [
      createAnnotation("rectangle", {
        id: "a1",
        x: 0.1,
        y: 0.1,
        color: "#d32f2f",
      }),
    ],
  };

  expect(deleteSlideAnnotation(slide, "a1").annotations).toEqual([]);
  expect(slide.annotations).toHaveLength(1);
});

it("recolors the selected annotation", () => {
  const slide: Slide = {
    id: "slide-1",
    title: "Slide 1",
    filePath: "/tmp/slide.html",
    thumbnailPath: null,
    annotations: [
      createAnnotation("text-box", {
        id: "a1",
        x: 0.1,
        y: 0.1,
        color: "#1976d2",
      }),
    ],
  };

  const updated = recolorSlideAnnotation(slide, "a1", "#f57c00");

  expect(updated.annotations[0].color).toBe("#f57c00");
});
```

- [ ] **Step 2: Implement helper**

Add to `src/domain/annotations.ts`:

```ts
export function recolorSlideAnnotation(
  slide: Slide,
  annotationId: string,
  color: AnnotationColor,
): Slide {
  return {
    ...slide,
    annotations: slide.annotations.map((annotation) =>
      annotation.id === annotationId ? { ...annotation, color } : annotation,
    ),
  };
}
```

- [ ] **Step 3: Add create flow**

In screens using `AnnotationToolbar`, implement:

```ts
function handleAddAnnotation(type: AnnotationKind) {
  if (!selectedSlide) {
    return;
  }

  const annotation = createAnnotation(type, {
    id: crypto.randomUUID(),
    x: 0.15,
    y: 0.15,
    color: annotationColor,
  });

  onSlideChange(selectedIndex, {
    ...selectedSlide,
    annotations: [...selectedSlide.annotations, annotation],
  });
  setSelectedAnnotationId(annotation.id);
}
```

- [ ] **Step 4: Add delete flow**

In screens:

```ts
function handleDeleteSelectedAnnotation() {
  if (!selectedSlide || !selectedAnnotationId) {
    return;
  }

  onSlideChange(
    selectedIndex,
    deleteSlideAnnotation(selectedSlide, selectedAnnotationId),
  );
  setSelectedAnnotationId(null);
}
```

- [ ] **Step 5: Add recolor flow**

In screens:

```ts
function handleAnnotationColorChange(color: AnnotationColor) {
  setAnnotationColor(color);
  if (selectedSlide && selectedAnnotationId) {
    onSlideChange(
      selectedIndex,
      recolorSlideAnnotation(selectedSlide, selectedAnnotationId, color),
    );
  }
}
```

- [ ] **Step 6: Add drag and transform updates**

In `AnnotationLayer.tsx`, use Konva drag end and transform end handlers to emit updated relative coordinates through `onChange(annotation)`.

For sticky notes, text boxes, and rectangles:

```tsx
onDragEnd={(event) => {
  onChange({
    ...annotation,
    x: event.target.x() / size.width,
    y: event.target.y() / size.height,
  });
}}
```

Use `Transformer rotateEnabled={false}` for selected non-arrow objects.

- [ ] **Step 7: Add arrow endpoint handles**

For selected arrows, render two draggable `Circle` handles. On drag end, update `x/y` or `endX/endY` respectively.

Use relative conversion:

```ts
x: event.target.x() / size.width,
y: event.target.y() / size.height,
```

- [ ] **Step 8: Verify Task 7**

Run:

```bash
pnpm vitest run src/domain/annotations.test.ts src/features/annotations/AnnotationLayer.test.tsx
pnpm test
pnpm build
```

Expected: all pass.

- [ ] **Step 9: Commit Task 7**

```bash
git add src/domain/annotations.ts src/domain/annotations.test.ts src/features/annotations/AnnotationLayer.tsx src/features/project/ProjectScreen.tsx src/features/presenter/PresenterScreen.tsx
git commit -m "Enable annotation editing"
```

## Task 8: Autosave And Reopen Verification

**Files:**
- Modify: `src/App.test.tsx`
- Create: `src/domain/projectAnnotations.test.ts`
- Modify: `docs/tasks/0005-slide-annotations.md`

- [ ] **Step 1: Add integration-style test for project annotation persistence path**

Create `src/domain/projectAnnotations.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  createAnnotation,
  updateSlideAnnotation,
} from "./annotations";
import type { Project } from "./project";

function updateProjectSlide(
  project: Project,
  slideIndex: number,
  updater: (slide: Project["slides"][number]) => Project["slides"][number],
): Project {
  return {
    ...project,
    slides: project.slides.map((slide, index) =>
      index === slideIndex ? updater(slide) : slide,
    ),
  };
}

describe("project annotations", () => {
  it("stores annotations on the selected slide only", () => {
    const project: Project = {
      id: "project-1",
      title: "Deck",
      createdAt: "1",
      updatedAt: "1",
      displaySettings: { mode: "embedded" },
      slides: [
        {
          id: "slide-1",
          title: "Slide 1",
          filePath: "/tmp/1.html",
          thumbnailPath: null,
          annotations: [],
        },
        {
          id: "slide-2",
          title: "Slide 2",
          filePath: "/tmp/2.html",
          thumbnailPath: null,
          annotations: [],
        },
      ],
    };

    const annotation = createAnnotation("sticky-note", {
      id: "a1",
      x: 0.15,
      y: 0.25,
      color: "#fff59d",
    });

    const updated = updateProjectSlide(project, 1, (slide) =>
      updateSlideAnnotation(
        { ...slide, annotations: [annotation] },
        { ...annotation, text: "Persist me" },
      ),
    );

    expect(updated.slides[0].annotations).toEqual([]);
    expect(updated.slides[1].annotations).toHaveLength(1);
    expect(updated.slides[1].annotations[0]).toMatchObject({
      id: "a1",
      text: "Persist me",
    });
  });
});
```

Run:

```bash
pnpm vitest run src/domain/projectAnnotations.test.ts
```

Expected: pass after Tasks 1-7 are complete.

- [ ] **Step 2: Manually verify local browser preview**

Run:

```bash
pnpm dev
```

Verify:

- Create a project.
- Add slides.
- Select a slide.
- Add each annotation type.
- Hide annotations.
- Show annotations.
- Move and resize annotations.
- Delete an annotation.

- [ ] **Step 3: Manually verify Tauri persistence**

Run:

```bash
pnpm tauri dev
```

Verify:

- Create or open a project.
- Add annotations to at least two slides.
- Close the app.
- Reopen the app.
- Reopen the project.
- Confirm annotations are restored on the correct slides.
- Confirm source HTML files were not modified.

- [ ] **Step 4: Run full verification**

Run:

```bash
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

Expected: all pass.

- [ ] **Step 5: Update task status**

Modify `docs/tasks/0005-slide-annotations.md`:

```md
## Status

Implemented.
```

Add a short implementation summary and verification evidence.

- [ ] **Step 6: Commit Task 8**

```bash
git add src docs
git commit -m "Verify persistent slide annotations"
```

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

- All commands pass.
- Working tree is clean except for intentionally uncommitted release/version work.
- Annotations can be created, edited, hidden, shown, persisted, and restored.
- HTML slide files remain unchanged.

## Release Follow-Up

After implementation is merged to `master`:

1. Bump app version.
2. Push `master`.
3. Tag a new release.
4. Let GitHub Actions build Windows artifacts.
