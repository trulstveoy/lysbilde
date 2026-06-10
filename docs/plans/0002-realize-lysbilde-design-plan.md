# Realize Lysbilde Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Evolve the current minimal Tauri baseline into the phase 1 Lysbilde app described by the design package: an HTML-slide presentation organizer and presenter.

**Architecture:** Build the product in vertical slices. Start with a branded desktop shell and local HTML-file opening, then add project persistence, multi-slide import, presentation navigation, organizer UI, and finally robustness. Keep the React UI modular, keep Tauri filesystem and dialog access behind a small service boundary, and store project metadata separately from source HTML files so originals are never modified.

**Tech Stack:** Tauri 2, Rust, React, TypeScript, Vite, pnpm, CSS modules/plain CSS, Tauri dialog/window/filesystem APIs, serde/serde_json for local project metadata.

---

## Source Material

- `docs/design/phase 1/specification.md`
- `docs/design/phase 1/HANDOFF.md`
- `docs/design/phase 1/Lysbilde Prototype.html`
- `docs/design/phase 1/Lysbilde Design.html`

## Product Decisions To Preserve

- Lysbilde presents existing HTML slides; it does not edit slide source files.
- Original HTML files are never modified.
- Slide order, project metadata, thumbnails, display settings, and future annotations are Lysbilde project data.
- Dark mode is the primary and only designed theme for phase 1.
- The UI should use system fonts and a macOS-inspired custom titlebar.
- Fullscreen presentation is the primary presentation mode; embedded presentation is for review and testing.
- Thumbnails are cache data and can be regenerated.

## Target File Structure

- Modify: `package.json` - add Tauri plugins, test tooling, and scripts as needed.
- Modify: `src-tauri/Cargo.toml` - add Rust dependencies and Tauri plugins.
- Modify: `src-tauri/tauri.conf.json` - configure window chrome, security, and plugin capabilities.
- Modify: `src-tauri/capabilities/default.json` - grant only the dialog, filesystem, and window permissions the app uses.
- Modify: `src-tauri/src/lib.rs` - register commands and plugins.
- Create: `src-tauri/src/project_store.rs` - Rust project persistence, filesystem validation, and JSON serialization.
- Create: `src-tauri/src/html_metadata.rs` - HTML title extraction and file metadata helpers.
- Replace: `src/App.tsx` - top-level app composition and route/state wiring.
- Replace: `src/App.css` - global reset and app-level layout.
- Create: `src/domain/project.ts` - TypeScript domain types for projects and slides.
- Create: `src/domain/projectStore.ts` - frontend interface to Tauri commands.
- Create: `src/domain/presenter.ts` - navigation helpers for slide decks.
- Create: `src/styles/tokens.css` - design tokens from the handoff.
- Create: `src/components/TitleBar.tsx` - custom titlebar and navigation affordances.
- Create: `src/components/Button.tsx` - shared button variants.
- Create: `src/components/Modal.tsx` - shared modal shell.
- Create: `src/components/SlideThumbnail.tsx` - placeholder thumbnail and cached thumbnail rendering.
- Create: `src/features/home/HomeScreen.tsx` - project overview and new-project entry.
- Create: `src/features/project/ProjectScreen.tsx` - slide organizer, side list, and import actions.
- Create: `src/features/project/SlideGrid.tsx` - drag-and-drop thumbnail grid.
- Create: `src/features/project/SlideList.tsx` - drag-and-drop side list.
- Create: `src/features/presenter/PresenterScreen.tsx` - embedded/fullscreen presentation UI and navigation.
- Create: `src/features/import/ImportModal.tsx` - HTML file import flow.
- Create: `src/features/project/NewProjectModal.tsx` - project creation flow.
- Create: `src/test/` - focused unit tests for domain logic and React components.

## Implementation Strategy

The design should be realized in five deliverable phases. Each phase should be usable and independently verifiable.

1. **App shell and single-file presentation:** replace Hello World with the branded shell, open one local HTML file, and show it in the presenter.
2. **Project persistence and import:** create projects, import multiple HTML files, save metadata locally, and reload projects on startup.
3. **Presentation navigation:** navigate through imported slides with keyboard, mouse zones, dots, buttons, and fullscreen state.
4. **Organizer and home experience:** implement the home grid, project cards, slide grid/list, drag-and-drop reordering, and design states.
5. **Robustness and follow-up foundations:** handle missing files, regenerate thumbnails, document security decisions, and leave a clean seam for annotations.

## Task 1: Establish Design Tokens And App Shell

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Create: `src/styles/tokens.css`
- Create: `src/components/TitleBar.tsx`
- Create: `src/components/Button.tsx`
- Create: `src/components/Modal.tsx`
- Modify: `src-tauri/tauri.conf.json`

