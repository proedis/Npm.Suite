import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import itemProps from 'virtual:ui-props/StrictItemProps';
import themeDoc from 'virtual:ui-theme/display/item';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/display/item/basic.tsx?example';
import link from '@/examples/display/item/link.tsx?example';
import list from '@/examples/display/item/list.tsx?example';
import responsive from '@/examples/display/item/responsive.tsx?example';
import truncation from '@/examples/display/item/truncation.tsx?example';
import vertical from '@/examples/display/item/vertical.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/display/item');

const PROPS = refineProps(itemProps, {
  inset      : { description: 'Row padding on the item itself, so the hover of an interactive row fills it edge to edge.' },
  interactive: { description: 'The cursor, the hover and the focus ring of a row that is pressed. The affordance only: the element and its semantics are yours.' },
  direction  : { default: '\'horizontal\'' }
});


/* --------
 * Page
 * -------- */

function ItemPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The row: a leading visual, a block of text, a tail. The workhorse of every list, every settings screen and
            every summary panel, and the reason it exists rather than a row of three children is the plumbing that lets
            a long title truncate while the actions stay in view.
          </React.Fragment>
        )}
        imports={tsx`
          import { Item } from '@proedis/ui/display/item';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Anatomy'}
          lead={(
            <React.Fragment>
              Any child goes in the row. Three of them have a role: a <InlineCode>Heading</InlineCode> or a{' '}
              <InlineCode>LabeledContent</InlineCode> takes the free space, <InlineCode>Item.Actions</InlineCode> holds the
              controls at the end and never shrinks, <InlineCode>Item.Trailing</InlineCode> is the quiet affordance at the
              very end, a chevron, a count, a unit, tight against the edge.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              The leading visual needs no slot: <InlineCode>IconBox</InlineCode>, <InlineCode>Spinner</InlineCode> and{' '}
              <InlineCode>Avatar</InlineCode> already refuse to shrink, so anything from the package can be a direct child.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Truncation'}
          lead={(
            <React.Fragment>
              The heading grows and has <InlineCode>min-w-0</InlineCode>, the actions do not shrink: the pressure of a long
              title lands on the title, which truncates, and never on the buttons. Drag the preview narrower to see it.
            </React.Fragment>
          )}
        >
          <Example of={truncation} resizable />
          <Callout>
            The plumbing is a descendant rule on the item, so it beats a class on the heading itself: a{' '}
            <InlineCode>grow-0</InlineCode> on the heading loses. That is the price of nobody having to remember the
            plumbing; the way out is a <InlineCode>className</InlineCode> on the item.
          </Callout>
        </Section>

        <Section
          title={'Interactive rows'}
          lead={(
            <React.Fragment>
              <InlineCode>interactive</InlineCode> gives the cursor, the hover and the focus ring, and nothing else. The
              semantics stay yours, and the element decides them.
            </React.Fragment>
          )}
        >
          <SubSection
            title={'A row that is a button'}
            lead={(
              <React.Fragment>
                With no control inside it, the whole row can be one: <InlineCode>as={'{\'button\'}'}</InlineCode> with{' '}
                <InlineCode>type={'{\'button\'}'}</InlineCode>. <InlineCode>inset</InlineCode> puts the padding on the row
                itself, so the hover fills it edge to edge.
              </React.Fragment>
            )}
          >
            <Example of={list} />
          </SubSection>
          <SubSection
            title={'A row that navigates'}
            lead={'The router’s link is the element: a real anchor, with the middle click and a new tab.'}
          >
            <Example of={link} />
          </SubSection>
          <Callout tone={'warning'} title={'No button semantics on a div'}>
            A row with an <InlineCode>onClick</InlineCode> on a <InlineCode>div</InlineCode> cannot be reached from the
            keyboard, and a row with its own actions cannot be a button: a button inside a button is invalid. In that case
            the row is not clickable, the actions are.
          </Callout>
        </Section>

        <Section
          title={'Direction'}
          lead={(
            <React.Fragment>
              <InlineCode>direction={'{\'vertical\'}'}</InlineCode> with the default centre alignment is the shape of an
              empty state: the visual above the text instead of beside it.
            </React.Fragment>
          )}
        >
          <Example of={vertical} />
          <SubSection
            title={'Per breakpoint'}
            lead={(
              <React.Fragment>
                <InlineCode>direction</InlineCode>, <InlineCode>align</InlineCode> and <InlineCode>gap</InlineCode> take one
                value per breakpoint. The heading grows without changing its basis, so the same plumbing is right in a row
                and inert in a column, with nothing to switch.
              </React.Fragment>
            )}
          >
            <Example of={responsive} resizable />
          </SubSection>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              An item is a layout: it adds no role. A list of items is a list when you make it one, a{' '}
              <InlineCode>ul</InlineCode> with an <InlineCode>li</InlineCode> per row as in the examples. The focus ring of{' '}
              <InlineCode>interactive</InlineCode> shows for the keyboard on the element you rendered.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'item', part: 'The row', attributes: [ 'data-inset', 'data-interactive' ] },
              { slot: 'item-actions', part: 'The controls at the end' },
              { slot: 'item-trailing', part: 'The affordance at the very end' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Item'} id={'api-item'}>
            <PropsTable props={PROPS} rest={'Polymorphic, a div by default: every other prop goes to the element.'} />
          </SubSection>
          <SubSection title={'Item.Actions and Item.Trailing'} id={'api-item-parts'}>
            <Prose>
              <p>
                No props of their own beyond the shared ones. Both are polymorphic: <InlineCode>Item.Actions</InlineCode> is a
                horizontal row with a gap, a <InlineCode>div</InlineCode> by default; <InlineCode>Item.Trailing</InlineCode> is
                quiet, with no gap, a <InlineCode>span</InlineCode> by default.
              </p>
            </Prose>
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Let the title truncate'}>
              Put the text in a Heading with <InlineCode>lines={'{1}'}</InlineCode>. The row keeps its height and its
              actions, whatever the length of the data.
            </Guidance>
            <Guidance kind={'dont'} title={'Give the row a card look'}>
              An item has no chrome. A boxed row is a Surface around an Item: one element, and the card stays one
              component.
            </Guidance>
            <Guidance kind={'do'} title={'Choose the element first'}>
              A button, a link, or nothing: the element says what the row does, <InlineCode>interactive</InlineCode> only
              says that it does something.
            </Guidance>
            <Guidance kind={'dont'} title={'Make a row with actions clickable'}>
              Either the row is the control or its actions are. Both at once nests controls.
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

export const Route = createFileRoute('/display/item')({
  component: ItemPage
});
