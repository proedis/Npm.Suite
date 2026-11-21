import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import groupProps from 'virtual:ui-props/ToggleGroupProps';
import toggleProps from 'virtual:ui-props/ToggleProps';

import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/actions/toggle/basic.tsx?example';
import groupStates from '@/examples/actions/toggle/group-states.tsx?example';
import group from '@/examples/actions/toggle/group.tsx?example';
import icons from '@/examples/actions/toggle/icons.tsx?example';
import inContext from '@/examples/actions/toggle/in-context.tsx?example';
import sizes from '@/examples/actions/toggle/sizes.tsx?example';
import states from '@/examples/actions/toggle/states.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/actions/toggle');


/* --------
 * Page
 * -------- */

function TogglePage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A button that stays on, in a bar: a view option or a tool. Off it is a quiet{' '}
            <InlineCode>plain muted</InlineCode> button, on it is filled with <InlineCode>primary</InlineCode>.{' '}
            <InlineCode>ToggleGroup</InlineCode> holds several that may be on together. Neither belongs in a form,
            where a value that is on or off is a Checkbox.
          </React.Fragment>
        )}
        imports={tsx`
          import { Toggle, ToggleGroup } from '@proedis/ui/actions/toggle';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Controlled and uncontrolled'}
          lead={(
            <React.Fragment>
              <InlineCode>pressed</InlineCode> and <InlineCode>onPressedChange</InlineCode> hand the state to you;{' '}
              <InlineCode>defaultPressed</InlineCode> leaves it to the toggle, outside a group only. The label does not
              change with the state: the state is <InlineCode>aria-pressed</InlineCode>, and a label that flips from
              “Show” to “Hide” would say the opposite of what the fill says.
            </React.Fragment>
          )}
        />

        <Section
          title={'Icons'}
          lead={(
            <React.Fragment>
              <InlineCode>leading</InlineCode> puts an icon before the label. With no label the toggle is square and
              icon only, its <InlineCode>aria-label</InlineCode> is required by the type, and it is also the text of
              the tooltip.
            </React.Fragment>
          )}
        >
          <Example of={icons} />
        </Section>

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              <InlineCode>sm</InlineCode> in a 28 pixel bar, <InlineCode>md</InlineCode> in an action bar. Inside a group
              the toggles take the size of the group unless they say otherwise.
            </React.Fragment>
          )}
        >
          <Example of={sizes} />
        </Section>

        <Section
          title={'Disabled and pending'}
          lead={(
            <React.Fragment>
              A disabled toggle stays reachable and its tooltip says why, through{' '}
              <InlineCode>disabledReason</InlineCode>. <InlineCode>pending</InlineCode> is a change being saved: clicks
              are ignored and nothing changes in its look, so a quick save does not flicker. Press the second one twice
              in a row.
            </React.Fragment>
          )}
        >
          <Example of={states} />
          <Callout>
            Neither state reaches Base UI as <InlineCode>disabled</InlineCode>, which would take the toggle out of the
            Tab order and out of the arrows of its group. Both render <InlineCode>aria-disabled</InlineCode> and{' '}
            <InlineCode>data-disabled</InlineCode> (or <InlineCode>data-pending</InlineCode>) and cancel the change.
          </Callout>
        </Section>

        <Section
          title={'ToggleGroup'}
          lead={(
            <React.Fragment>
              Toggles that are on together: “Columns”, “Layers”. More than one may always be on; one choice among
              views is a SegmentedControl. The value is the array of the items on, and each toggle in a group needs
              its <InlineCode>value</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={group} />

          <SubSection
            title={'Sizes, icons and a disabled group'}
            lead={(
              <React.Fragment>
                <InlineCode>size</InlineCode> on the group sets every item. The whole group can be off, with{' '}
                <InlineCode>disabledReason</InlineCode> repeated in the tooltip of each item, which stays in the
                arrow cycle.
              </React.Fragment>
            )}
          >
            <Example of={groupStates} />
          </SubSection>
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              The bar over a map: the layers as a group, following the vehicle as a toggle of its own, and refreshing
              as a plain IconButton, because it is an action and not a state.
            </React.Fragment>
          )}
        >
          <Example of={inContext} />
        </Section>

        <Section title={'Type safety'} lead={'A toggle or a group with no name does not compile.'}>
          <CodeBlock
            snippet={tsx`
              // @ts-expect-error: an icon only toggle needs aria-label
              <Toggle leading={<RefreshCw />} />

              // @ts-expect-error: aria-label or aria-labelledby is required
              <ToggleGroup defaultValue={[ 'stops' ]}>…</ToggleGroup>
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A toggle is a <InlineCode>{'<button>'}</InlineCode> with <InlineCode>aria-pressed</InlineCode>. Alone, its
              focus ring is the one of a Button, outside it; in a group the ring is drawn inside, so neighbours do not
              cover it.
            </p>
            <p>
              A group is one Tab stop: the arrows move between the items and loop, disabled items included, which
              Base UI alone would skip. Space or Enter switches the item with the focus.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves the focus to the toggle, or into the group and out of it.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Switches the toggle with the focus.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Switches the toggle with the focus.' ],
              [ <InlineCode key={'k'}>ArrowRight</InlineCode>, 'In a group, moves to the next item, and loops.' ],
              [ <InlineCode key={'k'}>ArrowLeft</InlineCode>, 'In a group, moves to the previous item, and loops.' ],
              [ <InlineCode key={'k'}>Home</InlineCode>, 'In a group, moves to the first item.' ],
              [ <InlineCode key={'k'}>End</InlineCode>, 'In a group, moves to the last item.' ]
            ]}
          />
        </Section>

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsTable
            rows={[
              { slot: 'toggle', part: 'The toggle', attributes: [ 'data-size', 'data-pressed', 'data-disabled', 'data-pending', 'data-icon-only' ] },
              { slot: 'toggle-content', part: 'The icon and the label, on one line' },
              { slot: 'toggle-leading', part: 'The icon' },
              { slot: 'toggle-group', part: 'The group', attributes: [ 'data-size', 'data-disabled', 'data-multiple' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Toggle'} id={'api-toggle'}>
            <PropsTable
              props={toggleProps}
              rest={<React.Fragment>Every other prop goes to the <InlineCode>{'<button>'}</InlineCode>, with the ref.</React.Fragment>}
            />
          </SubSection>
          <SubSection title={'ToggleGroup'} id={'api-toggle-group'}>
            <PropsTable
              props={groupProps}
              rest={<React.Fragment>Every other prop goes to the group, a <InlineCode>{'<div>'}</InlineCode>.</React.Fragment>}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A state, not an action'}>
              A toggle stays on. “Refresh” happens once and is a Button; “Auto refresh” stays on and is a toggle.
            </Guidance>
            <Guidance kind={'dont'} title={'Change the label with the state'}>
              The fill already says on or off. A label that turns into its opposite makes the reader wonder which of
              the two the button means.
            </Guidance>
            <Guidance kind={'do'} title={'Say why it is off'}>
              A disabled toggle keeps its tooltip: give it the reason, or the user is left pressing something that
              does nothing.
            </Guidance>
            <Guidance kind={'dont'} title={'A group for one choice'}>
              When exactly one item can be on, the control is a SegmentedControl, which is never empty.
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

export const Route = createFileRoute('/actions/toggle')({
  component: TogglePage
});
