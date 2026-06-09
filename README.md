# Lysbilde

Minimal Tauri 2 desktop app built with React and TypeScript.

## Prerequisites

- Node.js
- pnpm
- Rust and Cargo
- Tauri system prerequisites for your operating system

On Debian/Ubuntu Linux, install Tauri desktop prerequisites with:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

See the official Tauri prerequisites guide for other platforms:

https://v2.tauri.app/start/prerequisites/

## Install

```bash
pnpm install
```

## Run

```bash
pnpm tauri dev
```

The desktop window should display:

```text
Hello World
```
