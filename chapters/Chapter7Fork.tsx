import React from "react";
import { P, Spacer } from "../components/Prose";
import { Puzzle, Sparkles } from "lucide-react";

const Chapter7Fork: React.FC = () => {
  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return (
    <>
      <P>
        You've learned how FRACTRAN works. Fractions are instructions. Prime
        columns are memory. Simple rules, surprising power.
      </P>

      <P>Where do you want to go from here?</P>

      <Spacer />

      <div className="grid md:grid-cols-2 gap-4 my-8">
        {/* More Puzzles path */}
        <button
          onClick={() => navigate("/puzzles-advanced")}
          className="group p-6 bg-gray-900/50 border border-gray-700 rounded-xl hover:border-blue-500/50 hover:bg-blue-900/10 transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-900/50 transition-colors">
              <Puzzle size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-100">More Puzzles</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Subtraction, comparison — build more programs and deepen your
            understanding.
          </p>
        </button>

        {/* Explorer path */}
        <button
          onClick={() => navigate("/explorer")}
          className="group p-6 bg-gray-900/50 border border-gray-700 rounded-xl hover:border-amber-500/50 hover:bg-amber-900/10 transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-400 group-hover:bg-amber-900/50 transition-colors">
              <Sparkles size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-100">Explorer</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            See what's possible: prime generators, Fibonacci, and other
            mind-bending programs.
          </p>
        </button>
      </div>

      <Spacer />

      <p className="text-center text-gray-500 text-sm">
        (You can always come back and try the other path.)
      </p>
    </>
  );
};

export default Chapter7Fork;
