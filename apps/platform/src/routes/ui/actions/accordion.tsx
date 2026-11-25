import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import accordionProps from 'virtual:ui-props/AccordionProps';
import accordionItemProps from 'virtual:ui-props/AccordionItemProps';
import themeDoc from 'virtual:ui-theme/actions/accordion';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { css, tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/actions/accordion/basic.tsx?example';
import chevronPosition from '@/examples/actions/accordion/chevron-position.tsx?example';
import contained from '@/examples/actions/accordion/contained.tsx?example';
import controlled from '@/examples/actions/accordion/controlled.tsx?example';
import filled from '@/examples/actions/accordion/filled.tsx?example';
import inContext from '@/examples/actions/accordion/in-context.tsx?example';
import inset from '@/examples/actions/accordion/inset.tsx?example';
import keepMounted from '@/examples/actions/accordion/keep-mounted.tsx?example';
import parts from '@/examples/actions/accordion/parts.tsx?example';
import radius from '@/examples/actions/accordion/radius.tsx?example';
import separated from '@/examples/actions/accordion/separated.tsx?example';
import single from '@/examples/actions/accordion/single.tsx?example';
import theme from '@/examples/actions/accordion/theme.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/actions/accordion');


/* --------
 * Page
 * -------- */

function AccordionPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Sections that open and close from their header: an arrow, the title, a mark, a summary on the right,
            the actions at the end, and the body under them. A piece of layout rather than a container, it stands
            in a form, a detail, a page or a card, in four looks. A single section is an Accordion with one item.
          </React.Fragment>
        )}
        imports={tsx`
          import { Accordion } from '@proedis/ui/actions/accordion';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Variants'}
          lead={(
            <React.Fragment>
              <InlineCode>variant</InlineCode> decides how the items stand together. The default draws a rule between
              them and nothing around, so it goes inside a card without a line doubling the card’s.
            </React.Fragment>
          )}
        >
          <SubSection
            title={'Contained'}
            lead={'The same rules, in a box with a corner: a group that stands alone on a page.'}
          >
            <Example of={contained} />
          </SubSection>
          <SubSection
            title={'Filled'}
            lead={'No rule: the open item sits on a quiet surface with a corner. A list of questions, a sidebar.'}
          >
            <Example of={filled} />
          </SubSection>
          <SubSection
            title={'Separated'}
            lead={(
              <React.Fragment>
                Each item a box of its own, apart from the others, on a surface; the open one on a surface of its
                own, with a border. The room between them is <InlineCode>--accordion-gap</InlineCode>.
              </React.Fragment>
            )}
          >
            <Example of={separated} />
          </SubSection>
        </Section>

        <Section
          title={'Radius'}
          lead={(
            <React.Fragment>
              <InlineCode>radius</InlineCode> sets the corner of the three boxed variants: a step of the scale, or{' '}
              <InlineCode>default</InlineCode>, which is the theme’s <InlineCode>--accordion-radius</InlineCode> and
              falls back to <InlineCode>lg</InlineCode>. The open item of <InlineCode>filled</InlineCode> and{' '}
              <InlineCode>separated</InlineCode> keeps its corner on the body too.
            </React.Fragment>
          )}
        >
          <Example of={radius} />
        </Section>

        <Section
          title={'Header parts'}
          lead={(
            <React.Fragment>
              <InlineCode>status</InlineCode> sits right after the title, a mark such as “Modified” with its dot.{' '}
              <InlineCode>meta</InlineCode> is the summary at the end of the button, always with its unit: “4
              containers”, never “4”. <InlineCode>actions</InlineCode> are controls at the end of the header,
              outside the button, because a control never goes inside another one. A <InlineCode>disabled</InlineCode>{' '}
              item does not open.
            </React.Fragment>
          )}
        >
          <Example of={parts} />
          <Prose>
            <p>A long title wraps, and the arrow stays on its first line.</p>
          </Prose>
        </Section>

        <Section
          title={'Arrow at the end'}
          lead={(
            <React.Fragment>
              <InlineCode>chevronPosition</InlineCode> is <InlineCode>start</InlineCode> by default: the arrow before
              the title points at the body and turns down when it opens, and the body lines up with the title.{' '}
              <InlineCode>end</InlineCode> puts a downward arrow after the summary, turning up when open, and the
              body starts under the arrow’s edge, flush with the header.
            </React.Fragment>
          )}
        >
          <Example of={chevronPosition} />
        </Section>

        <Section
          title={'One open at a time'}
          lead={(
            <React.Fragment>
              Several items open together by default, the way the sections of a form or a detail are read.{' '}
              <InlineCode>{'multiple={false}'}</InlineCode> keeps one: opening an item closes the other. For a list of
              questions, where each answer is read alone.
            </React.Fragment>
          )}
        >
          <Example of={single} />
        </Section>

        <Section
          title={'Controlled'}
          lead={(
            <React.Fragment>
              Closed by default and not remembered between visits. <InlineCode>defaultValue</InlineCode> opens the
              items it lists the first time; <InlineCode>value</InlineCode> and{' '}
              <InlineCode>onValueChange</InlineCode> hand the set to you, for an “Open all” or to open the item that
              holds an error. Give each item a <InlineCode>value</InlineCode> to name it there; without one it gets
              an id of its own.
            </React.Fragment>
          )}
        >
          <Example of={controlled} />
        </Section>

        <Section
          title={'Keeping the body mounted'}
          lead={(
            <React.Fragment>
              A closed body is not in the document, which is what a long history or a list wants. A body with
              fields wants the opposite: <InlineCode>keepMounted</InlineCode> keeps it mounted and hidden, so the
              fields keep their value and the validation of the form still sees them. Type in both, close them,
              open them again.
            </React.Fragment>
          )}
        >
          <Example of={keepMounted} />
        </Section>

        <Section
          title={'Inset'}
          lead={(
            <React.Fragment>
              <InlineCode>inset</InlineCode> runs the headers edge to edge of a card: the padding of the card moves
              inside the button, the focus ring is drawn inside it so the card does not cut it, and the body takes
              the whole width and places its own content. It is how the groups of a CheckboxGrid are drawn, with
              the default variant.
            </React.Fragment>
          )}
        >
          <Example of={inset} />
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              The detail of a collection point: the items are headings under the title of the page, so{' '}
              <InlineCode>headingLevel</InlineCode> stays at 3, and the only action of the contract sits outside the
              button that opens it.
            </React.Fragment>
          )}
        >
          <Example of={inContext} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Each header is a real heading, <InlineCode>h3</InlineCode> unless <InlineCode>headingLevel</InlineCode>{' '}
              says otherwise, with a full width button inside it: the items can be browsed by their headings even
              while closed. Base UI’s <InlineCode>Accordion</InlineCode> owns <InlineCode>aria-expanded</InlineCode>,{' '}
              <InlineCode>aria-controls</InlineCode> and the hidden body. Every header is a stop of Tab, with no
              arrows between them: the pattern leaves them optional, and the headers of a long CheckboxGrid are
              reached the same way.
            </p>
            <p>
              The name of the button is the title, the mark and the summary, joined with{' '}
              <InlineCode>aria-labelledby</InlineCode>, so the package adds no word of its own. The body opens on its
              height in 150ms, a functional animation; with reduced motion it opens at once and the arrow does not
              turn.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves to the header button, then to the actions, then into the open body.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Opens or closes the item.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Opens or closes the item.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title}>
          <p>
            The look of the boxed variants is the theme’s, so a product sets it once, and every variable of the
            accordion falls back to a token the rest of the package reads. <InlineCode>--accordion-radius</InlineCode>{' '}
            is <InlineCode>--radius-lg</InlineCode> undeclared, <InlineCode>--accordion-gap</InlineCode> the{' '}
            <InlineCode>sm</InlineCode> step. The surfaces: <InlineCode>--accordion-filled-background</InlineCode>{' '}
            (the open item of <InlineCode>filled</InlineCode>) and <InlineCode>--accordion-item-background</InlineCode>{' '}
            (a closed item of <InlineCode>separated</InlineCode>) are <InlineCode>--muted</InlineCode>;{' '}
            <InlineCode>--accordion-item-open-background</InlineCode> is <InlineCode>--card</InlineCode> and{' '}
            <InlineCode>--accordion-open-border</InlineCode> is <InlineCode>--border</InlineCode>.
          </p>
        </Customization>

        <Section
          title={'Theming an accordion'}
          lead={(
            <React.Fragment>
              The variables, set on the root of one accordion here so only this one moves: a wider gap, a 2xl corner,
              no surface on a closed item, a primary border and a soft primary surface on the open one.
            </React.Fragment>
          )}
        >
          <Example of={theme} />
          <Prose>
            <p>
              In an application the same declarations go in <InlineCode>:root</InlineCode>, after the import. What
              varies by state, a stylesheet reaches through the attributes:
            </p>
          </Prose>
          <CodeBlock
            snippet={css`
              [data-slot='accordion'][data-variant='separated'] [data-slot='accordion-item'][data-open] {
                box-shadow: var(--shadow-sm);
              }
            `}
          />
        </Section>

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsInspector of={parts}
            rows={[
              {
                slot      : 'accordion',
                part      : 'The root',
                attributes: [ 'data-variant', 'data-radius', 'data-chevron-position', 'data-inset', 'data-multiple', 'data-orientation' ]
              },
              { slot: 'accordion-item', part: 'An item', attributes: [ 'data-open', 'data-closed', 'data-disabled', 'data-index' ] },
              { slot: 'accordion-header', part: 'The row of the heading and the actions' },
              { slot: 'accordion-trigger', part: 'The button inside the heading', attributes: [ 'data-panel-open', 'data-disabled' ] },
              { slot: 'accordion-chevron-box', part: 'The box of the arrow, one line tall' },
              { slot: 'accordion-chevron', part: 'The arrow, turned while open' },
              { slot: 'accordion-title', part: 'The title' },
              { slot: 'accordion-status', part: 'The mark after the title' },
              { slot: 'accordion-meta', part: 'The summary at the end of the button' },
              { slot: 'accordion-actions', part: 'The controls at the end of the header' },
              { slot: 'accordion-panel', part: 'The body, animated on its height; closed, only with keepMounted', attributes: [ 'data-open', 'data-closed' ] },
              { slot: 'accordion-content', part: 'The padding of the body, lined up with the title' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Accordion'}>
            <PropsTable
              props={accordionProps}
              rest={(
                <React.Fragment>
                  Every other prop goes to the root <InlineCode>{'<div>'}</InlineCode>.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'Accordion.Item'}>
            <PropsTable
              props={accordionItemProps}
              rest={(
                <React.Fragment>
                  Every other prop goes to the item’s <InlineCode>{'<div>'}</InlineCode>, except{' '}
                  <InlineCode>title</InlineCode>, which is the title of the item rather than the HTML attribute.
                </React.Fragment>
              )}
            />
          </SubSection>
          <Callout>
            It replaces <InlineCode>CollapsibleSection</InlineCode>: a section becomes an item, its{' '}
            <InlineCode>open</InlineCode> and <InlineCode>defaultOpen</InlineCode> the presence of its{' '}
            <InlineCode>value</InlineCode> in the set of the accordion.
          </Callout>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Give the summary a unit'}>
              “12 entries” says what is inside before anyone opens it. “12” makes the reader guess what was counted.
            </Guidance>
            <Guidance kind={'dont'} title={'Put a control in the title'}>
              The title is inside a button, and a control inside a button is invalid. Actions go in{' '}
              <InlineCode>actions</InlineCode>, beside the heading.
            </Guidance>
            <Guidance kind={'do'} title={'Keep mounted a body with fields'}>
              Without <InlineCode>keepMounted</InlineCode>, closing an item throws away what was typed in it, and
              the validation of the form stops seeing those fields.
            </Guidance>
            <Guidance kind={'dont'} title={'Hide what every visit needs'}>
              An item closed by default is an item most people never open. What is read every time stays in view.
            </Guidance>
            <Guidance kind={'do'} title={'Pick the variant from where it stands'}>
              In a card, the default: the card is the box. Alone on a page, contained. A list of answers, filled or
              separated.
            </Guidance>
            <Guidance kind={'dont'} title={'Draw a box around a default accordion'}>
              A border around it is what <InlineCode>contained</InlineCode> is for: it clips the hover and the corner
              of the first and last item, which a box drawn by hand does not.
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

export const Route = createFileRoute('/ui/actions/accordion')({
  component: AccordionPage
});
