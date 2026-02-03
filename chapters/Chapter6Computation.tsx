import React from "react";
import {
  P,
  H3,
  Callout,
  Spacer,
  WidgetContainer,
} from "../components/Prose";
import MiniSim from "../components/widgets/MiniSim";

const Chapter6Computation: React.FC = () => {
  return (
    <>
      <P>
        Remember puzzle 1? Moving dots from column 2 to column 3?
      </P>

      <P>
        The solution was 3/2. One fraction. But look what it actually does:
      </P>

      <WidgetContainer label="Addition">
        <MiniSim
          program={["3/2"]}
          initialRegisters={{ 2: 4 }}
          editableRegisters={[2]}
          showRules={true}
        />
      </WidgetContainer>

      <P>
        Start with 4 dots in column 2. End with 4 dots in column 3.
      </P>

      <P>
        That's addition. You just built a program that adds to a number.
      </P>

      <Spacer />

      <H3>Multiplication</H3>

      <P>
        What if you wanted to double the count in column 2?
      </P>

      <P>
        You'd need to turn each dot in column 2 into two dots somewhere.
        But you can't put them back in column 2 mid-process (why not?).
      </P>

      <P>
        Try this: move each dot from 2 to 3, but add two dots to 5 at the same time.
        Then move everything from 5 back to 2.
      </P>

      <WidgetContainer label="Doubling">
        <MiniSim
          program={["75/2", "2/5"]}
          initialRegisters={{ 2: 3 }}
          editableRegisters={[2]}
          showRules={true}
        />
      </WidgetContainer>

      <P>
        75 = 3 × 5². So 75/2 takes one from column 2, adds one to column 3,
        and adds two to column 5.
      </P>

      <P>
        When column 2 is empty, the second rule kicks in: 2/5 moves dots
        from 5 back to 2.
      </P>

      <Spacer />

      <H3>This is a programming language</H3>

      <P>
        What you've been doing is called FRACTRAN. It was invented by
        mathematician John Conway in 1987.
      </P>

      <P>
        It's one of the simplest programming languages that can compute anything
        a regular computer can compute. The columns are memory. The fractions
        are instructions.
      </P>

      <Callout>
        A list of fractions. A starting number. That's it. That's the whole language.
      </Callout>

      <Spacer />

      <H3>One more thing</H3>

      <P>
        There's a famous FRACTRAN program that generates prime numbers.
        It has 14 fractions.
      </P>

      <WidgetContainer label="PRIMEGAME">
        <MiniSim
          program={[
            "17/91", "78/85", "19/51", "23/38", "29/33",
            "77/29", "95/23", "77/19", "1/17", "11/13",
            "13/11", "15/14", "15/2", "55/1"
          ]}
          initialRegisters={{ 2: 1 }}
          showRules={true}
        />
      </WidgetContainer>

      <P>
        Run it. Every time the value becomes a power of 2 (like 4, 8, 32, 128...),
        the exponent is a prime number.
      </P>

      <P>
        This tiny program finds every prime. Forever.
      </P>

      <Spacer />
    </>
  );
};

export default Chapter6Computation;
