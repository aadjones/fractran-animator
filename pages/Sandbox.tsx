import React, { useState, useEffect, useRef } from 'react';
import { PrimeMap, EventType } from '../types';
import { useFractranSim } from '../hooks/useFractranSim';
import { calculateValue } from '../services/fractranLogic';
import { formatPrimeFactors } from '../services/formatters';
import RegisterBoard from '../components/RegisterBoard';
import ProgramPanel from '../components/ProgramPanel';
import Controls from '../components/Controls';
import { ArrowLeft, Plus, X, RotateCcw } from 'lucide-react';

interface SandboxProps {
  onNavigate: (hash: string) => void;
}

interface FractionInput {
  num: string;
  den: string;
}

// Default primes to show in sandbox
const DEFAULT_PRIMES = [2, 3, 5, 7, 11, 13];

const Sandbox: React.FC<SandboxProps> = ({ onNavigate }) => {
  // Fraction editor state
  const [fractions, setFractions] = useState<FractionInput[]>([
    { num: '3', den: '2' }
  ]);

  // Build program string array from inputs
  const buildProgram = (): string[] => {
    return fractions
      .filter(f => f.num && f.den && parseInt(f.num) > 0 && parseInt(f.den) > 0)
      .map(f => `${f.num}/${f.den}`);
  };

  const program = buildProgram();
  const programKey = program.join(',');
  const prevProgramRef = useRef(programKey);

  // Initial state: 4 beads in column 2
  const initialRegisters: PrimeMap = { 2: 4 };

  // Simulation
  const sim = useFractranSim({
    program: program.length > 0 ? program : ['1/1'],
    initialRegisters,
    editableRegisters: DEFAULT_PRIMES,
    enabledEvents: [EventType.HALT],
  });

  // Reload simulation when program changes
  useEffect(() => {
    if (programKey !== prevProgramRef.current && program.length > 0) {
      prevProgramRef.current = programKey;
      // Preserve current bead state when program changes
      sim.load(program, sim.currentState.registers, {
        editableRegisters: DEFAULT_PRIMES
      });
    }
  }, [programKey, program, sim]);

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
    setFractions(fractions.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setFractions([{ num: '3', den: '2' }]);
    sim.load(['3/2'], { 2: 4 }, { editableRegisters: DEFAULT_PRIMES });
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 h-14 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
          Sandbox
        </div>
        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 text-gray-400 hover:text-white transition-colors"
          title="Reset everything"
        >
          <RotateCcw size={16} />
          <span className="text-sm font-medium hidden sm:inline">Reset All</span>
        </button>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Left: Fraction Editor */}
        <div className="lg:w-56 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-800 bg-gray-900/30 p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">
            Your Program
          </div>

          <div className="space-y-3">
            {fractions.map((f, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className="text-gray-600 text-sm w-5 text-right">{i + 1}.</span>
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={f.num}
                    onChange={(e) => updateFraction(i, 'num', e.target.value)}
                    placeholder="?"
                    className="w-12 bg-gray-800 border border-gray-600 rounded px-1.5 py-1 text-center text-sm font-mono text-white focus:border-blue-500 outline-none"
                  />
                  <div className="w-10 border-t border-gray-500 my-1" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={f.den}
                    onChange={(e) => updateFraction(i, 'den', e.target.value)}
                    placeholder="?"
                    className="w-12 bg-gray-800 border border-gray-600 rounded px-1.5 py-1 text-center text-sm font-mono text-white focus:border-blue-500 outline-none"
                  />
                </div>
                {fractions.length > 1 && (
                  <button
                    onClick={() => removeFraction(i)}
                    className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addFraction}
            className="mt-4 flex items-center space-x-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors"
          >
            <Plus size={14} />
            <span>Add fraction</span>
          </button>

          {program.length === 0 && (
            <div className="mt-4 text-xs text-amber-500/80">
              Enter a fraction to start
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="text-[10px] text-gray-600 leading-relaxed">
              Click columns to add beads in setup mode. Use +/- buttons or click/right-click.
            </div>
          </div>
        </div>

        {/* Right: Simulation */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-3.5rem)]">
          {/* Value Display */}
          <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700 flex items-center justify-center">
            <span className="text-2xl font-mono font-bold text-blue-400">
              {calculateValue(sim.currentState.registers).toString()}
            </span>
            <span className="text-gray-500 mx-3">=</span>
            <span className="text-lg font-mono text-gray-400">
              {formatPrimeFactors(sim.currentState.registers) || '1'}
            </span>
          </div>

          {/* Main area with program panel and register board */}
          <div className="flex flex-1 min-h-0">
            {/* Program Rules sidebar */}
            <div className="hidden md:block w-44 flex-shrink-0 border-r border-gray-800 p-3 overflow-y-auto">
              <ProgramPanel
                program={sim.fractions}
                activeRuleIndex={sim.activeRuleIndex !== null ? sim.activeRuleIndex : sim.currentState.lastRuleIndex}
                phase={sim.phase}
                halted={sim.currentState.halted}
                scanningIndex={sim.scanningIndex}
              />
            </div>

            {/* Register Board */}
            <div className="flex-1 p-4 md:p-6 overflow-auto">
              <RegisterBoard
                registers={sim.currentState.registers}
                phase={sim.phase}
                activeRule={sim.activeFraction}
                usedPrimes={sim.usedPrimes}
                editableRegisters={sim.editableRegisters}
                isSetupMode={sim.currentState.step === 0}
                onEdit={sim.editRegister}
                title="Sandbox"
                description="Click columns to add beads, right-click to remove"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex-shrink-0 border-t border-gray-800 bg-gray-900/50">
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

export default Sandbox;
