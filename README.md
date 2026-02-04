# FRACTRAN Animator

A guided, interactive exploration of Conway's FRACTRAN — an esoteric programming language that uses fraction multiplication to perform computation. Built as an explorable explanation in the style of Nicky Case and Exploding Dots.

**[Try it live](https://yourusername.github.io/fractran-animator/)**

## What's here

**Guided chapters** that let you *discover* how FRACTRAN works:

1. **The Game** — Learn the rules by playing: multiply by the first fraction that works
2. **Number Game** — Explore single-fraction games and see what they do
3. **Prime Factors** — The key insight: see numbers as products of primes
4. **Visualization** — Watch dots move between prime columns
5. **Puzzles** — Design your own fraction rules
6. **Computation** — The reveal: this "game" is actually programming

**Philosophy:** No spoilers. You discover patterns before being told what they mean. "Game" terminology is used until you earn the word "program."

**Also includes:**
- **Full sandbox** for free-play with any FRACTRAN program
- **Preset programs** (addition, multiplication, Fibonacci, prime generation)

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
    RegisterBoard.tsx          # Bead visualization (prime columns)
    ProgramPanel.tsx           # Rule list with scanning animation
    Controls.tsx               # Play/pause/step/speed/scrubber
    ChapterLayout.tsx          # Chapter page shell
    Prose.tsx                  # Styled typography + Spoiler component
    widgets/
      NumberGameWidget.tsx     # Number-based view (early chapters)
      ManualStepWidget.tsx     # Interactive "is this a whole number?" widget
      MiniSim.tsx              # Compact simulator with dot visualization
      ProgramBuilder.tsx       # User creates their own fraction rules

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
