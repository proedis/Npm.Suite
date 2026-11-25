import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { css, tsx } from '@/docs/snippet';
import { DocTable } from '@/docs/Tables';
import columns from '@/examples/foundations/responsive/columns.tsx?example';
import fieldSpan from '@/examples/foundations/responsive/field-span.tsx?example';
import stackMap from '@/examples/foundations/responsive/stack-map.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/foundations/responsive');

/** A class name built from a value, as text: the anti-pattern the guidelines name */
const BUILT_CLASS = "'gap-' + n";

const BREAKPOINT_ROWS: readonly (readonly [ string, string, string ])[] = [
  [ 'base', 'none', 'Every width: the phone, and everything wider until a breakpoint overrides it.' ],
  [ 'sm', '640px', 'A large phone held sideways, a small tablet.' ],
  [ 'md', '768px', 'A tablet.' ],
  [ 'lg', '1024px', 'A laptop: where a navigation rail usually appears.' ],
  [ 'xl', '1280px', 'A desktop.' ],
  [ '2xl', '1536px', 'A wide desktop.' ]
];

/** Every responsive prop of the package, read from the types */
const RESPONSIVE_PROPS: readonly (readonly [ string, string ])[] = [
  [ 'Stack', 'direction, gap, align, justify, columns' ],
  [ 'Cluster', 'gap, align, justify' ],
  [ 'Grid, Split', 'gap' ],
  [ 'Item', 'direction, gap, align' ],
  [ 'Surface.Footer', 'justify' ],
  [ 'Button', 'block' ],
  [ 'Field, Detail.Item', 'span, breakBefore' ],
  [ 'Field', 'orientation' ],
  [ 'CheckboxGroup, RadioGroup', 'orientation' ]
];


/* --------
 * Page
 * -------- */

