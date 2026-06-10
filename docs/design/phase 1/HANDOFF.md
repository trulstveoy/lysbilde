# Lysbilde — Designhåndbok for utvikler

> Generert fra designprototypen. Målgruppe: LLM eller utvikler som skal implementere Lysbilde i Tauri + TypeScript.

---

## 1. Hva er levert

| Fil | Type | Formål |
|---|---|---|
| `Lysbilde Prototype.html` | Interaktiv React-prototype | Klikkbar prototype med ekte state, drag-and-drop, modaler og tastaturnavigasjon |
| `Lysbilde Design.html` | Design canvas | Storyboard (8 steg) + hi-fi skjermvarianter for alle hovedskjermbilder |

Prototypen er teknisk referanseimplementasjon for layout, farger, spacing og interaksjonslogikk. Design-canvasen viser visuelle varianter og brukerreise.

---

## 2. Designsystem-tokens

Alle farger, typografi og spacing er definert som konstanter. I Tauri-appen bør disse bli CSS custom properties eller et TypeScript design-token-objekt.

### Fargepalett

```typescript
const colors = {
  bg:       '#0c0c10',           // Appbakgrunn (aller mørkest)
  sidebar:  '#101014',           // Sidepanel-bakgrunn
  surface:  '#17171d',           // Kortbakgrunn, modaler
  surfaceHover: '#1e1e27',       // Hover-tilstand på overflater

  border:   'rgba(255,255,255,0.08)',   // Standard skillelinje
  borderMid:'rgba(255,255,255,0.14)',   // Sterkere border (fokus, modal)

  text:     '#eeeef3',           // Primærtekst
  muted:    '#888899',           // Sekundærtekst, etiketter
  dim:      '#40404f',           // Veldig dempet (tall, hints)

  accent:   'oklch(0.65 0.19 265)',       // Indigo — primæraksent
  accentGlow: 'oklch(0.65 0.19 265 / 0.28)', // Skygge/glow for primærknapper
  accentDim:  'oklch(0.65 0.19 265 / 0.14)', // Svak aksentbakgrunn (badge, outline)
}
```

### Typografi

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
/* Bruker systemfont — SF Pro på macOS, noe som er korrekt for en Tauri-app */
```

| Bruksområde | Størrelse | Vekt |
|---|---|---|
| Skjermtittel / seksjon | 17px | 700 |
| Kortoverskrift | 13px | 600 |
| Brødtekst / etiketter | 13px | 400 |
| Metadata (dato, antall) | 12px | 400 |
| Caps-etiketter (overordnet) | 11px | 600 + letter-spacing: 0.1em |
| Slide-nummer overlay | 10px | 400 |

### Border radius

```
app-vindu:   14px
modal:       16px
kort:        12px
knapp:        8px
input:        8px
meny-item:    7px
thumbnail:    8px
dot-indikator: 4px
```

### Skygger

```css
/* App-vindu */
box-shadow: 0 0 0 1px rgba(255,255,255,0.07), 0 28px 80px rgba(0,0,0,0.9);

/* Modal */
box-shadow: 0 24px 60px rgba(0,0,0,0.7);

/* Primærknapp */
box-shadow: 0 4px 14px oklch(0.65 0.19 265 / 0.28);
```

---

## 3. Komponentoversikt

### `<TitleBar>`

Alltid øverst i app-vinduet (unntatt presentasjonsmodus).

```
┌────────────────────────────────────────────┐
│  ● ● ●  [‹ tilbake]  [Tittel]              │
└────────────────────────────────────────────┘
```

- Høyde: 42px
- Bakgrunn: `sidebar`-farge
- Trafikklys (venstre): 12px sirkler, gap 7px
  - Rød: `#ff5f56`, Gul: `#febc2e`, Grønn: `#27c93f`
  - Border: `0.5px solid rgba(0,0,0,0.25)`
- Tilbake-knapp (kun i organizer-skjerm): 26×26px, border-radius 6, `rgba(255,255,255,0.07)` bakgrunn
- Tittel: sentrert, 13px, weight 600, `muted`-farge

