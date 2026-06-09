# 0001 - Tauri Hello World

## Status

Active

## Goal

Create a minimal Tauri 2 desktop application with React and TypeScript that displays "Hello World" and can be run locally in development mode.

## Context

- Repository starts from an empty application baseline.
- Tauri official site: https://tauri.app/
- Tauri Create Project guide: https://v2.tauri.app/start/create-project/
- Tauri recommends starting new projects with `create-tauri-app`.
- `create-tauri-app` supports multiple official frontend templates, including React with TypeScript.

## Scope

- Scaffold a new Tauri app in this repository.
- Use the React + TypeScript template.
- Show a visible "Hello World" message in the app window.
- Keep implementation minimal: no routing, no persistence, no custom backend commands unless required by the scaffold.
- Document how to run the app locally.

## Out Of Scope

- Packaging installers or release binaries.
- Mobile targets.
- Application branding beyond the basic app name/window title.
- CI setup.
- Non-minimal UI design work.

## Acceptance Criteria

- A Tauri 2 app exists in the repository.
- The development command starts the app successfully on the local machine.
- The app window renders "Hello World".
- The repository contains clear run instructions.
- Implementation plan is recorded under `docs/plans/` before code changes begin.

## Superpowers Flow

- Use the Superpowers workflow for design/spec and implementation planning before scaffolding code.
- Store the implementation plan as `docs/plans/0001-tauri-hello-world-plan.md`.
- Track execution steps with session `update_plan` while working, but keep persistent task state in this file.

## Open Decisions

- Frontend template: React + TypeScript.
- Package manager: pnpm.

## Execution Checklist

- [x] Confirm frontend template: React + TypeScript.
- [x] Confirm package manager: pnpm.
- [x] Write implementation plan in `docs/plans/0001-tauri-hello-world-plan.md`.
- [ ] Scaffold Tauri app.
- [ ] Replace default screen with "Hello World" if needed.
- [ ] Verify development run command.
- [ ] Document run instructions.
