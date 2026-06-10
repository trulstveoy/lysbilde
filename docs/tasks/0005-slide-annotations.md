# Slide Annotations

## Goal

Implement a persistent annotation layer for Lysbilde slides so users can add comments and visual markers during meetings without modifying the original HTML slide files.

## Status

Implemented.

## Related Plan

- `docs/plans/0005-slide-annotations-plan.md`

## Background

Lysbilde is a Tauri desktop application for presenting local HTML files. Each slide is a separate generated HTML file stored on disk, and the presentation flow is already implemented.

The next step is to add annotations on top of each slide. Annotations must be useful during reviews, walkthroughs, and meetings where participants discover issues, propose changes, add requirements, or leave follow-up notes directly on the relevant slide.

Typical notes include:

- "This must be updated before the next version."
- "This figure is incorrect."
- "Add an example here."
- "Move this to the next slide."

Annotations must be visible the next time the project is opened.

## Design Principles

- Original HTML slide files must never be modified.
- Annotations must not be stored inside the HTML files.
- Annotations must be stored as project data.
- Rendering combines the HTML slide and its saved annotations at view time.

```text
HTML file
+
Annotations
=
Rendered slide view
```

## Technology

Use:

- `konva`
- `react-konva`

React-Konva is selected because it supports drag-and-drop, resizing, transformation, selection, arrows, text, shapes, and JSON serialization.

## Architecture

```text
Lysbilde
|
+-- SlideViewer
|   +-- iframe showing the HTML slide
|
+-- AnnotationLayer
    +-- React-Konva Stage
        +-- Layer
        |   +-- StickyNote
        |   +-- TextBox
        |   +-- Rectangle
        |   +-- Arrow
        |
        +-- Transformer
```

The HTML slide is rendered at the bottom. The React-Konva stage is rendered as an overlay above the slide. Annotations are independent of the slide HTML content.

## Supported Annotation Types

### Sticky Note

Used for comments.

Properties:

- Text
- Background color
- Size
- Position

### Text Box

Used for explanations and comments.

Properties:

- Text
- Text color
- Size
- Position

### Rectangle

Used to highlight an area.

Properties:

- Stroke color
- Fill color
- Size
- Position

### Arrow

Used to point at content.

Properties:

- Color
- Stroke width
- Start point
- End point

## Common Object Behavior

All annotations must support:

- Selection
- Dragging
- Resizing where applicable
- Color changes
- Deletion
- Persistence
- Later editing

Sticky notes and text boxes are edited inline with a textarea overlay inside the annotation box. They do not use browser popup prompts.
The underlying canvas text is hidden while inline editing so the text does not appear doubled.

While text editing is active, keyboard input is captured by the editor. Presenter navigation shortcuts such as Space, arrows, PageUp, and PageDown must not fire from inside editable text fields.

## Transformation Behavior

Use Konva Transformer for text boxes, sticky notes, and rectangles.

Users must be able to:

- Drag the object.
- Resize the object.
- Stretch the object.

Rotation is out of scope for the first version.

```tsx
<Transformer rotateEnabled={false} />
```

## Arrow Editing

Arrows must not be scaled like normal objects.

Users must be able to:

- Move the entire arrow.
- Drag the start point.
- Drag the end point.

Visual model:

```text
o---------->
```

Both endpoints must be draggable. This is preferred over generic scaling because it gives a clearer editing experience.

## Colors

All annotation types must support color changes.

Initial color options:

- Yellow
- Red
- Green
- Blue
- Orange

The selected color must be stored with the annotation.

## Modes

### Fullscreen View Mode

- Slides are visible.
- Annotations are visible.
- Annotations cannot be edited.

### Windowed Presenter Mode

Users can:

- Create annotations.
- Move annotations.
- Edit annotations.
- Delete annotations.

Windowed presenter mode always allows annotation editing while the app chrome and presenter controls are visible. There is no separate Annotate toggle. Project setup mode does not expose annotation controls. Fullscreen presenter mode displays saved annotations but does not allow editing.

## Visibility Toggle

Users must be able to show or hide annotations without deleting them.

Example:

```text
Show annotations: on
Show annotations: off
```

When annotations are hidden, the original slide is shown alone.

## Persistence

Annotations must be saved automatically.

Save when:

- An annotation is created.
- An annotation is moved.
- An annotation is resized or otherwise edited.
- An annotation is deleted.

Users must not need to press a Save button.

## Project Lifecycle

Required scenario:

1. The user opens a project.
2. The user starts a presentation.
3. The user adds comments during a meeting.
4. The user closes the project.
5. The user opens the project the next day.
6. The user sees all annotations again.
7. The user adds more annotations.
8. The user continues the work.

Annotations remain permanent until the user deletes them.

## Storage Format

Annotations are stored per slide.

Example:

```json
{
  "slides": [
    {
      "id": "slide-01",
      "filePath": "/slides/01.html",
      "annotations": [
        {
          "id": "a1",
          "type": "sticky-note",
          "x": 0.15,
          "y": 0.25,
          "width": 0.2,
          "height": 0.15,
          "text": "This must be updated",
          "color": "#fff59d"
        },
        {
          "id": "a2",
          "type": "rectangle",
          "x": 0.55,
          "y": 0.4,
          "width": 0.18,
          "height": 0.12,
          "color": "#d32f2f"
        }
      ]
    }
  ]
}
```