- [x] **Step 1: Create design tokens**

Add CSS custom properties matching the handoff: background, sidebar, surface, border, text, muted, dim, accent, radii, shadows, and system font.

- [x] **Step 2: Configure the desktop window**

Set the Tauri main window title to `Lysbilde`, use an app-friendly default size, and evaluate `decorations: false` for the custom titlebar. If native window controls are retained for the first implementation slice, document that decision in this plan before execution.

- [x] **Step 3: Replace the Hello World screen**

Render a structured app shell with a custom titlebar and empty home content. The screen should already use the dark theme and spacing from `HANDOFF.md`.

- [x] **Step 4: Add shared primitives**

Create `TitleBar`, `Button`, and `Modal` components using the design values from the handoff. Keep these components presentational and prop-driven.

- [x] **Step 5: Verify**

Run:

```bash
pnpm build
pnpm tauri dev
```

Expected: the app builds, opens as Lysbilde, and shows the branded empty shell instead of `Hello World`.

- [x] **Step 6: Commit**

```bash
git add src src-tauri/tauri.conf.json
git commit -m "Build Lysbilde app shell"
```

## Task 2: Define Domain Types And Testable Navigation Logic

**Files:**
- Create: `src/domain/project.ts`
- Create: `src/domain/presenter.ts`
- Create: `src/domain/presenter.test.ts`
- Modify: `package.json` if test tooling is not present.

- [x] **Step 1: Add frontend test tooling**

Use the smallest fitting test setup for the React/Vite stack, such as Vitest with jsdom for component tests and plain Vitest for domain tests.

- [x] **Step 2: Define domain types**

Create TypeScript types for `Project`, `Slide`, `ProjectMetadata`, `DisplaySettings`, and `AnnotationLayerRef`. Keep annotations as an empty future-ready collection in phase 1.

- [x] **Step 3: Write presenter navigation tests**

Cover next, previous, clamping at first/last slide, direct slide selection, and empty slide decks.

- [x] **Step 4: Implement navigation helpers**

Create pure functions such as `nextSlideIndex`, `previousSlideIndex`, and `selectSlideIndex`.

- [x] **Step 5: Verify**

Run:

```bash
pnpm build
pnpm test
```

Expected: TypeScript passes and domain tests pass.

- [x] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/domain
git commit -m "Add Lysbilde domain model"
```

## Task 3: Add Local Project Persistence

**Files:**
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/lib.rs`
- Create: `src-tauri/src/project_store.rs`
- Create: `src-tauri/src/html_metadata.rs`
- Create: `src/domain/projectStore.ts`
- Modify: `src-tauri/capabilities/default.json`

- [x] **Step 1: Add Rust persistence dependencies**

Add `serde`, `serde_json`, and any minimal path/error helpers required by the Rust implementation.

- [x] **Step 2: Define project storage shape**

Use an app-data directory with this logical structure:

```text
projects/
  {project-id}/
    project.json
    thumbnails/
```

`project.json` stores title, created/updated timestamps, slide order, source file paths, display settings, and annotation references.

- [x] **Step 3: Implement Rust commands**

Add commands for:

- `list_projects`
- `create_project`
- `get_project`
- `update_project`
- `delete_project`

Use typed Rust structs and return structured errors as strings or a serializable error shape.

- [x] **Step 4: Implement frontend store wrapper**

Expose the commands through `src/domain/projectStore.ts` so React components do not call `invoke` directly.

- [x] **Step 5: Verify**

Run:

```bash
cargo test --manifest-path src-tauri/Cargo.toml
pnpm build
```

Expected: Rust tests pass and the frontend build passes.

- [x] **Step 6: Commit**

```bash
git add src-tauri src/domain/projectStore.ts
git commit -m "Add local project persistence"
```

## Task 4: Implement Project Creation And Home Screen

**Files:**
- Create: `src/features/home/HomeScreen.tsx`
- Create: `src/features/project/NewProjectModal.tsx`
- Create: `src/components/SlideThumbnail.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [x] **Step 1: Build the home layout**

Implement the titlebar, sidebar, project grid, and new-project card from the handoff. Use placeholder thumbnails until cached thumbnails exist.

- [x] **Step 2: Build project creation**

Add the new-project modal with live input state, disabled submit for empty names, Enter-to-create, Cancel, and Create actions.

- [x] **Step 3: Connect to persistence**

Load projects on app startup and call `create_project` when a project is created.

- [x] **Step 4: Verify**

Run:

```bash
pnpm build
pnpm tauri dev
```

Expected: a user can create a project, return to the home screen, and see the project card.

- [x] **Step 5: Commit**

```bash
git add src
git commit -m "Implement project home screen"
```

## Task 5: Implement HTML Import Flow

**Files:**
- Modify: `package.json`
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src-tauri/src/html_metadata.rs`
- Modify: `src-tauri/capabilities/default.json`
- Create: `src/features/import/ImportModal.tsx`
- Modify: `src/domain/projectStore.ts`
- Modify: `src/features/project/ProjectScreen.tsx`