### `<Sidebar>` (kun på hjemskjermen)

```
Bredde: 190px
Bakgrunn: sidebar-farge
Border right: 1px solid border-farge
```

Meny-item:
```
Høyde: 28px
Padding: 0 10px, margin 1px 8px
Border radius: 7px
Aktiv bakgrunn: surfaceHover
Ikon: 14px bred, opacity 0.75
```

### `<ProjectCard>`

Brukt i hjemskjermens rutenett (3 kolonner, gap 16px).

```
Bakgrunn: surface
Border radius: 12px
Border: 1px solid border
Hover: border → borderMid, translateY(-2px)
Transition: border-color .15s, transform .15s

Thumbnailområde:
  Høyde: 112px
  Bakgrunn: #11111a

Info-boks:
  Padding: 11px 14px 13px
  Tittel: 13px / weight 600 / text-farge
  Metadata: 12px / muted-farge
```

Ny-presentasjon-kort (sist i grid):
```
Border: 2px dashed border-farge
Hover: border → borderMid
Innhold: + ikon (36px sirkel, accentDim bakgrunn) + tekst
```

### `<SlideThumbnail>`

Placeholder-thumbnail brukt overalt der ekte HTML-slides vil vises som forhåndsvisning.

I produksjon erstattes dette av en faktisk `<webview>` eller `<iframe>`-basert thumbnail-generator.

```
Default: 180×112px
Border radius: 8px
Bakgrunn: fargepalett basert på slide-indeks (8 paletter, syklisk)
Border: 1px solid rgba(255,255,255,0.09) (normal), 2px solid accent (valgt)
Box shadow ved valgt: 0 0 0 3px accentDim

Drag-tilstand:
  transform: scale(1.05) rotate(-1.5deg)
  box-shadow: 0 16px 40px rgba(0,0,0,0.7)
  opacity på opprinnelig plass: 0.3
```

Innhold (placeholder-streker):
```
5px bred aksent-strek (55% bredde) — "tittel"
3px grå streker × 3 — "innhold"
Sidenummer: bottom-right, 10px, rgba(255,255,255,0.3)
```

### `<Button>`

To størrelser: standard og `small`.

```typescript
type ButtonVariant = 'default' | 'primary' | 'danger';

// Standard
padding: '8px 17px', fontSize: 13, borderRadius: 8
background: surfaceHover, border: 1px solid borderMid, color: text

// Primary
background: accent, color: '#fff'
box-shadow: 0 4px 14px accentGlow

// Small
padding: '5px 12px', fontSize: 12

// Disabled: opacity 0.4
```

---

## 4. Skjermbilder og tilstander

### 4.1 Hjemskjerm (`screen = 'home'`)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ● ● ●              Lysbilde                    │  42px titlebar
├──────────┬──────────────────────────────────────┤
│          │  Presentasjoner          [+ Ny]       │
│  Alle    │                                       │
│  Stjerne │  ┌────┐  ┌────┐  ┌────┐  ┌────┐    │
│  Siste   │  │    │  │    │  │    │  │ +  │    │  3-kol grid
│  Papirkurv  └────┘  └────┘  └────┘  └────┘    │
│          │  Tittel   Tittel   Tittel             │
└──────────┴──────────────────────────────────────┘
 190px                      flex:1
