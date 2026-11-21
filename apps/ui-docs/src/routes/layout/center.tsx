import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import centerProps from 'virtual:ui-props/StrictCenterProps';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/layout/center/basic.tsx?example';
import inline from '@/examples/layout/center/inline.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/layout/center');


/* --------
 * Page
 * -------- */

function CenterPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Centres its children on both axes. With <InlineCode>minHeight</InlineCode> it has room to centre in,
            which is what an empty state, a loader or a sign in screen need; with <InlineCode>maxWidth</InlineCode>{' '}
            the content keeps a readable column while the box still fills its parent.
          </React.Fragment>
        )}
        imports={tsx`
          import { Center } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={basic} align={'stretch'} />

        <Section
          title={'Room to centre in'}
          lead={(
            <React.Fragment>
              Centring needs space: a box exactly as tall as its content has nothing to centre. Give it a{' '}
              <InlineCode>minHeight</InlineCode>, any CSS length or a number of pixels, and the content sits in the
              middle of it. It is a minimum, so content taller than that still grows the box.
            </React.Fragment>
          )}
        />

        <Section
          title={'A readable column'}
          lead={(
            <React.Fragment>
              <InlineCode>maxWidth</InlineCode> wraps the children in a column of their own, at most that wide and
              never wider than the box. The text of an empty state wraps at a comfortable length, whatever the width
              of the page around it. Without it, Center adds no element.
            </React.Fragment>
          )}
        />

        <Section
          title={'Inline'}
          lead={(
            <React.Fragment>
              <InlineCode>inline</InlineCode> makes it <InlineCode>inline-flex</InlineCode>, a box that sits in a
              line of text with its content in the middle: a count in a circle, an initial in an avatar.
            </React.Fragment>
          )}
        >
          <Example of={inline} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              No role and nothing announced: Center is layout. An empty state inside it is read in DOM order, the
              icon first if it is not hidden, so an icon that only decorates is marked{' '}
              <InlineCode>aria-hidden</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'center', part: 'The box, unless a data-slot is passed', attributes: [ 'data-inline' ] },
              { slot: 'center-content', part: 'The column around the children, only with maxWidth' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={centerProps}
            rest={(
              <React.Fragment>
                <InlineCode>as</InlineCode> picks the element, <InlineCode>div</InlineCode> by default, and every
                other prop goes to it. A <InlineCode>style</InlineCode> is merged after the minimum height.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Center the state, not the page'}>
              An empty list centres its message in the space the list would take, so the toolbar and the filters
              above stay where they are.
            </Guidance>
            <Guidance kind={'dont'} title={'Center running text'}>
              A paragraph of several lines reads worst centred. Center the block, and keep long text aligned to the
              start inside it.
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

export const Route = createFileRoute('/layout/center')({
  component: CenterPage
});
