import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';
import { PrimeMap, EventType } from '../../types';
import { useFractranSim } from '../../hooks/useFractranSim';
import { calculateValue } from '../../services/fractranLogic';
import RegisterBoard from '../RegisterBoard';
import ProgramPanel from '../ProgramPanel';
import Controls from '../Controls';

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

interface MiniSimProps {
  program: string[];
  initialRegisters: PrimeMap;
  editableRegisters?: number[];
  enabledEvents?: EventType[];
  description?: string;
  showRules?: boolean;
  initialSpeed?: number;
  /** Use game terminology instead of programming terminology */
  gameMode?: boolean;
  /** Allow expanding to fullscreen mode */
  allowFullscreen?: boolean;
}

const MiniSim: React.FC<MiniSimProps> = ({
  program,
  initialRegisters,
  editableRegisters = [],
  enabledEvents = [EventType.HALT],
  description,
  showRules = true,
  initialSpeed = 10,
  gameMode = false,
  allowFullscreen = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Labels change based on gameMode
  const rulesTitle = gameMode ? "Game Rules" : "Program Rules";
  const haltedMessage = gameMode ? "Game Ended" : "Program Halted";
  const registersTitle = gameMode ? "Prime Columns" : "Prime Registers";
  const sim = useFractranSim({
    program,
    initialRegisters,
    editableRegisters,
    enabledEvents,
    initialSpeed,
  });

  const SimContent = ({ expanded = false }: { expanded?: boolean }) => (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${expanded ? 'h-full flex flex-col' : ''}`}>
      <div className={`flex flex-col md:flex-row ${expanded ? 'flex-1 min-h-0' : ''}`}>
        {/* Rules panel (optional) */}
        {showRules && (
          <div className={`${expanded ? 'md:w-56' : 'md:w-44'} flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-800 p-2`}>
            <ProgramPanel
              program={sim.fractions}
              activeRuleIndex={sim.activeRuleIndex !== null ? sim.activeRuleIndex : sim.currentState.lastRuleIndex}
              phase={sim.phase}
              halted={sim.currentState.halted}
              scanningIndex={sim.scanningIndex}
              rulesTitle={rulesTitle}
              haltedMessage={haltedMessage}
            />
          </div>
        )}

        {/* Main area */}
        <div className={`flex-1 flex flex-col min-w-0 ${expanded ? 'min-h-0' : ''}`}>
          {/* Header with value display and expand button */}
          <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
            <div className="flex-1 text-center">
              <span className="text-2xl font-mono font-bold text-blue-400">
                {calculateValue(sim.currentState.registers).toString()}
              </span>
              <span className="text-gray-500 mx-2">=</span>
              <span className="text-lg font-mono text-gray-400">
                {formatPrimeFactors(sim.currentState.registers) || '1'}
              </span>
            </div>
            {allowFullscreen && !expanded && (
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Expand"
              >
                <Maximize2 size={16} />
              </button>
            )}
            {expanded && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className={`flex-1 p-3 ${expanded ? 'overflow-auto' : ''}`} style={{ minHeight: expanded ? undefined : '280px' }}>
            <RegisterBoard
              registers={sim.currentState.registers}
              phase={sim.phase}
              activeRule={sim.activeFraction}
              usedPrimes={sim.usedPrimes}
              editableRegisters={sim.editableRegisters}
              isSetupMode={sim.currentState.step === 0}
              onEdit={sim.editRegister}
              title={registersTitle}
              description={description}
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

  return (
    <>
      <SimContent />
      {isFullscreen && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreen(false);
          }}
        >
          <div className="w-full max-w-5xl h-[85vh]">
            <SimContent expanded />
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MiniSim;
