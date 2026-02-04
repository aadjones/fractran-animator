import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PrimeMap, EventType } from '../../types';
import { useFractranSim } from '../../hooks/useFractranSim';
import { calculateValue } from '../../services/fractranLogic';
import { formatPrimeFactors } from '../../services/formatters';
import RegisterBoard from '../RegisterBoard';
import Controls from '../Controls';
import { Plus, X, Play } from 'lucide-react';

// Mobile breakpoint (matches Tailwind's md)
const MOBILE_BREAKPOINT = 768;

interface FractionInput {
  num: string;
  den: string;
}

interface ProgramBuilderProps {
  initialProgram?: string[];
  initialRegisters: PrimeMap;
  editableRegisters?: number[];
  goalDescription?: string;
  /** Title for preview card */
  title?: string;
}

const ProgramBuilder: React.FC<ProgramBuilderProps> = ({
  initialProgram = [],
  initialRegisters,
  editableRegisters = [],
  goalDescription,
  title,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
  );

  // Listen for resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Builder content - used both inline (desktop) and in fullscreen modal
  const BuilderContent = ({ compact = false }: { compact?: boolean }) => (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${compact ? 'h-full flex flex-col' : ''}`}>
      <div className={`flex flex-col md:flex-row ${compact ? 'flex-1 min-h-0' : ''}`}>
        {/* Program editor panel */}
        <div className={`md:w-48 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-800 ${compact ? 'p-2' : 'p-3'}`}>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 md:mb-3">
            Your Program:
          </div>

          <div className="space-y-2">
            {fractions.map((f, i) => (
              <div key={i} className="flex items-center space-x-1">
                <span className="text-gray-600 text-sm w-4">{i + 1}.</span>
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={f.num}
                    onChange={(e) => updateFraction(i, 'num', e.target.value)}
                    placeholder="?"
                    className={`bg-gray-800 border border-gray-600 rounded text-center font-mono text-white focus:border-blue-500 outline-none ${compact ? 'w-9 px-1 py-0.5 text-sm' : 'w-10 px-1 py-0.5 text-sm'}`}
                  />
                  <div className="w-8 border-t border-gray-500 my-0.5" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={f.den}
                    onChange={(e) => updateFraction(i, 'den', e.target.value)}
                    placeholder="?"
                    className={`bg-gray-800 border border-gray-600 rounded text-center font-mono text-white focus:border-blue-500 outline-none ${compact ? 'w-9 px-1 py-0.5 text-sm' : 'w-10 px-1 py-0.5 text-sm'}`}
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
            className="mt-2 md:mt-3 flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-400 transition-colors"
          >
            <Plus size={12} />
            <span>Add fraction</span>
          </button>

          {program.length === 0 && (
            <div className="mt-2 md:mt-3 text-xs text-amber-500">
              Enter a fraction to start
            </div>
          )}
        </div>

        {/* Main area */}
        <div className={`flex-1 flex flex-col min-w-0 ${compact ? 'min-h-0' : ''}`}>
          {/* Goal description */}
          {goalDescription && (
            <div className={`bg-blue-900/20 border-b border-blue-900/30 text-blue-300 ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}>
              <span className="font-bold">Goal:</span> {goalDescription}
            </div>
          )}

          {/* Current value display */}
          <div className={`bg-gray-800/50 border-b border-gray-700 text-center ${compact ? 'px-3 py-1.5' : 'px-4 py-2'}`}>
            <span className={`font-mono font-bold text-blue-400 ${compact ? 'text-xl' : 'text-2xl'}`}>
              {calculateValue(sim.currentState.registers).toString()}
            </span>
            <span className="text-gray-500 mx-2">=</span>
            <span className={`font-mono text-gray-400 ${compact ? 'text-base' : 'text-lg'}`}>
              {formatPrimeFactors(sim.currentState.registers) || '1'}
            </span>
            {compact && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="ml-4 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className={`flex-1 ${compact ? 'p-1.5 overflow-auto' : 'p-3'}`} style={{ minHeight: compact ? undefined : '240px' }}>
            <RegisterBoard
              registers={sim.currentState.registers}
              phase={sim.phase}
              activeRule={sim.activeFraction}
              usedPrimes={sim.usedPrimes}
              editableRegisters={sim.editableRegisters}
              isSetupMode={sim.currentState.step === 0}
              onEdit={sim.editRegister}
              compact={compact}
            />
          </div>

          <div className="border-t border-gray-800 flex-shrink-0">
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

  // Preview card for mobile
  const PreviewCard = () => (
    <button
      onClick={() => setIsFullscreen(true)}
      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 md:p-6 hover:border-gray-500 hover:bg-gray-800/50 transition-all group text-left"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base md:text-lg font-semibold text-gray-100 mb-1">
            {title || goalDescription || 'Build a program'}
          </h4>
          <p className="text-xs md:text-sm text-gray-400">
            Tap to open puzzle builder
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
          <span className="text-xs md:text-sm">Open</span>
          <Play size={16} />
        </div>
      </div>
    </button>
  );

  return (
    <>
      {isMobile ? <PreviewCard /> : <BuilderContent />}
      {isFullscreen && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreen(false);
          }}
        >
          <div className="w-full max-w-4xl h-[95vh] md:h-[85vh]">
            <BuilderContent compact={isMobile} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProgramBuilder;
