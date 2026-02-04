import React from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { P, H3, Callout, Spacer } from "../components/Prose";
import MiniSim from "../components/widgets/MiniSim";
import { EventType } from "../types";

interface ExplorerProps {
  onNavigate: (path: string) => void;
}

const Explorer: React.FC<ExplorerProps> = ({ onNavigate }) => {
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
          Explorer
        </div>
        <div className="w-20" />
      </header>

      {/* Title */}
      <div className="border-b border-gray-800/50 bg-gray-900/30 px-6 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-2">
            Path B
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 leading-tight">
            Explorer
          </h1>
          <p className="text-gray-400 text-lg mt-2">
            See what's possible with just fractions
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8 md:py-12">
        <P>
          Everything you've seen so far has been simple: addition, moving dots
          around. But FRACTRAN can do <em>anything</em> a computer can do.
        </P>

        <P>Here are some programs that show what's possible.</P>

        <Spacer />

        <H3>Multiplication</H3>

        <P>
          This program multiplies two numbers. Put values in columns 2 and 3,
          and the result appears in column 5.
        </P>

        <MiniSim
          program={["455/33", "11/13", "1/11", "3/7", "11/2", "1/3"]}
          initialRegisters={{ 2: 3, 3: 4 }}
          editableRegisters={[2, 3]}
          showRules={true}
          description="Computes column 2 × column 3 → result in column 5"
          previewOnly
          title="A × B"
        />

        <P>
          Put values in columns 2 and 3, run the program, and watch the result
          appear in column 5. Multiplication requires many steps — it loops
          through addition repeatedly.
        </P>

        <Spacer />

        <H3>Fibonacci sequence</H3>

        <P>
          This program generates the Fibonacci sequence forever. Watch columns 2
          and 3 — they hold consecutive Fibonacci numbers.
        </P>

        <MiniSim
          program={[
            "39/55",
            "33/65",
            "78/77",
            "66/91",
            "1/11",
            "1/13",
            "5/2",
            "7/3",
            "11/1",
          ]}
          initialRegisters={{ 3: 1 }}
          showRules={true}
          enabledEvents={[EventType.FIBONACCI_PAIR]}
          description="Columns 2 & 3 cycle through Fibonacci pairs"
          previewOnly
          title="Fibonacci Generator"
        />

        <P>
          The program loops forever. Each time columns 2 and 3 are the only
          non-empty columns, you've hit a Fibonacci pair: (1,1), (1,2), (2,3),
          (3,5), (5,8)...
        </P>

        <Spacer />

        <H3>Conway's PRIMEGAME</H3>

        <P>This is the most famous FRACTRAN program.</P>

        <Callout>
          Start with 2. The sequence of powers of 2 that appear (2¹, 2², 2³, 2⁵,
          2⁷, 2¹¹...) have exponents that are exactly the prime numbers!
        </Callout>

        <MiniSim
          program={[
            "17/91",
            "78/85",
            "19/51",
            "23/38",
            "29/33",
            "77/29",
            "95/23",
            "77/19",
            "1/17",
            "11/13",
            "13/11",
            "15/2",
            "1/7",
            "55/1",
          ]}
          initialRegisters={{ 2: 1 }}
          showRules={true}
          enabledEvents={[EventType.POWER_OF_TWO]}
          description="Watch for moments when only column 2 has dots"
          previewOnly
          title="Conway's PRIMEGAME"
        />

        <P>
          This takes many steps between primes. Speed it up and watch column 2.
          Each time it's the only non-empty column, count the dots — that's the
          next prime!
        </P>

        <P>
          John Conway designed this in 1987 to demonstrate that FRACTRAN is
          Turing-complete: it can compute anything any computer can compute.
        </P>

        <Spacer />

        <H3>How is this possible?</H3>

        <P>
          The fractions encode a state machine. Each prime column is like a
          variable. The fractions are if-then rules: "if these columns have
          enough dots, move them around like this."
        </P>

        <P>
          It's the same thing a computer does, just expressed in a bizarre way.
          And that's the beauty of it: something this simple can compute
          anything.
        </P>

        <Spacer />

        <div className="flex justify-center gap-4 pt-8 border-t border-gray-800">
          <button
            onClick={() => onNavigate("/puzzles-advanced")}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm"
          >
            ← Try the Puzzles path
          </button>
          <button
            onClick={() => onNavigate("/sandbox")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Open Sandbox
          </button>
        </div>

        <Spacer />

        <div className="text-center text-gray-500 text-sm">
          <a
            href="https://www.cs.unc.edu/~stotts/COMP210-s23/madMath/Conway87.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            Learn more about FRACTRAN from Conway's original article
            <ExternalLink size={12} />
          </a>
        </div>
      </main>
    </div>
  );
};

export default Explorer;
