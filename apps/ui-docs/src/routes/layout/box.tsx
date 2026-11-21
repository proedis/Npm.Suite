import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { Callout } from '@/docs/Callout';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, SlotsTable } from '@/docs/Tables';
import asElement from '@/examples/layout/box/as.tsx?example';
import contents from '@/examples/layout/box/contents.tsx?example';
import hide from '@/examples/layout/box/hide.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/layout/box');


/* --------
 * Page
 * -------- */

function BoxPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Any element, with the shared props and nothing else. It is what the other primitives would be with
            their layout taken away: reach for it when a plain element needs to hide below or above a breakpoint,
            or when an arrangement is a one-off that does not deserve a component.
          </React.Fragment>
        )}
        imports={tsx`
          import { Box } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={hide} resizable />
        <Prose>
          <p>
            Drag the handle of the preview below 768 pixels and the first line gives way to the second.{' '}
            <InlineCode>hideBelow</InlineCode> shows an element from a breakpoint up, <InlineCode>hideFrom</InlineCode>{' '}
            shows it below one. Both take <InlineCode>sm</InlineCode>, <InlineCode>md</InlineCode>,{' '}
            <InlineCode>lg</InlineCode>, <InlineCode>xl</InlineCode> or <InlineCode>2xl</InlineCode>, and the other
            primitives take them too, as does every component that renders a root of its own on the page.
          </p>
        </Prose>

        <Section
          title={'Nothing to say, no class'}
          lead={(
            <React.Fragment>
              A Box with no shared prop and no <InlineCode>className</InlineCode> renders its element with no{' '}
              <InlineCode>class</InlineCode> attribute at all, not even an empty one. It has no display, padding or
              colour of its own, so whatever you write is all it is.
            </React.Fragment>
          )}
        />

        <Section
          title={'Hiding a group without joining a layout'}
          lead={(
            <React.Fragment>
              A Box around some children of a stack is an item of that stack, which breaks its gap. Give it the{' '}
              <InlineCode>contents</InlineCode> class and the wrapper disappears from the layout: its children stay
              direct items of the stack, gap included, while <InlineCode>hideBelow</InlineCode> still hides the
              whole group. Drag the preview below <InlineCode>lg</InlineCode> to see Export and Print go together.
            </React.Fragment>
          )}
        >
          <Example of={contents} resizable />
          <Callout tone={'warning'} title={'contents belongs on a Box only'}>
            On a <InlineCode>Stack</InlineCode> or a <InlineCode>Cluster</InlineCode> the class would leave the
            component’s own gap and alignment inert, silently, since an element with{' '}
            <InlineCode>display: contents</InlineCode> lays nothing out.
          </Callout>
        </Section>

        <Section
          title={'Rendering another element'}
          lead={(
            <React.Fragment>
              <InlineCode>as</InlineCode> picks the element and its props: a section with its{' '}
              <InlineCode>aria-labelledby</InlineCode>, an anchor with its <InlineCode>href</InlineCode>. The
              props of the element are typed by the element, so an <InlineCode>href</InlineCode> on a{' '}
              <InlineCode>span</InlineCode> does not compile.
            </React.Fragment>
          )}
        >
          <Example of={asElement} />
        </Section>

        <Section title={'Hidden is still mounted'}>
          <Callout tone={'warning'}>
            Hiding is CSS: below the breakpoint the children are still rendered, their effects run and their
            requests fire. When a subtree has a cost, a map, a chart, a query, decide in JavaScript with{' '}
            <InlineCode>useIsMobile</InlineCode> from <InlineCode>@proedis/ui/hooks</InlineCode> and render
            nothing instead.
          </Callout>
          <Prose>
            <p>
              The classes are <InlineCode>not-md:hidden</InlineCode> and <InlineCode>md:hidden</InlineCode>: one
              class each, and no display to restore above the breakpoint, so an element keeps whatever display it
              has. That is what lets the same two props work on a stack, a grid or a plain element.{' '}
              <Link to={'/foundations/shared-props' as never} className={'font-medium text-primary hover:underline'}>Shared props</Link>{' '}
              has the whole story.
            </p>
          </Prose>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A hidden Box is <InlineCode>display: none</InlineCode>, so it is hidden from assistive technology too:
              the two halves of a responsive layout never both reach a screen reader. To hide something from the eye
              only and keep it for a screen reader, use <InlineCode>VisuallyHidden</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable rows={[ { slot: 'box', part: 'The element itself, unless a data-slot is passed' } ]} />
        </Section>

        <Section title={'API'}>
          <DocTable
            head={[ 'Prop', 'Type', 'Default' ]}
            rows={[
              [ <InlineCode key={'p'}>as</InlineCode>, <InlineCode key={'t'}>React.ElementType</InlineCode>, <InlineCode key={'d'}>{'\'div\''}</InlineCode> ],
              [ <InlineCode key={'p'}>hideBelow</InlineCode>, <InlineCode key={'t'}>MediaBreakpoint</InlineCode>, '–' ],
              [ <InlineCode key={'p'}>hideFrom</InlineCode>, <InlineCode key={'t'}>MediaBreakpoint</InlineCode>, '–' ]
            ]}
          />
          <Prose>
            <p>Every other prop goes to the element, typed by it.</p>
          </Prose>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Box for a plain element that hides'}>
              A banner for wide screens only, a hint for phones only. When the element also lays out its children,
              it is a Stack, which takes the same props.
            </Guidance>
            <Guidance kind={'dont'} title={'Wait for style props'}>
              There is no <InlineCode>p</InlineCode>, <InlineCode>m</InlineCode> or <InlineCode>bg</InlineCode>, on
              purpose: <InlineCode>className</InlineCode> already says all of that, and Tailwind finds it for free.
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

export const Route = createFileRoute('/layout/box')({
  component: BoxPage
});
