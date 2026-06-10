# Window Chrome Controls

## Goal

Fix the custom undecorated Tauri window chrome so users can move, resize, minimize, maximize, and close the app window reliably.

## Status

Implemented.

## Scope

- Add functional minimize, maximize, and close controls to the custom titlebar.
- Mark the titlebar as a Tauri drag region.
- Add larger resize drag handles around the window edge.
- Grant the required Tauri window capabilities.
- Cover the titlebar controls and resize handles with component tests.

## Verification

- `pnpm test`
- `pnpm build`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `cargo test --manifest-path src-tauri/Cargo.toml`
