import React, { useState, useEffect, useRef } from 'react';
import { PrimeMap, EventType } from '../../types';
import { useFractranSim } from '../../hooks/useFractranSim';
import { calculateValue } from '../../services/fractranLogic';
import RegisterBoard from '../RegisterBoard';
import Controls from '../Controls';
import { Plus, X } from 'lucide-react';

interface FractionInput {
  num: string;
  den: string;
}

interface ProgramBuilderProps {
  initialProgram?: string[];
  initialRegisters: PrimeMap;
  editableRegisters?: number[];
  goalDescription?: string;
}

// Format PrimeMap as "2³ × 3²"
function formatPrimeFactors(regs: PrimeMap): string {
  const primes = Object.keys(regs).map(Number).sort((a, b) => a - b);
  if (primes.length === 0) return '1';

  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  };

  const toSuperscript = (n: number): string => {
    if (n === 1) return '';
    return String(n).split('').map(d => superscripts[d]).join('');
  };

  return primes
    .filter(p => regs[p] > 0)
    .map(p => `${p}${toSuperscript(regs[p])}`)
    .join(' × ');
}

const ProgramBuilder: React.FC<ProgramBuilderProps> = ({
  initialProgram = [],
  initialRegisters,
  editableRegisters = [],
  goalDescription,
}) => {
  // Parse initial program into fraction inputs
  const parseInitialProgram = (): FractionInput[] => {
    if (initialProgram.length === 0) {
      return [{ num: '', den: '' }];
    }
    return initialProgram.map(f => {
      const [num, den] = f.split('/');
      return { num: num || '', den: den || '' };
    });
  };

  const [fractions, setFractions] = useState<FractionInput[]>(parseInitialProgram);

  // Build program string array from inputs
  const buildProgram = (): string[] => {
    return fractions
      .filter(f => f.num && f.den && parseInt(f.num) > 0 && parseInt(f.den) > 0)
      .map(f => `${f.num}/${f.den}`);
  };

  const program = buildProgram();
  const programKey = program.join(',');
  const prevProgramRef = useRef(programKey);

  const sim = useFractranSim({
    program: program.length > 0 ? program : ['1/1'], // placeholder to avoid empty
    initialRegisters,
    editableRegisters,
    enabledEvents: [EventType.HALT],
    initialSpeed: 10,
  });

  // Reload simulation when program changes
  useEffect(() => {
    if (programKey !== prevProgramRef.current && program.length > 0) {
      prevProgramRef.current = programKey;
      sim.load(program, initialRegisters, { editableRegisters });
    }
  }, [programKey, program, initialRegisters, editableRegisters, sim]);

  const updateFraction = (index: number, field: 'num' | 'den', value: string) => {
    // Only allow positive integers
    if (value && !/^\d+$/.test(value)) return;

    const newFractions = [...fractions];
    newFractions[index] = { ...newFractions[index], [field]: value };
    setFractions(newFractions);
  };

  const addFraction = () => {
    setFractions([...fractions, { num: '', den: '' }]);
  };

  const removeFraction = (index: number) => {
    if (fractions.length <= 1) return;
    const newFractions = fractions.filter((_, i) => i !== index);
    setFractions(newFractions);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Program editor panel */}
        <div className="md:w-48 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-800 p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">
            Your Program:
          </div>

          <div className="space-y-2">
            {fractions.map((f, i) => (
              <div key={i} className="flex items-center space-x-1">
                <span className="text-gray-600 text-sm w-4">{i + 1}.</span>
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    value={f.num}
                    onChange={(e) => updateFraction(i, 'num', e.target.value)}
                    placeholder="?"
                    className="w-10 bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-center text-sm font-mono text-white focus:border-blue-500 outline-none"
                  />
                  <div className="w-8 border-t border-gray-500 my-0.5" />
                  <input
                    type="text"
                    value={f.den}
                    onChange={(e) => updateFraction(i, 'den', e.target.value)}
                    placeholder="?"
                    className="w-10 bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-center text-sm font-mono text-white focus:border-blue-500 outline-none"
                  />
                </div>
                {fractions.length > 1 && (
                  <button
                    onClick={() => removeFraction(i)}
                    className="p-0.5 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addFraction}
            className="mt-3 flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-400 transition-colors"
          >
            <Plus size={12} />
            <span>Add fraction</span>
          </button>

          {program.length === 0 && (
            <div className="mt-3 text-xs text-amber-500">
              Enter a fraction to start
            </div>
          )}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Goal description */}
          {goalDescription && (
            <div className="bg-blue-900/20 border-b border-blue-900/30 px-4 py-2 text-sm text-blue-300">
              <span className="font-bold">Goal:</span> {goalDescription}
            </div>
          )}

          {/* Current value display */}
          <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 text-center">
            <span className="text-2xl font-mono font-bold text-blue-400">
              {calculateValue(sim.currentState.registers).toString()}
            </span>
            <span className="text-gray-500 mx-2">=</span>
            <span className="text-lg font-mono text-gray-400">
              {formatPrimeFactors(sim.currentState.registers) || '1'}
            </span>
          </div>

          <div className="flex-1 p-3" style={{ minHeight: '240px' }}>
            <RegisterBoard
              registers={sim.currentState.registers}
              phase={sim.phase}
              activeRule={sim.activeFraction}
              usedPrimes={sim.usedPrimes}
              editableRegisters={sim.editableRegisters}
              isSetupMode={sim.currentState.step === 0}
              onEdit={sim.editRegister}
            />
          </div>

          <div className="border-t border-gray-800">
            <Controls
              isPlaying={sim.isPlaying}
              onPlayPause={() => sim.setIsPlaying(!sim.isPlaying)}
              onStep={sim.step}
              onReset={sim.reset}
              speed={sim.speed}
              setSpeed={sim.setSpeed}
              stepCount={sim.currentState.step}
              historyLength={sim.history.length}
              currentHistoryIndex={sim.historyIndex}
              onScrub={sim.scrub}
              totalSteps={sim.totalSteps}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramBuilder;