- [x] **Step 1: Add Tauri dialog support**

Install and register the Tauri dialog plugin. The Tauri 2 dialog `open()` API returns selected paths and temporarily scopes selected paths for filesystem/asset access, so persist only the file references needed by the project.

- [x] **Step 2: Add HTML metadata extraction**

Extract slide titles from each file's `<title>` tag. If no title exists, derive a display title from the filename.

- [x] **Step 3: Build import modal**

Implement the drop-zone visual treatment, file list, remove action, Cancel, and Import buttons. Use the system file picker for initial implementation; native drag-and-drop from the OS can be a hardening task if it is not needed for the first slice.

- [x] **Step 4: Persist imported slides**

Add imported slides to the selected project without copying or modifying the source HTML files.

- [x] **Step 5: Verify**

Run:

```bash
pnpm build
pnpm tauri dev
```

Expected: a user can select multiple `.html` files, import them into a project, close/reopen the app, and still see the imported slide list.

- [x] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src src-tauri
git commit -m "Add HTML slide import"
```

## Task 6: Implement Embedded Presenter

**Files:**
- Create: `src/features/presenter/PresenterScreen.tsx`
- Modify: `src/domain/presenter.ts`
- Modify: `src/App.tsx`
- Modify: `src-tauri/capabilities/default.json`

- [x] **Step 1: Render local HTML slides**

Render the current slide in an isolated viewing surface. Prefer the safest Tauri-supported path for local HTML display. If direct `file://` rendering requires broader CSP or asset scope, use a dedicated Tauri command or asset protocol decision and document the chosen security boundary.

- [x] **Step 2: Add controls**

Implement previous/next buttons, dot navigation, slide title, slide count overlay, click zones, and Exit.

- [x] **Step 3: Add keyboard navigation**

Support ArrowRight, Space, PageDown, ArrowLeft, PageUp, and Escape as described in the specification.

- [x] **Step 4: Verify**

Run:

```bash
pnpm build
pnpm tauri dev
```

Expected: a user can present an imported deck inside the app window and navigate through every slide without leaving bounds.

- [x] **Step 5: Commit**

```bash
git add src src-tauri
git commit -m "Implement embedded presenter"
```

## Task 7: Implement Fullscreen Presentation Mode

**Files:**
- Modify: `src/features/presenter/PresenterScreen.tsx`
- Modify: `src/domain/presenter.ts`
- Modify: `src-tauri/capabilities/default.json`

- [x] **Step 1: Add fullscreen toggle**

Use Tauri's current window API to toggle fullscreen from the presenter. Escape should leave fullscreen first; if already windowed, Escape should exit presentation mode.

- [x] **Step 2: Preserve presentation state**

The current slide index should remain stable when toggling fullscreen.

- [x] **Step 3: Verify**

Run:

```bash
pnpm build
pnpm tauri dev
```

Expected: fullscreen toggle works, Escape behavior matches the design, and navigation remains stable.

- [x] **Step 4: Commit**

```bash
git add src src-tauri/capabilities/default.json
git commit -m "Add fullscreen presenter mode"
```

## Task 8: Implement Slide Organizer

**Files:**
- Create: `src/features/project/ProjectScreen.tsx`
- Create: `src/features/project/SlideGrid.tsx`
- Create: `src/features/project/SlideList.tsx`
- Modify: `src/components/SlideThumbnail.tsx`
- Modify: `src/domain/projectStore.ts`
- Modify: `src/App.tsx`

- [x] **Step 1: Build organizer layout**

Implement the side slide list, main thumbnail grid, import/add controls, and sticky Presenter button.

- [x] **Step 2: Add selection state**

Selecting a slide in either the side list or grid should update the selected slide consistently.

- [x] **Step 3: Add drag-and-drop reorder**

Use HTML5 drag-and-drop first, matching the prototype's `dragIdx` and `overIdx` behavior. Reorder should work in both the side list and grid.

- [x] **Step 4: Persist order**

After reorder, update `project.json` so reopening the app preserves the new order.

- [x] **Step 5: Verify**

Run:

```bash
pnpm build
pnpm tauri dev
```

Expected: imported slides can be reordered from both organizer views, and the order persists after restart.

- [x] **Step 6: Commit**

```bash
git add src
git commit -m "Implement slide organizer"
```

