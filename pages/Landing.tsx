import React from "react";
import { CHAPTERS } from "../chapters/index";
import { ChevronRight, Play } from "lucide-react";

interface LandingProps {
  onNavigate: (hash: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 font-sans flex flex-col">
      {/* Hero */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gray-900/30 px-6 py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center font-bold font-mono text-3xl shadow-lg shadow-blue-500/20 text-white mx-auto mb-6">
            F
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 leading-tight mb-4">
            FRACTRAN
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto">
            A game with fractions that can compute anything.
          </p>
          <p className="md:hidden text-gray-500 text-sm mt-3">
            Best experienced on desktop, but not actively hostile to mobile.
          </p>
          <button
            onClick={() => onNavigate("/chapter/1")}
            className="mt-8 inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-blue-500/20"
          >
            <Play size={18} />
            <span>Start exploring</span>
          </button>
        </div>
      </div>

      {/* Chapters */}
      <div className="flex-1 px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">
            Chapters
          </h2>

          <div className="space-y-2">
            {CHAPTERS.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => onNavigate(`/chapter/${chapter.number}`)}
                className="w-full flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:bg-gray-800/50 hover:border-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm font-mono font-bold text-gray-500 group-hover:text-blue-400 group-hover:bg-blue-900/30 transition-colors">
                    {chapter.number}
                  </div>
                  <div>
                    <div className="font-medium text-gray-200 group-hover:text-white transition-colors">
                      {chapter.title}
                    </div>
                    {chapter.subtitle && (
                      <div className="text-sm text-gray-500">
                        {chapter.subtitle}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-600 group-hover:text-gray-400 transition-colors"
                />
              </button>
            ))}
          </div>

          {/* Sandbox link */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <button
              onClick={() => onNavigate("/sandbox")}
              className="w-full flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:bg-gray-800/50 hover:border-gray-700 transition-colors text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 group-hover:text-amber-400 group-hover:bg-amber-900/30 transition-colors">
                  &gt;
                </div>
                <div>
                  <div className="font-medium text-gray-200 group-hover:text-white transition-colors">
                    Sandbox
                  </div>
                  <div className="text-sm text-gray-500">
                    Free-play with any FRACTRAN program
                  </div>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-600 group-hover:text-gray-400 transition-colors"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
