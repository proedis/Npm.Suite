import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import dividerProps from 'virtual:ui-props/DividerProps';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/primitives/divider/basic.tsx?example';
import label from '@/examples/primitives/divider/label.tsx?example';
import stackDivided from '@/examples/primitives/divider/stack-divided.tsx?example';
import vertical from '@/examples/primitives/divider/vertical.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/primitives/divider');

const PROPS = refineProps(dividerProps, {
  orientation: { default: '\'horizontal\'', description: 'The axis of the rule. A vertical one stretches to the height of its row.' }
});


/* --------
 * Page
 * -------- */

function DividerPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A hairline in the <InlineCode>--border</InlineCode> colour, horizontal or vertical, with an optional caption
            between two rules. It is a <InlineCode>separator</InlineCode> for assistive technology, so it means
            something: a break between two groups, not a decoration.
          </React.Fragment>
        )}
        imports={tsx`
          import { Divider } from '@proedis/ui/primitives';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Vertical'}
          lead={(
            <React.Fragment>
              <InlineCode>orientation={'{\'vertical\'}'}</InlineCode> draws a one pixel column that stretches to the height
              of its row. In a toolbar give it a height of its own, as here, so it reads as a pause between groups and
              not as a wall.
            </React.Fragment>
          )}
        >
          <Example of={vertical} />
        </Section>

        <Section
          title={'With a label'}
          lead={(
            <React.Fragment>
              <InlineCode>label</InlineCode> puts a short caption between two rules: “or” between two ways of doing the
              same thing, the name of the next block. Horizontal only: a vertical divider ignores it.
            </React.Fragment>
          )}
        >
          <Example of={label} />
        </Section>

        <Section
          title={'Between the children of a stack'}
          lead={(
            <React.Fragment>
              For a rule between every child of a list, use <InlineCode>{'<Stack divided>'}</InlineCode> instead. It draws
              the lines with <InlineCode>divide-*</InlineCode>: no separator element in the tree, never one before the
              first child or after the last, and it follows the direction of the stack at every breakpoint.
            </React.Fragment>
          )}
        >
          <Example of={stackDivided} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Every divider carries the <InlineCode>separator</InlineCode> role and its <InlineCode>aria-orientation</InlineCode>.
              The content of a separator is presentational for assistive technology, so the caption is for the eye: a
              word that changes the meaning, like “or” between two ways in, has to be clear from the content around
              it too. A rule that is only a visual rhythm belongs to a <InlineCode>divided</InlineCode> stack or a
              border class, which announce nothing.
            </p>
          </Prose>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'divider', part: 'The rule, or the row holding the two rules and the caption', attributes: [ 'data-orientation', 'data-labelled' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={PROPS}
            rest={(
              <React.Fragment>
                Every other prop goes to the <InlineCode>{'<div>'}</InlineCode>, except <InlineCode>children</InlineCode>:
                the divider owns its content.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Use divided for lists'}>
              A list of rows wants <InlineCode>{'<Stack divided>'}</InlineCode>. A Divider between each pair is more
              markup and announces a separator between every row.
            </Guidance>
            <Guidance kind={'dont'} title={'Divide what space already divides'}>
              Two sections far apart need no line. A rule is for a break the gap alone does not make visible.
            </Guidance>
            <Guidance kind={'do'} title={'Keep the caption short'}>
              One or two words, in the language of the interface, passed already translated.
            </Guidance>
            <Guidance kind={'dont'} title={'Put a Divider between the sections of a card'}>
              Between the sections of a card, <InlineCode>Surface.Separator</InlineCode> is the divider, and it can be
              room instead of a line where the card wants it.
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

export const Route = createFileRoute('/primitives/divider')({
  component: DividerPage
});