```

**Interaksjon:**
- Klikk på prosjektkort → `openProject(project)` → navigerer til organizer
- Klikk på "+ Ny presentasjon"-knapp eller "+ kort" → `NewProjectModal`
- Sidebar-navigasjon: kun visuell filtrering i prototypen (ikke implementert backend)

### 4.2 Slide-organisator (`screen = 'organizer'`)

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  ● ● ●  ‹  Q2 Produktlansering                    │  titlebar
├──────────┬─────────────────────────────────────────┤
│ 6 SLIDES │  [+ Legg til] [↓ Importer]   [hint]    │
│ ⠿ 1 🖼 Tittel │                                    │
│ ⠿ 2 🖼 Agenda │  ┌────┐ ┌────┐ ┌────┐            │
│ ⠿ 3 🖼 Marked │  │ 1  │ │ 2  │ │ 3  │            │  3-kol grid
│ ...       │  └────┘ └────┘ └────┘            │
│           │  ┌────┐ ┌────┐ ┌ +  ┐            │
│           │  │ 4  │ │ 5  │ └────┘            │
│ [▶ Presenter] │                               │
└──────────┴─────────────────────────────────────────┘
  198px               flex:1
```

**Drag-and-drop (HTML5 API):**
```typescript
// State
dragIdx: number | null   // Hvilken slide som dras
overIdx: number | null   // Hvilken slot musen er over

// Håndterere (på hvert slide-element)
onDragStart(e, i) → e.dataTransfer.effectAllowed = 'move'; setDragIdx(i)
onDragOver(e, i)  → e.preventDefault(); setOverIdx(i)
onDrop(e, i)      → splice dragIdx ut, sett inn ved i; setSlides(ny_array)
onDragEnd()       → reset dragIdx og overIdx

// Visuell feedback
- Opprinnelig posisjon: opacity 0.3
- Drop-target: outline 2px solid accent
- Sidepanel-item: outline 1.5px solid accent ved hover under drag
```

**Sidefeltliste:**
- Hvert item: `draggable`, viser grippe-ikon (`⠿`), thumbnail 42×27px, tittel
- Aktiv/valgt: `surfaceHover` bakgrunn
- `[▶ Presenter]`-knapp er alltid synlig nederst

### 4.3 Presentasjonsmodus (`screen = 'present'`)

**Layout:**
```
┌────────────────────────────────────────────────────┐
│                                                    │
│           [HTML-slide rendres her]                 │  flex:1
│                                                    │
│   ← klikk-sone (20% bredde)  → klikk-sone (20%) │
│                          [N / Total]               │  top-right overlay
├────────────────────────────────────────────────────┤
│  [←] [→]  ● ● ● ● ●   Slide-tittel  [⛶] [✕]    │  52px kontrollbar
└────────────────────────────────────────────────────┘
```

**Kontrollbar (52px, bakgrunn rgba(0,0,0,0.9) + blur):**
- `[←]` / `[→]`: 32×32px knapper, border-radius 7, deaktivert ved første/siste slide
- Dot-navigasjon: aktiv dot er 18px bred (pill-form), inaktive 7px, gap 6px
- Fullskjerm-toggle: bytter mellom `⛶ Fullskjerm` og `⊡ Vindu`
- `[✕ Avslutt]`: tilbake til organizer

**Tastaturnavigasjon:**
```
ArrowRight / Space  → neste slide
ArrowLeft           → forrige slide
Escape              → avslutt fullskjerm (første trykk) eller avslutt modus (andre trykk)
```

**Click-to-navigate:**
- Klikk på høyre 20% av slideflaten → neste
- Klikk på venstre 20% → forrige
- Klikk i midten → neste (standard)

**Fullskjerm:** I prototypen: `z-index: 100` overlapper hele app-vinduet. I Tauri: bruk `appWindow.setFullscreen(true)` fra `@tauri-apps/api/window`.

### 4.4 Import-modal

Overlay på toppen av gjeldende skjerm. `position: absolute, inset: 0`, bakgrunn `rgba(0,0,0,0.65)`.

```
Modal-bredde: 460px
Innhold:
  - Tittel + beskrivelse
  - Drop-sone (2px dashed border, padding 22px)
  - Fil-liste (thumbnail + filnavn + størrelse + × fjern)
  - [Avbryt] [Importer N slides]
```

I Tauri-implementasjonen erstattes "Velg filer..."-knappen med:
```typescript
import { open } from '@tauri-apps/api/dialog';
const files = await open({ multiple: true, filters: [{ name: 'HTML', extensions: ['html'] }] });
```

