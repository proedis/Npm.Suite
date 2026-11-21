import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import splitProps from 'virtual:ui-props/StrictSplitProps';
import { Callout } from '@/docs/Callout';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/layout/split/basic.tsx?example';
import collapse from '@/examples/layout/split/collapse.tsx?example';
import inContext from '@/examples/layout/split/in-context.tsx?example';
import side from '@/examples/layout/split/side.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/layout/split');


/* --------
 * Page
 * -------- */

function SplitPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The two pane frame of an application: a rail of a fixed width, a navigation, a column of filters, an
            inspector, and a pane that takes the rest. Below a breakpoint of your choice the two stack on top of
            each other.
          </React.Fragment>
        )}
        imports={tsx`
          import { Split } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={basic} align={'stretch'} />

        <Section
          title={'The rail'}
          lead={(
            <React.Fragment>
              The rail is a prop, <InlineCode>rail</InlineCode>, and the children are the other pane.{' '}
              <InlineCode>railWidth</InlineCode> takes any CSS length, or a number of pixels, and defaults to{' '}
              <InlineCode>16rem</InlineCode>. The pane always takes what is left, and it is allowed to shrink below
              its content: a wide table inside it scrolls in its own box instead of pushing the frame past the
              window.
            </React.Fragment>
          )}
        />

        <Section
          title={'Rail at the end'}
          lead={(
            <React.Fragment>
              <InlineCode>{'side={\'end\'}'}</InlineCode> puts the rail after the pane, and it does so in the DOM,
              not only on screen. That is why the rail is a prop rather than the first child: the order a screen
              reader reads and the order Tab follows are the order the eye sees.
            </React.Fragment>
          )}
        >
          <Example of={side} align={'stretch'} />
        </Section>

        <Section
          title={'Collapsing'}
          lead={(
            <React.Fragment>
              <InlineCode>collapseBelow</InlineCode> stacks the two panes below a breakpoint, rail first when it sits
              at the start and last when it sits at the end, which is again the DOM order. Narrow the window below{' '}
              <InlineCode>lg</InlineCode> to see the filters move above the results. The gap is responsive, so it can
              be tighter while the panes are stacked.
            </React.Fragment>
          )}
        >
          <Example of={collapse} align={'stretch'} />
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              A settings page: the sections in a rail, the selected one beside it, stacked on a phone. Choose a
              section to switch.
            </React.Fragment>
          )}
        >
          <Example of={inContext} align={'stretch'} />
        </Section>

        <Section
          title={'How the width travels'}
          lead={(
            <React.Fragment>
              The width is written as a custom property, <InlineCode>--split-rail</InlineCode>, and read by the{' '}
              <InlineCode>split-cols</InlineCode> utility the package declares. A media query cannot live in an
              inline style, so the responsive half has to be a class, and a class cannot carry an arbitrary length:
              the property carries it instead.
            </React.Fragment>
          )}
        >
          <Callout>
            The property is set inline, so a stylesheet cannot override it: the width belongs to{' '}
            <InlineCode>railWidth</InlineCode>. A <InlineCode>--split-rail</InlineCode> passed through{' '}
            <InlineCode>style</InlineCode> wins over it, since your <InlineCode>style</InlineCode> is merged after.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Split adds no role. The rail is usually a landmark of its own: a <InlineCode>nav</InlineCode> for a
              navigation, an <InlineCode>aside</InlineCode> for an inspector, which you render inside{' '}
              <InlineCode>rail</InlineCode>. The DOM order follows <InlineCode>side</InlineCode>, so the reading order
              is right without any reordering in CSS.
            </p>
          </Prose>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable rows={[ { slot: 'split', part: 'The frame, unless a data-slot is passed', attributes: [ 'data-side', 'data-collapse-below' ] } ]} />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={splitProps}
            rest={(
              <React.Fragment>
                <InlineCode>as</InlineCode> picks the element, <InlineCode>div</InlineCode> by default, and every
                other prop goes to it.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Collapse where the pane gets too narrow'}>
              Pick the breakpoint at which the pane, with the rail beside it, would no longer fit its content. For a
              navigation rail that is usually <InlineCode>lg</InlineCode>.
            </Guidance>
            <Guidance kind={'dont'} title={'Reorder the panes with CSS'}>
              Use <InlineCode>side</InlineCode>. A rail moved by <InlineCode>order</InlineCode> is read and tabbed in
              one place and seen in another.
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

export const Route = createFileRoute('/layout/split')({
  component: SplitPage
});
