import React from 'react';

export const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mt-10 mb-4 leading-tight">
    {children}
  </h2>
);

export const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xl md:text-2xl font-bold text-gray-200 mt-8 mb-3 leading-tight">
    {children}
  </h3>
);

export const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-4">
    {children}
  </p>
);

export const Callout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-4 md:p-5 my-6 text-blue-200 text-base leading-relaxed">
    {children}
  </div>
);

export const Spacer: React.FC = () => (
  <div className="h-8 md:h-12" />
);

export const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono">
    {children}
  </code>
);

export const Fraction: React.FC<{ num: number; den: number }> = ({ num, den }) => (
  <span className="inline-flex flex-col items-center mx-1 align-middle font-mono font-bold text-sm leading-none">
    <span className="text-cyan-400 border-b border-gray-500 px-1">{num}</span>
    <span className="text-amber-500 px-1">{den}</span>
  </span>
);

export const WidgetContainer: React.FC<{ children: React.ReactNode; label?: string }> = ({ children, label }) => (
  <div className="my-8 bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
    {label && (
      <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/80">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{label}</span>
      </div>
    )}
    <div className="p-4">
      {children}
    </div>
  </div>
);
