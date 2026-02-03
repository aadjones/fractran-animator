import React from "react";
import {
  P,
  H3,
  Callout,
  Spacer,
  WidgetContainer,
} from "../components/Prose";
import MiniSim from "../components/widgets/MiniSim";
import ProgramBuilder from "../components/widgets/ProgramBuilder";

const Chapter6Computation: React.FC = () => {
  return (
    <>
      <P>
        Look at this program again. It's from Chapter 1.
      </P>

      <WidgetContainer label="The original game">
        <MiniSim
          program={["3/2", "5/3"]}
          initialRegisters={{ 2: 3, 3: 4 }}
          editableRegisters={[2, 3]}
          showRules={true}
        />
      </WidgetContainer>

      <P>
        Put 3 in column 2. Put 4 in column 3. Run it.
      </P>

      <P>
        How many dots end up in column 5?
      </P>

      <Callout>
        This program computes addition.
      </Callout>

      <Spacer />

      <H3>Try this</H3>

      <P>
        Can you write a single fraction that doubles the count in column 2?
        (The result can end up in a different column.)
      </P>

      <WidgetContainer label="Doubling">
        <ProgramBuilder
          initialRegisters={{ 2: 4 }}
          editableRegisters={[2, 3]}
          goalDescription="Double the count from column 2"
        />
      </WidgetContainer>

      <Spacer />

      <H3>What is this?</H3>

      <P>
        What you've been doing is called FRACTRAN. It was invented by
        mathematician John Conway in 1987.
      </P>

      <P>
        The columns are memory. The fractions are instructions.
        It's one of the simplest programming languages ever designed.
      </P>

      <Callout>
        A list of fractions. A starting number. That's it. That's the whole language.
      </Callout>

      <Spacer />
    </>
  );
};

export default Chapter6Computation;
