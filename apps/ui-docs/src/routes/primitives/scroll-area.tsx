import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import scrollAreaProps from 'virtual:ui-props/StrictScrollAreaProps';
import themeDoc from 'virtual:ui-theme/primitives/scroll-area';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import both from '@/examples/primitives/scroll-area/both.tsx?example';
import flexParent from '@/examples/primitives/scroll-area/flex-parent.tsx?example';
import horizontal from '@/examples/primitives/scroll-area/horizontal.tsx?example';
import vertical from '@/examples/primitives/scroll-area/vertical.tsx?example';
import scrollbars from '@/examples/primitives/scroll-area/scrollbars.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/primitives/scroll-area');

const PROPS = refineProps(scrollAreaProps, {
  orientation: { default: '\'vertical\'', description: 'Which axes scroll. The other one is clipped.' }
});


/* --------
 * Page
 * -------- */

function ScrollAreaPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A scroll container with a thin scrollbar in the colours of the theme. Native overflow, no virtual
            scrollbar and no dependency: the browser keeps the momentum, the keyboard and the accessibility, and the
            look comes from the <InlineCode>scrollbar-thin</InlineCode> utility of the stylesheet.
          </React.Fragment>
        )}
        imports={tsx`
          import { ScrollArea } from '@proedis/ui/primitives';
        `}
      />

      <PageBody>
        <Example of={vertical} />

        <Section
          title={'Height'}
          lead={(
            <React.Fragment>
              Content scrolls only inside a box that is smaller than it. <InlineCode>maxHeight</InlineCode> caps the box,
              in pixels as a number or as any CSS length: <InlineCode>240</InlineCode>,{' '}
              <InlineCode>{'\'50dvh\''}</InlineCode>, <InlineCode>{'\'calc(100dvh - 3.5rem)\''}</InlineCode>. It is an
              inline style, the one place a free measure is right, and it grows with the content up to the cap.
            </React.Fragment>
          )}
        />

        <Section
          title={'Orientation'}
          lead={(
            <React.Fragment>
              <InlineCode>vertical</InlineCode> by default. <InlineCode>horizontal</InlineCode> for a row that must not wrap,
              <InlineCode>both</InlineCode> for a table wider and taller than its box.
            </React.Fragment>
          )}
        >
          <Example of={horizontal} />
          <Example of={both} />
        </Section>

        <Section
          title={'Scrollbars'}
          lead={(
            <React.Fragment>
              On macOS a scrollbar is drawn over the content and only while scrolling, so it is easy never to see one.
              On Windows, and on a Mac set to always show them, it is a bar beside the content that takes its room
              and is grey by default. <InlineCode>scrollbar</InlineCode> decides how it looks on every system:{' '}
              <InlineCode>thin</InlineCode>, the default, a thin bar in the muted ink; <InlineCode>hover</InlineCode>,
              the same bar transparent until the pointer is over the area or the focus is inside it;{' '}
              <InlineCode>none</InlineCode>, no bar at all.
            </React.Fragment>
          )}
        >
          <Example of={scrollbars} />
          <Prose>
            <p>
              <InlineCode>stableGutter</InlineCode> keeps the room of the bar even while nothing overflows, so the
              content does not shift sideways the moment it starts to; it changes nothing where the scrollbar is an
              overlay. Every scrolling part of the package uses the thin bar already: the body of a Dialog and of a
              Drawer, a Popover, a list, the Table, the ModalSelector, the notifications.
            </p>
            <p>
              The page itself is the application’s: put <InlineCode>scrollbar-thin</InlineCode> on the{' '}
              <InlineCode>html</InlineCode> element and the scrollbar of the window takes the same look, since the root
              element’s scrollbar properties apply to the viewport. The classes are{' '}
              <InlineCode>scrollbar-thin</InlineCode>, <InlineCode>scrollbar-hover</InlineCode>,{' '}
              <InlineCode>scrollbar-none</InlineCode> and <InlineCode>scrollbar-gutter-stable</InlineCode>, for any
              scrolling element of an application.
            </p>
          </Prose>
        </Section>

        <Section
          title={'In a flex parent'}
          lead={(
            <React.Fragment>
              Inside a column of fixed height, give the area <InlineCode>flex-1</InlineCode> and no{' '}
              <InlineCode>maxHeight</InlineCode>: the header keeps its size and the list takes the rest. This works
              because the area carries <InlineCode>min-h-0 min-w-0</InlineCode>. A flex child refuses to shrink below
              its content by default, so without them the scroll would never engage and the parent would grow instead.
            </React.Fragment>
          )}
        >
          <Example of={flexParent} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The scrolling is the browser’s: the wheel, a trackpad, touch and the keyboard all work as on any page.
              A region with focusable content inside scrolls to it as the focus moves. A region with nothing focusable
              inside, a table of figures for instance, cannot be reached with the keyboard in every browser: give it{' '}
              <InlineCode>tabIndex={'{0}'}</InlineCode>, <InlineCode>role={'{\'region\'}'}</InlineCode> and a name, as the
              table above does.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'With the focus inside the area' ]}
            rows={[
              [ <InlineCode key={'k'}>↑ ↓ ← →</InlineCode>, 'Scroll a step along the axis.' ],
              [ <InlineCode key={'k'}>Page Up</InlineCode>, 'Scrolls a screen up; Page Down a screen down.' ],
              [ <InlineCode key={'k'}>Home</InlineCode>, 'Scrolls to the start; End to the end.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'scroll-area', part: 'The scrolling box', attributes: [ 'data-orientation', 'data-scrollbar' ] }
            ]}
          />
          <Callout>
            The thumb is <InlineCode>--muted-foreground</InlineCode> at 35%, from the <InlineCode>scrollbar-thin</InlineCode>{' '}
            utility of the stylesheet: a product that retunes that token retunes every scrollbar with it.
          </Callout>
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={PROPS}
            rest={(
              <React.Fragment>
                Polymorphic: <InlineCode>as</InlineCode> picks the element, a <InlineCode>div</InlineCode> by default, and
                every other prop goes to it. A <InlineCode>style</InlineCode> of yours is merged after{' '}
                <InlineCode>maxHeight</InlineCode>.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Let the page scroll when you can'}>
              A scroll inside a scroll is harder to use than one long page. Reach for an area when a part of the screen
              must stay put: a side panel, a dropdown, a table in a card.
            </Guidance>
            <Guidance kind={'dont'} title={'Hide the overflow and hope'}>
              <InlineCode>overflow-hidden</InlineCode> on content that can grow cuts it off with no way to reach it. If it
              can be longer than its box, it scrolls.
            </Guidance>
            <Guidance kind={'do'} title={'Name a region that only scrolls'}>
              A table or a log with nothing focusable in it needs <InlineCode>tabIndex={'{0}'}</InlineCode> and an
              <InlineCode>aria-label</InlineCode> to be reachable from the keyboard.
            </Guidance>
            <Guidance kind={'dont'} title={'Fix a height that the content decides'}>
              <InlineCode>maxHeight</InlineCode> is a ceiling, not a height: a short list stays short.
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

export const Route = createFileRoute('/primitives/scroll-area')({
  component: ScrollAreaPage
});
