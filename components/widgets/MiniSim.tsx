import React from 'react';
import { PrimeMap, EventType } from '../../types';
import { useFractranSim } from '../../hooks/useFractranSim';
import RegisterBoard from '../RegisterBoard';
import ProgramPanel from '../ProgramPanel';
import Controls from '../Controls';

interface MiniSimProps {
  program: string[];
  initialRegisters: PrimeMap;
  editableRegisters?: number[];
  enabledEvents?: EventType[];
  description?: string;
  showRules?: boolean;
  initialSpeed?: number;
}

const MiniSim: React.FC<MiniSimProps> = ({
  program,
  initialRegisters,
  editableRegisters = [],
  enabledEvents = [EventType.HALT],
  description,
  showRules = true,
  initialSpeed = 10,
}) => {
  const sim = useFractranSim({
    program,
    initialRegisters,
    editableRegisters,
    enabledEvents,
    initialSpeed,
  });

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Rules panel (optional) */}
        {showRules && (
          <div className="md:w-44 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-800 p-2">
            <ProgramPanel
              program={sim.fractions}
              activeRuleIndex={sim.activeRuleIndex !== null ? sim.activeRuleIndex : sim.currentState.lastRuleIndex}
              phase={sim.phase}
              halted={sim.currentState.halted}
              scanningIndex={sim.scanningIndex}
            />
          </div>
        )}

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-3" style={{ minHeight: '280px' }}>
            <RegisterBoard
              registers={sim.currentState.registers}
              phase={sim.phase}
              activeRule={sim.activeFraction}
              usedPrimes={sim.usedPrimes}
              editableRegisters={sim.editableRegisters}
              isSetupMode={sim.currentState.step === 0}
              onEdit={sim.editRegister}
              description={description}
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

export default MiniSim;
