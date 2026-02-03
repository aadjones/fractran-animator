import React from "react";
import {
  P,
  H3,
  Callout,
  Spacer,
  WidgetContainer,
} from "../components/Prose";
import NumberGameWidget from "../components/widgets/NumberGameWidget";

const Chapter2NumberGame: React.FC = () => {
  return (
    <>
      <P>
        Let's explore some simple cases. What happens with just <em>one</em> fraction?
      </P>

      <H3>One fraction: 1/10</H3>

      <P>
        Try different starting numbers. What do you notice?
      </P>

      <WidgetContainer label="Experiment">
        <NumberGameWidget
          program={["1/10"]}
          initialN={1000}
          editableStart={true}
        />
      </WidgetContainer>

      <Spacer />

      <H3>One fraction: 1/15</H3>

      <P>
        Now try this one. When does it work? When does it stop?
      </P>

      <WidgetContainer label="Experiment">
        <NumberGameWidget
          program={["1/15"]}
          initialN={3375}
          editableStart={true}
        />
      </WidgetContainer>

      <P>
        Try starting with 45. Then 100. Then 225. Can you predict how many steps
        it will take before you run it?
      </P>

      <Spacer />

      <H3>One fraction: 2/1</H3>

      <P>
        What about this one?
      </P>

      <WidgetContainer label="Try it">
        <NumberGameWidget
          program={["2/1"]}
          initialN={1}
        />
      </WidgetContainer>

      <Callout>
        Some games halt. Some games run forever.
      </Callout>

      <Spacer />
    </>
  );
};

export default Chapter2NumberGame;
