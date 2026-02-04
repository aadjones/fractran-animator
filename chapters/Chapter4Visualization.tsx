import React from "react";
import { P, H3, Spacer, WidgetContainer, Spoiler } from "../components/Prose";
import MiniSim from "../components/widgets/MiniSim";

const Chapter4Visualization: React.FC = () => {
  return (
    <>
      <P>
        Writing out primes with their exponents like 2³ × 3² every time gets
        tedious. What if we could just focus on the exponents?
      </P>

      <P>
        Here's a different way to look at the same thing. Each column is a prime
        number. The dots in that column are the exponent.
      </P>
      <P>
        For example, let's start with 72 = 2³ × 3² again, but this time we'll
        represent it with three dots in the "2" column and two dots in the "3"
        column. Step through and watch what happens to the dots.
      </P>

      <WidgetContainer label="Try it">
        <MiniSim
          program={["3/2"]}
          initialRegisters={{ 2: 3, 3: 2 }}
          showRules={true}
          gameMode={true}
        />
      </WidgetContainer>

      <Spacer />

      <H3>Try some others</H3>

      <P>
        Here's 32 with the fraction 9/2. Remember what 9/2 does to the
        exponents?
      </P>

      <WidgetContainer label="Try it">
        <MiniSim
          program={["9/2"]}
          initialRegisters={{ 2: 5 }}
          showRules={true}
          gameMode={true}
        />
      </WidgetContainer>

      <Spacer />

      <H3>Two fractions</H3>

      <P>Let's go back to our original game: 3/2 and 5/3, starting with 6.</P>

      <WidgetContainer label="Try it">
        <MiniSim
          program={["3/2", "5/3"]}
          initialRegisters={{ 2: 1, 3: 1 }}
          showRules={true}
          gameMode={true}
        />
      </WidgetContainer>

      <P>Watch the dots move between columns as you step through.</P>

      <Spacer />

      <H3>Quick check</H3>

      <P>
        How would you represent 45 using dots? Which columns would have dots,
        and how many?
      </P>

      <Spoiler label="See answer">
        45 = 3² × 5, so two dots in the "3" column and one dot in the "5" column.
      </Spoiler>

      <P>How would you describe in words what the fraction 7/3 does?</P>

      <Spoiler label="See answer">
        It replaces a factor of 3 with a factor of 7 — or in dot terms, it moves one dot from the "3" column to the "7" column.
      </Spoiler>

      <Spacer />
    </>
  );
};

export default Chapter4Visualization;
