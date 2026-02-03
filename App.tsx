import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Fraction, ProgramState, PrimeMap, SimulationEvent, EventType, Preset, AnimationPhase } from './types';
import { parseProgram, stepSimulation, canApplyRule, applyRule, calculateValue } from './services/fractranLogic';
import { PRESETS, PRIMES } from './constants';
import RegisterBoard from './components/RegisterBoard';
import ProgramPanel from './components/ProgramPanel';
import Controls from './components/Controls';
import EventLog from './components/EventLog';
import Configuration from './components/Configuration';
import { ChevronLeft, ChevronRight, Code, Layout, List, Terminal, PanelRightOpen } from 'lucide-react';

const MAX_HISTORY = 2000;
const INSTANT_SPEED_THRESHOLD = 90;
const FORECAST_LIMIT = 5000;

// Helper: Dry run to find halt step
const calculateMaxSteps = (regs: PrimeMap, program: Fraction[]): number | null => {
  let currentRegs = { ...regs };
  let steps = 0;

  while (steps < FORECAST_LIMIT) {
    let applied = false;
    for (const rule of program) {
      if (canApplyRule(currentRegs, rule)) {
        currentRegs = applyRule(currentRegs, rule);
        steps++;
        applied = true;
        break;
      }
    }
    // If no rule applied, we halted
    if (!applied) return steps;
  }
  // Hit limit without halting
  return null;
};

