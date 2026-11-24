import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import stickyProps from 'virtual:ui-props/StrictStickyProps';
import themeDoc from 'virtual:ui-theme/layout/sticky';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { PropsTable } from '@/docs/Tables';
import basic from '@/examples/layout/sticky/basic.tsx?example';
import bottom from '@/examples/layout/sticky/bottom.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/layout/sticky');


/* --------
 * Page
 * -------- */

function StickyPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Pins its content to the top or the bottom edge of the nearest scroll container while the rest scrolls:
            the header of a day in an agenda, the bar of a page, the confirm button under a long list.
          </React.Fragment>
        )}
        imports={tsx`
          import { Sticky } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={basic} />
        <Prose>
          <p>
            Scroll the list. Each day stays at the top while its rounds pass under it, until the next day pushes it
            away: a sticky element stays inside its parent, which here is the section of its day.
          </p>
        </Prose>

        <Section
          title={'Bottom and offset'}
          lead={(
            <React.Fragment>
              <InlineCode>{'position={\'bottom\'}'}</InlineCode> pins to the lower edge. <InlineCode>offset</InlineCode>{' '}
              keeps a distance from the edge, in steps of the spacing scale, so <InlineCode>2</InlineCode> is half a
              rem.
            </React.Fragment>
          )}
        >
          <Example of={bottom} />
        </Section>

        <Section
          title={'Stacking order'}
          lead={(
            <React.Fragment>
              <InlineCode>z</InlineCode> is the <InlineCode>z-index</InlineCode>, <InlineCode>10</InlineCode> by
              default, so the pinned element passes over the content scrolling under it. Raise it when the content
              has stacking contexts of its own, a popover anchor or a raised card.
            </React.Fragment>
          )}
        />

        <Section title={'When it does not stick'}>
          <Callout tone={'warning'}>
            <InlineCode>position: sticky</InlineCode> pins to the nearest ancestor that scrolls or clips. An{' '}
            <InlineCode>overflow-hidden</InlineCode> two levels up turns that ancestor into the container, and since
            it never scrolls, the element never sticks. A sticky header that does nothing is almost always that, not
            a bug of the component.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Sticky changes where an element is drawn, not where it is in the DOM, so it is read and focused in its
              place. A pinned bar that covers content can hide the element that has the focus: leave room for it,
              with <InlineCode>scroll-padding</InlineCode> on the scroll container, as tall as the bar.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic} rows={[ { slot: 'sticky', part: 'The pinned element, unless a data-slot is passed', attributes: [ 'data-position' ] } ]} />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={stickyProps}
            rest={(
              <React.Fragment>
                The edge and <InlineCode>z</InlineCode> are written as an inline style that your <InlineCode>style</InlineCode>{' '}
                overrides. <InlineCode>as</InlineCode> picks the element, <InlineCode>div</InlineCode> by default.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Give it a background'}>
              Content scrolls under a sticky element. Without a background of its own the two are drawn on top of
              each other.
            </Guidance>
            <Guidance kind={'dont'} title={'Pin more than you need'}>
              Every pinned bar takes height from the content on a phone. A header and a footer both sticky leave
              little room to read in.
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

export const Route = createFileRoute('/layout/sticky')({
  component: StickyPage
});