### 4.5 Ny presentasjon-modal

```
Modal-bredde: 380px
Innhold:
  - Tittel: "Ny presentasjon"
  - Tekstinput med live border-fargeendring (accent ved fokus/utfyllt)
  - Enter-tast bekrefter
  - [Avbryt] [Opprett] (deaktivert til navn er utfylt)
```

---

## 5. Datamodeller

```typescript
interface Project {
  id: number;
  title: string;
  count: number;       // Antall slides (computed fra slides.length)
  date: string;        // Relativ dato-tekst
  size: string;        // Total filstørrelse (computed)
  slides: Slide[];
}

interface Slide {
  id: number;
  title: string;       // Vises under thumbnail og i sidefelt
  file: string;        // Relativ filsti til HTML-fil
}
```

**Persistens (Tauri):**
```
~/.lysbilde/projects/
  {project-id}/
    project.json        ← Project metadata + slides-array (filreferanser + rekkefølge)
    thumbnails/
      {slide-id}.png    ← Forhåndsgenerert thumbnail-bilde
```

Originalfilene endres aldri — Lysbilde lagrer kun referanser.

---

## 6. Animasjoner og overganger

```css
/* Skjermovergang (slideUp) */
@keyframes slideUp {
  from { transform: translateY(10px); }
  to   { transform: translateY(0); }
}
animation: slideUp 0.22s ease;

/* Modal-inngang (dropIn) */
@keyframes dropIn {
  from { transform: translateY(-8px) scale(0.97); }
  to   { transform: translateY(0) scale(1); }
}
animation: dropIn 0.22s ease;

/* Overlay-bakgrunn (fadeIn) */
@keyframes fadeIn {
  from { transform: scale(0.98); }
  to   { transform: scale(1); }
}
```

> ⚠️ Ikke bruk `opacity: 0` i `from`-states uten `animation-fill-mode: forwards`. Statiske rendere (PDF, screenshots) fryser animasjoner i startposisjonen og gjør innhold usynlig.

**Hover-overganger:**
```css
transition: border-color .15s, transform .15s;   /* ProsjektKort */
transition: background .1s;                       /* Menypunkt */
transition: opacity .15s;                         /* Dragtilstand */
transition: width .2s, background .2s;            /* Dot-navigasjon */
```

---

## 7. Thumbnail-generering

I prototypen: placeholder-grafikk generert fra slide-indeks.

**Anbefalt Tauri-implementasjon:**
1. Bruk en skjult `<webview>` ved import for å laste HTML-filen
2. Kall `webview.captureImage()` eller bruk screenshot-API
3. Lagre som `thumbnails/{slide-id}.png`
4. Oppdater thumbnail ved endring i kildefilen (filovervåking med `tauri-plugin-fs-watch`)

```rust
// Pseudokode Tauri backend
#[tauri::command]
async fn generate_thumbnail(file_path: String) -> Result<Vec<u8>, String> {
    // Load HTML in headless webview, capture screenshot, return PNG bytes
}
```

---

## 8. Foreslått implementeringssekvens

### Fase 1 — Kjerne (MVP): Vise HTML-slides

**Mål:** Brukeren kan åpne en HTML-fil og se den fullskjerm.

1. **App-skall + vindu-oppsett**
   - Tauri-vindu med riktig størrelse og uten standard chrome
   - Dark bakgrunn, custom titlebar med trafikklys (via `decorations: false`)

2. **Slide-visning (WebviewWindow)**
   - Vis én HTML-fil i en fullskjerm `<webview>`
   - Tastaturnavigasjon: piltaster sender events til Rust-backend
   - Kontrollbar nederst (Escape, ← →)

3. **Åpne fil**
   - `tauri-plugin-dialog` for å velge en HTML-fil
   - Vis den umiddelbart

**Leveranse:** Brukeren kan åpne én HTML-fil og navigere (selv om det bare er én slide).

---

### Fase 2 — Prosjekt: Samle flere slides

