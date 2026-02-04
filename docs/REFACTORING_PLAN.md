# FRACTRAN Animator — Refactoring Plan

> Created: February 2026
> Status: **Planning**
> Goal: Reduce duplication, improve maintainability, make it easier to add features

---

## The Problem

The codebase grew organically as features were added. This led to:
- **Copy-paste duplication** across widgets
- **A monolithic hook** (`useFractranSim`) doing too many things
- **Inconsistent patterns** for similar problems
- **Brittle code** that requires touching multiple files for simple changes

This plan addresses these issues in phases, starting with quick wins.

---

## Phase 1: Quick Wins (Deduplication)

**Goal:** Remove obvious duplication without changing architecture.
**Estimated scope:** 4 files touched, ~100 lines removed

### 1.1 Extract `formatPrimeFactors()` to shared utility

**Problem:** The exact same 31-line function exists in 4 files:
- `components/widgets/MiniSim.tsx`
- `components/widgets/NumberGameWidget.tsx`
- `components/widgets/ProgramBuilder.tsx`
- `pages/Sandbox.tsx`

**Solution:** Create `services/formatters.ts`:
```typescript
// services/formatters.ts
const superscriptMap: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};

export function formatPrimeFactors(regs: PrimeMap): string {
  // move implementation here
}
```

**Action items:**
- [ ] Create `services/formatters.ts`
- [ ] Move `formatPrimeFactors` and `superscriptMap` into it
- [ ] Update imports in all 4 files
- [ ] Delete duplicate implementations

---

### 1.2 Remove duplicate `numberToRegisters()`

**Problem:** `NumberGameWidget.tsx` has `numberToRegisters()` which reimplements the prime factorization logic that already exists in `fractranLogic.ts` as `getPrimeFactors()`.

**Solution:** Delete `numberToRegisters()` and use the existing function.

**Action items:**
- [ ] In `NumberGameWidget.tsx`, import `getPrimeFactors` from `fractranLogic.ts`
- [ ] Replace calls to `numberToRegisters(n)` with `getPrimeFactors(n)`
- [ ] Delete the `numberToRegisters` function

---

### 1.3 Move magic constants to `constants.ts`

**Problem:** `useFractranSim.ts` has hardcoded values:
```typescript
const MAX_HISTORY_DEFAULT = 2000;
const INSTANT_SPEED_THRESHOLD = 90;
const FORECAST_LIMIT = 5000;
```

**Solution:** Move to `constants.ts` for visibility and easy tuning.

**Action items:**
- [ ] Add constants to `constants.ts`
- [ ] Import them in `useFractranSim.ts`

---

## Phase 2: Split the Monolithic Hook

**Goal:** Break `useFractranSim.ts` (397 lines) into focused, testable pieces.
**Estimated scope:** Major refactor, 1 large file → 3-4 smaller files

### Why this matters

The current hook manages:
1. Program parsing
2. History array + scrubbing
3. Animation state machine (5 phases)
4. Timer/interval management
5. Event detection & logging
6. Speed calculations
7. Forecast calculations
8. Register editing

Adding any new feature (breakpoints, export, custom animations) means modifying this god object.

### 2.1 Extract `useSimulationHistory`

**Responsibility:** Manage the history array and scrubbing.

```typescript
// hooks/useSimulationHistory.ts
interface UseSimulationHistoryProps {
  maxHistory?: number;
}

interface UseSimulationHistoryReturn {
  history: ProgramState[];
  historyIndex: number;
  addToHistory: (state: ProgramState) => void;
  scrubTo: (index: number) => void;
  reset: (initialState: ProgramState) => void;
  isAtEnd: boolean;
}
```

**Action items:**
- [ ] Create `hooks/useSimulationHistory.ts`
- [ ] Extract history-related state and logic
- [ ] Update `useFractranSim` to use this hook

---

### 2.2 Extract `useAnimationController`

**Responsibility:** Handle play/pause, speed, animation phases, timer intervals.

```typescript
// hooks/useAnimationController.ts
interface UseAnimationControllerProps {
  onTick: () => void;  // called each animation frame
  speed: number;
}

interface UseAnimationControllerReturn {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  phase: AnimationPhase;
  setPhase: (phase: AnimationPhase) => void;
}
```

**Action items:**
- [ ] Create `hooks/useAnimationController.ts`
- [ ] Extract timer/interval logic
- [ ] Extract phase state machine
- [ ] Update `useFractranSim` to use this hook

---

### 2.3 Extract `useEventDetector`

**Responsibility:** Detect special events (halt, power of two, Fibonacci, etc.)

```typescript
// hooks/useEventDetector.ts
type EventDetector = (prev: ProgramState, next: ProgramState) => SimulationEvent | null;

interface UseEventDetectorProps {
  detectors: EventDetector[];
}

interface UseEventDetectorReturn {
  events: SimulationEvent[];
  checkForEvents: (prev: ProgramState, next: ProgramState) => void;
  clearEvents: () => void;
}
```

**Benefit:** Widgets can provide custom event detectors without modifying the core hook.

**Action items:**
- [ ] Create `hooks/useEventDetector.ts`
- [ ] Extract event detection logic from `useFractranSim`
- [ ] Create default detectors (halt, power of two, etc.)
- [ ] Make detectors configurable per-widget

---

### 2.4 Slim down `useFractranSim`

After extraction, `useFractranSim` becomes a **composition layer**:

