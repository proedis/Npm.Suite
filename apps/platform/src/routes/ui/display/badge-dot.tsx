import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import badgeDotProps from 'virtual:ui-props/StrictBadgeDotProps';
import themeDoc from 'virtual:ui-theme/display/badge-dot';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { PropsTable } from '@/docs/Tables';
import basic from '@/examples/display/badge-dot/basic.tsx?example';
import placement from '@/examples/display/badge-dot/placement.tsx?example';
import pulse from '@/examples/display/badge-dot/pulse.tsx?example';
import tones from '@/examples/display/badge-dot/tones.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/display/badge-dot');

const PROPS = refineProps(badgeDotProps, {
  tone     : { default: 'success' },
  size     : { default: 'sm' },
  placement: { default: 'inline' }
});


/* --------
 * Page
 * -------- */

function BadgeDotPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A dot of colour: a state with no words, next to a name, on the corner of a button or of an avatar, with a
            pulse for a state that is happening now.
          </React.Fragment>
        )}
        imports={tsx`
          import { BadgeDot } from '@proedis/ui/display/badge-dot';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Tones and sizes'}
          lead={(
            <React.Fragment>
              The seven tones, in their solid colour; <InlineCode>muted</InlineCode> and <InlineCode>secondary</InlineCode>{' '}
              in their ink, since their solid is a surface a dot would not show on. Four sizes, 6 to 12 pixels,{' '}
              <InlineCode>sm</InlineCode> by default.
            </React.Fragment>
          )}
        >
          <Example of={tones} />
        </Section>

        <Section
          title={'Pulse'}
          lead={(
            <React.Fragment>
              <InlineCode>pulse</InlineCode> adds a copy of the dot that grows and fades, for a state that is live: online,
              recording, running. With reduced motion the copy is gone and the dot stands still.
            </React.Fragment>
          )}
        >
          <Example of={pulse} />
        </Section>

        <Section
          title={'Placement'}
          lead={(
            <React.Fragment>
              Inline by default, in the line of the text. <InlineCode>placement</InlineCode> puts it on a corner of the
              nearest positioned parent, and <InlineCode>ring</InlineCode> draws the card’s colour around it, so it keeps
              its edge over what it covers. On an avatar the corner is the avatar’s own: pass the dot as its{' '}
              <Link to={'/ui/display/avatar'} className={'font-medium text-foreground underline underline-offset-2'}>indicator</Link>.
            </React.Fragment>
          )}
        >
          <Example of={placement} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A colour is never the only carrier of a state. Next to a text that says it, the dot is decoration and hidden
              from assistive technology; alone, <InlineCode>label</InlineCode> makes it an image with that name. On an icon
              button, the button’s name says it (“Notifications, something new”); on an avatar,{' '}
              <InlineCode>stateLabel</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={pulse}
            rows={[
              { slot: 'badge-dot', part: 'The dot', attributes: [ 'data-tone', 'data-size', 'data-placement', 'data-pulse', 'data-ring' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable props={PROPS} rest={'Every other prop goes to the span.'} />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Say it in words too'}>
              The dot is for the eye that scans. The name of the row, the label or the button says the same thing.
            </Guidance>
            <Guidance kind={'dont'} title={'Pulse a state that does not change'}>
              A pulse says “now”. On a state that stays the same while the page is open, it is noise.
            </Guidance>
            <Guidance kind={'do'} title={'Ring a dot over a picture'}>
              Over a photo or a coloured box, <InlineCode>ring</InlineCode> keeps the dot apart from what is under it.
            </Guidance>
            <Guidance kind={'dont'} title={'Count with a dot'}>
              A number is a <Link to={'/ui/display/badge-counter'} className={'font-medium text-foreground underline underline-offset-2'}>BadgeCounter</Link>.
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

export const Route = createFileRoute('/ui/display/badge-dot')({
  component: BadgeDotPage
});
