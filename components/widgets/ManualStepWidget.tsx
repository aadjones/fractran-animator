import React, { useState, useEffect } from 'react';
import { parseProgram } from '../../services/fractranLogic';
import { useSound } from '../../hooks/useSound';

interface ManualStepWidgetProps {
  fractions: string[];
  startingNumber: number;
  onComplete?: () => void;
}

type Phase =
  | { type: 'checking'; ruleIndex: number }
  | { type: 'wrong_answer'; ruleIndex: number; userSaidYes: boolean }
  | { type: 'correct_no'; ruleIndex: number; decimalResult: string }
  | { type: 'calculate'; ruleIndex: number }
  | { type: 'wrong_calculation'; ruleIndex: number; userAnswer: number }
  | { type: 'step_complete'; result: number }
  | { type: 'halted' };

const ManualStepWidget: React.FC<ManualStepWidgetProps> = ({
  fractions: fractionStrings,
  startingNumber,
  onComplete,
}) => {
  const fractions = React.useMemo(() => parseProgram(fractionStrings), [fractionStrings]);
  const [currentN, setCurrentN] = useState(startingNumber);
  const [history, setHistory] = useState<number[]>([startingNumber]);
  const [phase, setPhase] = useState<Phase>({ type: 'checking', ruleIndex: 0 });
  const [inputValue, setInputValue] = useState('');
  const { playHalt } = useSound();

  // Check if rule applies (result is whole number)
  const ruleApplies = (ruleIndex: number): boolean => {
    const f = fractions[ruleIndex];
    return (currentN * f.numerator) % f.denominator === 0;
  };

  const getResult = (ruleIndex: number): number => {
    const f = fractions[ruleIndex];
    return (currentN * f.numerator) / f.denominator;
  };

  const handleYesNo = (userSaysYes: boolean) => {
    if (phase.type !== 'checking') return;

    const actuallyApplies = ruleApplies(phase.ruleIndex);

    if (userSaysYes === actuallyApplies) {
      // Correct!
      if (actuallyApplies) {
        // Rule applies, now ask for calculation
        setPhase({ type: 'calculate', ruleIndex: phase.ruleIndex });
      } else {
        // Rule doesn't apply - show confirmation with the decimal result
        const f = fractions[phase.ruleIndex];
        const rawResult = (currentN * f.numerator) / f.denominator;
        let decimalResult: string;
        if (Number.isInteger(rawResult)) {
          decimalResult = rawResult.toString();
        } else {
          // Check if it's a clean terminating decimal (up to 4 places)
          const fixed4 = rawResult.toFixed(4);
          const trimmed = fixed4.replace(/0+$/, '').replace(/\.$/, '');
          if (parseFloat(trimmed) === rawResult) {
            // Terminates cleanly
            decimalResult = trimmed;
          } else {
            // Non-terminating - truncate (don't round) to 2 decimal places, add ...
            const truncated = Math.floor(rawResult * 100) / 100;
            decimalResult = truncated.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + '...';
          }
        }
        setPhase({ type: 'correct_no', ruleIndex: phase.ruleIndex, decimalResult });
      }
    } else {
      // Wrong answer
      setPhase({ type: 'wrong_answer', ruleIndex: phase.ruleIndex, userSaidYes: userSaysYes });
    }
  };

  const handleCalculationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase.type !== 'calculate') return;

    const userAnswer = parseInt(inputValue, 10);
    const correctAnswer = getResult(phase.ruleIndex);

    if (userAnswer === correctAnswer) {
      setPhase({ type: 'step_complete', result: correctAnswer });
    } else {
      setPhase({ type: 'wrong_calculation', ruleIndex: phase.ruleIndex, userAnswer });
    }
  };

  const handleContinue = () => {
    if (phase.type !== 'step_complete') return;

    const newN = phase.result;
    setCurrentN(newN);
    setHistory(prev => [...prev, newN]);
    setPhase({ type: 'checking', ruleIndex: 0 });
    setInputValue('');
  };

  const handleTryAgain = () => {
    if (phase.type === 'wrong_answer') {
      setPhase({ type: 'checking', ruleIndex: phase.ruleIndex });
    } else if (phase.type === 'wrong_calculation') {
      setInputValue('');
      setPhase({ type: 'calculate', ruleIndex: phase.ruleIndex });
    }
  };

  const handleNextRule = () => {
    if (phase.type !== 'correct_no') return;

    if (phase.ruleIndex + 1 < fractions.length) {
      setPhase({ type: 'checking', ruleIndex: phase.ruleIndex + 1 });
    } else {
      // No rules apply - halt!
      setPhase({ type: 'halted' });
      playHalt();
      onComplete?.();
    }
  };

  // Keyboard shortcuts for faster interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (e.target instanceof HTMLInputElement) return;

      if (phase.type === 'checking') {
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleYesNo(true);
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleYesNo(false);
        }
      } else if (phase.type === 'wrong_answer') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTryAgain();
        }
      } else if (phase.type === 'correct_no') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextRule();
        }
      } else if (phase.type === 'step_complete') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleContinue();
        }
      } else if (phase.type === 'wrong_calculation') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTryAgain();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  const currentFraction = (phase.type !== 'halted' && phase.type !== 'step_complete' && 'ruleIndex' in phase)
    ? fractions[phase.ruleIndex]
    : null;

  const isActive = (i: number) =>
    phase.type !== 'halted' && phase.type !== 'step_complete' && phase.ruleIndex === i;
  const isSkipped = (i: number) =>
    phase.type !== 'halted' && phase.type !== 'step_complete' && phase.ruleIndex > i;

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
                  isActive(i)
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400'
                }`}
              >
                <span className="text-gray-600 w-5 md:w-6 text-sm md:text-base">{i + 1}.</span>
                <span className={isActive(i) ? 'font-semibold' : ''}>{f.numerator}/{f.denominator}</span>
                {isSkipped(i) && (
                  <span className="ml-1.5 md:ml-2 text-gray-600 text-xs md:text-sm">✗</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main interaction area */}
      <div className="p-3 md:p-4 flex-1">
        {/* History chain - prominent display */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6 py-2 md:py-3 bg-gray-800/50 rounded-lg font-mono text-xl md:text-2xl">
          {history.map((n, i) => (
            <React.Fragment key={i}>
              <span className={i === history.length - 1 ? 'text-blue-400 font-bold' : 'text-gray-400'}>
                {n}
              </span>
              {i < history.length - 1 && (
                <span className="text-gray-600">→</span>
              )}
            </React.Fragment>
          ))}
          {phase.type === 'step_complete' && (
            <>
              <span className="text-gray-600">→</span>
              <span className="text-green-400 font-bold">{phase.result}</span>
            </>
          )}
        </div>

        <div className="text-center mb-3 md:mb-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
            Current Number
          </div>
          <div className="text-3xl md:text-4xl font-mono font-bold text-blue-400">
            {phase.type === 'step_complete' ? phase.result : currentN}
          </div>
        </div>

        {/* Checking phase */}
        {phase.type === 'checking' && currentFraction && (
          <div className="text-center">
            <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">
              Is <span className="font-mono font-bold text-white">{currentN} × {currentFraction.numerator}/{currentFraction.denominator}</span> a whole number?
            </p>
            <div className="flex justify-center space-x-2 md:space-x-3">
              <button
                onClick={() => handleYesNo(true)}
                className="px-4 md:px-6 py-1.5 md:py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-md transition-colors text-sm md:text-base"
              >
                Yes
              </button>
              <button
                onClick={() => handleYesNo(false)}
                className="px-4 md:px-6 py-1.5 md:py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md transition-colors text-sm md:text-base"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Wrong answer feedback */}
        {phase.type === 'wrong_answer' && currentFraction && (
          <div className="text-center">
            <p className="text-red-400 mb-2 text-sm md:text-base">
              Not quite. Let's check: {currentN} × {currentFraction.numerator} = {currentN * currentFraction.numerator},
              divided by {currentFraction.denominator} = {(currentN * currentFraction.numerator) / currentFraction.denominator}.
            </p>
            <p className="text-gray-400 mb-3 md:mb-4 text-xs md:text-sm">
              {ruleApplies(phase.ruleIndex)
                ? "That's a whole number, so this fraction does work."
                : "That's not a whole number, so this fraction doesn't work."}
            </p>
            <button
              onClick={handleTryAgain}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition-colors text-sm md:text-base"
            >
              Got it
            </button>
          </div>
        )}

        {/* Correct "No" feedback - rule doesn't apply */}
        {phase.type === 'correct_no' && currentFraction && (
          <div className="text-center">
            <p className="text-green-400 mb-2 text-sm md:text-base">
              Right! {currentN} × {currentFraction.numerator}/{currentFraction.denominator} = {phase.decimalResult}, not a whole number.
            </p>
            <p className="text-gray-400 mb-3 md:mb-4 text-xs md:text-sm">
              {phase.ruleIndex + 1 < fractions.length
                ? "So we try the next fraction."
                : "No more fractions to try."}
            </p>
            <button
              onClick={handleNextRule}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition-colors text-sm md:text-base"
            >
              {phase.ruleIndex + 1 < fractions.length ? "Next fraction" : "Continue"}
            </button>
          </div>
        )}

        {/* Calculate phase */}
        {phase.type === 'calculate' && currentFraction && (
          <div className="text-center">
            <p className="text-green-400 mb-2 text-sm md:text-base">Yes! Fraction {phase.ruleIndex + 1} works.</p>
            <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">
              What is <span className="font-mono font-bold text-white">{currentN} × {currentFraction.numerator}/{currentFraction.denominator}</span>?
            </p>
            <form onSubmit={handleCalculationSubmit} className="flex justify-center items-center space-x-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-20 md:w-24 bg-gray-800 border border-gray-600 rounded px-2 md:px-3 py-1.5 md:py-2 font-mono text-base md:text-lg text-white text-center focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition-colors text-sm md:text-base"
              >
                Check
              </button>
            </form>
          </div>
        )}

        {/* Wrong calculation feedback */}
        {phase.type === 'wrong_calculation' && currentFraction && (
          <div className="text-center">
            <p className="text-red-400 mb-2 text-sm md:text-base">
              {phase.userAnswer} isn't right. Try again!
            </p>
            <p className="text-gray-500 text-xs md:text-sm mb-3 md:mb-4">
              Hint: {currentN} × {currentFraction.numerator} = {currentN * currentFraction.numerator}, then divide by {currentFraction.denominator}.
            </p>
            <button
              onClick={handleTryAgain}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition-colors text-sm md:text-base"
            >
              Try again
            </button>
          </div>
        )}

        {/* Step complete - continue to next */}
        {phase.type === 'step_complete' && (
          <div className="text-center">
            <p className="text-green-400 font-bold mb-2 text-sm md:text-base">
              Correct!
            </p>
            <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4">
              Now we start over from fraction 1.
            </p>
            <button
              onClick={handleContinue}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition-colors text-sm md:text-base"
            >
              Continue
            </button>
          </div>
        )}

        {/* Halted */}
        {phase.type === 'halted' && (
          <div className="text-center">
            <p className="text-red-400 font-bold mb-2 text-sm md:text-base">
              No fraction works — the game stops!
            </p>
            <div className="text-gray-400 text-xs md:text-sm mt-3 md:mt-4">
              <p>Final sequence:</p>
              <p className="font-mono mt-1">
                {history.join(' → ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualStepWidget;
