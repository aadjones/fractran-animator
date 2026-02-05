import { useCallback, useState, useEffect } from 'react';
import {
  initAudio,
  playDing as _playDing,
  playHalt as _playHalt,
  isMuted,
  setMuted as _setMuted,
} from '../services/sounds';

/**
 * Hook for playing UI sounds with mute control.
 * Automatically initializes AudioContext on first sound played.
 */
export function useSound() {
  const [muted, setMutedState] = useState(isMuted);

  // Sync with any external changes to mute state
  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  const ensureAudio = useCallback(() => {
    initAudio();
  }, []);

  const playDing = useCallback(() => {
    ensureAudio();
    _playDing();
  }, [ensureAudio]);

  const playHalt = useCallback(() => {
    ensureAudio();
    _playHalt();
  }, [ensureAudio]);

  const setMuted = useCallback((value: boolean) => {
    _setMuted(value);
    setMutedState(value);
  }, []);

  const toggleMuted = useCallback(() => {
    const newValue = !isMuted();
    setMuted(newValue);
    return newValue;
  }, [setMuted]);

  return {
    playDing,
    playHalt,
    muted,
    setMuted,
    toggleMuted,
  };
}
