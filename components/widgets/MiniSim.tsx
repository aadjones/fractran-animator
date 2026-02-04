import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X, Play } from 'lucide-react';

// Mobile breakpoint (matches Tailwind's md)
const MOBILE_BREAKPOINT = 768;
import { EventType } from '../../types';
import { useFractranSim } from '../../hooks/useFractranSim';
import { calculateValue } from '../../services/fractranLogic';
import { formatPrimeFactors } from '../../services/formatters';
import RegisterBoard from '../RegisterBoard';
import ProgramPanel from '../ProgramPanel';
import Controls from '../Controls';
import EventLog from '../EventLog';

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
  /** Show only a preview card that opens fullscreen when clicked */
  previewOnly?: boolean;
  /** Title for preview card */
  title?: string;
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
  previewOnly = false,
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

  // On mobile, force preview mode for inline widgets (unless already previewOnly)
  const usePreviewMode = previewOnly || isMobile;

  // Check if we're tracking special events (not just HALT)
  const hasSpecialEvents = enabledEvents.some(e => e !== EventType.HALT);

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

  const SimContent = ({ expanded = false, compact = false }: { expanded?: boolean; compact?: boolean }) => (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${expanded ? 'h-full flex flex-col' : ''}`}>
      <div className={`flex flex-col md:flex-row ${expanded ? 'flex-1 min-h-0' : ''}`}>
        {/* Rules panel (optional) */}
        {showRules && (
          <div className={`${expanded ? 'md:w-56' : 'md:w-44'} flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-800 ${compact ? 'p-1.5' : 'p-2'}`}>
            <ProgramPanel
              program={sim.fractions}
              activeRuleIndex={sim.activeRuleIndex !== null ? sim.activeRuleIndex : sim.currentState.lastRuleIndex}
              phase={sim.phase}
              halted={sim.currentState.halted}
              scanningIndex={sim.scanningIndex}
              rulesTitle={rulesTitle}
              haltedMessage={haltedMessage}
              compact={compact}
            />
          </div>
        )}

        {/* Main area */}
        <div className={`flex-1 flex flex-col min-w-0 ${expanded ? 'min-h-0' : ''}`}>
          {/* Header with value display and expand button */}
          <div className={`bg-gray-800/50 border-b border-gray-700 flex items-center justify-between ${compact ? 'px-3 py-1.5' : 'px-4 py-2'}`}>
            <div className="flex-1 text-center">
              <span className={`font-mono font-bold text-blue-400 ${compact ? 'text-xl' : 'text-2xl'}`}>
                {calculateValue(sim.currentState.registers).toString()}
              </span>
              <span className="text-gray-500 mx-2">=</span>
              <span className={`font-mono text-gray-400 ${compact ? 'text-base' : 'text-lg'}`}>
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

          <div className={`flex-1 ${compact ? 'p-1.5' : 'p-3'} ${expanded ? 'overflow-auto' : ''}`} style={{ minHeight: expanded ? undefined : '280px' }}>
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

  // Preview card for previewOnly mode
  const PreviewCard = () => (
    <button
      onClick={() => setIsFullscreen(true)}
      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-gray-500 hover:bg-gray-800/50 transition-all group text-left"
    >
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h4 className="text-lg font-semibold text-gray-100 mb-1">{title}</h4>
          )}
          <p className="text-sm text-gray-400">
            {program.length} fraction{program.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
          <span className="text-sm">Open simulator</span>
          <Play size={18} />
        </div>
      </div>
    </button>
  );

  return (
    <>
      {usePreviewMode ? <PreviewCard /> : <SimContent />}
      {isFullscreen && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreen(false);
          }}
        >
          <div className={`w-full h-[95vh] md:h-[85vh] flex gap-4 ${hasSpecialEvents ? 'max-w-6xl' : 'max-w-5xl'}`}>
            <div className={hasSpecialEvents ? 'flex-1 min-w-0' : 'w-full'}>
              <SimContent expanded compact={isMobile} />
            </div>
            {hasSpecialEvents && (
              <div className="w-64 flex-shrink-0">
                <EventLog events={sim.events} />
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MiniSim;
