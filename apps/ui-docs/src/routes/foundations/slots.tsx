import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { css } from '@/docs/snippet';
import { DocTable, SlotsTable } from '@/docs/Tables';
import anatomy from '@/examples/foundations/slots/anatomy.tsx?example';
import resolved from '@/examples/foundations/slots/resolved.tsx?example';
import skin from '@/examples/foundations/slots/skin.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/foundations/slots');

/** The attributes and selectors the prose quotes: strings, since a quote cannot be written in JSX text */
const CODE = {
  noStackSlot        : 'data-slot="stack"',
  softFill           : 'data-fill="soft"',
  mutedTone          : 'data-tone="muted"',
  defaultElevation   : 'data-elevation="default"',
  soft               : '"soft"',
  defaultSelector    : "[data-elevation='default']",
  mediumSize         : 'data-size="md"',
  destructiveSelector: "[data-slot='button'][data-tone='destructive']"
} as const;

/** How each kind of prop is reported, from the rule every component of the package follows */
const REPORTING: readonly (readonly [ string, string, string ])[] = [
  [ 'A closed set of values', 'Always, resolved: the default included', 'An attribute that vanishes with the prop cannot be targeted, and the default is the case most worth retuning.' ],
  [ 'A chrome variant with no opinion', 'With a default member', 'Surface elevation and radius, Container size, Label emphasis: [data-elevation=\'default\'] is the set nobody decided.' ],
  [ 'A boolean', 'Present when true, absent otherwise', 'The HTML idiom: [data-loading] reads better than [data-loading=\'false\'].' ],
  [ 'A responsive value', 'Never whole', 'One attribute cannot hold a map; where one is reported, it carries the value at base.' ],
  [ 'A free measure', 'Never', 'A width, a ratio, a maximum height: an inline length, and the prop is already the surface.' ]
];


/* --------
 * Page
 * -------- */

function SlotsPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Every part of every component carries a <InlineCode>data-slot</InlineCode>, and every resolved variant and
            state a <InlineCode>data-*</InlineCode> attribute. Together they are the surface a product skins with plain
            CSS: every button of an application restyled in one rule, without touching a call site and without
            wrapping a component.
          </React.Fragment>
        )}
        imports={css`
          [data-slot='button'][data-size='lg'] {
            border-radius: 9999px;
          }
        `}
      />

      <PageBody>
        <Example of={anatomy} />

        <Section
          title={'Every part has a name'}
          lead={(
            <React.Fragment>
              The root of a component and each of its parts has a slot, named after the component:{' '}
              <InlineCode>surface</InlineCode>, <InlineCode>surface-header</InlineCode>,{' '}
              <InlineCode>heading-title</InlineCode>. The readout under the example is read from the DOM: every element
              with a slot, nested as on the page, with its attributes.
            </React.Fragment>
          )}
        >
          <SlotsTable
            rows={[
              { slot: 'surface', part: 'The card', attributes: [ 'data-elevation', 'data-radius' ] },
              { slot: 'surface-body', part: 'Everything inside it, dimmed while the card loads' },
              { slot: 'surface-header', part: 'Its header, an Item that names its own part', attributes: [ 'data-inset' ] },
              { slot: 'icon-box', part: 'The framed icon', attributes: [ 'data-fill', 'data-tone', 'data-size', 'data-shape' ] },
              { slot: 'heading', part: 'The block of text', attributes: [ 'data-gap' ] },
              { slot: 'heading-title', part: 'Its title', attributes: [ 'data-size' ] },
              { slot: 'heading-description', part: 'The line under it', attributes: [ 'data-size' ] },
              { slot: 'item-actions', part: 'The controls at the end of the row' },
              { slot: 'button', part: 'The icon button', attributes: [ 'data-fill', 'data-tone', 'data-size', 'data-icon-only' ] },
              { slot: 'button-content', part: 'The content of the button' },
              { slot: 'surface-separator', part: 'The rule between two sections', attributes: [ 'data-type', 'data-orientation' ] },
              { slot: 'surface-section', part: 'A section of the card' }
            ]}
          />
          <Prose>
            <p>
              A component built on another replaces the slot of the root rather than adding one: the header of a Surface
              is an Item, and it says <InlineCode>surface-header</InlineCode>, because a rule written for every row of a
              list should not catch the header of every card. The layout primitives a component is built with never
              leave their own slot behind: there is no <InlineCode>{CODE.noStackSlot}</InlineCode> inside a component of
              the package.
            </p>
            <p>
              The <InlineCode>data-mode</InlineCode> and <InlineCode>data-inline</InlineCode> in the readout come from that
              primitive too: they describe how the part is laid out, flex or grid, inline or not. They are not part of the
              component’s contract, and a skin does not target them.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Variants, resolved'}
          lead={(
            <React.Fragment>
              A component reports what it resolved, not what it was given. The first badge has no props at all and says{' '}
              <InlineCode>{CODE.softFill}</InlineCode> and <InlineCode>{CODE.mutedTone}</InlineCode>, its defaults;
              the loading button says <InlineCode>data-loading</InlineCode>, present because it is true.
            </React.Fragment>
          )}
        >
          <Example of={resolved} />
          <DocTable
            head={[ 'Kind of prop', 'Reported', 'Why' ]}
            rows={REPORTING.map(([ kind, reported, why ]) => [
              <span key={'k'} className={'font-medium text-foreground'}>{kind}</span>,
              reported,
              why
            ])}
          />
        </Section>

        <Section
          title={'The default member'}
          lead={(
            <React.Fragment>
              The two surfaces of the example look the same, and the attributes tell them apart: the first says{' '}
              <InlineCode>{CODE.defaultElevation}</InlineCode>, the second <InlineCode>{CODE.soft}</InlineCode>, because
              someone asked for it. A rule on <InlineCode>{CODE.defaultSelector}</InlineCode> restyles the cards
              nobody had an opinion about, and keeps meaning that the day the package changes its default.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              Only four variants have a default member, and the list is the answer to three questions, all three yes: is
              the default a choice among named options rather than a step of a scale; would an application write a rule
              for the unspecified case; would that rule survive the package changing its mind. Surface{' '}
              <InlineCode>elevation</InlineCode> and <InlineCode>radius</InlineCode>, Container{' '}
              <InlineCode>size</InlineCode>, Label <InlineCode>emphasis</InlineCode>. A size is a step, so{' '}
              <InlineCode>{CODE.mediumSize}</InlineCode> says more than a default would; an orientation is what the caller
              meant, and nobody restyles the dividers they did not orient.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Skinning with a stylesheet'}
          lead={(
            <React.Fragment>
              Tailwind writes the classes of the package inside <InlineCode>@layer utilities</InlineCode>. A plain rule of
              yours, outside any layer, beats them whatever its specificity, with no{' '}
              <InlineCode>!important</InlineCode>. The right panel is the same markup as the left one, under four rules.
            </React.Fragment>
          )}
        >
          <Example of={skin} />
          <CodeBlock
            title={'app.css'}
            snippet={css`
              /* Every button of the product, round */
              [data-slot='button'] {
                border-radius: 9999px;
              }

              /* The soft badges, in small capitals */
              [data-slot='badge'][data-fill='soft'] {
                text-transform: uppercase;
                letter-spacing: 0.06em;
              }

              /* The cards nobody gave an elevation, flat with a dashed outline */
              [data-slot='surface'][data-elevation='default'] {
                box-shadow: none;
                outline: 1px dashed var(--border);
              }
            `}
          />
          <Callout title={'Why not a variable per component'}>
            A set of <InlineCode>--badge-sm-height</InlineCode> variables is sizes × properties for every component,
            hundreds of names, and each one cuts the component out of the scales it follows today:{' '}
            <InlineCode>size-8</InlineCode> follows <InlineCode>--spacing</InlineCode> and{' '}
            <InlineCode>rounded-xl</InlineCode> follows <InlineCode>--radius-scale</InlineCode>. A rule on the attributes
            reaches exactly what it names and leaves the scales alone.
          </Callout>
        </Section>

        <Section
          title={'A contract, not a detail'}
          lead={(
            <React.Fragment>
              Slots and attributes are public API. Renaming one is a breaking change of the package, recorded in its
              migration table, because a product’s skin is written against them. The classes are not: they change with
              the look, and a rule written against a class breaks at the next release.
            </React.Fragment>
          )}
        />

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Target slots and attributes'}>
              <InlineCode>{CODE.destructiveSelector}</InlineCode> means the same thing in every
              release.
            </Guidance>
            <Guidance kind={'dont'} title={'Target the classes of a component'}>
              They are how it looks today, not what it is.
            </Guidance>
            <Guidance kind={'do'} title={'Restyle the default member'}>
              <InlineCode>{CODE.defaultSelector}</InlineCode> is the set you own; the surfaces someone gave a value
              to keep it.
            </Guidance>
            <Guidance kind={'dont'} title={'Put a skin in @layer utilities'}>
              Inside the layer it fights the package on specificity and order. Outside any layer it simply wins.
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

export const Route = createFileRoute('/foundations/slots')({
  component: SlotsPage
});
