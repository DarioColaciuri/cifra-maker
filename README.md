# Cifra Maker

Professional chord chart editor built with React + TypeScript. Create beautiful, printable lead sheets for musicians.

![Cifra Maker](public/icons.svg)

## Features

- **Drag & Drop** — Build chords in the sidebar and drag them onto measures. Reorder chords and sections by dragging.
- **Visual Chord Builder** — Piano keyboard, quality selector, and extensions. No need to memorize chord notation.
- **Professional Notation** — Jazz symbols (Δ, ♭, ♯, ø) or standard text (maj7, b5, m7b5). Toggle anytime.
- **Sheet Music Layout** — A4 portrait page with continuous staff lines, 4 measures per system, double barlines, repeat signs, and more.
- **Musical Symbols** — Fermata, Coda, Segno, Fine, D.C./D.S., volta brackets (1st/2nd ending), rehearsal marks.
- **Audio Preview** — Web Audio API synthesizer plays piano-like arpeggios when you build or click chords.
- **Undo/Redo** — Unlimited history (Ctrl+Z / Ctrl+Shift+Z).
- **Auto-Save** — LocalStorage persistence. Reload and continue where you left off.
- **Export** — PNG, HD PNG, and PDF export.
- **Dark Theme** — Refined dark UI with amber accents, paper-textured page.

## Tech Stack

- React 19
- TypeScript
- Vite
- TailwindCSS v4
- Zustand (state management)
- @dnd-kit (drag & drop)
- html2canvas + jsPDF (export)
- Web Audio API (preview)
- Immer (immutable updates)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## License

MIT
