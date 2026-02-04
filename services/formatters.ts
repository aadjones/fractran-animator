import { PrimeMap } from '../types';

/**
 * Superscript digit map for formatting exponents
 */
const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

/**
 * Convert a number to its superscript representation
 * Returns empty string for 1 (implicit exponent)
 */
function toSuperscript(n: number): string {
  if (n === 1) return '';
  return String(n).split('').map(d => SUPERSCRIPTS[d]).join('');
}

/**
 * Format a PrimeMap as a product of prime powers: "2³ × 3²"
 * Returns '1' for empty registers (representing the number 1)
 */
export function formatPrimeFactors(regs: PrimeMap): string {
  const primes = Object.keys(regs).map(Number).sort((a, b) => a - b);
  if (primes.length === 0) return '1';

  return primes
    .filter(p => regs[p] > 0)
    .map(p => `${p}${toSuperscript(regs[p])}`)
    .join(' × ');
}
