import React from 'react';
import { P, H2, H3, Callout, Spacer, WidgetContainer } from '../components/Prose';
import NumberGameWidget from '../components/widgets/NumberGameWidget';

const Chapter2NumberGame: React.FC = () => {
  return (
    <>
      <P>
        {/* PLACEHOLDER: Write your narrative here. */}
        Let's try the simplest possible program: just one fraction, <strong>3/2</strong>.
      </P>

      <P>
        Start with <strong>10</strong>. Multiply by 3/2. Is the result a whole number?
        10 &times; 3/2 = 15. Yes! So 15 is your new number. Keep going.
      </P>

      <WidgetContainer label="Try it">
        <NumberGameWidget
          program={["3/2"]}
          initialN={10}
        />
      </WidgetContainer>

      <P>
        Notice how some numbers keep going and others stop quickly. What determines
        whether the game continues?
      </P>

      <H3>Try different starting numbers</H3>

      <P>
        Change the starting number below. Try 12, 7, 108, 64. What patterns do you notice?
      </P>

      <WidgetContainer label="Experiment">
        <NumberGameWidget
          program={["3/2"]}
          initialN={12}
          editableStart={true}
        />
      </WidgetContainer>

      <Spacer />

      <H3>A bigger program</H3>

      <P>
        Now let's try two fractions: <strong>5/2</strong> and <strong>5/3</strong>.
        Start with 72 (which happens to be 2&sup3; &times; 3&sup2;, but don't worry about that yet).
      </P>

      <WidgetContainer label="Two fractions">
        <NumberGameWidget
          program={["5/2", "5/3"]}
          initialN={72}
        />
      </WidgetContainer>

      <P>
        The game always tries fractions in order, left to right. It uses the
        first one that works. When none of them give a whole number, the game stops.
      </P>

      <Callout>
        There's a hidden structure in these numbers that explains everything.
        What if we could see inside them?
      </Callout>

      <Spacer />
    </>
  );
};

export default Chapter2NumberGame;
