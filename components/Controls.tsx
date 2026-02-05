import React from 'react';
import { Play, Pause, ArrowRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStep: () => void;
  onReset: () => void;
  speed: number;
  setSpeed: (s: number) => void;
  stepCount: number;
  historyLength: number;
  currentHistoryIndex: number;
  onScrub: (index: number) => void;
  totalSteps: number | null;
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onPlayPause,
  onStep,
  onReset,
  speed,
  setSpeed,
  stepCount,
  historyLength,
  currentHistoryIndex,
  onScrub,
  totalSteps
}) => {
  const { muted, toggleMuted } = useSound();

  // Calculate offset to map between absolute step and history index
  // history[0].step = stepCount - currentHistoryIndex
  const historyStartStep = stepCount - currentHistoryIndex;
  
  // The slider value tracks the absolute step count
  const sliderValue = stepCount;

  // If we have a forecast (totalSteps), use it as the visual max.
  // Otherwise, fallback to the current step (growing slider).
  const sliderMax = (totalSteps !== null && totalSteps > 0) 
      ? Math.max(totalSteps, stepCount) 
      : stepCount;

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetStep = Number(e.target.value);
    
    // Map absolute step back to history index
    const targetIndex = targetStep - historyStartStep;
    
    // Clamp to valid history range
    if (targetIndex >= 0 && targetIndex < historyLength) {
      onScrub(targetIndex);
    } else if (targetIndex >= historyLength) {
      // If user drags into future, snap to end of history
      onScrub(historyLength - 1);
    } else {
      // If user drags into past (truncated history), snap to start
      onScrub(0);
    }
  };

  return (
    <div className="bg-gray-800/80 md:bg-gray-800 border-t border-gray-700 p-3 md:p-4 flex flex-col gap-3">
      {/* Top Row: Playback Buttons and Speed */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 transition-colors tooltip"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={onPlayPause}
            className={`flex items-center px-4 py-2 rounded-md font-bold text-white transition-all shadow-lg text-sm md:text-base ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={18} className="mr-2" /> Pause
              </>
            ) : (
              <>
                <Play size={18} className="mr-2" /> Play
              </>
            )}
          </button>

          <button
            onClick={onStep}
            disabled={isPlaying}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-white transition-colors flex items-center gap-1 font-bold px-3"
            title="Step Forward"
          >
            <ArrowRight size={18} />
            <span className="text-xs hidden sm:inline">Step</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700">
             <div className="flex flex-col">
               <label className="text-[10px] text-gray-400 font-semibold mb-0.5">SPEED</label>
               <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-24 md:w-32 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
             </div>
          </div>

          <button
            onClick={toggleMuted}
            className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
            title={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Bottom Row: Scrubber */}
      <div className="flex flex-col space-y-1 w-full pb-1">
         <div className="flex justify-between items-end mb-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Timeline</label>
            <div className="text-xs font-mono">
               <span className="text-blue-400 font-bold">Step {stepCount}</span>
               <span className="text-gray-600 mx-1">/</span>
               <span className="text-gray-400">{totalSteps === null ? '∞' : totalSteps}</span>
            </div>
         </div>
         <input 
            type="range" 
            min={0}
            max={sliderMax} 
            value={sliderValue}
            onChange={handleScrubChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={sliderMax === 0}
            title={sliderMax === 0 ? "No steps yet" : `Scrub to step ${stepCount}`}
         />
      </div>
    </div>
  );
};

export default Controls;