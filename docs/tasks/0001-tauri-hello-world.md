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

## Prerequisite Findings

- 2026-06-09: Node.js `v25.1.0`, pnpm `10.30.3`, Cargo `1.96.0`, and rustc `1.96.0` are available in the local worktree environment.
- 2026-06-09: `pnpm create tauri-app /tmp/framside-tauri-prereq-check --template react-ts --manager pnpm --identifier no.framside.hello --tauri-version 2 --yes` completed, but reported missing Linux desktop prerequisites: `webkit2gtk` and `rsvg2`.
- 2026-06-09: Passwordless `sudo` is not available (`sudo -n true` requires a password), so installing the Tauri Linux desktop prerequisites is blocked in this execution environment. Desktop runtime verification remains blocked until `libwebkit2gtk-4.1-dev` and `librsvg2-dev` are installed along with the other Tauri Linux prerequisite packages.
- 2026-06-09: `pnpm build` succeeded. `pnpm tauri dev` started Vite on `http://localhost:1420/`, then failed during Rust compilation because the system library `glib-2.0` was not found by `pkg-config`. No desktop window opened, so visual `Hello World` runtime verification remains blocked until the Linux Tauri desktop prerequisite development packages are installed.

## Execution Checklist

- [x] Confirm frontend template: React + TypeScript.
- [x] Confirm package manager: pnpm.
- [x] Write implementation plan in `docs/plans/0001-tauri-hello-world-plan.md`.
- [x] Scaffold Tauri app.
- [x] Replace default screen with "Hello World" if needed.
- [ ] Verify development run command.
- [x] Document run instructions.
