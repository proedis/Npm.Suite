import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import collapsibleProps from 'virtual:ui-props/CollapsibleSectionProps';
import themeDoc from 'virtual:ui-theme/actions/collapsible';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/actions/collapsible/basic.tsx?example';
import controlled from '@/examples/actions/collapsible/controlled.tsx?example';
import inContext from '@/examples/actions/collapsible/in-context.tsx?example';
import inset from '@/examples/actions/collapsible/inset.tsx?example';
import keepMounted from '@/examples/actions/collapsible/keep-mounted.tsx?example';
import parts from '@/examples/actions/collapsible/parts.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/actions/collapsible');


/* --------
 * Page
 * -------- */

function CollapsibleSectionPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A section that opens and closes from its header: an arrow, the title, a mark, a summary on the right,
            the actions at the end, and the body under them. A piece of layout rather than a container, it stands
            in a form, a detail or a page, and several of them stack into a list of sections divided by hairlines.
          </React.Fragment>
        )}
        imports={tsx`
          import { CollapsibleSection } from '@proedis/ui/actions/collapsible';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Header parts'}
          lead={(
            <React.Fragment>
              <InlineCode>status</InlineCode> sits right after the title, a mark such as “Modified” with its dot.{' '}
              <InlineCode>meta</InlineCode> is the summary at the end of the button, always with its unit: “4
              containers”, never “4”. <InlineCode>actions</InlineCode> are controls at the end of the header,
              outside the button, because a control never goes inside another one.
            </React.Fragment>
          )}
        >
          <Example of={parts} />
          <Prose>
            <p>
              Stacked sections draw a hairline above each one and one under the last, so a list of them reads as a
              list with no container around it. A long title wraps, and the arrow stays on its first line.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Controlled'}
          lead={(
            <React.Fragment>
              Closed by default and not remembered between visits. <InlineCode>defaultOpen</InlineCode> opens it the
              first time; <InlineCode>open</InlineCode> and <InlineCode>onOpenChange</InlineCode> hand the state to
              you, for an “Open all” or to open the section that holds an error.
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
              <InlineCode>inset</InlineCode> runs the header edge to edge of a card: the padding of the card moves
              inside the button, the focus ring is drawn inside it so the card does not cut it, and the body takes
              the whole width and places its own content. It is how the groups of a CheckboxGrid are drawn.
            </React.Fragment>
          )}
        >
          <Example of={inset} />
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              The detail of a collection point: the sections are headings under the title of the page, so{' '}
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
              The header is a real heading, <InlineCode>h3</InlineCode> unless <InlineCode>headingLevel</InlineCode>{' '}
              says otherwise, with a full width button inside it: the sections can be browsed by their headings
              even while closed. Base UI’s <InlineCode>Collapsible</InlineCode> owns{' '}
              <InlineCode>aria-expanded</InlineCode>, <InlineCode>aria-controls</InlineCode> and the hidden body.
            </p>
            <p>
              The name of the button is the title, the mark and the summary, joined with{' '}
              <InlineCode>aria-labelledby</InlineCode>, so the package adds no word of its own. The height is not
              animated, since a body can be dozens of rows long: only the arrow turns, and not even that with
              reduced motion.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves to the header button, then to the actions, then into the open body.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Opens or closes the section.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Opens or closes the section.' ]
            ]}
          />
          <Callout>
            Several sections open together need no group, which is why this is Base UI’s{' '}
            <InlineCode>Collapsible</InlineCode> rather than its <InlineCode>Accordion</InlineCode>.
          </Callout>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsTable
            rows={[
              { slot: 'collapsible-section', part: 'The section', attributes: [ 'data-heading-level', 'data-open', 'data-closed', 'data-inset' ] },
              { slot: 'collapsible-section-header', part: 'The row of the heading and the actions' },
              { slot: 'collapsible-section-trigger', part: 'The button inside the heading', attributes: [ 'data-panel-open' ] },
              { slot: 'collapsible-section-chevron-box', part: 'The box of the arrow, one line tall' },
              { slot: 'collapsible-section-chevron', part: 'The arrow, turned while open' },
              { slot: 'collapsible-section-title', part: 'The title' },
              { slot: 'collapsible-section-status', part: 'The mark after the title' },
              { slot: 'collapsible-section-meta', part: 'The summary at the end of the button' },
              { slot: 'collapsible-section-actions', part: 'The controls at the end of the header' },
              { slot: 'collapsible-section-panel', part: 'The body; closed, only with keepMounted', attributes: [ 'data-open', 'data-closed' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={collapsibleProps}
            rest={(
              <React.Fragment>
                Every other prop goes to the root <InlineCode>{'<div>'}</InlineCode>, except{' '}
                <InlineCode>title</InlineCode>, which is the title of the section rather than the HTML attribute.
              </React.Fragment>
            )}
          />
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
              Without <InlineCode>keepMounted</InlineCode>, closing a section throws away what was typed in it, and
              the validation of the form stops seeing those fields.
            </Guidance>
            <Guidance kind={'dont'} title={'Hide what every visit needs'}>
              A section closed by default is a section most people never open. What is read every time stays in
              view.
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

export const Route = createFileRoute('/actions/collapsible')({
  component: CollapsibleSectionPage
});
