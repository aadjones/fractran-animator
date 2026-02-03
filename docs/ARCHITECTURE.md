# FRACTRAN Explorable Explanation — Architecture

> This document is for future Claude Code sessions. It describes the project architecture and teaching arc.

## Vision

Transform the existing single-page FRACTRAN simulator into a **guided, chapter-based explorable explanation** (in the style of Nicky Case / Exploding Dots). The teaching arc builds from a simple number game to Conway's PRIMEGAME, with the key "aha moment" being the switch from raw numbers to the prime-register/dots view.

**Navigation**: Hybrid — scrollable sections within chapters, clear transitions between chapters.
**Simulator**: Both — interactive widgets embedded in lessons + full sandbox mode accessible separately.

---

## Teaching Arc (7 Chapters)

| # | Title | Core Idea | Key Widget |
|---|-------|-----------|------------|
| 1 | What is FRACTRAN? | A simple game with fractions and a number | None (just prose) |
| 2 | The Number Game | Multiply by fractions, watch numbers bounce | `NumberGameWidget` |
| 3 | Inside the Numbers | Prime factors reveal hidden structure | `DualViewWidget` |
| 4 | Puzzles | Move dots, create loops, build programs | `PuzzleWidget` |
| 5 | Computing with Fractions | Addition, multiplication | `MiniSim` with presets |
| 6 | Loops and Sequences | Fibonacci, division | `MiniSim` with presets |
| 7 | PRIMEGAME | Conway's prime generator — the finale | `NumberTraceWidget` + `MiniSim` |

---

## Architecture

### Routing: Hash-based, no library
- Routes: `#/` (landing), `#/chapter/1`-`#/chapter/7`, `#/sandbox`
- `useHash` hook + `Router` component in App.tsx
- Works on GitHub Pages without configuration

### State: `useFractranSim` custom hook
- All simulation state extracted from old App.tsx into `hooks/useFractranSim.ts`
- Each interactive widget gets its own independent hook instance
- No contexts, no state library — just the hook
- Exposes: `currentState`, `nValue`, `history`, `isPlaying`, `speed`, `phase`, animation state, `step()`, `reset()`, `scrub()`, `editRegister()`, `load()`

### Content: Plain JSX chapter components
- No MDX, no markdown processing
- `Prose.tsx` provides styled primitives (`P`, `H2`, `Callout`, etc.)
- Each chapter is a React component mixing prose with embedded interactive widgets

### Component reuse
- Existing `RegisterBoard`, `ProgramPanel`, `Controls` used directly via props
- New lightweight widgets (`NumberGameWidget`, `DualViewWidget`, `PuzzleWidget`) compose these
- `MiniSim` is a self-contained simulator widget (RegisterBoard + Controls + own state)

---

## File Organization

```
/
  App.tsx                      # Router shell
  index.tsx                    # Entry point
  types.ts                     # All TypeScript interfaces
  constants.ts                 # Preset programs + primes list

  hooks/
    useFractranSim.ts          # Extracted simulation state machine
    useHash.ts                 # Hash routing hook

  services/
    fractranLogic.ts           # Pure FRACTRAN simulation logic

  components/
    RegisterBoard.tsx          # Bead visualization (prime registers)
    ProgramPanel.tsx           # Rule list with scanning animation
    Controls.tsx               # Play/pause/step/speed/scrubber
    EventLog.tsx               # Event history
    Configuration.tsx          # Preset/custom editor modal (sandbox only)
    ChapterLayout.tsx          # Chapter page shell (title, scroll, nav)
    Prose.tsx                  # Styled typography for narrative

    widgets/
      MiniSim.tsx              # Self-contained simulator (RegisterBoard + Controls)
      NumberGameWidget.tsx     # Raw number view (no registers — pre-insight)
      DualViewWidget.tsx       # Number + registers side by side (Phase 2)
      PuzzleWidget.tsx         # Goal-oriented simulator (Phase 3)
      NumberTraceWidget.tsx    # Sequence trace for PRIMEGAME (Phase 3)

  chapters/
    index.ts                   # Chapter registry
    Chapter1Intro.tsx          # What is FRACTRAN?
    Chapter2NumberGame.tsx     # The number game
    Chapter3Insight.tsx        # Prime factorization reveal (Phase 2)
    Chapter4Puzzles.tsx        # Interactive puzzles (Phase 2-3)
    Chapter5BasicComp.tsx      # Addition, multiplication (Phase 2)
    Chapter6AdvancedComp.tsx   # Division, Fibonacci (Phase 3)
    Chapter7PrimeGame.tsx      # PRIMEGAME finale (Phase 3)

  pages/
    Landing.tsx                # Table of contents / home
    Sandbox.tsx                # Full simulator (original app)

  docs/
    ARCHITECTURE.md            # This file
```

---

## Key Patterns

### Adding a new chapter
1. Create `chapters/ChapterNFoo.tsx` as a React component
2. Use `Prose` components for narrative text (`P`, `H2`, `Callout`)
3. Embed widgets (`NumberGameWidget`, `MiniSim`, etc.) inline
4. Register in `chapters/index.ts`

### Adding a new widget
1. Create `components/widgets/FooWidget.tsx`
2. Use `useFractranSim` hook internally for simulation state
3. Compose existing components (`RegisterBoard`, `Controls`) as needed
4. Widget should be fully self-contained — no external state management

### The `useFractranSim` hook
Central abstraction. Call it with program + initial state, get back everything:
```typescript
const sim = useFractranSim({
  program: ["3/2"],
  initialRegisters: { 2: 3, 3: 2 },
  editableRegisters: [2, 3],
});
// sim.currentState, sim.step(), sim.reset(), sim.isPlaying, etc.
```
