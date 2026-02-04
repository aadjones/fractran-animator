import { useState, useEffect, useCallback, useMemo } from 'react';
import { Fraction, ProgramState, PrimeMap, EventType } from '../types';
import { parseProgram, stepSimulation, canApplyRule, applyRule, calculateValue } from '../services/fractranLogic';
import { PRIMES, FORECAST_LIMIT } from '../constants';
import { useSimulationHistory } from './useSimulationHistory';
import { useAnimationController } from './useAnimationController';
import { useEventDetector } from './useEventDetector';

// Dry run to find halt step
const calculateMaxSteps = (regs: PrimeMap, program: Fraction[]): number | null => {
  let currentRegs = { ...regs };
  let steps = 0;

  while (steps < FORECAST_LIMIT) {
    let applied = false;
    for (const rule of program) {
      if (canApplyRule(currentRegs, rule)) {
        currentRegs = applyRule(currentRegs, rule);
        steps++;
        applied = true;
        break;
      }
    }
    if (!applied) return steps;
  }
  return null;
};

export interface FractranSimOptions {
  program: string[];
  initialRegisters: PrimeMap;
  editableRegisters?: number[];
  enabledEvents?: EventType[];
  maxHistory?: number;
  initialSpeed?: number;
}

/**
 * Main simulation hook - composes history, animation, and event detection.
 * This is the public API used by widgets.
 */
