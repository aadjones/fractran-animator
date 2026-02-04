import React from "react";
import {
  P,
  H3,
  Spacer,
  WidgetContainer,
} from "../components/Prose";
import ProgramBuilder from "../components/widgets/ProgramBuilder";

const Chapter5Puzzles: React.FC = () => {
  return (
    <>
      <P>
        Now you know how this works. Time to design your own.
      </P>

      <H3>Puzzle 1: Move everything from 2 to 3</H3>

      <P>
        Write a single fraction that, when applied repeatedly, moves all the
        dots from the "2" column to the "3" column.
      </P>

      <WidgetContainer label="Build it">
        <ProgramBuilder
          initialRegisters={{ 2: 4 }}
          editableRegisters={[2, 3]}
          goalDescription="Move all dots from 2 to 3"
        />
      </WidgetContainer>

      <Spacer />

      <H3>Puzzle 2: The yo-yo</H3>

      <P>
        Write two fractions that make a dot bounce back and forth between
        columns 2 and 3 forever: 2 → 3 → 2 → 3 → ...
      </P>

      <WidgetContainer label="Build it">
        <ProgramBuilder
          initialRegisters={{ 2: 1 }}
          editableRegisters={[2, 3]}
          goalDescription="Bounce forever: 2 → 3 → 2 → 3 → ..."
        />
      </WidgetContainer>

      <Spacer />

      <H3>Puzzle 3: Combine 2s and 3s into 5s</H3>

      <P>
        Write a fraction that takes one dot from the "2" column and one dot from
        the "3" column, and puts a dot in the "5" column.
      </P>

      <WidgetContainer label="Build it">
        <ProgramBuilder
          initialRegisters={{ 2: 3, 3: 3 }}
          editableRegisters={[2, 3, 5]}
          goalDescription="Combine 2s and 3s into 5s"
        />
      </WidgetContainer>

      <Spacer />
    </>
  );
};

export default Chapter5Puzzles;
