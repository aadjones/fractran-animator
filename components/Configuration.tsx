import React, { useState } from 'react';
import { Fraction, PrimeMap, Preset, EventType } from '../types';
import { PRESETS } from '../constants';

interface ConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
  currentProgram: Fraction[];
  currentState: PrimeMap;
  onLoadPreset: (preset: Preset) => void;
  onSaveCustom: (fractions: string[], state: PrimeMap) => void;
}

const Configuration: React.FC<ConfigurationProps> = ({ 
  isOpen, onClose, currentProgram, currentState, onLoadPreset, onSaveCustom 
}) => {
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  const [customFractions, setCustomFractions] = useState<string>('');
  const [customState, setCustomState] = useState<string>('');

  // Init custom fields on open
  React.useEffect(() => {
    if (isOpen) {
      const fracStr = currentProgram.map(f => `${f.numerator}/${f.denominator}`).join('\n');
      setCustomFractions(fracStr);
      
      const stateStr = Object.entries(currentState)
        .map(([p, c]) => `${p}:${c}`)
        .join(', ');
      setCustomState(stateStr);
    }
  }, [isOpen, currentProgram, currentState]);

  const handleSaveCustom = () => {
    const fractions = customFractions.split('\n').map(s => s.trim()).filter(s => s);
    
    // Parse state string "2:3, 3:1"
    const newState: PrimeMap = {};
    const pairs = customState.split(',').map(s => s.trim()).filter(s => s);
    for (const pair of pairs) {
      const [p, c] = pair.split(':').map(n => parseInt(n.trim()));
      if (!isNaN(p) && !isNaN(c)) {
        newState[p] = c;
      }
    }
    
    onSaveCustom(fractions, newState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Configuration</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>

        <div className="flex border-b border-gray-700">
          <button 
            className={`flex-1 py-3 text-sm font-bold ${mode === 'presets' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
            onClick={() => setMode('presets')}
          >
            Presets
          </button>
          <button 
             className={`flex-1 py-3 text-sm font-bold ${mode === 'custom' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
             onClick={() => setMode('custom')}
          >
            Custom Editor
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'presets' && (
            <div className="space-y-4">
              {PRESETS.map((preset) => (
                <div key={preset.name} className="border border-gray-700 rounded-lg p-4 bg-gray-900/50 hover:bg-gray-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-blue-400">{preset.name}</h3>
                    <button 
                      onClick={() => { onLoadPreset(preset); onClose(); }}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold"
                    >
                      Load
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{preset.description}</p>
                  <p className="text-gray-500 text-xs italic">{preset.notes}</p>
                </div>
              ))}
            </div>
          )}

          {mode === 'custom' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Fractions (One per line)</label>
                <textarea 
                  value={customFractions}
                  onChange={(e) => setCustomFractions(e.target.value)}
                  className="w-full h-40 bg-gray-900 border border-gray-700 rounded p-2 font-mono text-gray-200 focus:border-blue-500 outline-none"
                  placeholder="17/91&#10;78/85&#10;..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Initial State (Prime:Exponent)</label>
                <input 
                  type="text"
                  value={customState}
                  onChange={(e) => setCustomState(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 font-mono text-gray-200 focus:border-blue-500 outline-none"
                  placeholder="2:1, 3:0, 5:2"
                />
                <p className="text-xs text-gray-500 mt-1">Format: comma separated "Prime:Count" pairs.</p>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleSaveCustom}
                  className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold transition-colors"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuration;