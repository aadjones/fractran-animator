import React from "react";
import { P, H3, Callout, Spacer, WidgetContainer, Spoiler } from "../components/Prose";
import NumberGameWidget from "../components/widgets/NumberGameWidget";

const Chapter3PrimeFactors: React.FC = () => {
  return (
    <>
      <P>
        Remember the fraction 1/15? It only worked when your number was
        divisible by 15.
      </P>

      <P>
        Wouldn't it be nice if you could look at a number and immediately see
        whether it is divisible by 15? How would you do that?
      </P>

      <Spoiler label="One idea">
        Break the number into its prime factors. If it has at least one 3 and at least one 5, it's divisible by 15.
      </Spoiler>

      <Spacer />

      <H3>A different way to write numbers</H3>

      <P>
        Instead of writing "72", you can write it as a product of prime numbers:
      </P>

      <Callout>72 = 2 × 2 × 2 × 3 × 3 = 2³ × 3²</Callout>

      <P>This tells you: 72 has three 2s and two 3s.</P>

      <P>What about 45?</P>

      <Callout>45 = 3 × 3 × 5 = 3² × 5</Callout>

      <P>
        Now you can see at a glance: 45 is divisible by 3 (it has 3s), divisible
        by 5 (it has a 5), but not divisible by 2 (no 2s).
      </P>

      <Spacer />

      <H3>Now watch closely</H3>

      <P>
        Here's 72 with the fraction 3/2. As you step through, write down each
        number in prime factor form. What do you notice?
      </P>

      <WidgetContainer label="72 with 3/2">
        <NumberGameWidget
          program={["3/2"]}
          initialN={72}
          showPrimeFactors={true}
        />
      </WidgetContainer>

      <Spacer />

      <H3>Try another</H3>

      <P>
        Here's 32 with the fraction 9/2. Remember: 9 = 3². Write down the prime
        factors at each step.
      </P>

      <WidgetContainer label="32 with 9/2">
        <NumberGameWidget
          program={["9/2"]}
          initialN={32}
          showPrimeFactors={true}
          editableStart={true}
        />
      </WidgetContainer>

      <Spacer />
    </>
  );
};

export default Chapter3PrimeFactors;
