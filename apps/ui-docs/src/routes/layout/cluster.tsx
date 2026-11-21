import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import clusterProps from 'virtual:ui-props/StrictClusterProps';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { CodeBlock } from '@/docs/CodeBlock';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/layout/cluster/basic.tsx?example';
import inContext from '@/examples/layout/cluster/in-context.tsx?example';
import inline from '@/examples/layout/cluster/inline.tsx?example';
import props from '@/examples/layout/cluster/props.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/layout/cluster');


/* --------
 * Page
 * -------- */

function ClusterPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A row that wraps, its items centred on each line, with a small gap. Tags, active filters, the
            actions of a toolbar: the arrangement a hand-written <InlineCode>flex flex-wrap items-center gap-2</InlineCode>{' '}
            keeps coming back as, with a name of its own.
          </React.Fragment>
        )}
        imports={tsx`
          import { Cluster } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Gap, alignment and distribution'}
          lead={(
            <React.Fragment>
              The same three props as <InlineCode>Stack</InlineCode>, each responsive, with the defaults a cluster
              wants: <InlineCode>{'gap={2}'}</InlineCode>, <InlineCode>{'align={\'center\'}'}</InlineCode> and{' '}
              <InlineCode>{'justify={\'start\'}'}</InlineCode>. <InlineCode>justify</InlineCode> moves the items
              along each line, so <InlineCode>end</InlineCode> right-aligns the buttons of a footer however many
              lines they take.
            </React.Fragment>
          )}
        >
          <Example of={props} />
        </Section>

        <Section
          title={'Inline'}
          lead={(
            <React.Fragment>
              <InlineCode>inline</InlineCode> lets a cluster sit inside a sentence, as a few badges do here.
              Render it as a <InlineCode>span</InlineCode> with <InlineCode>as</InlineCode> when it lives inside a
              paragraph, since a <InlineCode>div</InlineCode> cannot.
            </React.Fragment>
          )}
        >
          <Example of={inline} />
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              The active filters of a list. Remove a few, or all of them: the row shrinks, and when it grows past
              its width it continues on a second line instead of pushing the page wider.
            </React.Fragment>
          )}
        >
          <Example of={inContext} />
        </Section>

        <Section
          title={'Cluster or Stack'}
          lead={(
            <React.Fragment>
              A cluster is a horizontal <InlineCode>Stack</InlineCode> with <InlineCode>wrap</InlineCode> and a
              centred alignment, and it always emits those classes, even when you did not ask for them. When a row
              should not wrap, or should be a column at some width, it is a Stack.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              // The same row, twice
              <Cluster>…</Cluster>
              <Stack direction={'horizontal'} wrap align={'center'} gap={2}>…</Stack>
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A <InlineCode>{'<div>'}</InlineCode> with no role. A set of tags or filters that belongs together is
              a list: render it with <InlineCode>{'as={\'ul\'}'}</InlineCode> and wrap each item in a{' '}
              <InlineCode>li</InlineCode>, so a screen reader announces how many there are. The visual order of the
              wrapped lines is the DOM order, so the keyboard goes through them the way the eye does.
            </p>
          </Prose>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable rows={[ { slot: 'cluster', part: 'The row itself, unless a data-slot is passed', attributes: [ 'data-inline' ] } ]} />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={clusterProps}
            rest={(
              <React.Fragment>
                Defaults: <InlineCode>{'align={\'center\'}'}</InlineCode>, <InlineCode>{'gap={2}'}</InlineCode>,{' '}
                <InlineCode>{'justify={\'start\'}'}</InlineCode>. <InlineCode>as</InlineCode> picks the element,{' '}
                <InlineCode>div</InlineCode> by default, and every other prop goes to it.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A Cluster for things of the same kind'}>
              Tags, chips, filters, a row of buttons: items that can flow onto a second line without the meaning
              changing.
            </Guidance>
            <Guidance kind={'dont'} title={'A Cluster for a header'}>
              A title and its actions should stay at the two ends, not wrap under each other at random widths. That
              is a Stack with <InlineCode>{'justify={\'between\'}'}</InlineCode> and a responsive direction.
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

export const Route = createFileRoute('/layout/cluster')({
  component: ClusterPage
});