```typescript
export function useFractranSim(props: UseFractranSimProps) {
  const history = useSimulationHistory({ maxHistory: props.maxHistory });
  const animation = useAnimationController({ onTick: step, speed });
  const events = useEventDetector({ detectors: props.eventDetectors ?? defaultDetectors });

  // Compose and expose unified API
  return {
    ...history,
    ...animation,
    events: events.events,
    step,
    reset,
    // etc.
  };
}
```

**Target:** `useFractranSim` should be under 150 lines after this refactor.

---

## Phase 3: Consolidate Widget Patterns

**Goal:** Reduce boilerplate when creating new widgets.
**Estimated scope:** Medium refactor, new abstraction

### 3.1 Create `useWidgetBase` hook

**Problem:** Every widget repeats the same initialization:
- Parse fraction program with `useMemo`
- Initialize registers
- Create reset handler
- Wire up `useFractranSim`

**Solution:** Extract common patterns:

```typescript
// hooks/useWidgetBase.ts
interface UseWidgetBaseProps {
  program: string | string[];
  initialRegisters?: PrimeMap;
  editableRegisters?: number[];
  autoPlay?: boolean;
}

export function useWidgetBase(props: UseWidgetBaseProps) {
  // Common initialization logic
  const fractionProgram = useMemo(() => parseProgram(props.program), [props.program]);
  const sim = useFractranSim({ ... });

  return {
    sim,
    fractionProgram,
    // common handlers
  };
}
```

**Action items:**
- [ ] Identify common patterns across widgets
- [ ] Create `hooks/useWidgetBase.ts`
- [ ] Refactor widgets to use it
- [ ] Document the pattern in ARCHITECTURE.md

---

### 3.2 Standardize widget props interface

**Problem:** Widgets have slightly different prop names:
- `editableStart` vs `editableRegisters`
- `initialN` vs `initialRegisters`
- Some take `program: string`, others `program: string[]`

**Solution:** Define canonical interfaces:

```typescript
// types.ts
interface BaseWidgetProps {
  /** Program as string ("3/2, 1/3") or array (["3/2", "1/3"]) */
  program: string | string[];
  /** Initial register values */
  initialRegisters?: PrimeMap;
  /** Which registers can be edited (prime bases) */
  editableRegisters?: number[];
  /** Start playing automatically */
  autoPlay?: boolean;
}
```

**Action items:**
- [ ] Add `BaseWidgetProps` to `types.ts`
- [ ] Update widgets to extend/use this interface
- [ ] Migrate inconsistent prop names

---

## Phase 4: Strengthen Types

**Goal:** Make invalid states unrepresentable.
**Estimated scope:** Small refactor, improves safety

### 4.1 Typed fraction input state

**Problem:** Fraction inputs are `{ num: string; den: string }[]` — allows invalid states (empty strings, "abc", etc.)

**Solution:**
```typescript
// types.ts
export type FractionInputState =
  | { status: 'empty' }
  | { status: 'editing'; num: string; den: string }
  | { status: 'valid'; num: number; den: number };
```

**Action items:**
- [ ] Add `FractionInputState` type
- [ ] Update `Sandbox.tsx` fraction editing
- [ ] Update `ProgramBuilder.tsx` fraction editing

---

### 4.2 Consolidate edit mode state

**Problem:** "Editable" state is split across:
- `editableRegisters` prop
- `step === 0` check for "setup mode"
- `isSetupMode` prop on RegisterBoard

**Solution:** Single source of truth:
```typescript
interface RegisterBoardProps {
  editMode: 'locked' | { editable: number[] };
  // instead of: editableRegisters + isSetupMode
}
```

**Action items:**
- [ ] Simplify RegisterBoard props
- [ ] Remove redundant `isSetupMode` derivation
- [ ] Update all call sites

---

## Phase 5: Future Improvements (Lower Priority)

These can be done opportunistically:

### 5.1 Extract RegisterBoard sizing logic
Move magic numbers (8, 5) and responsive classes into a `getSizeConfig()` utility.

### 5.2 Extract phase-specific renderers
Pull bead rendering logic out of RegisterBoard into focused functions.

### 5.3 Standardize chapter structure
Create a `createChapter()` helper for consistent chapter metadata.

### 5.4 Unify animation approaches
Decide between the 5-phase animation (useFractranSim) and simple timer (NumberGameWidget).

---

## Execution Order

Recommended order based on dependencies and risk:

```
Phase 1 (Quick Wins)
  ├── 1.1 Extract formatPrimeFactors ←── START HERE
  ├── 1.2 Remove numberToRegisters
  └── 1.3 Move constants

Phase 2 (Split Hook) ←── Biggest impact
  ├── 2.1 Extract useSimulationHistory
  ├── 2.2 Extract useAnimationController
  ├── 2.3 Extract useEventDetector
  └── 2.4 Slim down useFractranSim

Phase 3 (Widget Patterns)
  ├── 3.1 Create useWidgetBase
  └── 3.2 Standardize props

Phase 4 (Types)
  ├── 4.1 Typed fraction input
  └── 4.2 Consolidate edit mode

Phase 5 (Polish) ←── As needed
  └── ...
```

---

## Success Criteria

After completing Phases 1-3:
- [ ] No function is duplicated across files
- [ ] `useFractranSim.ts` is under 150 lines
- [ ] Adding a new widget requires < 50 lines of boilerplate
- [ ] Event detection is pluggable (can add custom detectors)
- [ ] All constants are in `constants.ts`

---

## Notes

- **Test as you go:** Run `npm run build` after each change to catch type errors
- **Commit often:** Small, focused commits make it easier to revert if needed
- **Don't over-engineer:** Stop when the code is "good enough" — perfect is the enemy of done
