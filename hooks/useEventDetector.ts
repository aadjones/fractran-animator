import { useState, useCallback } from 'react';
import { ProgramState, SimulationEvent, EventType } from '../types';

/**
 * Event detector function type.
 * Takes previous and next states, returns an event if detected, null otherwise.
 */
export type EventDetector = (
  prevState: ProgramState,
  nextState: ProgramState
) => SimulationEvent | null;

// --- Built-in event detectors ---

export const detectHalt: EventDetector = (prev, next) => {
  if (!prev.halted && next.halted) {
    return {
      step: next.step,
      type: EventType.HALT,
      message: 'Program Halted',
    };
  }
  return null;
};

export const detectPowerOfTwo: EventDetector = (_prev, next) => {
  const primes = Object.keys(next.registers).map(Number);
  if (primes.length === 1 && primes[0] === 2) {
    const exponent = next.registers[2];
    if (exponent > 1) {
      return {
        step: next.step,
        type: EventType.POWER_OF_TWO,
        message: `2^${exponent} (Prime found: ${exponent})`,
        data: exponent,
      };
    }
  }
  return null;
};

export const detectFibonacciPair: EventDetector = (_prev, next) => {
  const primes = Object.keys(next.registers).map(Number);
  const hasHighPrimes = primes.some(p => p >= 5 && (next.registers[p] || 0) > 0);

  if (!hasHighPrimes) {
    const a = next.registers[2] || 0;
    const b = next.registers[3] || 0;
    if (a > 0 || b > 0) {
      return {
        step: next.step,
        type: EventType.FIBONACCI_PAIR,
        message: `Sequence: (${a}, ${b})`,
        data: { a, b },
      };
    }
  }
  return null;
};

// --- Map event types to their detectors ---

const DETECTOR_MAP: Record<EventType, EventDetector> = {
  [EventType.HALT]: detectHalt,
  [EventType.POWER_OF_TWO]: detectPowerOfTwo,
  [EventType.FIBONACCI_PAIR]: detectFibonacciPair,
  [EventType.INFO]: () => null, // INFO events are manually created, not detected
};

export interface UseEventDetectorOptions {
  enabledEvents?: EventType[];
  initialMessage?: string;
  /** Called when events are detected - useful for playing sounds, etc. */
  onEvent?: (event: SimulationEvent) => void;
}

export interface UseEventDetectorReturn {
  events: SimulationEvent[];
  /** Check for events between two states, add any detected to the log */
  checkEvents: (prevState: ProgramState, nextState: ProgramState) => void;
  /** Clear all events and add a fresh message */
  reset: (message?: string) => void;
  /** Set which event types are enabled for detection */
  setEnabledEvents: (types: EventType[]) => void;
}

/**
 * Manages event detection and logging for FRACTRAN simulation.
 * Detectors are pluggable - enable different EventTypes for different widgets.
 *
 * Extracted from useFractranSim to isolate event concerns.
 */
export function useEventDetector(
  options: UseEventDetectorOptions = {}
): UseEventDetectorReturn {
  const { enabledEvents = [EventType.HALT], initialMessage = 'Loaded.', onEvent } = options;

  const [events, setEvents] = useState<SimulationEvent[]>([
    { step: 0, type: EventType.INFO, message: initialMessage },
  ]);
  const [enabledEventTypes, setEnabledEventTypes] = useState<EventType[]>(enabledEvents);

  const checkEvents = useCallback(
    (prevState: ProgramState, nextState: ProgramState) => {
      const newEvents: SimulationEvent[] = [];

      for (const eventType of enabledEventTypes) {
        const detector = DETECTOR_MAP[eventType];
        if (detector) {
          const event = detector(prevState, nextState);
          if (event) {
            newEvents.push(event);
            onEvent?.(event);
          }
        }
      }

      if (newEvents.length > 0) {
        setEvents(prev => [...prev, ...newEvents]);
      }
    },
    [enabledEventTypes, onEvent]
  );

  const reset = useCallback((message = 'Reset.') => {
    setEvents([{ step: 0, type: EventType.INFO, message }]);
  }, []);

  const setEnabledEvents = useCallback((types: EventType[]) => {
    setEnabledEventTypes(types);
  }, []);

  return {
    events,
    checkEvents,
    reset,
    setEnabledEvents,
  };
}