function App() {
  // --- State ---
  
  const [currentPresetIndex, setCurrentPresetIndex] = useState<number>(0);
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'board' | 'program' | 'events'>('board');
  
  // Desktop Panel State
  const [isEventPanelOpen, setIsEventPanelOpen] = useState(true);

  // Program Data
  const [fractions, setFractions] = useState<Fraction[]>([]);
  const [editableRegisters, setEditableRegisters] = useState<number[]>([]);
  const [totalSteps, setTotalSteps] = useState<number | null>(null);
  
  // Simulation History & Current Pointer
  const [history, setHistory] = useState<ProgramState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Playback Control
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(10); // 1 to 100

  // Animation State
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [activeRuleIndex, setActiveRuleIndex] = useState<number | null>(null);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);
  const [targetRuleIndex, setTargetRuleIndex] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Events
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [enabledEventTypes, setEnabledEventTypes] = useState<EventType[]>([EventType.HALT]);

  // UI State
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Helper to get current state object easily
  const currentState = history[historyIndex] || {
    registers: {},
    step: 0,
    lastRuleIndex: null,
    halted: false
  };

  // Calculate N for display
  const nValue = useMemo(() => {
    return calculateValue(currentState.registers).toString();
  }, [currentState.registers]);

  const currentPreset = !isCustomMode ? PRESETS[currentPresetIndex] : null;

  // --- Initialization ---

  useEffect(() => {
    loadPreset(PRESETS[0]);
  }, []);

  const loadPreset = (preset: Preset) => {
    stopSimulation();
    setIsCustomMode(false);
    // Find index if loading from config modal
    const idx = PRESETS.findIndex(p => p.name === preset.name);
    if (idx !== -1) setCurrentPresetIndex(idx);

    const parsed = parseProgram(preset.fractions);
    setFractions(parsed);
    setEditableRegisters(preset.editableRegisters);
    
    // Forecast Total Steps
    const max = calculateMaxSteps(preset.initialState, parsed);
    setTotalSteps(max);

    const initialState: ProgramState = {
      registers: { ...preset.initialState }, 
      step: 0,
      lastRuleIndex: null,
      halted: false
    };

    setHistory([initialState]);
    setHistoryIndex(0);
    setEvents([{
        step: 0,
        type: EventType.INFO,
        message: "Module loaded."
    }]);
    
    // Set enabled events from preset defaults
    setEnabledEventTypes(preset.defaultEvents || [EventType.HALT]);
  };

  const loadCustom = (fractionStrs: string[], stateMap: PrimeMap) => {
    stopSimulation();
    setIsCustomMode(true);
    const parsed = parseProgram(fractionStrs);
    setFractions(parsed);
    setEditableRegisters(Object.keys(stateMap).map(Number)); 
    
    // Forecast Total Steps
    const max = calculateMaxSteps(stateMap, parsed);
    setTotalSteps(max);
    
    const initialState: ProgramState = {
      registers: stateMap,
      step: 0,
      lastRuleIndex: null,
      halted: false
    };

    setHistory([initialState]);
    setHistoryIndex(0);
    setEvents([{
        step: 0,
        type: EventType.INFO,
        message: "Custom program loaded."
    }]);
    
    // Default for custom mode
    setEnabledEventTypes([EventType.HALT]);
  };

  const stopSimulation = () => {
    setIsPlaying(false);
    setPhase('idle');
    setActiveRuleIndex(null);
    setScanningIndex(null);
    setTargetRuleIndex(null);
    if (timerRef.current) clearTimeout(timerRef.current);
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

  // --- Logic Helpers ---

  // Identify all primes relevant to this program (for filtering the view)
  const usedPrimes = useMemo(() => {
     // 1. Collect all explicitly used primes
     const set = new Set<number>();
     fractions.forEach(f => {
         Object.keys(f.numPrimes).forEach(p => set.add(Number(p)));
         Object.keys(f.denPrimes).forEach(p => set.add(Number(p)));
     });
     Object.keys(currentState.registers).forEach(p => set.add(Number(p)));
     editableRegisters.forEach(p => set.add(p));
     
     if (set.size === 0) return [];

     // 2. Find max to ensure we fill gaps (e.g. show 2,3,5,7 even if 3 is unused)
     const maxPrime = Math.max(...Array.from(set));
     
     // 3. Filter canonical primes list up to maxPrime
     const contiguous = PRIMES.filter(p => p <= maxPrime);
     
     // 4. Add any custom primes larger than our static list (edge case)
     Array.from(set).forEach(p => {
        if (!contiguous.includes(p)) contiguous.push(p);
     });

     return contiguous.sort((a, b) => a - b);
  }, [fractions, currentState.registers, editableRegisters]);

  const handleRegisterEdit = (prime: number, delta: number) => {
    if (currentState.step !== 0) return;
    if (!editableRegisters.includes(prime)) return;

    setHistory(prev => {
        const root = { ...prev[0] };
        const newRegs = { ...root.registers };
        const currentCount = newRegs[prime] || 0;
        const newCount = Math.max(0, currentCount + delta);
        
        if (newCount === 0) delete newRegs[prime];
        else newRegs[prime] = newCount;

        root.registers = newRegs;

        // Re-forecast when user edits state
        const max = calculateMaxSteps(newRegs, fractions);
        setTotalSteps(max);

        return [root];
    });
  };

  const checkEvents = (prevState: ProgramState, newState: ProgramState) => {
    const newEvents: SimulationEvent[] = [];

    // Check Halt
    if (!prevState.halted && newState.halted && enabledEventTypes.includes(EventType.HALT)) {
      newEvents.push({
        step: newState.step,
        type: EventType.HALT,
        message: 'Program Halted'
      });
    }

    // Check Power of 2 (Only if enabled for this preset, e.g. Prime Game)
    if (enabledEventTypes.includes(EventType.POWER_OF_TWO)) {
        const primes = Object.keys(newState.registers).map(Number);
        if (primes.length === 1 && primes[0] === 2) {
            const exponent = newState.registers[2];
            if (exponent > 1) {
                newEvents.push({
                    step: newState.step,
                    type: EventType.POWER_OF_TWO,
                    message: `2^${exponent} (Prime found: ${exponent})`,
                    data: exponent
                });
            }
        }
    }

    // Check Fibonacci Pair (Only if enabled, e.g. Fibonacci Sequence)
    if (enabledEventTypes.includes(EventType.FIBONACCI_PAIR)) {
        const primes = Object.keys(newState.registers).map(Number);
        // Check if any register >= 5 is occupied
        const hasHighPrimes = primes.some(p => p >= 5 && (newState.registers[p] || 0) > 0);
        
        if (!hasHighPrimes) {
             const a = newState.registers[2] || 0;
             const b = newState.registers[3] || 0;
             // Only log non-zero states to avoid empty state noise
             if (a > 0 || b > 0) {
                 newEvents.push({
                     step: newState.step,
                     type: EventType.FIBONACCI_PAIR,
                     message: `Sequence: (${a}, ${b})`,
                     data: { a, b }
                 });
             }
        }
    }

    if (newEvents.length > 0) {
      setEvents(prev => [...prev, ...newEvents]);
    }
  };

  const commitStep = useCallback((nextState: ProgramState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(nextState);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return newHistory;
    });

    setHistoryIndex(prev => {
       return (history.length >= MAX_HISTORY && historyIndex >= MAX_HISTORY - 1) 
         ? MAX_HISTORY - 1 
         : historyIndex + 1;
    });

    checkEvents(currentState, nextState);
  }, [history, historyIndex, currentState, enabledEventTypes]);


  // --- Animation Loop ---

  useEffect(() => {
    if (!isPlaying || currentState.halted) {
        if (currentState.halted) setIsPlaying(false);
        return;
    }

    const isInstant = speed > INSTANT_SPEED_THRESHOLD;
    
    // 1. IDLE -> Start Logic or Scanning
    if (phase === 'idle') {
        const stepDelay = isInstant ? Math.max(10, 200 - speed * 2) : 50; 
        
        timerRef.current = setTimeout(() => {
            let foundIndex = -1;
            for (let i = 0; i < fractions.length; i++) {
                if (canApplyRule(currentState.registers, fractions[i])) {
                    foundIndex = i;
                    break;
                }
            }

            if (isInstant) {
                if (foundIndex === -1) {
                    const nextState = { ...currentState, halted: true, lastRuleIndex: null };
                    commitStep(nextState);
                    setIsPlaying(false);
                } else {
                    const nextState = stepSimulation(currentState, fractions);
                    commitStep(nextState);
                }
            } else {
                setTargetRuleIndex(foundIndex);
                setScanningIndex(0);
                setPhase('scanning');
            }
        }, stepDelay);
    } 
    // 2. SCANNING -> Iterate until foundIndex
    else if (phase === 'scanning') {
        const scanDelay = Math.max(20, 150 - speed); 
        timerRef.current = setTimeout(() => {
             if (scanningIndex === targetRuleIndex) {
                 setActiveRuleIndex(targetRuleIndex);
                 setScanningIndex(null);
                 setPhase('selecting');
             } 
             else if (scanningIndex !== null && scanningIndex >= fractions.length - 1) {
                 const nextState = { ...currentState, halted: true, lastRuleIndex: null };
                 commitStep(nextState);
                 stopSimulation();
             }
             else {
                 setScanningIndex((prev) => (prev !== null ? prev + 1 : 0));
             }
        }, scanDelay);
    }
    // 3. SELECTING -> Consuming
    else if (phase === 'selecting') {
        const delay = Math.max(50, 400 - speed * 3);
        timerRef.current = setTimeout(() => { setPhase('consuming'); }, delay);
    }
    // 4. CONSUMING -> Producing
    else if (phase === 'consuming') {
        const delay = Math.max(50, 500 - speed * 4);
        timerRef.current = setTimeout(() => { setPhase('producing'); }, delay);
    }
    // 5. PRODUCING -> Idle (Commit)
    else if (phase === 'producing') {
        const delay = Math.max(50, 500 - speed * 4);
        timerRef.current = setTimeout(() => {
            const nextState = stepSimulation(currentState, fractions);
            commitStep(nextState);
            setPhase('idle');
            setActiveRuleIndex(null);
            setScanningIndex(null);
        }, delay);
    }

    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

  }, [isPlaying, phase, currentState, fractions, speed, commitStep, scanningIndex, targetRuleIndex]);

  useEffect(() => {
    if (history.length > 0 && historyIndex > history.length - 1) {
        setHistoryIndex(history.length - 1);
    }
  }, [history.length]);


  // --- Event Handlers ---

  const handleStep = () => {
    if (currentState.halted) return;
    const nextState = stepSimulation(currentState, fractions);
    commitStep(nextState);
  };

  const handleReset = () => {
    stopSimulation();
    if (history.length > 0) {
      setHistory([history[0]]);
      setHistoryIndex(0);
      setEvents([{
         step: 0, 
         type: EventType.INFO, 
         message: "Reset." 
      }]);
    }
  };

  const handleScrub = (idx: number) => {
    stopSimulation();
    setHistoryIndex(idx);
  };

  const activeFraction = phase === 'scanning' && scanningIndex !== null
     ? fractions[scanningIndex]
     : (activeRuleIndex !== null ? fractions[activeRuleIndex] : null);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-950 text-gray-100 font-sans">
      
      {/* Header */}
      <header className="h-14 md:h-16 border-b border-gray-800 bg-gray-900 px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-20 shadow-md">
        
        {/* Left: Branding */}
        <div className="flex items-center space-x-3 md:w-64">
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
             
             {/* Fixed width container to prevent jumping arrows */}
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
              <span className="font-mono text-lg text-blue-400 font-bold max-w-[10rem] truncate" title={nValue}>
                {nValue}
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

        {/* Left: Program (Hidden on Mobile unless active) */}
        <div className={`
             ${activeTab === 'program' ? 'flex' : 'hidden'} 
             md:flex flex-col w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-800 bg-gray-900/50 p-4 z-10 overflow-hidden
        `}>
           <ProgramPanel 
             program={fractions}
             activeRuleIndex={activeRuleIndex !== null ? activeRuleIndex : currentState.lastRuleIndex}
             phase={phase}
             halted={currentState.halted}
             scanningIndex={scanningIndex}
           />
        </div>

        {/* Center: Visualization (Hidden on Mobile unless active) */}
        <div className={`
             ${activeTab === 'board' ? 'flex' : 'hidden'}
             md:flex flex-1 flex-col min-w-0 bg-gray-950 relative overflow-hidden transition-all duration-300
        `}>
          
          <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
            <RegisterBoard 
              registers={currentState.registers} 
              phase={phase}
              activeRule={activeFraction}
              usedPrimes={usedPrimes}
              editableRegisters={editableRegisters}
              isSetupMode={currentState.step === 0}
              onEdit={handleRegisterEdit}
              title={isCustomMode ? "Custom" : currentPreset?.name}
              description={isCustomMode ? "Running custom program" : currentPreset?.notes}
            />
          </div>

          <div className="flex-shrink-0 border-t border-gray-800 z-10 bg-gray-900/90 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
             <Controls 
               isPlaying={isPlaying}
               onPlayPause={() => setIsPlaying(!isPlaying)}
               onStep={handleStep}
               onReset={handleReset}
               speed={speed}
               setSpeed={setSpeed}
               stepCount={currentState.step}
               historyLength={history.length}
               currentHistoryIndex={historyIndex}
               onScrub={handleScrub}
               totalSteps={totalSteps}
             />
          </div>
        </div>

        {/* Right: Events (Fixed width on desktop) */}
        <div className={`
            ${activeTab === 'events' ? 'flex w-full' : 'hidden'}
            md:flex flex-col flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-800 bg-gray-900/50 z-10 overflow-hidden md:w-72
        `}>
           <div className="w-full h-full p-4 overflow-hidden">
               <EventLog 
                   events={events}
               />
           </div>
        </div>

      </div>

      <Configuration 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentProgram={fractions}
        currentState={currentState.registers}
        onLoadPreset={loadPreset}
        onSaveCustom={loadCustom}
      />
    </div>
  );
}

export default App;