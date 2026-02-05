import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PrimeMap } from '../../types';
import { parseProgram, canApplyRule, applyRule, calculateValue, getPrimeFactors } from '../../services/fractranLogic';
import { formatPrimeFactors } from '../../services/formatters';
import { Play, Pause, ArrowRight, RotateCcw } from 'lucide-react';
import { useSound } from '../../hooks/useSound';

interface NumberGameWidgetProps {
  program: string[];
  initialN: number;
  editableStart?: boolean;
  maxSteps?: number;
  showPrimeFactors?: boolean;
}

interface NumberStep {
  n: string;
  ruleApplied: number | null; // index of fraction that was applied, or null if start/halt
  registers: PrimeMap;
}

const NumberGameWidget: React.FC<NumberGameWidgetProps> = ({
  program,
  initialN,
  editableStart = false,
  maxSteps = 200,
  showPrimeFactors = false,
}) => {
  const fractions = React.useMemo(() => parseProgram(program), [program]);
  const { playHalt } = useSound();

  const [startN, setStartN] = useState(initialN);
  const [inputValue, setInputValue] = useState(String(initialN));
  const [steps, setSteps] = useState<NumberStep[]>(() => [{
    n: String(initialN),
    ruleApplied: null,
    registers: getPrimeFactors(initialN),
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
    playHalt();
  }, [currentRegisters, fractions, halted, playHalt]);

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
    const regs = getPrimeFactors(startN);
    setSteps([{ n: String(startN), ruleApplied: null, registers: regs }]);
  };

  const handleInputChange = (raw: string) => {
    setInputValue(raw);
    const val = raw === '' ? 0 : parseInt(raw, 10);
    if (!Number.isFinite(val) || val < 0) return;
    setStartN(val);
    setIsPlaying(false);
    setHalted(false);
    const regs = getPrimeFactors(val);
    setSteps([{ n: String(val), ruleApplied: null, registers: regs }]);
  };

  const lastAppliedRule = steps.length > 1 ? steps[steps.length - 1].ruleApplied : null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex flex-col md:flex-row">
      {/* Fractions sidebar - horizontally on mobile, vertical on desktop */}
      <div className="bg-gray-800/50 px-3 md:px-5 py-3 md:py-6 flex items-center justify-center md:justify-start border-b md:border-b-0 md:border-r border-gray-700/50">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2 md:mb-3 text-center md:text-left">
            Fractions
          </div>
          <div className="flex flex-row md:flex-col gap-3 md:gap-0 md:space-y-2 font-mono text-base md:text-lg">
            {fractions.map((f, i) => (
              <div
                key={i}
                className={`flex items-center pl-2 border-l-2 transition-colors ${
                  lastAppliedRule === i
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400'
                }`}
              >
                <span className="text-gray-600 w-5 md:w-6 text-sm md:text-base">{i + 1}.</span>
                <span className={lastAppliedRule === i ? 'font-semibold' : ''}>{f.numerator}/{f.denominator}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Number sequence */}
      <div className="p-3 md:p-4 flex-1">
        {/* Current value */}
        <div className="text-center mb-3 md:mb-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Current Number</div>
          <div className="text-3xl md:text-5xl font-mono font-bold text-blue-400">
            {steps[steps.length - 1].n}
          </div>
          {showPrimeFactors && (
            <div className="text-base md:text-lg font-mono text-gray-400 mt-1">
              {formatPrimeFactors(steps[steps.length - 1].registers)}
            </div>
          )}
          {halted && (
            <div className="text-red-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-2">
              No fraction applies — stopped!
            </div>
          )}
        </div>

        {/* Sequence trail - prominent display */}
        <div ref={scrollRef} className="flex items-center justify-center flex-wrap gap-x-1.5 md:gap-x-2 gap-y-1 overflow-x-auto py-2 md:py-3 px-3 md:px-4 mb-3 md:mb-4 bg-gray-800/50 rounded-lg">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && s.ruleApplied !== null && (
                <span className="flex flex-col items-center flex-shrink-0">
                  <span className="text-[8px] md:text-[10px] text-gray-500 font-mono leading-none whitespace-nowrap">
                    ×{fractions[s.ruleApplied].numerator}/{fractions[s.ruleApplied].denominator}
                  </span>
                  <span className="text-gray-600 text-base md:text-xl">→</span>
                </span>
              )}
              <span
                className={`font-mono text-base md:text-xl flex-shrink-0 px-1.5 md:px-2 py-0.5 md:py-1 rounded ${
                  i === steps.length - 1
                    ? 'bg-blue-900/40 text-blue-300 font-bold'
                    : 'text-gray-400'
                }`}
              >
                {showPrimeFactors ? formatPrimeFactors(s.registers) : s.n}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Controls - stack on mobile for breathing room */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <button
              onClick={handleReset}
              className="p-1.5 md:p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 transition-colors"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={halted}
              className={`flex items-center px-2.5 py-1.5 md:px-3 md:py-2 rounded-md font-bold text-white transition-all text-xs md:text-sm ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'
              } disabled:opacity-50`}
            >
              {isPlaying ? <><Pause size={12} className="mr-1" /> Pause</> : <><Play size={12} className="mr-1" /> Play</>}
            </button>
            <button
              onClick={doStep}
              disabled={halted || isPlaying}
              className="p-1.5 md:p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-md text-white transition-colors"
              title="Step"
            >
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3">
            {editableStart && (
              <div className="flex items-center space-x-1.5">
                <label className="text-[10px] md:text-xs text-gray-500 font-bold">Start:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-16 md:w-20 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 md:px-2 md:py-1 font-mono text-xs md:text-sm text-gray-200 focus:border-blue-500 outline-none"
                />
              </div>
            )}

            <div className="text-[10px] md:text-xs text-gray-500 font-mono">
              Step {steps.length - 1}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberGameWidget;
