# Lysbilde

Lysbilde is a lightweight desktop application for presenting slide decks made from existing HTML files. Instead of authoring slides inside a traditional presentation editor, users can collect generated or hand-written HTML pages, arrange them in order, and present them in fullscreen or inside the app window.

The app is built with Tauri 2, React, TypeScript, and Vite. The repository currently contains the Tauri application baseline plus product, design, and prototype material for the next implementation phases.

## Product Goal

Lysbilde aims to be the simplest way to present HTML-based slides. The focus is on organizing, previewing, and presenting existing HTML content, not on editing the slide source files themselves.

Typical use cases include:

- AI-generated presentations
- HTML-based documentation walkthroughs
- Visual narratives already exported as standalone HTML pages
- Local slide collections that should be presented without converting them to PowerPoint or PDF

## Planned App Features

The product specification in `docs/design/phase 1/specification.md` describes the target application. The main planned capabilities are:

- Create presentation projects from one or more local HTML files.
- Store project metadata, slide order, display settings, and future annotations separately from the original files.
- Import HTML slides from disk and generate thumbnails.
- Organize slides with thumbnail previews and drag-and-drop ordering.
- Present slides in fullscreen mode or embedded inside the application window.
- Navigate with arrow keys, Space, Page Up/Page Down, mouse clicks, and on-screen controls.
- Add annotation layers in a future phase without modifying the source HTML files.

Original HTML files should remain unchanged. Lysbilde stores references, ordering, metadata, thumbnails, and annotations as project data.

## Current Repository State

The implemented app is still a minimal Tauri baseline. Running it opens a desktop window that renders a simple `Hello World` screen.

The repository also includes phase 1 design artifacts:

- `docs/design/phase 1/specification.md` - product description and functional direction.
- `docs/design/phase 1/HANDOFF.md` - developer-oriented design handoff.
- `docs/design/phase 1/Lysbilde Prototype.html` - interactive React prototype.
- `docs/design/phase 1/Lysbilde Design.html` - design canvas with screen variants and storyboard.
- `docs/design/phase 1/design-canvas.jsx` and `macos-window.jsx` - prototype support components.

## Tech Stack

- Tauri 2 for the desktop shell
- Rust for the native Tauri layer
- React for the frontend UI
- TypeScript for frontend code
- Vite for frontend development and builds
- pnpm for package management

## Repository Layout

```text
.
├── docs/
│   ├── design/       Product specification, prototype, and design handoff
│   ├── plans/        Implementation plans
│   ├── specs/        Earlier task-level specs
│   └── tasks/        Active/completed task notes
├── public/           Static frontend assets
├── src/              React frontend source
├── src-tauri/        Tauri Rust application, config, icons, and capabilities
├── index.html        Vite HTML entry point
├── package.json      pnpm scripts and frontend dependencies
└── vite.config.ts    Vite configuration for Tauri development
```

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

## Development

Run the Tauri desktop app in development mode:

```bash
pnpm tauri dev
```

Run only the Vite frontend dev server:

```bash
pnpm dev
```

## Build

Build the frontend:

```bash
pnpm build
```

Build/package through Tauri:

```bash
pnpm tauri build
```

## Design References

The design package under `docs/design/phase 1/` is the main reference for future product implementation. Start with `specification.md` for product scope, then use `HANDOFF.md` and the HTML prototypes for layout, visual states, and interaction details.
