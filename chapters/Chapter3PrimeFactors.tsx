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
        whether it's divisible by 15?
      </P>

      <Spoiler label="One idea">
        Break the number into its prime factors. If it has at least one 3 and at least one 5, it's divisible by 15.
      </Spoiler>

      <Spacer />

      <H3>A different way to write numbers</H3>

      <P>
        Instead of writing "675", you can write it as a product of prime numbers:
      </P>

      <Callout>675 = 3 × 3 × 3 × 5 × 5 = 3³ × 5²</Callout>

      <P>
        Now you can see: 675 has 3s and 5s, so it must be divisible by 15.
        In fact, it has two complete pairs of (3 × 5) — so it's divisible by 15 twice!
      </P>

      <P>What about 3375?</P>

      <Callout>3375 = 3³ × 5³</Callout>

      <P>
        Three 3s and three 5s. Divisible by 15 three times — which is why 1/15 takes three steps!
      </P>

      <Spacer />

      <H3>Now watch closely</H3>

      <P>
        Here's the 1/15 game again, but now showing the prime factors.
        Watch what happens to the 3s and 5s as you step through.
      </P>

      <WidgetContainer label="3375 with 1/15">
        <NumberGameWidget
          program={["1/15"]}
          initialN={3375}
          showPrimeFactors={true}
          editableStart={true}
        />
      </WidgetContainer>

      <Spacer />

      <H3>What about 3/2?</H3>

      <P>
        Let's try a different fraction. Here's 72 = 2³ × 3² with the fraction 3/2.
        Watch the prime factors at each step.
      </P>

      <WidgetContainer label="72 with 3/2">
        <NumberGameWidget
          program={["3/2"]}
          initialN={72}
          showPrimeFactors={true}
        />
      </WidgetContainer>

      <P>
        What pattern do you notice?
      </P>

      <Spoiler label="See pattern">
        Each step removes a 2 and adds a 3. The fraction 3/2 literally means "trade a 2 for a 3."
      </Spoiler>

      <Spacer />
    </>
  );
};

export default Chapter3PrimeFactors;
