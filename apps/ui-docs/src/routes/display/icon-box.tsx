import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import iconBoxProps from 'virtual:ui-props/StrictIconBoxProps';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { css, tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/display/icon-box/basic.tsx?example';
import halo from '@/examples/display/icon-box/halo.tsx?example';
import rows from '@/examples/display/icon-box/rows.tsx?example';
import shape from '@/examples/display/icon-box/shape.tsx?example';
import sizes from '@/examples/display/icon-box/sizes.tsx?example';
import tones from '@/examples/display/icon-box/tones.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/display/icon-box');

const PROPS = refineProps(iconBoxProps, {
  fill: { default: '\'soft\'', description: 'A tenth of the tone with a hairline, the full colour, or no surface at all.' },
  tone: { default: '\'muted\'', description: 'Which of the seven tones, from the same table Badge and Button read.' },
  size: { default: '\'md\'', description: 'The side of the box, its radius and the size of the glyph move together.' }
});


/* --------
 * Page
 * -------- */

function IconBoxPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A box that frames a single icon, sized and toned. The icon arrives as a child from any library: the box
            knows how big the glyph should be and nothing about where it came from, which keeps an icon library out of
            the package.
          </React.Fragment>
        )}
        imports={tsx`
          import { IconBox } from '@proedis/ui/display/icon-box';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Tones and fills'}
          lead={(
            <React.Fragment>
              Three independent axes: how it is filled, which tone, how big. <InlineCode>soft</InlineCode> carries a
              hairline so a tinted box holds its edge on any surface; <InlineCode>solid</InlineCode> is the full colour
              with the foreground as the glyph; <InlineCode>plain</InlineCode> has no surface and keeps the footprint.
            </React.Fragment>
          )}
        >
          <Example of={tones} />
        </Section>

        <Section title={'Sizes'}>
          <Example of={sizes} />
          <DocTable
            head={[ 'size', 'Box', 'Glyph', 'Where' ]}
            rows={[
              [ <InlineCode key={'s'}>xs</InlineCode>, '24px', '14px', 'A dense row, a mark next to a label' ],
              [ <InlineCode key={'s'}>sm</InlineCode>, '32px', '16px', 'A compact list' ],
              [ <InlineCode key={'s'}>md</InlineCode>, '40px', '20px', 'The default: a list row, a card header' ],
              [ <InlineCode key={'s'}>lg</InlineCode>, '56px', '24px', 'A summary tile' ],
              [ <InlineCode key={'s'}>xl</InlineCode>, '72px', '28px', 'An empty state in a card' ],
              [ <InlineCode key={'s'}>2xl</InlineCode>, '88px', '36px', 'An empty state on a page' ]
            ]}
          />
          <Prose>
            <p>
              The glyph size is skipped when the icon already sets its own <InlineCode>size-*</InlineCode> class: that is
              the escape hatch for an icon that needs to be drawn smaller or larger.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Shape'}
          lead={(
            <React.Fragment>
              Square by default, with a radius that grows with the size. <InlineCode>round</InlineCode> makes it a circle at
              any size.
            </React.Fragment>
          )}
        >
          <Example of={shape} />
        </Section>

        <Section
          title={'Halo'}
          lead={(
            <React.Fragment>
              <InlineCode>halo</InlineCode> draws two concentric rings behind the box in its tone, scaled from the box
              itself so they follow any size. It belongs to an empty state, never to a header or a row.
            </React.Fragment>
          )}
        >
          <Example of={halo} />
        </Section>

        <Section
          title={'In rows'}
          lead={(
            <React.Fragment>
              <InlineCode>plain</InlineCode> keeps the footprint of the box without drawing it, so a column of rows stays
              aligned whether or not a row has a surface: the first glyph of every row starts at the same place.
            </React.Fragment>
          )}
        >
          <Example of={rows} />
        </Section>

        <Section
          title={'Theming'}
          lead={'Every variant is reported as an attribute, the cheapest theming surface of the package: one rule retunes every box of a size.'}
        >
          <CodeBlock
            title={'app.css'}
            snippet={css`
              [data-slot='icon-box'][data-size='sm'] {
                width: 2.25rem;
                height: 2.25rem;
              }
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The box adds nothing to the accessibility tree: the icon inside it decides. A decorative icon next to a
              title is <InlineCode>aria-hidden</InlineCode>, which lucide icons are by default; an icon that carries meaning
              alone needs a name of its own.
            </p>
          </Prose>
          <Callout tone={'warning'} title={'A frame, not a control'}>
            No hover, no press, no focus. A clickable icon is an IconButton: it needs a focus ring, a pressed state and an
            accessible name, which a frame has no business owning.
          </Callout>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'icon-box', part: 'The box', attributes: [ 'data-fill', 'data-tone', 'data-size', 'data-shape' ] },
              { slot: 'icon-box-halo', part: 'Each of the two rings, with halo' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={PROPS}
            rest={(
              <React.Fragment>
                Polymorphic: <InlineCode>as</InlineCode> picks the element, a <InlineCode>span</InlineCode> by default, and
                every other prop goes to it.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Tone by meaning'}>
              A vehicle in the primary tone, a completed step in success, a destructive action in destructive. A box
              toned for decoration dilutes every toned box on the screen.
            </Guidance>
            <Guidance kind={'dont'} title={'Wrap it in a button'}>
              An icon that does something is an IconButton. Its tooltip and focus come with it.
            </Guidance>
            <Guidance kind={'do'} title={'Use plain to keep a column aligned'}>
              In a list where only some rows have a toned box, the others take a plain one of the same size.
            </Guidance>
            <Guidance kind={'dont'} title={'Halo in a header'}>
              The rings are for the one icon of an empty state. In a header they crowd the title.
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

export const Route = createFileRoute('/display/icon-box')({
  component: IconBoxPage
});
