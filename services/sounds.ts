/**
 * Simple sound engine using Web Audio API.
 * Synthesizes UI feedback sounds - no external assets needed.
 */

let audioContext: AudioContext | null = null;
let muted = false;

// Load mute preference from localStorage
if (typeof window !== 'undefined') {
  muted = localStorage.getItem('fractran-muted') === 'true';
}

/**
 * Initialize or resume AudioContext.
 * Must be called from a user gesture (click/tap) the first time.
 */
export function initAudio(): void {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

/**
 * Check if audio is muted.
 */
export function isMuted(): boolean {
  return muted;
}

/**
 * Set mute state and persist to localStorage.
 */
export function setMuted(value: boolean): void {
  muted = value;
  if (typeof window !== 'undefined') {
    localStorage.setItem('fractran-muted', String(value));
  }
}

/**
 * Play a celebratory ding for prime discoveries.
 */
export function playDing(): void {
  if (muted || !audioContext) return;

  const now = audioContext.currentTime;

  // Two-tone ding: quick rising interval
  const osc1 = audioContext.createOscillator();
  const osc2 = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc1.type = 'sine';
  osc2.type = 'sine';
  osc1.frequency.value = 880;  // A5
  osc2.frequency.value = 1320; // E6 (perfect fifth above)

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(audioContext.destination);

  osc1.start(now);
  osc2.start(now + 0.05); // Slight delay for "ding" character
  osc1.stop(now + 0.3);
  osc2.stop(now + 0.35);
}

/**
 * Play a conclusive sound when program halts.
 */
export function playHalt(): void {
  if (muted || !audioContext) return;

  const now = audioContext.currentTime;

  // Descending tone - signals "done"
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}
