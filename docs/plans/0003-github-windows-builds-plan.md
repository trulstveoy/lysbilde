# GitHub Windows Builds Plan

## Goal

Create GitHub Actions workflows that verify Lysbilde and build Windows-ready Tauri artifacts.

## Design

Lysbilde uses the same two-workflow structure as Sidekick: `CI` for normal pushes and manual artifact builds, and `Release` for `v*` tags. Because Lysbilde is a Tauri application, the packaging step uses the official `tauri-apps/tauri-action` instead of Electron Forge.

## Steps

- [x] Confirm current branch state and that the presenter sizing fix is already pushed.
- [x] Fetch Sidekick's `ci.yml` and `release.yml` using GitHub CLI.
- [x] Compare Sidekick's Electron packaging flow with Lysbilde's Tauri project structure.
- [x] Add `packageManager` to `package.json` for Corepack-based CI installs.
- [x] Add `.github/workflows/ci.yml`.
- [x] Add `.github/workflows/release.yml`.
- [x] Run local verification.
- [x] Commit changes.
- [x] Push `master`.
