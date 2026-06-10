# Example HTML Slides

This directory contains standalone HTML files that can be imported into Lysbilde for manual testing.

## Q2 Product Launch

Use the files in `q2-product-launch/` as a six-slide test deck:

1. `01-title.html`
2. `02-agenda.html`
3. `03-market-analysis.html`
4. `04-product.html`
5. `05-pricing.html`
6. `06-next-steps.html`

Each file is self-contained and includes:

- A `<title>` tag for Lysbilde title extraction.
- Inline CSS, with no external dependencies.
- A full-viewport slide layout suitable for presentation mode.

Suggested smoke test:

1. Run `pnpm tauri dev`.
2. Create a new presentation.
3. Import all six files from `docs/examples/q2-product-launch/`.
4. Reorder a few slides.
5. Start presenter mode and test arrow keys, mouse click zones, fullscreen, and exit.
