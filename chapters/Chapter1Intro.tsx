import React from "react";
import { P, Callout, Spacer, WidgetContainer } from "../components/Prose";
import ManualStepWidget from "../components/widgets/ManualStepWidget";
import NumberGameWidget from "../components/widgets/NumberGameWidget";

const Chapter1Intro: React.FC = () => {
  return (
    <>
      <P>
        Here's a game. You start with a whole number, and you have a list of
        fractions.
      </P>

      <P>
        Go through the fractions in order. Multiply your number by the first
        fraction that gives you a whole number. That's your new number. Repeat.
      </P>

      <Callout>
        That's it. That's the whole game.
      </Callout>

      <P>Let's try it. We'll start with <strong>6</strong> and these two fractions:</P>

      <WidgetContainer label="Your turn">
        <ManualStepWidget fractions={["3/2", "5/3"]} startingNumber={6} />
      </WidgetContainer>

      <P>
        That was a bit tedious. Let's have the computer do the arithmetic:
      </P>

      <WidgetContainer label="Automated">
        <NumberGameWidget program={["3/2", "5/3"]} initialN={6} />
      </WidgetContainer>

      <Spacer />
    </>
  );
};

export default Chapter1Intro;
