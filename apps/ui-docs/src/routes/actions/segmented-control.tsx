import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import itemProps from 'virtual:ui-props/SegmentedControlItemProps';
import segmentedProps from 'virtual:ui-props/SegmentedControlProps';

import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/actions/segmented-control/basic.tsx?example';
import disabled from '@/examples/actions/segmented-control/disabled.tsx?example';
import icons from '@/examples/actions/segmented-control/icons.tsx?example';
import inContext from '@/examples/actions/segmented-control/in-context.tsx?example';
import period from '@/examples/actions/segmented-control/period.tsx?example';
import sizes from '@/examples/actions/segmented-control/sizes.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/actions/segmented-control');


/* --------
 * Page
 * -------- */

function SegmentedControlPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            One choice among a few views of the same thing: Table or Map, Day, Week or Month. A grey rail with the
            items inside, the chosen one filled with <InlineCode>primary</InlineCode> by an indicator that slides
            from the item chosen before. The choice applies at once and one item is always chosen. It lives in
            headers and bars; a value in a form is a Radio.
          </React.Fragment>
        )}
        imports={tsx`
          import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Choosing a view'}
          lead={(
            <React.Fragment>
              <InlineCode>value</InlineCode> and <InlineCode>onValueChange</InlineCode> hand the choice to you, which is
              where it belongs when the view is in the address of the page; <InlineCode>defaultValue</InlineCode>{' '}
              leaves it to the control. One of the two is required, because the control is never empty, and a click
              on the chosen item does not empty it.
            </React.Fragment>
          )}
        >
          <Example of={period} />
          <Prose>
            <p>
              The items share the width of the longest one, so a rail does not wobble when the labels differ, and the
              indicator measures its item again when a label, a font or the items change.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Icons'}
          lead={(
            <React.Fragment>
              <InlineCode>leading</InlineCode> puts an icon before the label. With no label at all the item is icon
              only: its <InlineCode>aria-label</InlineCode> is then required, by the type, and it is also the text of
              the tooltip the item shows on hover and focus.
            </React.Fragment>
          )}
        >
          <Example of={icons} />
        </Section>

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              <InlineCode>md</InlineCode> in a page header, <InlineCode>sm</InlineCode> in a card header or a 28 pixel
              bar. The rail takes the height of a control of that size.
            </React.Fragment>
          )}
        >
          <Example of={sizes} />
        </Section>

        <Section
          title={'Disabled'}
          lead={(
            <React.Fragment>
              An item that is off stays in the arrow cycle with its tooltip, and{' '}
              <InlineCode>disabledReason</InlineCode> says why. The whole control can be off too, and its reason is
              repeated on every item. The chosen item is never disabled: a view left without data stays chosen, and
              its content says so.
            </React.Fragment>
          )}
        >
          <Example of={disabled} />
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              The header of a list that switches between rows and a map. The control takes its name from the title of
              the card with <InlineCode>aria-labelledby</InlineCode>, and sits beside the action of the card at the
              small size.
            </React.Fragment>
          )}
        >
          <Example of={inContext} />
        </Section>

        <Section
          title={'Type safety'}
          lead={'A control nobody can name and a choice that could be empty do not compile.'}
        >
          <CodeBlock
            snippet={tsx`
              // No name for the control
              // @ts-expect-error: aria-label or aria-labelledby is required
              <SegmentedControl defaultValue={'day'}>…</SegmentedControl>

              // No choice at all
              // @ts-expect-error: value or defaultValue is required
              <SegmentedControl aria-label={'Period'}>…</SegmentedControl>

              // An icon with no name and no tooltip
              // @ts-expect-error: an item without a label needs aria-label
              <SegmentedControl.Item value={'map'} leading={<MapIcon />} />
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A group of buttons with <InlineCode>aria-pressed</InlineCode>, not a <InlineCode>radiogroup</InlineCode>,
              where the arrows would choose, nor a <InlineCode>tablist</InlineCode>, which asks for panels. The arrows
              move the focus and not the choice, so a view that loads a map does not start while the user passes over
              it: Space or Enter chooses.
            </p>
            <p>
              The control is one Tab stop. Tab enters on the chosen item, wherever the arrows left the focus before. A
              disabled item is <InlineCode>aria-disabled</InlineCode> rather than <InlineCode>disabled</InlineCode>, so
              it stays reachable and its tooltip can say why.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves the focus into the control, on the chosen item, then out of it.' ],
              [ <InlineCode key={'k'}>ArrowRight</InlineCode>, 'Moves to the next item, disabled ones included, and loops.' ],
              [ <InlineCode key={'k'}>ArrowLeft</InlineCode>, 'Moves to the previous item, and loops.' ],
              [ <InlineCode key={'k'}>Home</InlineCode>, 'Moves to the first item.' ],
              [ <InlineCode key={'k'}>End</InlineCode>, 'Moves to the last item.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Chooses the item with the focus.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Chooses the item with the focus.' ]
            ]}
          />
          <Callout>
            The arrows are written by the package rather than left to Base UI, whose toggle group skips an item marked{' '}
            <InlineCode>aria-disabled</InlineCode>: here a disabled item stays in the cycle, to show its reason.
          </Callout>
        </Section>

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsTable
            rows={[
              { slot: 'segmented-control', part: 'The rail', attributes: [ 'data-size', 'data-disabled' ] },
              { slot: 'segmented-control-indicator', part: 'The fill that slides under the chosen item', attributes: [ 'data-disabled' ] },
              { slot: 'segmented-control-item', part: 'An item', attributes: [ 'data-value', 'data-pressed', 'data-disabled', 'data-icon-only' ] },
              { slot: 'segmented-control-content', part: 'The icon and the label, on one line' },
              { slot: 'segmented-control-leading', part: 'The icon' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'SegmentedControl'} id={'api-segmented-control'}>
            <PropsTable
              props={segmentedProps}
              rest={<React.Fragment>Every other prop goes to the rail, a <InlineCode>{'<div>'}</InlineCode>.</React.Fragment>}
            />
          </SubSection>
          <SubSection title={'SegmentedControl.Item'} id={'api-segmented-control-item'}>
            <PropsTable
              props={itemProps}
              rest={<React.Fragment>Every other prop goes to the item, a <InlineCode>{'<button>'}</InlineCode>.</React.Fragment>}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A few views of the same thing'}>
              Day, Week, Month; Table or Map. A list that grows with the data, or that does not fit in a header, is a
              Select.
            </Guidance>
            <Guidance kind={'dont'} title={'Use it for a value in a form'}>
              A form field is saved with the form. A view applies at once. The first is a Radio group.
            </Guidance>
            <Guidance kind={'do'} title={'Keep the view in the address'}>
              Controlled from the URL, the view survives a reload and a shared link opens on the same view.
            </Guidance>
            <Guidance kind={'dont'} title={'Disable the chosen item'}>
              A view without data stays chosen and says so in its content. Taking the choice away leaves the control
              empty, which it can never be.
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

export const Route = createFileRoute('/actions/segmented-control')({
  component: SegmentedControlPage
});
