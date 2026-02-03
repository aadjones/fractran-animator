import { Fraction, PrimeMap, ProgramState } from '../types';
import { PRIMES } from '../constants';

// Helper: Factorize a number into a PrimeMap
export const getPrimeFactors = (n: number): PrimeMap => {
  const factors: PrimeMap = {};
  let d = 2;
  let temp = n;
  while (d * d <= temp) {
    while (temp % d === 0) {
      factors[d] = (factors[d] || 0) + 1;
      temp /= d;
    }
    d++;
  }
  if (temp > 1) {
    factors[temp] = (factors[temp] || 0) + 1;
  }
  return factors;
};

// Helper: Parse fraction string "17/91" to Fraction object
export const parseProgram = (input: string[]): Fraction[] => {
  return input.map((s, index) => {
    const [numStr, denStr] = s.split('/');
    const numerator = parseInt(numStr, 10);
    const denominator = parseInt(denStr, 10);
    return {
      numerator,
      denominator,
      numPrimes: getPrimeFactors(numerator),
      denPrimes: getPrimeFactors(denominator),
      id: `rule-${index}-${Date.now()}`
    };
  });
};

// Logic: Check if fraction applies to current state
// Fraction N/D applies if State represents integer I and I * (N/D) is integer.
// This means current state must contain ALL prime factors of D.
export const canApplyRule = (state: PrimeMap, rule: Fraction): boolean => {
  for (const [primeStr, count] of Object.entries(rule.denPrimes)) {
    const prime = parseInt(primeStr, 10);
    const currentCount = state[prime] || 0;
    if (currentCount < count) {
      return false;
    }
  }
  return true;
};

// Logic: Apply rule
export const applyRule = (state: PrimeMap, rule: Fraction): PrimeMap => {
  const newState = { ...state };

  // Remove denominator factors
  for (const [primeStr, count] of Object.entries(rule.denPrimes)) {
    const prime = parseInt(primeStr, 10);
    newState[prime] = (newState[prime] || 0) - count;
    if (newState[prime] <= 0) {
      delete newState[prime];
    }
  }

  // Add numerator factors
  for (const [primeStr, count] of Object.entries(rule.numPrimes)) {
    const prime = parseInt(primeStr, 10);
    newState[prime] = (newState[prime] || 0) + count;
  }

  return newState;
};

// Step function
export const stepSimulation = (
  currentState: ProgramState, 
  program: Fraction[]
): ProgramState => {
  for (let i = 0; i < program.length; i++) {
    const rule = program[i];
    if (canApplyRule(currentState.registers, rule)) {
      const nextRegisters = applyRule(currentState.registers, rule);
      return {
        registers: nextRegisters,
        step: currentState.step + 1,
        lastRuleIndex: i,
        halted: false
      };
    }
  }
  
  // No rule applied -> Halt
  return {
    ...currentState,
    lastRuleIndex: null,
    halted: true
  };
};

// Calculate BigInt value from PrimeMap (for display, if small enough)
export const calculateValue = (registers: PrimeMap): BigInt => {
  let val = 1n;
  for (const [p, exp] of Object.entries(registers)) {
    const prime = BigInt(p);
    for (let i = 0; i < exp; i++) {
      val *= prime;
    }
  }
  return val;
};