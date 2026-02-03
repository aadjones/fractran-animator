# FRACTRAN

A guided, interactive exploration of Conway's FRACTRAN — an esoteric programming language that uses fraction multiplication to perform computation. Built as an explorable explanation in the style of Nicky Case and Exploding Dots.

## What's here

- **Guided chapters** that introduce FRACTRAN from scratch — starting as a simple number game, building to the insight of prime factorization, and culminating in Conway's PRIMEGAME
- **Interactive widgets** embedded in the narrative — step through computations, experiment with different inputs
- **Full sandbox** for free-play with any FRACTRAN program, including preset programs (addition, multiplication, Fibonacci, division, prime generation)

## Run Locally

**Prerequisites:** Node.js (v18 or higher)

```bash
npm install
npm run dev
```

Open `http://localhost:3000/fractran-animator/`

## Deploy to GitHub Pages

Automatic deployment via GitHub Actions on push to main. Or manually:

```bash
npm run deploy
```

## Project Structure

```
/
  App.tsx                      # Router shell (hash-based routing)
  types.ts                     # TypeScript interfaces
  constants.ts                 # Preset FRACTRAN programs

  hooks/
    useFractranSim.ts          # Simulation state machine (extracted hook)
    useHash.ts                 # Hash routing

  services/
    fractranLogic.ts           # Pure FRACTRAN simulation logic

  components/
    RegisterBoard.tsx          # Bead visualization (prime registers)
    ProgramPanel.tsx           # Rule list with scanning animation
    Controls.tsx               # Play/pause/step/speed/scrubber
    ChapterLayout.tsx          # Chapter page shell
    Prose.tsx                  # Styled typography for narrative
    widgets/
      NumberGameWidget.tsx     # Raw number view (pre-insight)
      MiniSim.tsx              # Self-contained compact simulator

  chapters/                    # Chapter content (JSX)
  pages/
    Landing.tsx                # Table of contents
    Sandbox.tsx                # Full simulator
  docs/
    ARCHITECTURE.md            # Architecture notes for contributors
```

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — type safety
- **Vite** — build tool
- **Tailwind CSS** — styling (via CDN)
- **lucide-react** — icons

No routing library, no state management library. Hash-based routing and a custom simulation hook handle everything.

## License

MIT
