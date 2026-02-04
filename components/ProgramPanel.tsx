import React, { useEffect, useRef } from 'react';
import { Fraction, AnimationPhase } from '../types';

interface ProgramPanelProps {
  program: Fraction[];
  activeRuleIndex: number | null;
  phase: AnimationPhase;
  halted: boolean;
  scanningIndex?: number | null;
  rulesTitle?: string;
  haltedMessage?: string;
  /** Force compact mode (for mobile) */
  compact?: boolean;
}

const ProgramPanel: React.FC<ProgramPanelProps> = ({
  program, activeRuleIndex, phase, halted, scanningIndex,
  rulesTitle = "Program Rules",
  haltedMessage = "Program Halted",
  compact: forceCompact = false,
}) => {
  const activeRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);

  // Auto-compact if there are many rules to avoid scrolling
  // Prime game has 14 rules, so we need an ultra-compact mode
  // Also compact if forced (mobile)
  const isCompact = forceCompact || program.length > 6;
  const isUltraCompact = program.length > 10;

  useEffect(() => {
    // Scroll to the relevant item
    if (phase === 'scanning' && scanningIndex !== null && scanRef.current) {
        scanRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (activeRuleIndex !== null && activeRef.current) {
        activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeRuleIndex, scanningIndex, phase]);

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-inner">
      <div className={`bg-gray-800 border-b border-gray-700 ${isUltraCompact ? 'px-3 py-2' : 'px-4 py-3'}`}>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{rulesTitle}</h2>
      </div>
      
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isUltraCompact ? 'p-1 space-y-0.5' : 'p-2 space-y-2'}`}>
        {program.length === 0 && (
          <div className="text-gray-500 text-center text-sm py-8 italic">No rules loaded</div>
        )}

        {program.map((rule, idx) => {
          
          const isSelected = idx === activeRuleIndex && phase !== 'idle' && phase !== 'scanning';
          const isScanning = phase === 'scanning' && idx === scanningIndex;
          
          return (
            <div 
              key={rule.id}
              ref={isSelected ? activeRef : (isScanning ? scanRef : null)}
              className={`
                flex items-center justify-between rounded-lg font-mono transition-all duration-200 relative overflow-hidden group
                ${isUltraCompact ? 'py-1 px-2 min-h-[28px] text-sm' : (isCompact ? 'p-1.5 min-h-[40px] text-base' : 'p-3 text-lg')}
                ${isSelected ? 'bg-gradient-to-r from-blue-900/60 to-blue-900/40 border-blue-500/50 shadow-lg scale-[1.02] z-10 ring-1 ring-blue-500/30' : ''}
                ${isScanning ? 'bg-gray-800/80 border-l-4 border-l-yellow-500/80' : ''}
                ${!isSelected && !isScanning ? 'bg-gray-800/40 border border-gray-700/50 text-gray-400 hover:bg-gray-800' : ''}
                ${halted ? 'opacity-40 grayscale' : ''}
                border
              `}
            >
              {isScanning && (
                  <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none" />
              )}
              
              {/* Prominent Rule Number */}
              <div className={`
                  flex items-center justify-center font-bold text-gray-600 bg-gray-900/30 rounded flex-shrink-0 transition-colors
                  ${isScanning ? 'text-yellow-500 bg-yellow-900/20' : ''}
                  ${isSelected ? 'text-blue-400 bg-blue-900/30' : ''}
                  ${isUltraCompact ? 'w-5 h-5 text-[10px] mr-2' : (isCompact ? 'w-6 h-6 text-xs mr-3' : 'w-10 h-10 text-lg mr-3')}
              `}>
                {idx + 1}
              </div>
              
              <div className="flex flex-col items-center justify-center flex-1 font-bold z-10 leading-none">
                {/* Numerator: Producing (CYAN) */}
                <span className={`border-b px-1 mb-0.5 ${isSelected || isScanning ? 'border-gray-500' : 'border-gray-600'} text-cyan-400`}>
                  {rule.numerator}
                </span>
                {/* Denominator: Consuming (AMBER) */}
                <span className="text-amber-500">
                  {rule.denominator}
                </span>
              </div>

              <div className="w-4 flex justify-center z-10 ml-2">
                {isSelected && (
                    <div className={`rounded-full shadow-glow
                        ${isUltraCompact ? 'w-1.5 h-1.5' : 'w-2 h-2'}
                        ${phase === 'selecting' ? 'bg-yellow-400 shadow-yellow-400/50' : ''}
                        ${phase === 'consuming' ? 'bg-amber-500 shadow-amber-500/50' : ''}
                        ${phase === 'producing' ? 'bg-cyan-500 shadow-cyan-500/50' : ''}
                    `} />
                )}
                {isScanning && (
                     <span className="text-yellow-500 text-[10px] animate-pulse">?</span>
                )}
              </div>
            </div>
          );
        })}
        
        {halted && program.length > 0 && (
           <div className={`text-center text-red-400 font-bold border border-red-900/50 bg-red-900/20 rounded-lg animate-fade-in uppercase tracking-widest
             ${isUltraCompact ? 'p-1.5 mt-2 text-xs' : 'p-3 mt-4 text-sm'}
           `}>
             {haltedMessage}
           </div>
        )}
      </div>
    </div>
  );
};

export default ProgramPanel;