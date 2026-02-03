import React, { useState } from 'react';
import { parseProgram } from '../../services/fractranLogic';

interface ManualStepWidgetProps {
  fractions: string[];
  startingNumber: number;
  onComplete?: () => void;
}

type Phase =
  | { type: 'checking'; ruleIndex: number }
  | { type: 'wrong_answer'; ruleIndex: number; userSaidYes: boolean }
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
        // Rule doesn't apply, move to next
        if (phase.ruleIndex + 1 < fractions.length) {
          setPhase({ type: 'checking', ruleIndex: phase.ruleIndex + 1 });
        } else {
          // No rules apply - halt!
          setPhase({ type: 'halted' });
          onComplete?.();
        }
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

  const currentFraction = (phase.type !== 'halted' && phase.type !== 'step_complete')
    ? fractions[phase.ruleIndex]
    : null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      {/* Fractions display */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">
          Fractions:
        </div>
        <div className="flex flex-col space-y-1 font-mono text-sm">
          {fractions.map((f, i) => (
            <div
              key={i}
              className={`flex items-center ${
                phase.type !== 'halted' && phase.type !== 'step_complete' && phase.ruleIndex === i
                  ? 'text-blue-400'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-gray-600 w-5">{i + 1}.</span>
              <span>{f.numerator}/{f.denominator}</span>
              {phase.type !== 'halted' && phase.type !== 'step_complete' && phase.ruleIndex > i && (
                <span className="ml-2 text-gray-600 text-xs">✗</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main interaction area */}
      <div className="p-4">
        {/* History trail */}
        {history.length > 1 && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3 font-mono">
            {history.slice(0, -1).map((n, i) => (
              <React.Fragment key={i}>
                <span>{n}</span>
                <span className="text-gray-600">→</span>
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="text-center mb-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
            Current Number
          </div>
          <div className="text-4xl font-mono font-bold text-blue-400">
            {currentN}
          </div>
        </div>

        {/* Checking phase */}
        {phase.type === 'checking' && currentFraction && (
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Is <span className="font-mono font-bold text-white">{currentN} × {currentFraction.numerator}/{currentFraction.denominator}</span> a whole number?
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => handleYesNo(true)}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-md transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => handleYesNo(false)}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md transition-colors"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Wrong answer feedback */}
        {phase.type === 'wrong_answer' && currentFraction && (
          <div className="text-center">
            <p className="text-red-400 mb-2">
              Not quite. Let's check: {currentN} × {currentFraction.numerator} = {currentN * currentFraction.numerator},
              divided by {currentFraction.denominator} = {(currentN * currentFraction.numerator) / currentFraction.denominator}.
            </p>
            <p className="text-gray-400 mb-4 text-sm">
              {ruleApplies(phase.ruleIndex)
                ? "That's a whole number, so this fraction does work."
                : "That's not a whole number, so this fraction doesn't work."}
            </p>
            <button
              onClick={handleTryAgain}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition-colors"
            >
              Got it
            </button>
          </div>
        )}

        {/* Calculate phase */}
        {phase.type === 'calculate' && currentFraction && (
          <div className="text-center">
            <p className="text-green-400 mb-2">Yes! Fraction {phase.ruleIndex + 1} works.</p>
            <p className="text-gray-300 mb-4">
              What is <span className="font-mono font-bold text-white">{currentN} × {currentFraction.numerator}/{currentFraction.denominator}</span>?
            </p>
            <form onSubmit={handleCalculationSubmit} className="flex justify-center items-center space-x-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-24 bg-gray-800 border border-gray-600 rounded px-3 py-2 font-mono text-lg text-white text-center focus:border-blue-500 outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition-colors"
              >
                Check
              </button>
            </form>
          </div>
        )}

        {/* Wrong calculation feedback */}
        {phase.type === 'wrong_calculation' && currentFraction && (
          <div className="text-center">
            <p className="text-red-400 mb-2">
              {phase.userAnswer} isn't right. Try again!
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Hint: {currentN} × {currentFraction.numerator} = {currentN * currentFraction.numerator}, then divide by {currentFraction.denominator}.
            </p>
            <button
              onClick={handleTryAgain}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Step complete - continue to next */}
        {phase.type === 'step_complete' && (
          <div className="text-center">
            <p className="text-green-400 font-bold mb-2">
              Correct! The new number is {phase.result}.
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Now we start over from fraction 1 with our new number.
            </p>
            <button
              onClick={handleContinue}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Halted */}
        {phase.type === 'halted' && (
          <div className="text-center">
            <p className="text-red-400 font-bold mb-2">
              No fraction works — the game stops!
            </p>
            <div className="text-gray-400 text-sm mt-4">
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