function ResponsivePage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A layout prop whose right value depends on the width takes one value, or one value per breakpoint. The
            map is written where the component is used, it is typed, and every class it can produce is already in
            the stylesheet.
          </React.Fragment>
        )}
        imports={tsx`
          import type { Breakpoint, MediaBreakpoint, Responsive } from '@proedis/ui/core';
        `}
      />

      <PageBody>
        <Example of={stackMap} resizable />

        <Section
          title={'One value or a map'}
          lead={(
            <React.Fragment>
              <InlineCode>{'Responsive<T>'}</InlineCode> is <InlineCode>T</InlineCode>, or an object with a{' '}
              <InlineCode>T</InlineCode> for any of the breakpoints. The map is mobile first: a value applies from its
              breakpoint up, until a wider one says otherwise, and <InlineCode>base</InlineCode> is the value with no
              media query at all.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              <Stack gap={4} />                                     // 4 at every width
              <Stack gap={{ base: 2, lg: 6 }} />                    // 2, then 6 from lg
              <Stack direction={{ base: 'vertical', md: 'horizontal' }} />
              <Stack columns={{ base: 1, sm: 2, lg: 4 }} />         // 1, 2 from sm, 4 from lg
            `}
          />
          <Example of={columns} resizable />
        </Section>

        <Section
          title={'The breakpoints'}
          lead={'The breakpoints of Tailwind, under the same names. The hooks of the package read the same values.'}
        >
          <DocTable
            head={[ 'Name', 'From', 'Roughly' ]}
            rows={BREAKPOINT_ROWS.map(([ name, from, roughly ]) => [
              <InlineCode key={'n'}>{name}</InlineCode>,
              <span key={'f'} className={'whitespace-nowrap'}>{from}</span>,
              roughly
            ])}
          />
          <Prose>
            <p>
              <InlineCode>MediaBreakpoint</InlineCode> is the same list without <InlineCode>base</InlineCode>: the type
              of the props that need a real media query, <InlineCode>hideBelow</InlineCode> and{' '}
              <InlineCode>hideFrom</InlineCode> among them.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Why the scale is a union'}
          lead={(
            <React.Fragment>
              A class built from a prop at runtime, <InlineCode>md:gap-6</InlineCode> from{' '}
              <InlineCode>{'{ md: 6 }'}</InlineCode>, is invisible to the Tailwind scanner. So the stylesheet declares
              every class a responsive prop can produce, and the type of the prop allows exactly those values and no
              other.
            </React.Fragment>
          )}
        >
          <CodeBlock
            title={'ui.css'}
            snippet={css`
              @source inline("{sm:,md:,lg:,xl:,2xl:,}gap-{0,0.5,1,1.5,2,2.5,3,3.5,4,5,6,7,8,9,10,12,14,16}");
              @source inline("{sm:,md:,lg:,xl:,2xl:,}grid-cols-{1,2,3,4,5,6,7,8,9,10,11,12}");
            `}
          />
          <CodeBlock
            snippet={tsx`
              <Stack gap={12} />    // a step of the scale
              // @ts-expect-error: 11 is not a step, and md:gap-11 would have no CSS behind it
              <Stack gap={11} />
              // @ts-expect-error: twelve columns at most
              <Stack columns={13} />
            `}
          />
          <Callout tone={'warning'} title={'Both halves, always'}>
            A type without its safelist entry ships a class with no CSS: a component that silently loses its gap at one
            width. A safelist entry without the type lets a caller ask for a value the stylesheet never declared. The two
            change together, in the same commit.
          </Callout>
        </Section>

        <Section
          title={'Which props are responsive'}
          lead={(
            <React.Fragment>
              Layout props, and only those. A prop of meaning, <InlineCode>tone</InlineCode>,{' '}
              <InlineCode>fill</InlineCode>, <InlineCode>size</InlineCode>, is not: a button does not change what it
              means at <InlineCode>lg</InlineCode>. The height of a control is not either, it follows the pointer.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Component', 'Responsive props' ]}
            rows={RESPONSIVE_PROPS.map(([ component, props ]) => [
              <span key={'c'} className={'font-medium whitespace-nowrap text-foreground'}>{component}</span>,
              <code key={'p'} className={'font-mono text-xs text-foreground'}>{props}</code>
            ])}
          />
          <Prose>
            <p>
              A responsive prop is never reported whole as a <InlineCode>data-*</InlineCode> attribute, since one
              attribute cannot hold a map: where a component reports it, as <InlineCode>data-block</InlineCode> on a
              Button, the attribute carries the value at <InlineCode>base</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Fields in a form section'}
          lead={(
            <React.Fragment>
              <InlineCode>span</InlineCode> on a Field has two behaviours, and the difference is who decides. One value
              lets the section decide: below 32rem of its own width the short fields take half a row and the others a
              whole one, a container query that keeps a form right inside a narrow drawer on a wide window. A map is your
              decision at every width of the window, and the section steps aside.
            </React.Fragment>
          )}
        >
          <Example of={fieldSpan} resizable />
          <Prose>
            <p>
              Two handles, two widths. The handle on the right of the preview sets the window; the corner of the dashed
              box inside sets only the container of the form. Keep the window wide and drag the corner: the first section
              reflows as soon as it is narrow, the second does not. Then narrow the window: the second follows it only, because a map speaks of the window like every{' '}
              <InlineCode>Responsive</InlineCode> prop. Container sizes and window breakpoints share names in Tailwind
              for different widths, so the package never mixes the two in one prop.
            </p>
          </Prose>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Write the map where the component is used'}>
              The layout of a screen at each width is read in one place, next to what it lays out.
            </Guidance>
            <Guidance kind={'dont'} title={'Build a class name from a value'}>
              <InlineCode>{BUILT_CLASS}</InlineCode> is invisible to the scanner. Pass the value to a prop that has it
              declared.
            </Guidance>
            <Guidance kind={'do'} title={'Prefer a literal class when it is literal'}>
              <InlineCode>className={'{\'md:p-8\'}'}</InlineCode> is found by the scanner for free; a new responsive prop
              costs six classes per value.
            </Guidance>
            <Guidance kind={'dont'} title={'Change a meaning with the width'}>
              Tone, fill and size say what a thing is, and that does not depend on the window.
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

export const Route = createFileRoute('/ui/foundations/responsive')({
  component: ResponsivePage
});
