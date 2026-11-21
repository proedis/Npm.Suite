import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import loadingBarProps from 'virtual:ui-props/LoadingBarProps';
import themeDoc from 'virtual:ui-theme/primitives/loading-bar';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { css, tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/primitives/loading-bar/basic.tsx?example';
import updating from '@/examples/primitives/loading-bar/updating.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Page
 * -------- */

const PAGE = pageAt('/primitives/loading-bar');

function LoadingBarPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The bar of content already in view that is updating: a filter, a sort or a page changed, and the rows on
            screen are about to be replaced. A two pixel track with a segment running across it, placed by you on the
            edge of the region.
          </React.Fragment>
        )}
        imports={tsx`
          import { LoadingBar } from '@proedis/ui/primitives';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Over a list that updates'}
          lead={(
            <React.Fragment>
              Change the filter. The rows stay, dimmed to 70% and out of reach of the pointer, while the bar runs on the
              top edge; then the new rows arrive. The region is <InlineCode>aria-busy</InlineCode> at once, the bar shows
              only past 300ms through <InlineCode>useDelayedBusy</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={updating} />
          <Prose>
            <p>
              The content is dimmed but not <InlineCode>inert</InlineCode>: in a grid the focus stays on the cell it was
              on, and the keyboard keeps working. A refresh in the background, which the user did not ask for, shows
              nothing at all.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Placement'}
          lead={'The bar is a block as wide as its parent and draws nothing around itself. The caller puts it on an edge.'}
        >
          <CodeBlock
            snippet={tsx`
              <div className={'relative'} aria-busy={wait.busy}>
                {wait.visible && <LoadingBar className={'absolute inset-x-0 top-0'} />}
                <div className={cn(wait.visible && 'pointer-events-none opacity-70')}>…</div>
              </div>
            `}
          />
        </Section>

        <Section
          title={'Motion'}
          lead={(
            <React.Fragment>
              The segment is a third of the track and crosses it in 1.2s, from the <InlineCode>loading-bar</InlineCode>{' '}
              keyframe of the stylesheet. With reduced motion the segment fills the track and stands still: the state is
              still visible, the movement is gone.
            </React.Fragment>
          )}
        >
          <CodeBlock
            title={'app.css'}
            snippet={css`
              /* A product colour for the bar, without touching a call site */
              [data-slot='loading-bar'] { background-color: var(--info-soft); }
              [data-slot='loading-bar-segment'] { background-color: var(--info); }
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The bar is <InlineCode>aria-hidden</InlineCode>. What a screen reader learns comes from{' '}
              <InlineCode>aria-busy</InlineCode> on the region, which is the one place that knows what is busy.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'loading-bar', part: 'The track' },
              { slot: 'loading-bar-segment', part: 'The running segment' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable props={loadingBarProps} rest={'Every other prop goes to the outer <span>.'} />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Keep the old content while the new one loads'}>
              A list that empties on every filter change jumps twice. Dim it, run the bar, replace it.
            </Guidance>
            <Guidance kind={'dont'} title={'Use it for a first load'}>
              With nothing on screen yet, the shapes of the content say more: Skeleton in a page, the veil in a dialog.
            </Guidance>
            <Guidance kind={'do'} title={'Put it on the edge it belongs to'}>
              The bottom line of a header, the top of a table: next to the content that is changing.
            </Guidance>
            <Guidance kind={'dont'} title={'Show it for a background refresh'}>
              A poll the user did not start is not news. The bar is for an answer the user is waiting for.
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

export const Route = createFileRoute('/primitives/loading-bar')({
  component: LoadingBarPage
});
