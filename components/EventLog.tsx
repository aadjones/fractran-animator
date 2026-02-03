import React, { useEffect, useRef } from 'react';
import { SimulationEvent, EventType } from '../types';

interface EventLogProps {
  events: SimulationEvent[];
}

const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center shadow-md">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Event Log</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-sm space-y-2 custom-scrollbar">
        {events.length === 0 && (
          <div className="text-gray-600 text-center italic mt-10 text-xs">No events recorded.</div>
        )}
        {events.map((evt, idx) => {
          
          let typeColor = "text-gray-400";
          if (evt.type === EventType.HALT) typeColor = "text-red-400";
          if (evt.type === EventType.POWER_OF_TWO) typeColor = "text-purple-400";
          if (evt.type === EventType.FIBONACCI_PAIR) typeColor = "text-green-400";

          return (
            <div key={idx} className="flex items-start space-x-2 text-gray-300 animate-fade-in border-b border-gray-800/50 pb-2 last:border-0">
              <span className="text-gray-600 min-w-[2.5rem] text-[10px] pt-0.5 font-bold">#{evt.step}</span>
              <div className="flex flex-col">
                {evt.type !== EventType.INFO && (
                  <span className={`
                      font-bold text-[10px] uppercase tracking-wider mb-0.5
                      ${typeColor}
                  `}>
                      {evt.type.replace('_', ' ')}
                  </span>
                )}
                <span className={`text-xs ${evt.type === EventType.INFO ? 'text-blue-300/80 italic' : 'text-gray-300'}`}>
                  {evt.message}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default EventLog;