## Coordinate System

All positions and sizes must be stored as relative values.

```text
0.0 -> left/top
1.0 -> right/bottom
```

This ensures annotations work across:

- Window sizes
- Screen resolutions
- Fullscreen mode
- Embedded slide view

## Out Of Scope For First Version

Do not implement these in the first version:

- Freehand drawing
- Multiple annotation sets
- Real-time collaboration
- Per-user comments
- Version history
- Rotation
- Triangulation or advanced shapes

## Acceptance Criteria

- [x] Users can add sticky notes, text boxes, rectangles, and arrows on top of a slide.
- [x] Annotation creation and delete actions use icon buttons with accessible labels.
- [x] Users can select, move, resize where applicable, edit, recolor, and delete annotations.
- [x] Sticky notes and text boxes can be edited directly in place without a popup.
- [x] Canvas text is hidden while sticky notes and text boxes are edited inline.
- [x] Text keeps a fixed font size while sticky notes and text boxes are resized.
- [x] Resize updates the local Konva node during drag and saves project data only when transform ends.
- [x] Resize updates child nodes inside text annotation groups so the visible box follows the Transformer frame during drag.
- [x] Keyboard input inside inline text editors does not advance slides.
- [x] Arrow endpoints can be dragged independently.
- [x] Arrows can be resized and angled by dragging start and end handles.
- [x] Arrow endpoints render live while dragging and save when released.
- [x] Fullscreen view mode is read-only.
- [x] Annotation editing is available only in windowed presenter mode with chrome.
- [x] Windowed presenter mode is always annotation-ready without an Annotate toggle.
- [x] Project setup mode does not expose annotation controls.
- [x] Users can hide and show annotations without deleting them.
- [x] Annotations autosave after create, edit, move, resize, and delete operations.
- [x] Annotations are stored per slide as project data.
- [x] Annotation coordinates are stored relative to the slide viewport.
- [x] Reopening a project restores all saved annotations on the correct slides.
- [x] Original HTML slide files remain unchanged.

## Implementation Notes

- Added `konva` and `react-konva`.
- Added `Slide.annotations` as the first-version annotation storage location.
- Kept the legacy project-level `annotations` field for compatibility.
- Added Rust serde defaults so existing project files without slide annotations continue to load.
- Added a shared `SlideViewport` component that renders the slide iframe and annotation overlay in the same coordinate space.
- Added `AnnotationLayer` with React-Konva support for sticky notes, text boxes, rectangles, arrows, selection, dragging, resizing, arrow endpoints, and text editing.
- Text editing uses the standard Konva pattern: a DOM textarea overlay positioned over the canvas text while editing.
- Added `AnnotationToolbar` for annotation mode, visibility, create actions, color selection, and deletion.
- Added icon-only visibility toggle for showing and hiding annotations.
- Wired annotation editing into windowed presenter mode only, without a separate Annotate toggle.
- Fullscreen presenter mode displays saved annotations but keeps editing disabled.

## Verification Plan

- [x] Add unit tests for annotation data types, relative coordinate conversion, and project persistence.
- [x] Add component tests for annotation toolbar state, visibility toggle, and editing mode behavior.
- [x] Add focused integration coverage for project-owned slide annotations.
- [x] Add component coverage confirming project setup does not expose annotation controls.
- [x] Add component coverage confirming windowed presenter exposes annotation controls and fullscreen hides them.
- [x] Add component coverage confirming sticky note text edits inline without `window.prompt`.
- [x] Add component coverage confirming canvas text is hidden while inline text editing.
- [x] Add component coverage confirming resize converts scale into width and height for text annotations.
- [x] Add regression coverage confirming resize does not save on every transform event.
- [x] Add regression coverage confirming child nodes resize locally with the transformed group.
- [x] Add component coverage confirming selected arrows show draggable start and end handles.
- [x] Add component coverage confirming arrow handles update start/end coordinates independently.
- [x] Add regression coverage confirming arrow endpoint drag updates local points before save.
- [x] Add component coverage confirming dragging the arrow body moves both endpoints together.
- [x] Add regression coverage confirming Space inside text fields does not advance slides.
- [x] Add component coverage confirming annotation tools are icon-only controls with accessible labels.
- [x] Add component coverage confirming the Annotate toggle is not rendered.
- [x] Verify Rust project deserialization compatibility for old project files.
- [ ] Manually verify annotation behavior in the Tauri app using local HTML example slides on Windows.

## Verification Evidence

- `pnpm test`: 16 test files passed, 49 tests passed.
- `pnpm build`: TypeScript and Vite production build passed. Vite reports the existing chunk-size warning after adding Konva.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 3 Rust tests passed.

## Scope Amendment

Annotation editing was narrowed after implementation:

- Users annotate only in windowed presenter mode with app chrome visible.
- Windowed presenter mode is always ready for annotation; there is no separate Annotate button.
- Project setup mode is for organizing slides and does not show annotation controls.
- Fullscreen mode is presentation-only: saved annotations remain visible, editing controls are hidden.
