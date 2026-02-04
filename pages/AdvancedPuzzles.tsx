import React from "react";
import { ArrowLeft } from "lucide-react";
import { P, H3, Callout, Spacer, WidgetContainer, Spoiler } from "../components/Prose";
import ProgramBuilder from "../components/widgets/ProgramBuilder";
import MiniSim from "../components/widgets/MiniSim";

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
          Start with some dots in column 2 and some in column 3. Write a single
          fraction that removes one dot from <em>each</em> column per step.
        </P>

        <P>
          When the program halts, the remaining dots tell you which column
          started with more — and by how much!
        </P>

        <WidgetContainer label="Build it">
          <ProgramBuilder
            initialRegisters={{ 2: 5, 3: 3 }}
            editableRegisters={[2, 3]}
            goalDescription="Remove one from each column per step"
          />
        </WidgetContainer>

        <Spoiler label="See solution">
          The fraction is <strong>1/6</strong>. Since 6 = 2 × 3, it consumes one
          2 and one 3 each step, producing nothing. When one column empties, the
          program halts. The remaining dots = the difference!
        </Spoiler>

        <Spacer />

        <H3>Puzzle: Find the minimum</H3>

        <P>
          This is similar to subtraction. If you run 1/6 and count how many
          steps it takes before halting, that count equals the <em>smaller</em>{" "}
          of the two starting values.
        </P>

        <P>
          But how do you "count" steps in FRACTRAN? You need a third column to
          accumulate the count!
        </P>

        <P>
          Write a fraction that removes one dot from columns 2 and 3, while
          adding one to column 5.
        </P>

        <WidgetContainer label="Build it">
          <ProgramBuilder
            initialRegisters={{ 2: 4, 3: 7 }}
            editableRegisters={[2, 3, 5]}
            goalDescription="Count steps in column 5 = min(col2, col3)"
          />
        </WidgetContainer>

        <Spoiler label="See solution">
          The fraction is <strong>5/6</strong>. Each step consumes 2 × 3 and
          produces 5. The final count in column 5 equals min(4, 7) = 4.
        </Spoiler>

        <Spacer />

        <H3>Puzzle: The swap</H3>

        <P>
          Here's a classic programming problem: swap the values in two columns.
          Move everything from column 2 to column 3, and everything from column
          3 to column 2.
        </P>

        <P>
          The catch: you can't do it with just two columns. You need a{" "}
          <em>temporary</em> column to hold values while swapping!
        </P>

        <Callout>
          This is the same problem you hit in regular programming: you can't
          swap two variables without a temp.
        </Callout>

        <P>
          Write three fractions that swap columns 2 and 3 using column 5 as
          temporary storage.
        </P>

        <WidgetContainer label="Build it">
          <ProgramBuilder
            initialRegisters={{ 2: 4, 3: 2 }}
            editableRegisters={[2, 3, 5]}
            goalDescription="Swap: 2↔3 (using 5 as temp)"
          />
        </WidgetContainer>

        <Spoiler label="See solution">
          One solution: <strong>5/2, 2/3, 3/5</strong>
          <br />
          <br />
          First, 5/2 moves all 2s → 5s (temp).
          <br />
          Then, 2/3 moves all 3s → 2s.
          <br />
          Finally, 3/5 moves temp (5s) → 3s.
        </Spoiler>

        <P>Here's what the swap looks like in action:</P>

        <WidgetContainer label="The swap">
          <MiniSim
            program={["5/2", "2/3", "3/5"]}
            initialRegisters={{ 2: 4, 3: 2 }}
            editableRegisters={[2, 3]}
            showRules={true}
          />
        </WidgetContainer>

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
