
export type PrimeMap = Record<number, number>;

export interface Fraction {
  numerator: number;
  denominator: number;
  // Pre-calculated prime factors for performance
  numPrimes: PrimeMap;
  denPrimes: PrimeMap;
  id: string;
}

export interface ProgramState {
  registers: PrimeMap; // The current state (bead counts)
  step: number;
  lastRuleIndex: number | null; // Index of the rule that produced this state
  halted: boolean;
}

export enum EventType {
  INFO = 'INFO',
  POWER_OF_TWO = 'POWER_OF_TWO',
  HALT = 'HALT',
  FIBONACCI_PAIR = 'FIBONACCI_PAIR',
}

export interface SimulationEvent {
  step: number;
  type: EventType;
  message: string;
  data?: any;
}

export interface Preset {
  name: string;
  description: string;
  fractions: string[]; // Strings like "17/91"
  initialState: PrimeMap; // e.g. {2: 1} for input 2
  editableRegisters: number[]; // Primes that the user can add/remove beads from
  defaultEvents: EventType[];
  notes?: string;
}

export type AnimationPhase = 'idle' | 'scanning' | 'selecting' | 'consuming' | 'producing';

export interface ChapterMeta {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  component: React.ComponentType;
}