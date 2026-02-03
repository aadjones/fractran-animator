import React, { useState } from 'react';
import { Preset, EventType } from '../types';
import { PRESETS } from '../constants';
import { useFractranSim } from '../hooks/useFractranSim';
import RegisterBoard from '../components/RegisterBoard';
import ProgramPanel from '../components/ProgramPanel';
import Controls from '../components/Controls';
import EventLog from '../components/EventLog';
import Configuration from '../components/Configuration';
import { ChevronLeft, ChevronRight, Code, Layout, List, Terminal, ArrowLeft } from 'lucide-react';

interface SandboxProps {
  onNavigate: (hash: string) => void;
}

const Sandbox: React.FC<SandboxProps> = ({ onNavigate }) => {
  // Sandbox-specific UI state
  const [currentPresetIndex, setCurrentPresetIndex] = useState<number>(0);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'program' | 'events'>('board');
  const [isEventPanelOpen, setIsEventPanelOpen] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const currentPreset = !isCustomMode ? PRESETS[currentPresetIndex] : null;

  // Simulation state via hook
  const sim = useFractranSim({
    program: PRESETS[0].fractions,
    initialRegisters: PRESETS[0].initialState,
    editableRegisters: PRESETS[0].editableRegisters,
    enabledEvents: PRESETS[0].defaultEvents,
  });

  const loadPreset = (preset: Preset) => {
    setIsCustomMode(false);
    const idx = PRESETS.findIndex(p => p.name === preset.name);
    if (idx !== -1) setCurrentPresetIndex(idx);

    sim.load(preset.fractions, preset.initialState, {
      editableRegisters: preset.editableRegisters,
      enabledEvents: preset.defaultEvents,
    });
  };

  const loadCustom = (fractionStrs: string[], stateMap: Record<number, number>) => {
    setIsCustomMode(true);
    sim.load(fractionStrs, stateMap, {
      editableRegisters: Object.keys(stateMap).map(Number),
      enabledEvents: [EventType.HALT],
    });
  };

  const handleNextPreset = () => {
    const nextIndex = (currentPresetIndex + 1) % PRESETS.length;
    setCurrentPresetIndex(nextIndex);
    loadPreset(PRESETS[nextIndex]);
  };

  const handlePrevPreset = () => {
    const prevIndex = (currentPresetIndex - 1 + PRESETS.length) % PRESETS.length;
    setCurrentPresetIndex(prevIndex);
    loadPreset(PRESETS[prevIndex]);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-950 text-gray-100 font-sans">

      {/* Header */}
      <header className="h-14 md:h-16 border-b border-gray-800 bg-gray-900 px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-20 shadow-md">

        {/* Left: Back + Branding */}
        <div className="flex items-center space-x-3 md:w-64">
          <button
            onClick={() => onNavigate('/')}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            title="Back to chapters"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-md flex items-center justify-center font-bold font-mono text-xl shadow-lg shadow-blue-500/20 text-white">F</div>
          <h1 className="text-xl font-bold tracking-tight text-gray-200 hidden md:block">FRACTRAN</h1>
        </div>

        {/* Center: Module Navigation */}
        <div className="flex-1 flex justify-center items-center overflow-hidden px-2">
          <div className="flex items-center bg-gray-950/50 p-1 rounded-full border border-gray-800/50 max-w-full">
             <button
                onClick={handlePrevPreset}
                disabled={isCustomMode}
                className="p-1 md:p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors disabled:opacity-30 flex-shrink-0"
             >
                <ChevronLeft size={20} />
             </button>

             <div className="w-[160px] md:w-[240px] px-2 text-center cursor-pointer hover:opacity-80 transition-opacity flex flex-col items-center" onClick={() => setIsConfigOpen(true)}>
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-0.5 hidden md:block w-full truncate">
                    {isCustomMode ? 'CUSTOM MODE' : `MODULE ${currentPresetIndex + 1} / ${PRESETS.length}`}
                </div>
                <h2 className="text-sm md:text-lg font-bold text-white leading-none whitespace-nowrap overflow-hidden text-ellipsis w-full">
                    {isCustomMode ? 'Custom Program' : currentPreset?.name}
                </h2>
             </div>

             <button
                onClick={handleNextPreset}
                disabled={isCustomMode}
                className="p-1 md:p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors disabled:opacity-30 flex-shrink-0"
             >
                <ChevronRight size={20} />
             </button>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center justify-end space-x-2 md:space-x-4 md:w-64">
           <div className="hidden lg:flex flex-col items-end border-r border-gray-700 pr-4 mr-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Value (N)</span>
              <span className="font-mono text-lg text-blue-400 font-bold max-w-[10rem] truncate" title={sim.nValue}>
                {sim.nValue}
              </span>
           </div>

           <button
             onClick={() => setIsConfigOpen(true)}
             className="flex items-center space-x-2 px-2 py-2 md:px-3 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors border border-gray-700 hover:border-gray-500"
             title="Open Configuration / Custom Editor"
           >
             <Code size={18} />
             <span className="text-xs font-bold hidden md:inline">EDITOR</span>
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

        {/* Mobile: Bottom Navigation Bar */}
        <div className="md:hidden flex-shrink-0 order-last h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-around z-50 pb-safe">
            <button
                onClick={() => setActiveTab('program')}
                className={`flex flex-col items-center justify-center space-y-1 w-full h-full ${activeTab === 'program' ? 'text-blue-400' : 'text-gray-500'}`}
            >
                <List size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Rules</span>
            </button>
            <button
                onClick={() => setActiveTab('board')}
                className={`flex flex-col items-center justify-center space-y-1 w-full h-full ${activeTab === 'board' ? 'text-blue-400' : 'text-gray-500'}`}
            >
                <Layout size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Board</span>
            </button>
            <button
                onClick={() => setActiveTab('events')}
                className={`flex flex-col items-center justify-center space-y-1 w-full h-full ${activeTab === 'events' ? 'text-blue-400' : 'text-gray-500'}`}
            >
                <Terminal size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Log</span>
            </button>
        </div>

        {/* Left: Program */}
        <div className={`
             ${activeTab === 'program' ? 'flex' : 'hidden'}
             md:flex flex-col w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-800 bg-gray-900/50 p-4 z-10 overflow-hidden
        `}>
           <ProgramPanel
             program={sim.fractions}
             activeRuleIndex={sim.activeRuleIndex !== null ? sim.activeRuleIndex : sim.currentState.lastRuleIndex}
             phase={sim.phase}
             halted={sim.currentState.halted}
             scanningIndex={sim.scanningIndex}
           />
        </div>

        {/* Center: Visualization */}
        <div className={`
             ${activeTab === 'board' ? 'flex' : 'hidden'}
             md:flex flex-1 flex-col min-w-0 bg-gray-950 relative overflow-hidden transition-all duration-300
        `}>

          <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
            <RegisterBoard
              registers={sim.currentState.registers}
              phase={sim.phase}
              activeRule={sim.activeFraction}
              usedPrimes={sim.usedPrimes}
              editableRegisters={sim.editableRegisters}
              isSetupMode={sim.currentState.step === 0}
              onEdit={sim.editRegister}
              title={isCustomMode ? "Custom" : currentPreset?.name}
              description={isCustomMode ? "Running custom program" : currentPreset?.notes}
            />
          </div>

          <div className="flex-shrink-0 border-t border-gray-800 z-10 bg-gray-900/90 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
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

        {/* Right: Events */}
        <div className={`
            ${activeTab === 'events' ? 'flex w-full' : 'hidden'}
            md:flex flex-col flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-800 bg-gray-900/50 z-10 overflow-hidden md:w-72
        `}>
           <div className="w-full h-full p-4 overflow-hidden">
               <EventLog
                   events={sim.events}
               />
           </div>
        </div>

      </div>

      <Configuration
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentProgram={sim.fractions}
        currentState={sim.currentState.registers}
        onLoadPreset={loadPreset}
        onSaveCustom={loadCustom}
      />
    </div>
  );
};

export default Sandbox;
