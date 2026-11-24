import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import badgeCounterProps from 'virtual:ui-props/BadgeCounterProps';
import themeDoc from 'virtual:ui-theme/display/badge-counter';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { PropsTable } from '@/docs/Tables';
import basic from '@/examples/display/badge-counter/basic.tsx?example';
import live from '@/examples/display/badge-counter/live.tsx?example';
import tones from '@/examples/display/badge-counter/tones.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Page
 * -------- */

const PAGE = pageAt('/display/badge-counter');

function BadgeCounterPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The count on the corner of an icon button: “3” on the bell of a panel, “9+” past nine. A small solid pill
            with a ring in the colour of the surface, which parts it from the button under it.
          </React.Fragment>
        )}
        imports={tsx`
          import { BadgeCounter } from '@proedis/ui/display/badge-counter';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Placement'}
          lead={(
            <React.Fragment>
              The counter sits on the top right corner of its nearest positioned ancestor. Wrap the button in an inline
              element with <InlineCode>relative</InlineCode>, an inline <InlineCode>Stack</InlineCode> as here, and keep that
              wrapper free of <InlineCode>overflow-hidden</InlineCode>: the pill reaches outside it.
            </React.Fragment>
          )}
        />

        <Section
          title={'Tone and maximum'}
          lead={(
            <React.Fragment>
              Two tones. <InlineCode>destructive</InlineCode> when an error is among what is counted,{' '}
              <InlineCode>info</InlineCode> otherwise: the fill is the shape of a count, not its urgency. Past{' '}
              <InlineCode>max</InlineCode>, nine by default, the pill says “9+”; raise it where a larger number still means
              something.
            </React.Fragment>
          )}
        >
          <Example of={tones} />
        </Section>

        <Section
          title={'Nothing to count'}
          lead={'At zero the counter renders nothing at all, so the caller passes the number and never a condition.'}
        >
          <Example of={live} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The pill is <InlineCode>aria-hidden</InlineCode>. The name of the button stays fixed, “Jobs”, so a voice
              command finds it whatever the count; the count reaches a screen reader through the button’s{' '}
              <InlineCode>aria-describedby</InlineCode>, pointing at a hidden sentence you word: “3 to look at”.
            </p>
          </Prose>
          <Callout>
            Keep that sentence in step with the count. When the count reaches zero the pill disappears on its own, the
            description does not: say “Nothing to look at”, or drop the reference.
          </Callout>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'badge-counter', part: 'The pill', attributes: [ 'data-tone' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable props={badgeCounterProps} rest={'Every other prop goes to the pill.'} />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Count things to look at'}>
              Unread messages, failed synchronisations, jobs waiting: a number that asks the user to open something.
            </Guidance>
            <Guidance kind={'dont'} title={'Put the count in the name'}>
              “Jobs (3)” as the label changes the name every minute and breaks voice control. The count is a description.
            </Guidance>
            <Guidance kind={'do'} title={'Destructive only for errors'}>
              Red says something went wrong. Ten new messages are not an error.
            </Guidance>
            <Guidance kind={'dont'} title={'Use it beside a title'}>
              A count next to text is a Badge. The counter is for the corner of an icon.
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

export const Route = createFileRoute('/display/badge-counter')({
  component: BadgeCounterPage
});
