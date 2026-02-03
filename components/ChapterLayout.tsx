import React, { useEffect } from 'react';
import { CHAPTERS } from '../chapters/index';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

interface ChapterLayoutProps {
  chapterNum: number;
  children: React.ReactNode;
  onNavigate: (hash: string) => void;
}

const ChapterLayout: React.FC<ChapterLayoutProps> = ({ chapterNum, children, onNavigate }) => {
  const chapter = CHAPTERS[chapterNum - 1];
  const hasPrev = chapterNum > 1;
  const hasNext = chapterNum < CHAPTERS.length;

  // Scroll to top when chapter changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapterNum]);

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-20 h-14 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium hidden sm:inline">Chapters</span>
        </button>

        <div className="flex items-center space-x-1 text-xs text-gray-500 font-mono">
          {CHAPTERS.map((_, i) => (
            <button
              key={i}
              onClick={() => onNavigate(`/chapter/${i + 1}`)}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                i + 1 === chapterNum
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-800 text-gray-500'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="w-20" /> {/* Spacer for balance */}
      </header>

      {/* Chapter Title */}
      <div className="border-b border-gray-800/50 bg-gray-900/30 px-6 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">
            Chapter {chapter?.number}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 leading-tight">
            {chapter?.title}
          </h1>
          {chapter?.subtitle && (
            <p className="text-gray-400 text-lg mt-2">{chapter.subtitle}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8 md:py-12">
        {children}
      </main>

      {/* Navigation Footer */}
      <nav className="border-t border-gray-800 bg-gray-900/50 px-6 py-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          {hasPrev ? (
            <button
              onClick={() => onNavigate(`/chapter/${chapterNum - 1}`)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <div className="text-left">
                <div className="text-[10px] text-gray-600 uppercase tracking-wider">Previous</div>
                <div className="text-sm font-medium">{CHAPTERS[chapterNum - 2]?.title}</div>
              </div>
            </button>
          ) : (
            <div />
          )}

          {hasNext ? (
            <button
              onClick={() => onNavigate(`/chapter/${chapterNum + 1}`)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group text-right"
            >
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider">Next</div>
                <div className="text-sm font-medium">{CHAPTERS[chapterNum]?.title}</div>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('/sandbox')}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors group text-right"
            >
              <div>
                <div className="text-[10px] text-blue-600 uppercase tracking-wider">Continue</div>
                <div className="text-sm font-medium">Open Sandbox</div>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default ChapterLayout;
