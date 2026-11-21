import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import themeDoc from 'virtual:ui-theme/layout/spacer';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/layout/spacer/basic.tsx?example';
import vertical from '@/examples/layout/spacer/vertical.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/layout/spacer');


/* --------
 * Page
 * -------- */

function SpacerPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The free space of a row or a column, as an element. It grows to take whatever is left, so what comes
            before it stays at the start and what comes after is pushed to the end: the quiet actions of a toolbar
            on the left, the main one on the right.
          </React.Fragment>
        )}
        imports={tsx`
          import { Spacer } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={basic} align={'stretch'} />

        <Section
          title={'In a column'}
          lead={(
            <React.Fragment>
              In a vertical stack with a height, the spacer takes the free height instead. A card whose button has
              to sit at the bottom, whatever the length of its text, is the usual case: every card of a row then has
              its button on the same line.
            </React.Fragment>
          )}
        >
          <Example of={vertical} />
        </Section>

        <Section
          title={'Spacer or justify'}
          lead={(
            <React.Fragment>
              With two groups, <InlineCode>{'justify={\'between\'}'}</InlineCode> on the stack says the same thing.
              The spacer earns its place when the split is not between the first and the last child, or when there
              are more than two groups: the spacer goes exactly where the gap opens.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              // Two groups: justify is enough
              <Stack direction={'horizontal'} justify={'between'}>
                <Filters />
                <Actions />
              </Stack>

              // The gap opens after the second of four: a Spacer
              <Stack direction={'horizontal'} gap={2}>
                <Back />
                <Title />
                <Spacer />
                <Share />
                <Edit />
              </Stack>
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The spacer is <InlineCode>aria-hidden</InlineCode>: it carries nothing, and a screen reader has no use
              for it. Put nothing inside it.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsTable rows={[ { slot: 'spacer', part: 'The filler, unless a data-slot is passed' } ]} />
        </Section>

        <Section title={'API'}>
          <DocTable
            head={[ 'Prop', 'Type', 'Default' ]}
            rows={[
              [ <InlineCode key={'p'}>as</InlineCode>, <InlineCode key={'t'}>React.ElementType</InlineCode>, <InlineCode key={'d'}>{'\'div\''}</InlineCode> ],
              [ <InlineCode key={'p'}>hideBelow</InlineCode>, <InlineCode key={'t'}>MediaBreakpoint</InlineCode>, '–' ],
              [ <InlineCode key={'p'}>hideFrom</InlineCode>, <InlineCode key={'t'}>MediaBreakpoint</InlineCode>, '–' ]
            ]}
          />
          <Prose>
            <p>
              Nothing else of its own: it is <InlineCode>flex-1 self-stretch</InlineCode>, and every other prop goes
              to the element. <InlineCode>hideFrom</InlineCode> is useful here: a spacer that only splits the row
              while there is room for it.
            </p>
          </Prose>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'One Spacer per row'}>
              Two spacers share the free space in halves, which centres what is between them. That is rarely what a
              toolbar means.
            </Guidance>
            <Guidance kind={'dont'} title={'Use it for a fixed gap'}>
              A Spacer has no size of its own: it takes all the free space or none. A fixed distance is the{' '}
              <InlineCode>gap</InlineCode> of the stack.
            </Guidance>
          </GuidanceGrid>
        </Section>
      </PageBody>
    </React.Fragment>
  );
}


/* --------
 * Route
 * -------- */

export const Route = createFileRoute('/layout/spacer')({
  component: SpacerPage
});
