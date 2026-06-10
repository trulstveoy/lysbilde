# Windows Slide Reordering Drag And Drop

## Goal

Make slide reordering by drag-and-drop work reliably, especially on Windows, so users can change the sequence of slides in a project.

## Status

Implemented and verified on Windows.

## Related Plan

- `docs/plans/0007-slide-reordering-windows-plan.md`

## Problem

The user reports that it is not possible to sort or reorder slides with drag-and-drop to change their sequence, at least on Windows.

The current app has `ProjectScreen`, `SlideList`, `SlideGrid`, and `moveSlide` / reorder callbacks, so the data flow appears to exist. The likely gap is in the UI interaction layer, event handling, or persistence path that should connect drag/drop gestures to a project slide-order update.

## Expected Behavior

- Users can drag a slide to a new position and drop it to change slide sequence.
- Reordering works in both the slide list and slide grid if both surfaces support reordering.
- The visual drop target and final slide order match the user's drag action.
- The updated order is persisted to the project slide order.
- Behavior is reliable on Windows, not only on the primary development platform.

## Affected Surfaces

- `ProjectScreen` slide ordering state and callbacks.
- `SlideList` drag/drop interaction.
- `SlideGrid` drag/drop interaction, if grid reordering is supported.
- Project persistence for slide order.
- Any keyboard, pointer, or mouse fallback paths that affect slide ordering.

## Likely Implementation Areas

- Trace `moveSlide` / reorder callbacks from `ProjectScreen` through `SlideList` and `SlideGrid`.
- Verify HTML5 drag events, pointer events, and mouse event handling on Windows.
- Check whether drag source, drag-over, drop, and prevent-default behavior are wired consistently.
- Confirm drag handles or draggable slide elements are usable with Windows pointer and mouse behavior.
- Confirm the persisted project model writes the reordered slide sequence after a successful drop.
- Add or update tests around reorder callbacks and persistence where practical.

## Scope

- Investigate why drag-and-drop slide reordering fails or behaves unreliably on Windows.
- Fix list reordering.
- Fix grid reordering if the grid is intended to support slide reordering.
- Ensure UI order, in-memory project state, and persisted project slide order stay consistent.
- Preserve existing selection and active-slide behavior where possible during reorder.

## Non-Goals

- Redesigning the slide list or slide grid.
- Adding new slide organization concepts such as folders or sections.
- Implementing cross-project slide dragging.
- Replacing the full drag-and-drop system unless investigation shows the current approach cannot be made reliable.
- Changing presentation playback behavior.

## Acceptance Criteria

- A slide can be moved before and after other slides using drag-and-drop on Windows.
- Reordering works in both list and grid views if both surfaces expose reordering.
- The active project's slide order updates immediately after a successful drop.
- Closing and reopening the project preserves the new slide order.
- Failed or canceled drags do not corrupt slide order or selection state.
- Reordering behavior remains usable on non-Windows platforms.

## Verification Plan

- Run the app on Windows and open a project with several slides.
- Reorder slides in the list and confirm the displayed order changes correctly.
- Reorder slides in the grid, if supported, and confirm the displayed order changes correctly.
- Save or otherwise persist the project, then reopen it and confirm the new slide order remains.
- Test dragging upward, downward, to the first position, and to the last position.
- Test canceled drops outside valid targets and confirm order is unchanged.
- Verify the same flow on the primary development platform to avoid regressions.

## Implementation Notes

- Added `src/domain/reorder.ts` with shared `moveItem` and `selectedIndexAfterMove` helpers.
- Replaced native HTML5 drag/drop in `SlideList` and `SlideGrid` with pointer-event drag handles using `usePointerReorder`.
- Kept reorder persistence on the existing `ProjectScreen` `onProjectChange` path and preserved the selected slide across reorder moves.
- Added drag handle, dragging, and drop-target styles in `src/App.css`.

## Local Verification

- `pnpm vitest run src/domain/reorder.test.ts src/features/project/usePointerReorder.test.tsx`: passed.
- `pnpm test`: passed.
- `pnpm build`: passed.

## Windows Verification

- Manual Windows WebView2 verification was completed by the user.
- Result: OK.
