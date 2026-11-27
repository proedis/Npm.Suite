import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { DocTable } from '@/docs/Tables';
import surfaceLoading from '@/examples/display/surface/loading.tsx?example';
import noResults from '@/examples/feedback/empty-state/in-context.tsx?example';
import states from '@/examples/patterns/empty-and-loading/states.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/patterns/empty-and-loading');

const LINK = 'font-medium text-primary hover:underline';


/* --------
 * Page
 * -------- */

function EmptyAndLoadingPatternPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A list before its rows arrive, with none to show, and once they are there. The frame never changes: the
            header and its actions stay, and only the part with the rows takes another shape.
          </React.Fragment>
        )}
      />

      <PageBody>
        <Section title={'The three states'} lead={'Switch between them: the card keeps its header in all three.'}>
          <Example of={states} />
          <Prose>
            <p>
              <strong>Loading</strong> is the shape of what is coming: <InlineCode>Skeleton</InlineCode> with{' '}
              <InlineCode>shape={'{\'item\'}'}</InlineCode> draws a row as tall as a real one, so nothing jumps when the
              data lands. <strong>Empty</strong> is an <InlineCode>EmptyState</InlineCode> in the place of the rows, with
              what to do next as its action. <strong>Loaded</strong> is the list.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Nothing matches'}
          lead={'An empty result of a search is not the same as an empty list: the way out is to change the search.'}
        >
          <Example of={noResults} />
        </Section>

        <Section
          title={'Refreshing what is already there'}
          lead={'When content is on screen and is being renewed, the card keeps it and puts a veil over it instead.'}
        >
          <Example of={surfaceLoading} />
          <Prose>
            <p>
              <InlineCode>loading</InlineCode> on a <InlineCode>Surface</InlineCode> shows the veil after a moment and keeps
              it long enough not to blink; <InlineCode>loadingLabel</InlineCode> is what a screen reader hears.
            </p>
          </Prose>
        </Section>

        <Section title={'The pieces'}>
          <DocTable
            head={[ 'State', 'Component' ]}
            rows={[
              [ 'Content on its way', <Link key={'k'} to={'/ui/primitives/skeleton'} className={LINK}>Skeleton</Link> ],
              [ 'Nothing to show, or nothing found', <Link key={'k'} to={'/ui/feedback/empty-state'} className={LINK}>EmptyState</Link> ],
              [ 'Content being renewed', <React.Fragment key={'k'}><Link to={'/ui/display/surface'} className={LINK}>Surface</Link> with <InlineCode>loading</InlineCode></React.Fragment> ],
              [ 'A whole region working', <Link key={'k'} to={'/ui/primitives/busy-veil'} className={LINK}>BusyVeil</Link> ]
            ]}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Keep the frame'}>
              The header and its actions are there in every state: a reader knows where they are before the data does.
            </Guidance>
            <Guidance kind={'dont'} title={'A spinner in place of a list'}>
              A Skeleton of rows says what is coming and holds its height; a spinner says only that something is.
            </Guidance>
            <Guidance kind={'do'} title={'Say what to do next'}>
              An empty list offers to create the first record; an empty search, to clear it.
            </Guidance>
            <Guidance kind={'dont'} title={'Hide the card when it is empty'}>
              The empty state belongs inside it, where the rows would be.
            </Guidance>
          </GuidanceGrid>
        </Section>
      </PageBody>
    </React.Fragment>
  );
}

export const Route = createFileRoute('/ui/patterns/empty-and-loading')({
  component: EmptyAndLoadingPatternPage
});
