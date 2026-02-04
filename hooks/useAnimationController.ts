import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimationPhase, Fraction, ProgramState } from '../types';
import { canApplyRule, stepSimulation } from '../services/fractranLogic';
import { INSTANT_SPEED_THRESHOLD } from '../constants';

export interface UseAnimationControllerOptions {
  /** Called when a step completes (instant or animated) */
  onStep: (nextState: ProgramState) => void;
  /** Called when simulation halts */
  onHalt: (haltedState: ProgramState) => void;
  initialSpeed?: number;
}

export interface UseAnimationControllerReturn {
  isPlaying: boolean;
  speed: number;
  phase: AnimationPhase;
  activeRuleIndex: number | null;
  scanningIndex: number | null;
  setSpeed: (speed: number) => void;
  setIsPlaying: (playing: boolean) => void;
  /** Stop all animation and reset to idle */
  stop: () => void;
  /** Run one tick of the animation loop - call this from parent's useEffect */
  tick: (currentState: ProgramState, fractions: Fraction[]) => void;
}

/**
 * Manages animation state machine for FRACTRAN simulation.
 * Handles the 5-phase animation: idle → scanning → selecting → consuming → producing
 *
 * Extracted from useFractranSim to isolate animation concerns.
 */
export function useAnimationController(
  options: UseAnimationControllerOptions
): UseAnimationControllerReturn {
  const { onStep, onHalt, initialSpeed = 10 } = options;

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);

  // Animation phase state machine
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [activeRuleIndex, setActiveRuleIndex] = useState<number | null>(null);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);
  const [targetRuleIndex, setTargetRuleIndex] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setPhase('idle');
    setActiveRuleIndex(null);
    setScanningIndex(null);
    setTargetRuleIndex(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // The tick function runs the animation state machine
  const tick = useCallback((currentState: ProgramState, fractions: Fraction[]) => {
    if (!isPlaying || currentState.halted) {
      if (currentState.halted) setIsPlaying(false);
      return;
    }

    const isInstant = speed > INSTANT_SPEED_THRESHOLD;

    if (phase === 'idle') {
      const stepDelay = isInstant ? Math.max(10, 200 - speed * 2) : 50;

      timerRef.current = setTimeout(() => {
        // Find first applicable rule
        let foundIndex = -1;
        for (let i = 0; i < fractions.length; i++) {
          if (canApplyRule(currentState.registers, fractions[i])) {
            foundIndex = i;
            break;
          }
        }

        if (isInstant) {
          // Skip animation, execute immediately
          if (foundIndex === -1) {
            const haltedState = { ...currentState, halted: true, lastRuleIndex: null };
            onHalt(haltedState);
            setIsPlaying(false);
          } else {
            const nextState = stepSimulation(currentState, fractions);
            onStep(nextState);
          }
        } else {
          // Start animated sequence
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
          // Found matching rule
          setActiveRuleIndex(targetRuleIndex);
          setScanningIndex(null);
          setPhase('selecting');
        }
        else if (scanningIndex !== null && scanningIndex >= fractions.length - 1) {
          // Scanned all rules, none matched - halt
          const haltedState = { ...currentState, halted: true, lastRuleIndex: null };
          onHalt(haltedState);
          stop();
        }
        else {
          // Continue scanning
          setScanningIndex(prev => (prev !== null ? prev + 1 : 0));
        }
      }, scanDelay);
    }
    else if (phase === 'selecting') {
      const delay = Math.max(50, 400 - speed * 3);
      timerRef.current = setTimeout(() => setPhase('consuming'), delay);
    }
    else if (phase === 'consuming') {
      const delay = Math.max(50, 500 - speed * 4);
      timerRef.current = setTimeout(() => setPhase('producing'), delay);
    }
    else if (phase === 'producing') {
      const delay = Math.max(50, 500 - speed * 4);
      timerRef.current = setTimeout(() => {
        const nextState = stepSimulation(currentState, fractions);
        onStep(nextState);
        setPhase('idle');
        setActiveRuleIndex(null);
        setScanningIndex(null);
      }, delay);
    }
  }, [isPlaying, phase, speed, scanningIndex, targetRuleIndex, onStep, onHalt, stop]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    isPlaying,
    speed,
    phase,
    activeRuleIndex,
    scanningIndex,
    setSpeed,
    setIsPlaying,
    stop,
    tick,
  };
}
