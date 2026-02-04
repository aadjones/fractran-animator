import React from "react";
import { ArrowLeft } from "lucide-react";
import { P, H3, Spacer, WidgetContainer, Spoiler } from "../components/Prose";
import ProgramBuilder from "../components/widgets/ProgramBuilder";

interface AdvancedPuzzlesProps {
  onNavigate: (path: string) => void;
}

const AdvancedPuzzles: React.FC<AdvancedPuzzlesProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 h-14 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate("/chapter/7")}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
          More Puzzles
        </div>
        <div className="w-20" />
      </header>

      {/* Title */}
      <div className="border-b border-gray-800/50 bg-gray-900/30 px-6 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">
            Path A
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 leading-tight">
            More Puzzles
          </h1>
          <p className="text-gray-400 text-lg mt-2">
            Subtraction, comparison, and the classic swap problem
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8 md:py-12">
        <H3>Puzzle: Subtraction</H3>

        <P>
          Compute b − a. The answer should end up in column 3.
        </P>

        <WidgetContainer label="Build it">
          <ProgramBuilder
            initialRegisters={{ 2: 3, 3: 5 }}
            editableRegisters={[2, 3]}
            goalDescription="Compute b − a (answer in column 3)"
          />
        </WidgetContainer>

        <Spoiler label="See solution">
          <strong>1/6</strong>
        </Spoiler>

        <Spacer />

        <H3>Puzzle: Find the minimum</H3>

        <P>Write a program that computes min(4, 7). The answer should end up in column 5.</P>

        <WidgetContainer label="Build it">
          <ProgramBuilder
            initialRegisters={{ 2: 4, 3: 7 }}
            editableRegisters={[2, 3, 5]}
            goalDescription="Compute min(4, 7) in column 5"
          />
        </WidgetContainer>

        <Spoiler label="See solution">
          <strong>5/6</strong>
        </Spoiler>

        <Spacer />

        <H3>Puzzle: The swap</H3>

        <P>Swap the values in columns 2 and 3.</P>

        <WidgetContainer label="Build it">
          <ProgramBuilder
            initialRegisters={{ 2: 4, 3: 2 }}
            editableRegisters={[2, 3, 5]}
            goalDescription="Swap columns 2 and 3"
          />
        </WidgetContainer>

        <Spoiler label="See solution">
          <strong>5/2, 2/3, 3/5</strong>
        </Spoiler>

        <Spacer />

        <div className="flex justify-center gap-4 pt-8 border-t border-gray-800">
          <button
            onClick={() => onNavigate("/explorer")}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm"
          >
            Try the Explorer path →
          </button>
          <button
            onClick={() => onNavigate("/sandbox")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Open Sandbox
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdvancedPuzzles;
