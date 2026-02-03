import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PrimeMap } from '../../types';
import { parseProgram, canApplyRule, applyRule, calculateValue } from '../../services/fractranLogic';
import { Play, Pause, ArrowRight, RotateCcw } from 'lucide-react';

interface NumberGameWidgetProps {
  program: string[];
  initialN: number;
  editableStart?: boolean;
  maxSteps?: number;
}

interface NumberStep {
  n: string;
  ruleApplied: number | null; // index of fraction that was applied, or null if start/halt
  registers: PrimeMap;
}

// Convert a single number to PrimeMap
function numberToRegisters(n: number): PrimeMap {
  const regs: PrimeMap = {};
  let d = 2;
  let temp = n;
  while (d * d <= temp) {
    while (temp % d === 0) {
      regs[d] = (regs[d] || 0) + 1;
      temp /= d;
    }
    d++;
  }
  if (temp > 1) {
    regs[temp] = (regs[temp] || 0) + 1;
  }
  return regs;
}

const NumberGameWidget: React.FC<NumberGameWidgetProps> = ({
  program,
  initialN,
  editableStart = false,
  maxSteps = 200,
}) => {
  const fractions = React.useMemo(() => parseProgram(program), [program]);

  const [startN, setStartN] = useState(initialN);
  const [steps, setSteps] = useState<NumberStep[]>(() => [{
    n: String(initialN),
    ruleApplied: null,
    registers: numberToRegisters(initialN),
  }]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [halted, setHalted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentRegisters = steps[steps.length - 1].registers;

  const doStep = useCallback(() => {
    if (halted) return;

    for (let i = 0; i < fractions.length; i++) {
      if (canApplyRule(currentRegisters, fractions[i])) {
        const newRegs = applyRule(currentRegisters, fractions[i]);
        const newN = calculateValue(newRegs).toString();
        setSteps(prev => [...prev, { n: newN, ruleApplied: i, registers: newRegs }]);
        return;
      }
    }
    // No rule applied — halted
    setHalted(true);
    setIsPlaying(false);
  }, [currentRegisters, fractions, halted]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || halted) return;
    if (steps.length > maxSteps) {
      setIsPlaying(false);
      return;
    }
    timerRef.current = setTimeout(doStep, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, halted, steps.length, doStep, maxSteps]);

  // Auto-scroll to latest
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [steps.length]);

  const handleReset = () => {
    setIsPlaying(false);
    setHalted(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    const regs = numberToRegisters(startN);
    setSteps([{ n: String(startN), ruleApplied: null, registers: regs }]);
  };

  const handleStartNChange = (val: number) => {
    if (val < 1) val = 1;
    if (val > 999999) val = 999999;
    setStartN(val);
    setIsPlaying(false);
    setHalted(false);
    const regs = numberToRegisters(val);
    setSteps([{ n: String(val), ruleApplied: null, registers: regs }]);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      {/* Fractions display */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-1 text-xs text-gray-500 uppercase tracking-wider font-bold">
          <span>Program:</span>
        </div>
        <div className="flex items-center space-x-3 font-mono">
          {fractions.map((f, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-sm leading-none ${
                steps.length > 1 && steps[steps.length - 1].ruleApplied === i
                  ? 'text-blue-400'
                  : 'text-gray-400'
              }`}
            >
              <span className="border-b border-gray-600 px-1">{f.numerator}</span>
              <span className="px-1">{f.denominator}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Number sequence */}
      <div className="p-4">
        {/* Current value */}
        <div className="text-center mb-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Current Number</div>
          <div className="text-4xl md:text-5xl font-mono font-bold text-blue-400">
            {steps[steps.length - 1].n}
          </div>
          {halted && (
            <div className="text-red-400 text-xs font-bold uppercase tracking-wider mt-2">
              No fraction applies — stopped!
            </div>
          )}
        </div>

        {/* Sequence trail */}
        <div ref={scrollRef} className="flex items-center space-x-2 overflow-x-auto pb-2 mb-4 custom-scrollbar">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span className="text-gray-600 text-xs flex-shrink-0">
                  {s.ruleApplied !== null ? (
                    <span className="text-gray-500">&times;</span>
                  ) : ''}
                </span>
              )}
              <span
                className={`font-mono text-sm flex-shrink-0 px-1.5 py-0.5 rounded ${
                  i === steps.length - 1
                    ? 'bg-blue-900/40 text-blue-300 font-bold'
                    : 'text-gray-500'
                }`}
              >
                {s.n}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 transition-colors"
              title="Reset"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={halted}
              className={`flex items-center px-3 py-2 rounded-md font-bold text-white transition-all text-sm ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'
              } disabled:opacity-50`}
            >
              {isPlaying ? <><Pause size={14} className="mr-1" /> Pause</> : <><Play size={14} className="mr-1" /> Play</>}
            </button>
            <button
              onClick={doStep}
              disabled={halted || isPlaying}
              className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-md text-white transition-colors"
              title="Step"
            >
              <ArrowRight size={16} />
            </button>
          </div>

          {editableStart && (
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-500 font-bold">Start:</label>
              <input
                type="number"
                value={startN}
                onChange={(e) => handleStartNChange(Number(e.target.value))}
                className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 font-mono text-sm text-gray-200 focus:border-blue-500 outline-none"
                min={1}
              />
            </div>
          )}

          <div className="text-xs text-gray-500 font-mono">
            Step {steps.length - 1}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberGameWidget;
