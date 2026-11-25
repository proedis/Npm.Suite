import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import multiSelectProps from 'virtual:ui-props/MultiSelectProps';
import themeDoc from 'virtual:ui-theme/forms/multi-select';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/multi-select/basic.tsx?example';
import chips from '@/examples/forms/multi-select/chips.tsx?example';
import inContext from '@/examples/forms/multi-select/in-context.tsx?example';
import labels from '@/examples/forms/multi-select/labels.ts?source';
import search from '@/examples/forms/multi-select/search.tsx?example';
import states from '@/examples/forms/multi-select/states.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/forms/multi-select');


/* --------
 * Page
 * -------- */

function MultiSelectPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Several choices from a list that is not in view. Closed, the field shows a chip per value on one row;
            open, the list of the Select with a box per option, a search past eight options, and a footer that checks
            or clears them all.
          </React.Fragment>
        )}
        imports={tsx`
          import { MultiSelect } from '@proedis/ui/forms/multi-select';
          import type { MultiSelectLabels, SelectOption } from '@proedis/ui/forms/multi-select';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Options, value and labels'}
          lead={(
            <React.Fragment>
              The options are the ones of a Select, <InlineCode>{'{ value, label, disabled? }'}</InlineCode>, and the
              value is the array of the chosen ones, <strong>always in the order of the list</strong> rather than the
              order they were ticked in. A box counts at once and keeps the list open, and the options never move
              when checked: the one under the pointer stays the one under the pointer.
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={labels} title={labels.file} />
          <Prose>
            <p>
              Three of the labels are functions, because they carry a count or a name:{' '}
              <InlineCode>remove</InlineCode> names the x of a chip with its value, <InlineCode>more</InlineCode> names
              the “+N” chip, <InlineCode>moreRest</InlineCode> closes its tooltip past the tenth value.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Chips and +N'}
          lead={(
            <React.Fragment>
              Up to <InlineCode>maxChips</InlineCode> values show as chips, three by default; the rest go into a
              “+N” chip whose tooltip lists them, ten at most and then a closing line. A chip’s x removes its value
              without opening the list, and is not a Tab stop: a field with twenty values is still one stop.
            </React.Fragment>
          )}
        >
          <Example of={chips} />
        </Section>

        <Section
          title={'Search and the footer'}
          lead={(
            <React.Fragment>
              Past <InlineCode>searchThreshold</InlineCode> options the list gets a search, which stays after a tick so
              several values can be picked from one search. The footer checks every option that can change, or clears
              them: while searching, <strong>only the ones found</strong>.
            </React.Fragment>
          )}
        >
          <Example of={search} />
        </Section>

        <Section
          title={'States'}
          lead={(
            <React.Fragment>
              Read only, every value is in view: the chips wrap and nothing opens. A chosen option that is disabled
              stays chosen and its chip has no x, so a value no longer offered survives an edit. Invalid, disabled and
              loading work as in every text control.
            </React.Fragment>
          )}
        >
          <Example of={states} />
          <Callout>
            <InlineCode>loadingLabel</InlineCode> is required with <InlineCode>loading</InlineCode>, by the type, as in
            the Select.
          </Callout>
        </Section>

        <Section
          title={'In context'}
          lead={'The filters of a report: two small fields side by side, where an empty field means every value.'}
        >
          <Example of={inContext} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The element that takes the focus is the button under the chips, and the label of the{' '}
              <InlineCode>Field</InlineCode> names it. Open, the list is a listbox that allows several choices, its
              options announced as checked or not. The chips are for the eye: their x buttons and the “+N” are not Tab
              stops, and every value is already in the list.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'On the closed field, opens the list. In the list, checks or clears the option and keeps the list open.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'On the closed field, opens the list.' ],
              [ <InlineCode key={'k'}>↓</InlineCode>, 'Opens the list, then moves to the next option.' ],
              [ <InlineCode key={'k'}>Esc</InlineCode>, 'Closes the list. The values checked stay checked.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={chips}
            rows={[
              { slot: 'multi-select', part: 'The frame', attributes: [ 'data-size', 'data-loading', 'data-invalid', 'data-readonly', 'data-disabled' ] },
              { slot: 'multi-select-chips', part: 'The row of chips' },
              { slot: 'multi-select-chip', part: 'A chip' },
              { slot: 'multi-select-chip-remove', part: 'The x of a chip' },
              { slot: 'multi-select-more', part: 'The “+N” chip, with its tooltip' },
              { slot: 'multi-select-trigger', part: 'The button under the chips, which takes the focus', attributes: [ 'data-field-control', 'data-popup-open' ] },
              { slot: 'multi-select-panel', part: 'The list, in a portal' },
              { slot: 'multi-select-search', part: 'The search at the top of a long list' },
              { slot: 'multi-select-search-input', part: 'Its input' },
              { slot: 'multi-select-empty', part: 'The line that replaces a search with no result' },
              { slot: 'multi-select-item', part: 'An option', attributes: [ 'data-selected', 'data-highlighted', 'data-disabled' ] },
              { slot: 'multi-select-item-box', part: 'The box of an option' },
              { slot: 'multi-select-item-label', part: 'The label of an option' },
              { slot: 'multi-select-footer', part: 'The footer of the list' },
              { slot: 'multi-select-select-all', part: 'Its “Select all” button' },
              { slot: 'multi-select-clear-all', part: 'Its “Clear” button' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={multiSelectProps}
            rest={(
              <React.Fragment>
                The frame takes <InlineCode>className</InlineCode> and the shared props; every other prop, with the{' '}
                <InlineCode>ref</InlineCode>, reaches the button under the chips. <InlineCode>size</InlineCode> defaults
                to <InlineCode>md</InlineCode>, <InlineCode>searchThreshold</InlineCode> to 8,{' '}
                <InlineCode>maxChips</InlineCode> to 3.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A MultiSelect when the options are not in view'}>
              A long list of towns, a set of kinds that would crowd the form: the chips say what is chosen without
              taking the space of every option.
            </Guidance>
            <Guidance kind={'dont'} title={'A MultiSelect for a few options'}>
              Up to seven options that fit on screen are a CheckboxGroup: read at a glance, with no list to open.
            </Guidance>
            <Guidance kind={'do'} title={'Say what an empty field means'}>
              In a filter an empty field is “every value”: write it in the placeholder, “All”, and the user does not
              have to guess.
            </Guidance>
            <Guidance kind={'dont'} title={'Raise maxChips to show everything'}>
              A row of ten chips pushes the form around and is read by nobody. The “+N” and its tooltip are the point.
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

export const Route = createFileRoute('/ui/forms/multi-select')({
  component: MultiSelectPage
});
