// First 50 primes for register mapping
export const PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229
];

// Simulation constants
export const MAX_HISTORY_DEFAULT = 2000;      // Max steps to keep in history for scrubbing
export const INSTANT_SPEED_THRESHOLD = 90;    // Speed value above which animation is instant
export const FORECAST_LIMIT = 5000;           // Max steps to simulate when forecasting halt