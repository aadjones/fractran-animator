import React from "react";
import {
  P,
  H3,
  Callout,
  Spacer,
  WidgetContainer,
} from "../components/Prose";
import MiniSim from "../components/widgets/MiniSim";

const Chapter4Visualization: React.FC = () => {
  return (
    <>
      <P>
        Writing out 2³ × 3² every time gets tedious. What if we could just
        <em> see </em> the exponents?
      </P>

      <P>
        Here's a different way to look at the same thing. Each column is a prime
        number. The dots in that column are the exponent.
      </P>

      <WidgetContainer label="Try it">
        <MiniSim
          program={["3/2"]}
          initialRegisters={{ 2: 3, 3: 2 }}
          showRules={true}
        />
      </WidgetContainer>

      <P>
        Three dots in the "2" column. Two dots in the "3" column.
      </P>

      <P>
        Now step through and watch what happens to the dots.
      </P>

      <Spacer />

      <H3>Try some others</H3>

      <P>
        Here's 32 with the fraction 9/2. Remember what 9/2 does to the exponents?
      </P>

      <WidgetContainer label="Try it">
        <MiniSim
          program={["9/2"]}
          initialRegisters={{ 2: 5 }}
          showRules={true}
        />
      </WidgetContainer>

      <Spacer />

      <H3>Two fractions</H3>

      <P>
        Let's go back to our original game: 3/2 and 5/3, starting with 6.
      </P>

      <WidgetContainer label="Try it">
        <MiniSim
          program={["3/2", "5/3"]}
          initialRegisters={{ 2: 1, 3: 1 }}
          showRules={true}
        />
      </WidgetContainer>

      <P>
        Watch the dots move between columns as you step through.
      </P>

      <Spacer />

      <H3>Quick check</H3>

      <P>
        How would you represent 45 using dots? Which columns would have dots,
        and how many?
      </P>

      <P>
        What about 100?
      </P>

      <Spacer />
    </>
  );
};

export default Chapter4Visualization;
