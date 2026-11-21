import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import stackProps from 'virtual:ui-props/StrictStackProps';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import align from '@/examples/layout/stack/align.tsx?example';
import asElement from '@/examples/layout/stack/as.tsx?example';
import basic from '@/examples/layout/stack/basic.tsx?example';
import columns from '@/examples/layout/stack/columns.tsx?example';
import direction from '@/examples/layout/stack/direction.tsx?example';
import divided from '@/examples/layout/stack/divided.tsx?example';
import gap from '@/examples/layout/stack/gap.tsx?example';
import inContext from '@/examples/layout/stack/in-context.tsx?example';
import inline from '@/examples/layout/stack/inline.tsx?example';
import justify from '@/examples/layout/stack/justify.tsx?example';
import responsive from '@/examples/layout/stack/responsive.tsx?example';
import wrap from '@/examples/layout/stack/wrap.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/layout/stack');


/* --------
 * Page
 * -------- */

function StackPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Children on an axis, with a gap between them. A column by default, a row when asked, a grid of
            equal columns when it is given <InlineCode>columns</InlineCode>, and every one of those per
            breakpoint. It is the container every other component of the package is built from: nothing in
            the package writes <InlineCode>flex</InlineCode> or <InlineCode>gap</InlineCode> by hand.
          </React.Fragment>
        )}
        imports={tsx`
          import { Stack } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Direction'}
          lead={(
            <React.Fragment>
              <InlineCode>vertical</InlineCode> is the default, because a column is what a page is made of.
              {' '}<InlineCode>horizontal</InlineCode> lays the children in a row; the cross axis and the main
              axis follow, so <InlineCode>align</InlineCode> and <InlineCode>justify</InlineCode> always mean
              “across” and “along”, whatever the direction.
            </React.Fragment>
          )}
        >
          <Example of={direction} />
        </Section>

        <Section
          title={'Gap'}
          lead={(
            <React.Fragment>
              The space between children, in steps of the Tailwind spacing scale: one step is{' '}
              <InlineCode>0.25rem</InlineCode>, so <InlineCode>4</InlineCode> is one rem. The steps are{' '}
              <InlineCode>0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16</InlineCode>, and a
              theme that rescales <InlineCode>--spacing</InlineCode> rescales every gap with it. With no{' '}
              <InlineCode>gap</InlineCode> the children touch.
            </React.Fragment>
          )}
        >
          <Example of={gap} />
          <Callout tone={'warning'} title={'The scale is a type, not a number'}>
            <InlineCode>gap</InlineCode> is a union of those steps. A gap is a class built at runtime, which
            Tailwind cannot find by scanning the source, so the package declares every step in its stylesheet.
            A <InlineCode>13</InlineCode> would build a class with no CSS behind it and the gap would silently
            vanish: here it does not compile instead.
          </Callout>
        </Section>

        <Section
          title={'Align'}
          lead={(
            <React.Fragment>
              Where the children sit across the axis. In a row, <InlineCode>stretch</InlineCode> makes them as
              tall as the tallest, <InlineCode>center</InlineCode> lines them up on the middle, and{' '}
              <InlineCode>baseline</InlineCode> on the first line of their text, which is what a label next to
              a bigger value wants. Left undeclared, the browser stretches.
            </React.Fragment>
          )}
        >
          <Example of={align} align={'stretch'} />
        </Section>

        <Section
          title={'Justify'}
          lead={(
            <React.Fragment>
              How the free space along the axis is shared. <InlineCode>between</InlineCode> is the one a header
              reaches for: a title at one end, its actions at the other.
            </React.Fragment>
          )}
        >
          <Example of={justify} align={'stretch'} />
        </Section>

        <Section
          title={'Wrap'}
          lead={(
            <React.Fragment>
              A row that runs out of room keeps going past its parent, unless it may wrap. With{' '}
              <InlineCode>wrap</InlineCode> the children flow onto as many lines as they need, the gap applying
              between lines too. When a wrapping row is all you want, centred on its line,{' '}
              <InlineCode>Cluster</InlineCode> is the same thing with the defaults already set.
            </React.Fragment>
          )}
        >
          <Example of={wrap} />
        </Section>

        <Section
          title={'Columns'}
          lead={(
            <React.Fragment>
              Give it <InlineCode>columns</InlineCode> and the stack becomes a grid of equal columns, from 1 to
              12, and <InlineCode>direction</InlineCode> stops applying. Here: one column on a phone, two from{' '}
              <InlineCode>sm</InlineCode>, four from <InlineCode>lg</InlineCode>. Drag the handle of the preview,
              or pick a breakpoint over it, to watch it reflow. When the number of columns should follow the room rather than the breakpoint, use{' '}
              <InlineCode>Grid</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={columns} resizable align={'stretch'} />
        </Section>

        <Section
          title={'Divided'}
          lead={(
            <React.Fragment>
              A hairline between each pair of children, in the <InlineCode>border</InlineCode> token, following
              the axis: horizontal rules in a column, vertical ones in a row. In grid mode the rules run between
              the columns.
            </React.Fragment>
          )}
        >
          <Example of={divided} />
        </Section>

        <Section
          title={'Responsive values'}
          lead={(
            <React.Fragment>
              <InlineCode>direction</InlineCode>, <InlineCode>gap</InlineCode>, <InlineCode>align</InlineCode>,
              {' '}<InlineCode>justify</InlineCode> and <InlineCode>columns</InlineCode> take one value, or one
              per breakpoint: <InlineCode>{'{ base, sm, md, lg, xl, 2xl }'}</InlineCode>. The map is mobile
              first, so <InlineCode>base</InlineCode> applies everywhere until a wider breakpoint says otherwise.
              The breakpoints are the window’s: 640, 768, 1024, 1280 and 1536 pixels. Here the window is the frame of
              the preview, whose width the handle on its right sets.
            </React.Fragment>
          )}
        >
          <Example of={responsive} resizable align={'stretch'} />
          <Prose>
            <p>
              This one is a column with a small gap on a phone and a row with a wide gap from{' '}
              <InlineCode>md</InlineCode>. Its alignment changes too: <InlineCode>stretch</InlineCode> while it
              is a column, so every child is as wide as the stack, and <InlineCode>center</InlineCode> once it is
              a row. <InlineCode>divided</InlineCode> follows the direction at every width: the horizontal rules
              of the column are taken away when it turns into a row, rather than staying under the vertical ones.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Inline'}
          lead={(
            <React.Fragment>
              <InlineCode>inline</InlineCode> makes the stack sit in a line of text like a word,{' '}
              <InlineCode>inline-flex</InlineCode> rather than <InlineCode>flex</InlineCode>, or{' '}
              <InlineCode>inline-grid</InlineCode> with <InlineCode>columns</InlineCode>. An icon next to its
              word inside a sentence is the usual case; the package uses it for the content of every button.
            </React.Fragment>
          )}
        >
          <Example of={inline} />
        </Section>

        <Section
          title={'Rendering another element'}
          lead={(
            <React.Fragment>
              <InlineCode>as</InlineCode> picks the element, and the types follow it:{' '}
              <InlineCode>{'as={\'a\'}'}</InlineCode> accepts <InlineCode>href</InlineCode>,{' '}
              <InlineCode>{'as={\'ul\'}'}</InlineCode> is a list a screen reader counts. Reach for it every time
              the stack is a thing with a meaning: a navigation, a list, a form, a section, a link.
            </React.Fragment>
          )}
        >
          <Example of={asElement} />
          <CodeBlock
            snippet={tsx`
              <Stack as={'a'} href={'/rounds'}>…</Stack>     // compiles: an anchor takes href

              // @ts-expect-error: a span has no href
              <Stack as={'span'} href={'/rounds'}>…</Stack>

              // @ts-expect-error: 13 is not a step of the scale
              <Stack gap={13}>…</Stack>
            `}
          />
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              The top of a list page: a heading and its actions that sit in a column on a phone and spread into a
              row from <InlineCode>md</InlineCode>, and three figures in a grid below. Nothing in it writes a
              display, a direction or a gap by hand.
            </React.Fragment>
          )}
        >
          <Example of={inContext} align={'stretch'} />
        </Section>

        <Section
          title={'How the package uses it'}
          lead={(
            <React.Fragment>
              Every container inside a component of the package is a <InlineCode>Stack</InlineCode>, a{' '}
              <InlineCode>Cluster</InlineCode> or a <InlineCode>Grid</InlineCode>, and a lint rule makes sure of
              it. A component’s root renders through Stack with its own element and its own slot.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              // The footer of a card, from Surface (abridged): a row, centred, pushed to the end
              <Stack
                as={Component}
                data-slot={'surface-footer'}
                direction={'horizontal'}
                align={'center'}
                justify={justify}
                gap={2.5}
                className={cn('p-5', className)}
                {...rest}
              />
            `}
          />
          <Prose>
            <p>
              A <InlineCode>data-slot</InlineCode> passed to Stack replaces its own <InlineCode>stack</InlineCode>,
              which is how a component keeps one name for each of its parts. The same holds for any{' '}
              <InlineCode>data-*</InlineCode> you pass: yours comes after the stack’s and wins.
            </p>
          </Prose>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A stack is a <InlineCode>{'<div>'}</InlineCode> and says nothing to a screen reader, which is right
              for layout. When the group means something, say it with <InlineCode>as</InlineCode>: a{' '}
              <InlineCode>ul</InlineCode> is announced as a list of so many items, a <InlineCode>nav</InlineCode>{' '}
              is a landmark.
            </p>
            <p>
              Visual order and DOM order are the same thing here: there is no reverse direction. The
              order a sighted user reads is the order the keyboard and a screen reader follow.
            </p>
          </Prose>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'stack', part: 'The stack itself, unless a data-slot is passed', attributes: [ 'data-mode', 'data-divided', 'data-inline', 'data-wrap' ] }
            ]}
          />
          <DocTable
            head={[ 'Attribute', 'Value' ]}
            rows={[
              [ <InlineCode key={'a'}>data-mode</InlineCode>, <span key={'v'}><InlineCode>flex</InlineCode>, or <InlineCode>grid</InlineCode> when it has columns</span> ],
              [ <InlineCode key={'a'}>data-divided</InlineCode>, 'Present when divided' ],
              [ <InlineCode key={'a'}>data-inline</InlineCode>, 'Present when inline' ],
              [ <InlineCode key={'a'}>data-wrap</InlineCode>, 'Present when it wraps' ]
            ]}
          />
          <Prose>
            <p>
              The responsive props report nothing: one attribute cannot hold a value per breakpoint, so the classes
              themselves are the surface.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={stackProps}
            rest={(
              <React.Fragment>
                <InlineCode>as</InlineCode> picks the element, <InlineCode>div</InlineCode> by default, and every
                other prop goes to it, typed by it. <InlineCode>className</InlineCode> comes last and wins over the
                classes the props build.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A Stack for every container'}>
              A column, a row, a grid of equal columns: each is a Stack with props, and the props are what a reader
              scans. <InlineCode>flex flex-col gap-4</InlineCode> in a class says the same thing less clearly.
            </Guidance>
            <Guidance kind={'dont'} title={'Override the layout through className'}>
              <InlineCode>className</InlineCode> wins, so <InlineCode>{'gap={4} className={\'gap-8\'}'}</InlineCode>{' '}
              is a gap of 8. It works, and it hides the real value from whoever reads the props.
            </Guidance>
            <Guidance kind={'do'} title={'Say the meaning with as'}>
              A list of rows is a <InlineCode>ul</InlineCode>, a toolbar of links is a <InlineCode>nav</InlineCode>.
              The layout is the same, and assistive technology hears the structure.
            </Guidance>
            <Guidance kind={'dont'} title={'Reach for columns when the room decides'}>
              <InlineCode>columns</InlineCode> fixes the count per breakpoint. A gallery of cards wants as many as
              fit: that is <InlineCode>Grid</InlineCode>.
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

export const Route = createFileRoute('/layout/stack')({
  component: StackPage
});
