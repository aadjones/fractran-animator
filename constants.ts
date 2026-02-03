import { Preset, EventType } from './types';

// First 50 primes for register mapping
export const PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229
];

export const PRESETS: Preset[] = [
  {
    name: "In-Place Addition",
    description: "Computes A + B. Input: 2^A * 3^B. Output: 3^(A+B).",
    fractions: ["3/2"],
    initialState: { 2: 3, 3: 2 }, // 2^3 * 3^2 -> 3^5
    editableRegisters: [2, 3],
    defaultEvents: [EventType.HALT],
    notes: "In-place addition. Start with a in the 2 register and b in the 3 register; end with a+b in the 3 register."
  },
  {
    name: "Addition",
    description: "Computes A + B into register 5. Input: 2^A * 3^B. Output: 5^(A+B).",
    fractions: ["5/2", "5/3"],
    initialState: { 2: 3, 3: 2 }, // 2^3 * 3^2 -> 5^5
    editableRegisters: [2, 3],
    defaultEvents: [EventType.HALT],
    notes: "Consumes both inputs in registers 2 and 3 to produce the sum in register 5, avoiding in-place modification of register 3."
  },
  {
    name: "Fibonacci Step",
    description: "One step of the Fibonacci sequence: (a, b) -> (b, a+b). Input: 2^a * 3^b * 11. Output: 2^b * 3^(a+b).",
    fractions: [
      "85/22",   // 1. Move A(2) -> TempA(5), Bounce 11->17
      "119/33",  // 2. Move B(3) -> TempB(7), Bounce 11->17
      "11/17",   // 3. Restore Bounce 17->11 (End of move loop)
      "13/11",   // 4. Switch Phase 11->13 (When 2,3 empty)
      "57/65",   // 5. Move TempA(5) -> B(3), Bounce 13->19
      "114/91",  // 6. Move TempB(7) -> A(2)+B(3), Bounce 13->19
      "13/19",   // 7. Restore Bounce 19->13 (End of restore loop)
      "1/13"     // 8. Halt (Remove 13)
    ],
    initialState: { 2: 2, 3: 3, 11: 1 }, // (2,3) -> (3,5)
    editableRegisters: [2, 3],
    defaultEvents: [EventType.HALT],
    notes: "One step of the Fibonacci sequence: (a, b) -> (b, a+b). The values of a and b are kept in the 2 and 3 register. There is a 1 in the 11 register to start for bookkeeping."
  },
  {
    name: "Fibonacci Sequence",
    description: "Generates the infinite Fibonacci sequence. (0, 1) -> (1, 1) -> (1, 2) -> (2, 3)...",
    fractions: [
      "39/55", "33/65", "78/77", "66/91", 
      "1/11", "1/13", 
      "5/2", "7/3", 
      "11/1"
    ],
    initialState: { 3: 1 },
    editableRegisters: [],
    defaultEvents: [EventType.FIBONACCI_PAIR],
    notes: "Infinite loop starting at (0, 1). Registers 2 and 3 hold consecutive Fibonacci numbers when other registers are empty."
  },
  {
    name: "Multiplication",
    description: "Computes A * B. Input: 2^A * 3^B. Output: 5^(A*B).",
    fractions: ["455/33", "11/13", "1/11", "3/7", "11/2", "1/3"],
    initialState: { 2: 2, 3: 3 }, // 2^2 * 3^3 -> 5^6
    editableRegisters: [2, 3],
    defaultEvents: [EventType.HALT],
    notes: "Given a and b in the registers 2 and 3, computes ab in register 5."
  },
  {
    name: "Division/Remainder",
    description: "Computes quotient and remainder of N ÷ D. Input: 2^N * 3^D * 11. Output: 5^Q * 7^R.",
    fractions: ["91/66", "11/13", "1/33", "85/11", "57/119", "17/19", "11/17", "1/3"],
    initialState: { 2: 13, 3: 4, 11: 1 }, // 13 / 4 -> Q=3 (5^3), R=1 (7^1)
    editableRegisters: [2, 3],
    defaultEvents: [EventType.HALT],
    notes: "Divides a by b with quotient and remainder. Register 2 is a, 3 is b. The quotient and remainder end up in registers 5 and 7. There is a 1 in register 11 to start for bookkeeping."
  },
  {
    name: "Prime Game",
    description: "Conway's prime generator. Start with 2^1. The sequence of powers of 2 that appear are 2^k where k is a prime.",
    fractions: [
      "17/91", "78/85", "19/51", "23/38", "29/33", "77/29", "95/23", 
      "77/19", "1/17", "11/13", "13/11", "15/2", "1/7", "55/1"
    ],
    initialState: { 2: 1 }, // Start at 2^1 = 2
    editableRegisters: [],
    defaultEvents: [EventType.POWER_OF_TWO],
    notes: "Start with 1 in register 2. In the future, whenever the state is of the form 2^k, k is the next prime. This runs indefinitely."
  }
];