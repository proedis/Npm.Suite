import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import busyVeilProps from 'virtual:ui-props/BusyVeilProps';
import themeDoc from 'virtual:ui-theme/primitives/busy-veil';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/primitives/busy-veil/basic.tsx?example';
import timing from '@/examples/primitives/busy-veil/timing.tsx?example';
import visible from '@/examples/primitives/busy-veil/visible.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Page
 * -------- */

const PAGE = pageAt('/primitives/busy-veil');

function BusyVeilPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The veil over a dialog, a drawer or a card that loads or saves: a translucent layer, a spinner and a
            sentence saying what is happening. It is only the look. Blocking the clicks and telling assistive
            technology that the region is busy are the job of the container it sits in.
          </React.Fragment>
        )}
        imports={tsx`
          import { BusyVeil } from '@proedis/ui/primitives';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'The look'}
          lead={(
            <React.Fragment>
              The veil covers its nearest positioned ancestor, so the container is <InlineCode>relative</InlineCode>.
              It paints the <InlineCode>--busy-veil</InlineCode> token, three quarters of the card colour by default,
              and puts a <InlineCode>primary</InlineCode> spinner over the label.
            </React.Fragment>
          )}
        >
          <Example of={visible} />
        </Section>

        <Section
          title={'Timing with useDelayedBusy'}
          lead={(
            <React.Fragment>
              The veil is driven by <InlineCode>useDelayedBusy</InlineCode> from <InlineCode>@proedis/react</InlineCode>,
              which splits one boolean in two. <InlineCode>busy</InlineCode> is true at once and is what blocks the
              container: no double submit in the first 300ms. <InlineCode>visible</InlineCode> turns on after 300ms and
              stays at least 400ms, so a fast answer flashes nothing and a slow one never blinks.
            </React.Fragment>
          )}
        >
          <Example of={timing} />
        </Section>

        <Section
          title={'The container’s job'}
          lead={'Three attributes on the element the veil covers, and the veil itself sets none of them.'}
        >
          <CodeBlock
            snippet={tsx`
              import { inertValue, useDelayedBusy } from '@proedis/react';

              const wait = useDelayedBusy(isSaving);

              <div className={'relative'} aria-busy={wait.busy} inert={inertValue(wait.busy)}>
                {/* the content */}
                <BusyVeil visible={wait.visible} label={'Saving the round'} />
              </div>
            `}
          />
          <Prose>
            <p>
              <InlineCode>aria-busy</InlineCode> says the region is changing, <InlineCode>inert</InlineCode> takes it
              out of the reach of the pointer, the keyboard and assistive technology for as long as the wait lasts.
              The veil only turns on <InlineCode>pointer-events</InlineCode> when it shows, which is a visual
              guarantee and not a replacement for <InlineCode>inert</InlineCode>.
            </p>
          </Prose>
          <Callout>
            Dialog, AlertDialog and Drawer already draw this veil through their <InlineCode>busy</InlineCode> prop.
            Reach for BusyVeil directly for a region of your own: a card, a panel, a side column.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The label lives in a <InlineCode>status</InlineCode> region that stays mounted while the veil is hidden
              and takes its text when the veil appears, so the sentence is announced once, politely, at the moment
              it becomes true. Hidden, the veil is transparent rather than <InlineCode>invisible</InlineCode>, which
              keeps the region in the accessibility tree and lets its first text be heard.
            </p>
            <p>
              The spinner is decorative: the label already says what is happening. The label arrives translated,
              like every visible string of the package.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'busy-veil', part: 'The layer over the container', attributes: [ 'data-visible' ] },
              { slot: 'busy-veil-label', part: 'The status region with the label' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={busyVeilProps}
            rest={'BusyVeil takes no other prop: it renders no element of yours and owns no content beyond its label.'}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Drive it with useDelayedBusy'}>
              Pass <InlineCode>visible</InlineCode> to the veil and <InlineCode>busy</InlineCode> to the container. A veil
              on a raw boolean flashes on every fast answer.
            </Guidance>
            <Guidance kind={'dont'} title={'Rely on the veil to block the clicks'}>
              Between the first click and the 300th millisecond the veil is not there yet. The container is
              <InlineCode>inert</InlineCode> from the start; that is what stops a second submit.
            </Guidance>
            <Guidance kind={'do'} title={'Say what is happening'}>
              “Saving the round”, “Loading the order”: a verb and its object. “Please wait” tells nobody anything.
            </Guidance>
            <Guidance kind={'dont'} title={'Veil a list that is only updating'}>
              Content already in view that refreshes after a filter change keeps its rows and shows a LoadingBar.
              The veil is for a first load or a save, where the content cannot be used meanwhile.
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

export const Route = createFileRoute('/primitives/busy-veil')({
  component: BusyVeilPage
});