## Task 9: Add Thumbnail Cache

**Files:**
- Modify: `src-tauri/src/project_store.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src/components/SlideThumbnail.tsx`
- Modify: `src/domain/project.ts`
- Modify: `src/domain/projectStore.ts`

- [x] **Step 1: Keep placeholder thumbnails as fallback**

Do not block the MVP on perfect thumbnail capture. The placeholder thumbnail design remains valid when no cached image exists.

- [x] **Step 2: Add thumbnail metadata**

Store optional thumbnail paths per slide in project metadata.

- [x] **Step 3: Implement first thumbnail cache path**

Start with deterministic placeholder image generation or a documented manual cache slot if reliable Tauri webview capture is not available. Then replace with real capture once the Tauri rendering path is proven.

- [x] **Step 4: Verify**

Run:

```bash
cargo test --manifest-path src-tauri/Cargo.toml
pnpm build
```

Expected: the app shows cached thumbnails when present and falls back to placeholders when missing.

- [x] **Step 5: Commit**

```bash
git add src src-tauri
git commit -m "Add thumbnail cache support"
```

## Task 10: Add File Robustness

**Files:**
- Modify: `src-tauri/src/project_store.rs`
- Modify: `src/domain/project.ts`
- Modify: `src/features/project/ProjectScreen.tsx`
- Modify: `src/features/presenter/PresenterScreen.tsx`

- [x] **Step 1: Detect missing source files**

On project load and presentation start, check whether each source file still exists.

- [x] **Step 2: Show missing-file state**

Display a clear warning in the organizer and block presentation of missing slides with a readable error surface.

- [x] **Step 3: Preserve project data**

Missing files should not remove slides automatically. Keep the stored references so users can repair paths in a later flow.

- [x] **Step 4: Verify**

Run:

```bash
pnpm build
pnpm tauri dev
```

Expected: deleting or moving an imported source file creates a visible warning without corrupting the project.

- [x] **Step 5: Commit**

```bash
git add src src-tauri
git commit -m "Handle missing slide files"
```

## Task 11: Prepare Annotation Extension Point

**Files:**
- Modify: `src/domain/project.ts`
- Modify: `src-tauri/src/project_store.rs`
- Create: `docs/decisions/0001-annotation-layer-boundary.md`

- [x] **Step 1: Keep annotations out of phase 1 UI**

Do not build annotation tools during the MVP. Only preserve a stable data boundary so future annotation work does not require changing the project format.

- [x] **Step 2: Document the boundary**

Record that annotations are stored as separate project-owned layers linked to slides and never written into source HTML files.

- [x] **Step 3: Verify**

Run:

```bash
cargo test --manifest-path src-tauri/Cargo.toml
pnpm build
```

Expected: project serialization supports empty annotation references and existing projects remain readable.

- [x] **Step 4: Commit**

```bash
git add src src-tauri docs/decisions/0001-annotation-layer-boundary.md
git commit -m "Prepare annotation data boundary"
```

## Verification Matrix

Use this matrix before considering the design realized:

| Area | Verification |
|---|---|
| App shell | Tauri window opens as Lysbilde with dark custom shell |
| Project creation | New project can be created and persists after restart |
| Import | Multiple local `.html` files can be imported without modifying originals |
| Metadata | Slide title falls back from `<title>` to filename |
| Organizer | Slide selection and reordering work in grid and list |
| Persistence | Project order and file references survive app restart |
| Presenter | Embedded presentation displays imported HTML and navigates correctly |
| Fullscreen | Fullscreen toggle and Escape behavior match the design |
| Robustness | Missing files produce warnings without data loss |
| Build | `pnpm build` passes |
| Rust | `cargo test --manifest-path src-tauri/Cargo.toml` passes once Rust tests exist |

## Open Technical Decisions

These should be resolved during execution and documented under `docs/decisions/` when chosen:

1. **Local HTML rendering boundary:** whether slides are shown through a direct local asset URL, a Tauri webview/window, or a custom protocol/command.
2. **Thumbnail generation mechanism:** whether real capture is available early or placeholder thumbnails remain until a proven capture path is built.
3. **Project storage location:** use Tauri app data directory by default; document exact platform paths after implementation.
4. **Window decorations:** whether `decorations: false` is enabled immediately or deferred until custom window controls are fully reliable on target platforms.

## Official API References Checked

- Tauri dialog plugin `open()` API: https://v2.tauri.app/reference/javascript/dialog/
- Tauri filesystem plugin and path/base-directory model: https://v2.tauri.app/plugin/file-system/
- Tauri window API namespace: https://v2.tauri.app/reference/javascript/api/namespacewindow/
- Tauri window customization guidance: https://v2.tauri.app/learn/window-customization/
