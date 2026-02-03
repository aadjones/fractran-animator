import React from "react";
import { P, H3, Spacer, WidgetContainer, Spoiler } from "../components/Prose";
import NumberGameWidget from "../components/widgets/NumberGameWidget";

const Chapter2NumberGame: React.FC = () => {
  return (
    <>
      <P>
        Let's explore some simple cases. What happens with just <em>one</em>{" "}
        fraction?
      </P>

      <H3>One fraction: 1/10</H3>

      <P>Try different starting numbers. What do you notice?</P>

      <WidgetContainer label="Experiment">
        <NumberGameWidget
          program={["1/10"]}
          initialN={1000}
          editableStart={true}
        />
      </WidgetContainer>

      <P>How would you describe what this game does?</P>

      <Spoiler label="See description">
        This game lops off all the zeros at the end of a number. It keeps dividing by 10 until it can't anymore.
      </Spoiler>

      <Spacer />

      <H3>One fraction: 1/15</H3>

      <P>
        Try starting with 45. Then 225. Then 3375.
        Can you predict how many steps each will take before you run it?
      </P>

      <WidgetContainer label="Experiment">
        <NumberGameWidget
          program={["1/15"]}
          initialN={3375}
          editableStart={true}
        />
      </WidgetContainer>

      <Spoiler label="See description">
        This game divides by 15 as many times as possible. The number of steps depends on how many factors of 15 the starting number has.
      </Spoiler>

      <Spacer />

      <H3>One fraction: 2/1</H3>

      <P>What about this one?</P>

      <WidgetContainer label="Try it">
        <NumberGameWidget program={["2/1"]} initialN={1} />
      </WidgetContainer>

      <Spoiler label="See description">
        This is the doubling game. It multiplies by 2 forever and never stops!
      </Spoiler>

      <Spacer />
    </>
  );
};

export default Chapter2NumberGame;
