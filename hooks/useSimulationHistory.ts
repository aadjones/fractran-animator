import { useState, useCallback, useEffect } from 'react';
import { ProgramState } from '../types';
import { MAX_HISTORY_DEFAULT } from '../constants';

export interface UseSimulationHistoryOptions {
  initialState: ProgramState;
  maxHistory?: number;
}

export interface UseSimulationHistoryReturn {
  history: ProgramState[];
  historyIndex: number;
  currentState: ProgramState;
  isAtEnd: boolean;
  isAtStart: boolean;
  /** Add a new state to history (truncates any "future" states if scrubbed back) */
  pushState: (state: ProgramState) => void;
  /** Jump to a specific history index */
  scrubTo: (index: number) => void;
  /** Reset history to just the first state */
  resetToInitial: () => void;
  /** Replace the initial state (for editing registers at step 0) */
  replaceInitialState: (state: ProgramState) => void;
}

/**
 * Manages simulation history for scrubbing/replay.
 * Extracted from useFractranSim to isolate history concerns.
 */
export function useSimulationHistory(
  options: UseSimulationHistoryOptions
): UseSimulationHistoryReturn {
  const maxHistory = options.maxHistory ?? MAX_HISTORY_DEFAULT;

  const [history, setHistory] = useState<ProgramState[]>(() => [options.initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Derived: current state based on history index
  const currentState = history[historyIndex] ?? history[0] ?? {
    registers: {},
    step: 0,
    lastRuleIndex: null,
    halted: false,
  };

  const isAtEnd = historyIndex === history.length - 1;
  const isAtStart = historyIndex === 0;

  // Keep historyIndex in bounds if history shrinks
  useEffect(() => {
    if (history.length > 0 && historyIndex > history.length - 1) {
      setHistoryIndex(history.length - 1);
    }
  }, [history.length, historyIndex]);

  const pushState = useCallback((nextState: ProgramState) => {
    setHistory(prev => {
      // Truncate any future states if we're scrubbed back
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(nextState);

      // Enforce max history limit
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }
      return newHistory;
    });

    setHistoryIndex(prev => {
      // If we're at max capacity, index stays at max-1; otherwise increment
      const atCapacity = history.length >= maxHistory && prev >= maxHistory - 1;
      return atCapacity ? maxHistory - 1 : prev + 1;
    });
  }, [historyIndex, history.length, maxHistory]);

  const scrubTo = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, history.length - 1));
    setHistoryIndex(clampedIndex);
  }, [history.length]);

  const resetToInitial = useCallback(() => {
    if (history.length > 0) {
      setHistory([history[0]]);
      setHistoryIndex(0);
    }
  }, [history]);

  const replaceInitialState = useCallback((state: ProgramState) => {
    setHistory([state]);
    setHistoryIndex(0);
  }, []);

  return {
    history,
    historyIndex,
    currentState,
    isAtEnd,
    isAtStart,
    pushState,
    scrubTo,
    resetToInitial,
    replaceInitialState,
  };
}