export function useFractranSim(initialOptions: FractranSimOptions) {
  // Program data
  const [fractions, setFractions] = useState<Fraction[]>(() =>
    parseProgram(initialOptions.program)
  );
  const [editableRegisters, setEditableRegisters] = useState<number[]>(
    initialOptions.editableRegisters ?? []
  );
  const [totalSteps, setTotalSteps] = useState<number | null>(() => {
    const parsed = parseProgram(initialOptions.program);
    return calculateMaxSteps(initialOptions.initialRegisters, parsed);
  });

  // Create initial state for history
  const initialState: ProgramState = useMemo(() => ({
    registers: { ...initialOptions.initialRegisters },
    step: 0,
    lastRuleIndex: null,
    halted: false,
  }), []); // Only compute once on mount

  // Compose sub-hooks
  const historyHook = useSimulationHistory({
    initialState,
    maxHistory: initialOptions.maxHistory,
  });

  const eventsHook = useEventDetector({
    enabledEvents: initialOptions.enabledEvents,
  });

  // Callbacks for animation controller
  const handleStep = useCallback(
    (nextState: ProgramState) => {
      const prevState = historyHook.currentState;
      historyHook.pushState(nextState);
      eventsHook.checkEvents(prevState, nextState);
    },
    [historyHook, eventsHook]
  );

  const handleHalt = useCallback(
    (haltedState: ProgramState) => {
      const prevState = historyHook.currentState;
      historyHook.pushState(haltedState);
      eventsHook.checkEvents(prevState, haltedState);
    },
    [historyHook, eventsHook]
  );

  const animationHook = useAnimationController({
    onStep: handleStep,
    onHalt: handleHalt,
    initialSpeed: initialOptions.initialSpeed,
  });

  // Run animation loop
  useEffect(() => {
    if (animationHook.isPlaying && !historyHook.currentState.halted) {
      animationHook.tick(historyHook.currentState, fractions);
    }
  }, [
    animationHook.isPlaying,
    animationHook.phase,
    animationHook.scanningIndex,
    historyHook.currentState,
    fractions,
    animationHook,
  ]);

  // Derived values
  const nValue = useMemo(() => {
    return calculateValue(historyHook.currentState.registers).toString();
  }, [historyHook.currentState.registers]);

  const usedPrimes = useMemo(() => {
    const set = new Set<number>();
    fractions.forEach(f => {
      Object.keys(f.numPrimes).forEach(p => set.add(Number(p)));
      Object.keys(f.denPrimes).forEach(p => set.add(Number(p)));
    });
    Object.keys(historyHook.currentState.registers).forEach(p => set.add(Number(p)));
    editableRegisters.forEach(p => set.add(p));

    if (set.size === 0) return [];

    const maxPrime = Math.max(...Array.from(set));
    const contiguous = PRIMES.filter(p => p <= maxPrime);

    Array.from(set).forEach(p => {
      if (!contiguous.includes(p)) contiguous.push(p);
    });

    return contiguous.sort((a, b) => a - b);
  }, [fractions, historyHook.currentState.registers, editableRegisters]);

  const activeFraction =
    animationHook.phase === 'scanning' && animationHook.scanningIndex !== null
      ? fractions[animationHook.scanningIndex]
      : animationHook.activeRuleIndex !== null
        ? fractions[animationHook.activeRuleIndex]
        : null;

  // --- Public actions ---

  const step = useCallback(() => {
    if (historyHook.currentState.halted) return;
    const nextState = stepSimulation(historyHook.currentState, fractions);
    handleStep(nextState);
  }, [historyHook.currentState, fractions, handleStep]);

  const reset = useCallback(() => {
    animationHook.stop();
    historyHook.resetToInitial();
    eventsHook.reset('Reset.');
  }, [animationHook, historyHook, eventsHook]);

  const scrub = useCallback(
    (idx: number) => {
      animationHook.stop();
      historyHook.scrubTo(idx);
    },
    [animationHook, historyHook]
  );

  const editRegister = useCallback(
    (prime: number, delta: number) => {
      if (historyHook.currentState.step !== 0) return;
      if (!editableRegisters.includes(prime)) return;

      const currentRegs = historyHook.currentState.registers;
      const newRegs = { ...currentRegs };
      const currentCount = newRegs[prime] || 0;
      const newCount = Math.max(0, currentCount + delta);

      if (newCount === 0) delete newRegs[prime];
      else newRegs[prime] = newCount;

      const newState: ProgramState = {
        registers: newRegs,
        step: 0,
        lastRuleIndex: null,
        halted: false,
      };

      historyHook.replaceInitialState(newState);
      setTotalSteps(calculateMaxSteps(newRegs, fractions));
    },
    [historyHook, editableRegisters, fractions]
  );

  const load = useCallback(
    (
      program: string[],
      registers: PrimeMap,
      opts?: {
        editableRegisters?: number[];
        enabledEvents?: EventType[];
      }
    ) => {
      animationHook.stop();

      const parsed = parseProgram(program);
      setFractions(parsed);
      setEditableRegisters(opts?.editableRegisters ?? []);
      setTotalSteps(calculateMaxSteps(registers, parsed));

      const newInitialState: ProgramState = {
        registers: { ...registers },
        step: 0,
        lastRuleIndex: null,
        halted: false,
      };

      historyHook.replaceInitialState(newInitialState);
      eventsHook.reset('Loaded.');
      eventsHook.setEnabledEvents(opts?.enabledEvents ?? [EventType.HALT]);
    },
    [animationHook, historyHook, eventsHook]
  );

  // Return same API shape as before for compatibility
  return {
    // State
    currentState: historyHook.currentState,
    fractions,
    nValue,
    usedPrimes,
    history: historyHook.history,
    historyIndex: historyHook.historyIndex,
    events: eventsHook.events,
    totalSteps,
    editableRegisters,

    // Playback
    isPlaying: animationHook.isPlaying,
    speed: animationHook.speed,
    setSpeed: animationHook.setSpeed,
    setIsPlaying: animationHook.setIsPlaying,

    // Animation
    phase: animationHook.phase,
    activeRuleIndex: animationHook.activeRuleIndex,
    scanningIndex: animationHook.scanningIndex,
    activeFraction,

    // Actions
    step,
    reset,
    scrub,
    editRegister,
    load,
    stopSimulation: animationHook.stop,
  };
}
