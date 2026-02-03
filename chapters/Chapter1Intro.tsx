import React from 'react';
import { P, H2, Callout, Spacer, Fraction } from '../components/Prose';

const Chapter1Intro: React.FC = () => {
  return (
    <>
      <P>
        {/* PLACEHOLDER: Write your intro narrative here. */}
        Here's a game. You start with a number, and you have a list of fractions.
      </P>

      <P>
        Go through the fractions from left to right. Multiply your number by the first
        fraction that gives you a whole number. That's your new number. Repeat.
      </P>

      <Callout>
        That's it. That's the whole game. A number and some fractions.
      </Callout>

      <P>
        This is <strong>FRACTRAN</strong>, invented by the mathematician John Conway.
        It looks almost too simple to be interesting. But it turns out this little game
        can compute anything a computer can.
      </P>

      <P>
        Let's start playing.
      </P>

      <Spacer />
    </>
  );
};

export default Chapter1Intro;
