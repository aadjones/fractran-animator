import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Fraction, ProgramState, PrimeMap, SimulationEvent, EventType, AnimationPhase } from '../types';
import { parseProgram, stepSimulation, canApplyRule, applyRule, calculateValue } from '../services/fractranLogic';
import { PRIMES } from '../constants';

const MAX_HISTORY_DEFAULT = 2000;
const INSTANT_SPEED_THRESHOLD = 90;
const FORECAST_LIMIT = 5000;

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

export function useFractranSim(initialOptions: FractranSimOptions) {
  const maxHistory = initialOptions.maxHistory ?? MAX_HISTORY_DEFAULT;

  // Program Data
  const [fractions, setFractions] = useState<Fraction[]>(() => parseProgram(initialOptions.program));
  const [editableRegisters, setEditableRegisters] = useState<number[]>(initialOptions.editableRegisters ?? []);
  const [totalSteps, setTotalSteps] = useState<number | null>(() => {
    const parsed = parseProgram(initialOptions.program);
    return calculateMaxSteps(initialOptions.initialRegisters, parsed);
  });

  // Simulation History & Current Pointer
  const [history, setHistory] = useState<ProgramState[]>(() => [{
    registers: { ...initialOptions.initialRegisters },
    step: 0,
    lastRuleIndex: null,
    halted: false,
  }]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Playback Control
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialOptions.initialSpeed ?? 10);

  // Animation State
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [activeRuleIndex, setActiveRuleIndex] = useState<number | null>(null);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);
  const [targetRuleIndex, setTargetRuleIndex] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Events
  const [events, setEvents] = useState<SimulationEvent[]>([{
    step: 0,
    type: EventType.INFO,
    message: "Loaded."
  }]);
  const [enabledEventTypes, setEnabledEventTypes] = useState<EventType[]>(
    initialOptions.enabledEvents ?? [EventType.HALT]
  );

  // Derived state
  const currentState = history[historyIndex] || {
    registers: {},
    step: 0,
    lastRuleIndex: null,
    halted: false
  };

  const nValue = useMemo(() => {
    return calculateValue(currentState.registers).toString();
  }, [currentState.registers]);

  // Identify all primes relevant to this program
  const usedPrimes = useMemo(() => {
    const set = new Set<number>();
    fractions.forEach(f => {
      Object.keys(f.numPrimes).forEach(p => set.add(Number(p)));
      Object.keys(f.denPrimes).forEach(p => set.add(Number(p)));
    });
    Object.keys(currentState.registers).forEach(p => set.add(Number(p)));
    editableRegisters.forEach(p => set.add(p));

    if (set.size === 0) return [];

    const maxPrime = Math.max(...Array.from(set));
    const contiguous = PRIMES.filter(p => p <= maxPrime);

    Array.from(set).forEach(p => {
      if (!contiguous.includes(p)) contiguous.push(p);
    });

    return contiguous.sort((a, b) => a - b);
  }, [fractions, currentState.registers, editableRegisters]);

  const activeFraction = phase === 'scanning' && scanningIndex !== null
    ? fractions[scanningIndex]
    : (activeRuleIndex !== null ? fractions[activeRuleIndex] : null);

  // --- Internal helpers ---

  const stopSimulation = useCallback(() => {
    setIsPlaying(false);
    setPhase('idle');
    setActiveRuleIndex(null);
    setScanningIndex(null);
    setTargetRuleIndex(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const checkEvents = useCallback((prevState: ProgramState, newState: ProgramState) => {
    const newEvents: SimulationEvent[] = [];

    if (!prevState.halted && newState.halted && enabledEventTypes.includes(EventType.HALT)) {
      newEvents.push({
        step: newState.step,
        type: EventType.HALT,
        message: 'Program Halted'
      });
    }

    if (enabledEventTypes.includes(EventType.POWER_OF_TWO)) {
      const primes = Object.keys(newState.registers).map(Number);
      if (primes.length === 1 && primes[0] === 2) {
        const exponent = newState.registers[2];
        if (exponent > 1) {
          newEvents.push({
            step: newState.step,
            type: EventType.POWER_OF_TWO,
            message: `2^${exponent} (Prime found: ${exponent})`,
            data: exponent
          });
        }
      }
    }

    if (enabledEventTypes.includes(EventType.FIBONACCI_PAIR)) {
      const primes = Object.keys(newState.registers).map(Number);
      const hasHighPrimes = primes.some(p => p >= 5 && (newState.registers[p] || 0) > 0);

      if (!hasHighPrimes) {
        const a = newState.registers[2] || 0;
        const b = newState.registers[3] || 0;
        if (a > 0 || b > 0) {
          newEvents.push({
            step: newState.step,
            type: EventType.FIBONACCI_PAIR,
            message: `Sequence: (${a}, ${b})`,
            data: { a, b }
          });
        }
      }
    }

    if (newEvents.length > 0) {
      setEvents(prev => [...prev, ...newEvents]);
    }
  }, [enabledEventTypes]);

  const commitStep = useCallback((nextState: ProgramState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(nextState);
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }
      return newHistory;
    });

    setHistoryIndex(prev => {
      return (history.length >= maxHistory && historyIndex >= maxHistory - 1)
        ? maxHistory - 1
        : historyIndex + 1;
    });

    checkEvents(currentState, nextState);
  }, [history, historyIndex, currentState, checkEvents, maxHistory]);

  // --- Animation Loop ---

  useEffect(() => {
    if (!isPlaying || currentState.halted) {
      if (currentState.halted) setIsPlaying(false);
      return;
    }

    const isInstant = speed > INSTANT_SPEED_THRESHOLD;

    if (phase === 'idle') {
      const stepDelay = isInstant ? Math.max(10, 200 - speed * 2) : 50;

      timerRef.current = setTimeout(() => {
        let foundIndex = -1;
        for (let i = 0; i < fractions.length; i++) {
          if (canApplyRule(currentState.registers, fractions[i])) {
            foundIndex = i;
            break;
          }
        }

        if (isInstant) {
          if (foundIndex === -1) {
            const nextState = { ...currentState, halted: true, lastRuleIndex: null };
            commitStep(nextState);
            setIsPlaying(false);
          } else {
            const nextState = stepSimulation(currentState, fractions);
            commitStep(nextState);
          }
        } else {
          setTargetRuleIndex(foundIndex);
          setScanningIndex(0);
          setPhase('scanning');
        }
      }, stepDelay);
    }
    else if (phase === 'scanning') {
      const scanDelay = Math.max(20, 150 - speed);
      timerRef.current = setTimeout(() => {
        if (scanningIndex === targetRuleIndex) {
          setActiveRuleIndex(targetRuleIndex);
          setScanningIndex(null);
          setPhase('selecting');
        }
        else if (scanningIndex !== null && scanningIndex >= fractions.length - 1) {
          const nextState = { ...currentState, halted: true, lastRuleIndex: null };
          commitStep(nextState);
          stopSimulation();
        }
        else {
          setScanningIndex((prev) => (prev !== null ? prev + 1 : 0));
        }
      }, scanDelay);
    }
    else if (phase === 'selecting') {
      const delay = Math.max(50, 400 - speed * 3);
      timerRef.current = setTimeout(() => { setPhase('consuming'); }, delay);
    }
    else if (phase === 'consuming') {
      const delay = Math.max(50, 500 - speed * 4);
      timerRef.current = setTimeout(() => { setPhase('producing'); }, delay);
    }
    else if (phase === 'producing') {
      const delay = Math.max(50, 500 - speed * 4);
      timerRef.current = setTimeout(() => {
        const nextState = stepSimulation(currentState, fractions);
        commitStep(nextState);
        setPhase('idle');
        setActiveRuleIndex(null);
        setScanningIndex(null);
      }, delay);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, phase, currentState, fractions, speed, commitStep, scanningIndex, targetRuleIndex, stopSimulation]);

  useEffect(() => {
    if (history.length > 0 && historyIndex > history.length - 1) {
      setHistoryIndex(history.length - 1);
    }
  }, [history.length, historyIndex]);

  // --- Public actions ---

  const step = useCallback(() => {
    if (currentState.halted) return;
    const nextState = stepSimulation(currentState, fractions);
    commitStep(nextState);
  }, [currentState, fractions, commitStep]);

  const reset = useCallback(() => {
    stopSimulation();
    if (history.length > 0) {
      setHistory([history[0]]);
      setHistoryIndex(0);
      setEvents([{
        step: 0,
        type: EventType.INFO,
        message: "Reset."
      }]);
    }
  }, [history, stopSimulation]);

  const scrub = useCallback((idx: number) => {
    stopSimulation();
    setHistoryIndex(idx);
  }, [stopSimulation]);

  const editRegister = useCallback((prime: number, delta: number) => {
    if (currentState.step !== 0) return;
    if (!editableRegisters.includes(prime)) return;

    setHistory(prev => {
      const root = { ...prev[0] };
      const newRegs = { ...root.registers };
      const currentCount = newRegs[prime] || 0;
      const newCount = Math.max(0, currentCount + delta);

      if (newCount === 0) delete newRegs[prime];
      else newRegs[prime] = newCount;

      root.registers = newRegs;

      const max = calculateMaxSteps(newRegs, fractions);
      setTotalSteps(max);

      return [root];
    });
  }, [currentState.step, editableRegisters, fractions]);

  const load = useCallback((
    program: string[],
    registers: PrimeMap,
    opts?: {
      editableRegisters?: number[];
      enabledEvents?: EventType[];
    }
  ) => {
    stopSimulation();
    const parsed = parseProgram(program);
    setFractions(parsed);
    setEditableRegisters(opts?.editableRegisters ?? []);

    const max = calculateMaxSteps(registers, parsed);
    setTotalSteps(max);

    const initialState: ProgramState = {
      registers: { ...registers },
      step: 0,
      lastRuleIndex: null,
      halted: false
    };

    setHistory([initialState]);
    setHistoryIndex(0);
    setEvents([{
      step: 0,
      type: EventType.INFO,
      message: "Loaded."
    }]);
    setEnabledEventTypes(opts?.enabledEvents ?? [EventType.HALT]);
  }, [stopSimulation]);

  return {
    // State
    currentState,
    fractions,
    nValue,
    usedPrimes,
    history,
    historyIndex,
    events,
    totalSteps,
    editableRegisters,

    // Playback
    isPlaying,
    speed,
    setSpeed,
    setIsPlaying,

    // Animation
    phase,
    activeRuleIndex,
    scanningIndex,
    activeFraction,

    // Actions
    step,
    reset,
    scrub,
    editRegister,
    load,
    stopSimulation,
  };
}
