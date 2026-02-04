import React from 'react';
import { PrimeMap, Fraction, AnimationPhase } from '../types';
import { Plus, Minus, Info } from 'lucide-react';

interface RegisterBoardProps {
  registers: PrimeMap;
  phase: AnimationPhase;
  activeRule: Fraction | null;
  usedPrimes: number[];
  editableRegisters: number[];
  isSetupMode: boolean;
  onEdit: (prime: number, delta: number) => void;
  title?: string;
  description?: string;
}

const RegisterBoard: React.FC<RegisterBoardProps> = ({ 
    registers, 
    phase, 
    activeRule, 
    usedPrimes,
    editableRegisters,
    isSetupMode,
    onEdit,
    title,
    description
}) => {
  
  // Dynamic Sizing based on register count
  const count = usedPrimes.length;
  const isHighDensity = count > 10; // Prime Game typically
  const isCompact = count > 6 && !isHighDensity;

  // Sizing variables
  const containerWidth = isHighDensity 
    ? "w-14 md:w-16" 
    : isCompact 
        ? "w-16 md:w-20" 
        : "w-20 md:w-24";

  // Height needs to be small enough so 2 rows fit on screen
  const containerHeight = isHighDensity
    ? "h-24 md:h-28"
    : isCompact
        ? "h-40 md:h-48"
        : "h-56 md:h-64";
  
  const beadSize = isHighDensity
    ? "w-1.5 h-1.5 md:w-2 md:h-2"
    : isCompact
        ? "w-2 h-2 md:w-2.5 md:h-2.5"
        : "w-3 h-3 md:w-3.5 md:h-3.5";

  const textSize = isHighDensity
    ? "text-sm md:text-base"
    : isCompact
        ? "text-base md:text-lg"
        : "text-xl md:text-2xl";

  const gapSize = isHighDensity ? "gap-1.5 md:gap-2" : "gap-3 md:gap-4";

  return (
    <div className="w-full h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex flex-col shadow-inner relative">
      
      {/* Top Info Bar */}
      <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex justify-between items-center z-20 shadow-md flex-shrink-0">
        <h2 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{title || "Prime Registers"}</h2>
        <div className="flex items-center space-x-2 md:space-x-4 text-[10px] md:text-xs">
             <div className="flex items-center space-x-1">
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                 <span className="text-gray-500 font-medium hidden sm:inline">Bead (Exponent)</span>
             </div>
             {isSetupMode && <span className="text-green-400 font-bold animate-pulse bg-green-900/20 px-2 py-0.5 rounded border border-green-900/50">SETUP</span>}
             {phase === 'scanning' && <span className="text-yellow-400 font-bold animate-pulse">SCANNING</span>}
             {phase === 'consuming' && <span className="text-amber-500 font-bold animate-pulse">CONSUMING</span>}
             {phase === 'producing' && <span className="text-cyan-400 font-bold animate-pulse">PRODUCING</span>}
        </div>
      </div>
      
      {/* Content Area - Auto Scroll (Vertical) */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 custom-scrollbar flex flex-col justify-center">
        
        {/* Goal / Description Banner */}
        {description && (
          <div className="mb-4 flex-shrink-0 max-w-4xl mx-auto w-full">
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-2 md:p-3 flex items-start space-x-2 backdrop-blur-sm shadow-sm">
               <div className="bg-blue-900/30 p-1 rounded-full text-blue-400 flex-shrink-0">
                  <Info size={14} />
               </div>
               <div className="min-w-0">
                  <h3 className="text-blue-200 font-bold text-[10px] md:text-xs mb-0.5 uppercase tracking-wide">Program Info</h3>
                  <div className="text-[10px] md:text-sm text-gray-300 leading-snug whitespace-pre-wrap font-mono break-words">
                    {description}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Registers Track - Wrapped Layout */}
        <div className="w-full flex justify-center items-center flex-1">
          {/* Changed justify-center to justify-start and added w-fit to keep block centered but items left aligned inside block */}
          <div className={`flex flex-wrap justify-start ${gapSize} max-w-6xl w-fit`}>
            {usedPrimes.length === 0 && <div className="text-gray-600 font-mono italic w-full text-center py-10">No active registers to display</div>}
            
            {usedPrimes.map((prime) => {
              const currentCount = registers[prime] || 0;
              const isEditable = isSetupMode && editableRegisters.includes(prime);
              
              // Determine visual state based on phase
              let displayBeads: React.ReactNode[] = [];
              let borderColor = "border-gray-700";
              let bgColor = "bg-gray-800/30";
              let shadowClass = "";

              const isDenominator = activeRule && activeRule.denPrimes[prime];
              const isNumerator = activeRule && activeRule.numPrimes[prime];

              const beadBaseClass = `${beadSize} rounded-full shadow-sm flex-shrink-0`;

              if (phase === 'scanning' && activeRule) {
                  // SCANNING PHASE
                  if (isDenominator) {
                      const required = activeRule.denPrimes[prime] || 0;
                      if (currentCount < required) {
                          borderColor = "border-red-600";
                          bgColor = "bg-red-900/30";
                          shadowClass = "shadow-[0_0_15px_rgba(220,38,38,0.4)] opacity-90";
                      } else {
                          borderColor = "border-emerald-600/50";
                          bgColor = "bg-emerald-900/10";
                      }
                  }
                  
                  for (let i = 0; i < currentCount; i++) {
                      displayBeads.push(
                          <div key={`idle-${i}`} className={`${beadBaseClass} bg-blue-500`} />
                      );
                  }

              } else if (phase === 'consuming' && isDenominator) {
                  // CONSUMPTION PHASE
                  borderColor = "border-amber-500";
                  bgColor = "bg-amber-900/20";
                  shadowClass = "shadow-[0_0_20px_rgba(245,158,11,0.3)]";

                  const numToRemove = activeRule.denPrimes[prime] || 0;
                  const safeRemove = Math.min(numToRemove, currentCount);
                  const keptCount = currentCount - safeRemove;

                  for (let i = 0; i < keptCount; i++) {
                      displayBeads.push(
                          <div key={`kept-${i}`} className={`${beadBaseClass} bg-blue-500`} />
                      );
                  }
                  for (let i = 0; i < safeRemove; i++) {
                      displayBeads.push(
                          <div key={`rem-${i}`} className={`${beadBaseClass} bg-amber-500 bead-exit shadow-amber-500/50`} />
                      );
                  }

              } else if (phase === 'producing') {
                  // PRODUCTION PHASE
                  let baseCount = currentCount;
                  if (isDenominator) {
                      baseCount = Math.max(0, currentCount - (activeRule?.denPrimes[prime] || 0));
                  }

                  if (isNumerator) {
                      borderColor = "border-cyan-500";
                      bgColor = "bg-cyan-900/20";
                      shadowClass = "shadow-[0_0_20px_rgba(34,211,238,0.3)]";
                  }

                  for (let i = 0; i < baseCount; i++) {
                      displayBeads.push(
                          <div key={`base-${i}`} className={`${beadBaseClass} bg-blue-500`} />
                      );
                  }

                  if (isNumerator) {
                      const numToAdd = activeRule?.numPrimes[prime] || 0;
                      for (let i = 0; i < numToAdd; i++) {
                          displayBeads.push(
                              <div 
                                key={`add-${i}`} 
                                className={`${beadBaseClass} bg-cyan-400 bead-enter shadow-cyan-400/50 border border-cyan-200`}
                                style={{ animationDelay: `${i * 0.05}s` }} 
                              />
                          );
                      }
                  }
              } else {
                  // IDLE
                  if (phase === 'selecting' && activeRule) {
                      if (isDenominator) {
                          borderColor = "border-amber-900/50";
                          bgColor = "bg-amber-900/10";
                      }
                  }

                  for (let i = 0; i < currentCount; i++) {
                      displayBeads.push(
                          <div key={`idle-${i}`} className={`${beadBaseClass} bg-blue-500`} />
                      );
                  }
              }
              
              const totalBeads = displayBeads.length;

              return (
                <div 
                  key={prime}
                  className={`relative ${containerWidth} ${containerHeight} flex-shrink-0 flex flex-col items-center transition-all duration-300 group`}
                >
                  {/* Controls */}
                  <div className={`mb-1 flex flex-col items-center justify-center gap-0.5 ${isHighDensity ? 'min-h-[16px]' : 'min-h-[24px]'}`}>
                      {isEditable && (
                          <button 
                              onClick={() => onEdit(prime, 1)}
                              className="p-0.5 text-green-500 hover:text-green-300 hover:bg-green-900/30 rounded-full transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                              title="Add Bead"
                          >
                              <Plus size={isHighDensity ? 12 : 16} strokeWidth={3} />
                          </button>
                      )}
                      
                      {isEditable && (
                          <button 
                              onClick={() => onEdit(prime, -1)}
                              className="p-0.5 text-red-500 hover:text-red-300 hover:bg-red-900/30 rounded-full transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                              title="Remove Bead"
                          >
                              <Minus size={isHighDensity ? 12 : 16} strokeWidth={3} />
                          </button>
                      )}
                  </div>

                  {/* Register Box */}
                  <div 
                      className={`w-full flex-1 border ${borderColor} ${bgColor} ${shadowClass} rounded-lg relative flex flex-col-reverse flex-wrap content-center py-2 gap-0.5 transition-all duration-300 overflow-hidden ${isEditable ? 'cursor-pointer hover:border-green-500/40 hover:bg-green-900/5' : ''}`}
                      title={`${totalBeads} beads`}
                      onClick={() => isEditable && onEdit(prime, 1)}
                      onContextMenu={(e) => {
                          if (isEditable) {
                              e.preventDefault();
                              onEdit(prime, -1);
                          }
                      }}
                  >
                    
                    {displayBeads}

                    {!isEditable && !isSetupMode && currentCount === 0 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-700 opacity-20 text-[9px] md:text-[10px] font-bold tracking-widest rotate-90 whitespace-nowrap pointer-events-none">
                            EMPTY
                        </div>
                    )}
                    {isEditable && currentCount === 0 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500 opacity-40 text-[8px] font-bold text-center leading-tight pointer-events-none">
                            ADD
                        </div>
                    )}
                  </div>

                  {/* Prime Label */}
                  <div className={`mt-1 flex flex-col items-center ${isEditable ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`${textSize} font-mono font-bold leading-none`}>{prime}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterBoard;