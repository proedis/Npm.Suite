import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import bleedProps from 'virtual:ui-props/StrictBleedProps';
import themeDoc from 'virtual:ui-theme/layout/bleed';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { PropsTable } from '@/docs/Tables';
import basic from '@/examples/layout/bleed/basic.tsx?example';
import inset from '@/examples/layout/bleed/inset.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/layout/bleed');


/* --------
 * Page
 * -------- */

function BleedPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Undoes the side padding of its parent, so a band reaches the edges while the text around it stays in its
            column: a chart across a report, a table in a card, a rule through a panel.
          </React.Fragment>
        )}
        imports={tsx`
          import { Bleed } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={basic} resizable align={'stretch'} />
        <Prose>
          <p>
            Left alone, Bleed pulls out by exactly the padding of a <InlineCode>Container</InlineCode>:{' '}
            <InlineCode>1rem</InlineCode>, <InlineCode>1.5rem</InlineCode> from <InlineCode>sm</InlineCode>,{' '}
            <InlineCode>2rem</InlineCode> from <InlineCode>lg</InlineCode>. Drag the handle of the preview and the band keeps
            touching the edges at every breakpoint.
          </p>
        </Prose>

        <Section
          title={'Inset'}
          lead={(
            <React.Fragment>
              Inside a padding of your own, say how much to undo with <InlineCode>inset</InlineCode>, in steps of the
              spacing scale. The card below pads by <InlineCode>6</InlineCode>, so <InlineCode>{'inset={6}'}</InlineCode>{' '}
              takes the divider to its edges.
            </React.Fragment>
          )}
        >
          <Example of={inset} />
        </Section>

        <Section title={'Horizontal only'}>
          <Prose>
            <p>
              Bleed works on the sides, with negative margins, the only technique that works without knowing the width
              of the parent. Undoing a padding at the top or the bottom is a margin you can write yourself, since you
              can see it; the sides are the case where the padding belongs to somebody else.
            </p>
          </Prose>
          <Callout tone={'warning'} title={'The default copies the Container'}>
            The default is a copy of the padding of <InlineCode>Container</InlineCode>, and the package keeps the two
            in step. A Bleed inside some other padding with the default undoes the wrong amount at one breakpoint or
            another: give it <InlineCode>inset</InlineCode>.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>Layout only, no role. The content keeps its place in the reading order.</p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic} rows={[ { slot: 'bleed', part: 'The band, unless a data-slot is passed', attributes: [ 'data-inset' ] } ]} />
          <Prose>
            <p>
              <InlineCode>data-inset</InlineCode> carries the step when <InlineCode>inset</InlineCode> is given, and is
              absent when the band mirrors the Container.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={bleedProps}
            rest={(
              <React.Fragment>
                <InlineCode>as</InlineCode> picks the element, <InlineCode>div</InlineCode> by default, and every other
                prop goes to it.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Bleed what is wider than prose'}>
              A chart, a map, a table, a photo: content that reads better at the full width while the text stays in
              its measure.
            </Guidance>
            <Guidance kind={'dont'} title={'Fight a padding with a negative margin class'}>
              <InlineCode>-mx-4 sm:-mx-6 lg:-mx-8</InlineCode> written by hand drifts the day the padding changes.
              Bleed changes with it.
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

export const Route = createFileRoute('/ui/layout/bleed')({
  component: BleedPage
});
