# PowerPoint-Style Fullscreen Presentation

## Goal

Make presentation fullscreen behave like PowerPoint: when the user starts fullscreen presentation mode, the slide is displayed across the whole screen with no distracting application chrome, side panels, toolbars, or unused margins.

## Status

Implemented; local verification passed. Manual Windows fullscreen verification pending.

## Problem

The current Tauri + React app has a fullscreen button in `PresenterScreen` and uses `getCurrentWindow().setFullscreen(nextValue)`. The user reports that this does not produce the desired PowerPoint-like fullscreen presentation experience.

The likely gap is that the native window becomes fullscreen, but the presentation UI still behaves like an app view instead of a dedicated presentation surface.

## Expected Behavior

- Entering fullscreen shows the active slide as the primary screen content.
- The slide uses the full available display area while preserving its intended aspect ratio.
- App chrome, navigation controls, editor controls, and other non-presentation UI are hidden or minimized.
- The slide iframe fills the presentation area correctly.
- Annotation overlays, if visible, align with and fill the same presentation area as the slide.
- Pressing `Escape` exits fullscreen or exits presentation mode consistently.
- Leaving fullscreen restores the normal presenter screen layout.

## Scope

- Review the current fullscreen behavior in Tauri and React.
- Decide whether native fullscreen alone is sufficient or whether the app also needs a separate fullscreen presentation layout/state.
- Update the presentation view so the slide iframe occupies the full presentation surface.
- Ensure annotation overlays scale and align with the fullscreen slide area.
- Hide or suppress app chrome and controls while fullscreen presentation mode is active.
- Define consistent keyboard and button behavior for entering and exiting fullscreen.

## Non-Goals

- Multi-monitor presenter view.
- Separate audience display and presenter notes display.
- Display selection or monitor routing.
- Remote control or clicker support.
- Redesigning the normal non-fullscreen presenter screen.

Future multi-monitor and presenter-view behavior should be considered during design, but it is out of scope for the first version.

## Likely Implementation Questions

- How does Tauri fullscreen behave across supported platforms, and does it include or exclude native window decoration?
- Should fullscreen be modeled as native window state, React presentation mode state, or both?
- Which app chrome and controls must be hidden while fullscreen is active?
- How should the slide iframe use the full display area while preserving slide aspect ratio?
- How should annotations be sized and positioned so they fill and align with the fullscreen slide?
- Should `Escape` exit native fullscreen, presentation mode, or both?
- How should the app recover if fullscreen is exited by the operating system instead of the app button?
- What decisions should be deferred so future multi-monitor presenter view remains possible?

## Acceptance Criteria

- Fullscreen presentation displays the active slide on the whole screen in a PowerPoint-like way.
- Non-presentation UI is not visible during fullscreen presentation.
- The slide iframe fills the presentation surface correctly without unexpected margins or clipping.
- Visible annotations remain aligned with the slide in fullscreen.
- `Escape` exits fullscreen or presentation mode in a predictable, documented way.
- Exiting fullscreen restores the normal presenter screen without losing slide position or annotation visibility state.
- Behavior is verified on the target development platform.

## Verification Plan

- Start the app and open a presentation.
- Enter fullscreen from `PresenterScreen`.
- Confirm the active slide is the only primary visible content and uses the full display area.
- Confirm app controls and window chrome are hidden or not visually distracting.
- Confirm annotations, when enabled, align with the fullscreen slide.
- Press `Escape` and confirm fullscreen or presentation mode exits consistently.
- Re-enter fullscreen after exiting and confirm the behavior is repeatable.
- Verify the normal presenter screen layout is restored after leaving fullscreen.

## Implementation Notes

- Added a dedicated fullscreen presenter layout state with `presenter-screen--fullscreen`.
- The footer controls are hidden while fullscreen is active, leaving the slide as the primary screen content.
- The presenter stage fills the fullscreen viewport and the iframe remains absolutely positioned to fill that stage.
- `Escape` exits fullscreen first and restores the normal presenter controls; pressing `Escape` again exits presentation mode.
- Exiting presentation mode also clears native fullscreen when needed.

## Local Verification

- `pnpm vitest run src/features/presenter/PresenterScreen.test.tsx src/presenterLayout.test.ts`: passed.
- `pnpm build`: passed.
