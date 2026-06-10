# GitHub Windows Builds

## Goal

Configure GitHub Actions so Lysbilde can build distributable desktop artifacts, including Windows installers, from GitHub.

## Status

Complete.

## Scope

- Add a CI workflow modeled after the Sidekick repository structure.
- Add a tag-driven release workflow that publishes Tauri build assets to GitHub Releases.
- Keep Windows signing out of scope until signing certificates and repository secrets are available.

## References

- `https://github.com/trulstveoy/Sidekick/.github/workflows/ci.yml`
- `https://github.com/trulstveoy/Sidekick/.github/workflows/release.yml`
- `https://v2.tauri.app/distribute/pipelines/github/`
- `https://github.com/tauri-apps/tauri-action`

## Checklist

- [x] Inspect Sidekick workflows with GitHub CLI.
- [x] Add Lysbilde CI workflow.
- [x] Add Lysbilde release workflow.
- [x] Verify local checks.
- [x] Commit and push.