**Mål:** Brukeren kan lage en presentasjon av flere HTML-filer.

4. **Datalag**
   - `serde`-serialisert `Project`-struct lagret som JSON
   - CRUD for prosjekter og slides
   - `tauri-plugin-store` eller `serde_json` mot fil

5. **Import-flyt**
   - Dialog for å velge N HTML-filer
   - Legg til som slides med auto-genererte titler (fra `<title>`-tag i HTML)
   - Lagre filreferanser (ikke kopier filene)

6. **Slide-navigasjon i presentasjonsmodus**
   - Naviger mellom slides med piltaster
   - `currentSlide`-tilstand i frontend
   - Slide-teller overlay

**Leveranse:** Brukeren kan lage en presentasjon, legge til slides og presentere dem i rekkefølge.

---

### Fase 3 — Organisator: Redigere rekkefølge

**Mål:** Brukeren kan se og omorganisere slides.

7. **Thumbnail-generering**
   - Bakgrunns-capture av hvert slide ved import
   - Lagre som PNG, vis i UI

8. **Slide-organisator (drag-and-drop)**
   - Rutenettvisning med thumbnails
   - HTML5 drag-and-drop for resortering
   - Sidepanel med listvisning

9. **Hjemskjerm**
   - Prosjektoversikt med kort
   - Lag nytt prosjekt, åpne eksisterende, slett

**Leveranse:** Fullt fungerende MVP tilsvarende prototype.

---

### Fase 4 — Polering og robusthet

10. **Filhåndtering**
    - Håndter at kildefiler flyttes eller slettes (vis advarsel, tilby å finne på nytt)
    - Relativ vs. absolutt filsti (vurder å kopiere filer inn i prosjektmappe)

11. **Tastatursnarvei-oversikt** (`⌘+N`, `⌘+O`, `F` for fullskjerm, osv.)

12. **Fullskjerm-modus** (`appWindow.setFullscreen(true)`)

13. **Innstillinger** (temavalg, standard presentasjonsvisning, etc.)

---

### Fase 5 — Annotasjoner (fremtidig)

14. **Annotasjonslag** (canvas-overlay oppå webview)
    - Sticky notes, tekst, piler, rektangler
    - Lagres som `annotations/{slide-id}.json`
    - Vises som SVG/Canvas-lag over HTML-innholdet
    - Originalfilen røres aldri

---

## 9. Tauri-spesifikke merknader

| Funksjon | Tauri API |
|---|---|
| Åpne fil-dialog | `@tauri-apps/plugin-dialog` → `open()` |
| Lese filinnhold | `@tauri-apps/plugin-fs` → `readFile()` |
| Lagre JSON-data | `@tauri-apps/plugin-store` eller skriv til `app_data_dir()` |
| Fullskjerm | `@tauri-apps/api/window` → `appWindow.setFullscreen()` |
| Vis HTML-fil | `<webview src="file://{absolutt_sti}">` eller `WebviewWindow` |
| Tastatursnarvei globalt | `@tauri-apps/plugin-global-shortcut` |
| Filovervåking | `@tauri-apps/plugin-fs` → `watch()` |
| Thumbnail-generering | Custom Rust-kommando med headless rendering |

**Viktig:** `<webview>` i Tauri krever at `allowlist` inkluderer de riktige originene, og at CSP er satt riktig for lokale HTML-filer (`file://`-protokoll).

---

## 10. Viktige designbeslutninger å bevare

1. **Originalfiler endres aldri** — all metadata lagres i prosjektfilen, aldri i HTML-kilden
2. **Mørkt tema er primært** — ingen lys-modus er designet
3. **Systemfont** — SF Pro/systemfont er korrekt valg for macOS-native følelse
4. **Fullskjerm er standard presentasjonsform** — innebygd visning er for gjennomgang
5. **Rekkefølge er ikke metadata om filen** — det er presentasjonsdata, lagret separat
6. **Thumbnails er cache** — de kan alltid regenereres fra kildefilen
