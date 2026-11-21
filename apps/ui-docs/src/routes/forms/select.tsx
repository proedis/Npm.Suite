import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import selectProps from 'virtual:ui-props/SelectProps';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/forms/select/basic.tsx?example';
import controlled from '@/examples/forms/select/controlled.tsx?example';
import disabledOptions from '@/examples/forms/select/disabled-options.tsx?example';
import inContext from '@/examples/forms/select/in-context.tsx?example';
import labels from '@/examples/forms/select/labels.ts?source';
import required from '@/examples/forms/select/required.tsx?example';
import search from '@/examples/forms/select/search.tsx?example';
import server from '@/examples/forms/select/server.tsx?example';
import sizes from '@/examples/forms/select/sizes.tsx?example';
import states from '@/examples/forms/select/states.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/select');


/* --------
 * Page
 * -------- */

function SelectPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            One choice from a list that is not in view. The field looks like a TextInput, the list opens under it,
            and past eight options the list gets a search at its top. Every option arrives at once: a list that
            loads in pieces from the server is a Combobox.
          </React.Fragment>
        )}
        imports={tsx`
          import { Select } from '@proedis/ui/forms/select';
          import type { SelectLabels, SelectOption } from '@proedis/ui/forms/select';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Options and labels'}
          lead={(
            <React.Fragment>
              <InlineCode>options</InlineCode> is every choice, <InlineCode>{'{ value, label }'}</InlineCode>, in the
              order the list shows them. <InlineCode>labels</InlineCode> holds the few texts the field writes of its
              own, the placeholder of the search, the empty list and the name of the clear button: the package ships
              no visible string, so an application writes them once, in its language, and passes them everywhere.
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={labels} title={labels.file} />
          <Prose>
            <p>
              <InlineCode>placeholder</InlineCode> is a short invitation, “Select”: not an example, and never the label
              again. The label belongs to the <InlineCode>Field</InlineCode> around the Select, which names it and
              focuses it on a click without opening the list.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Search'}
          lead={(
            <React.Fragment>
              Past <InlineCode>searchThreshold</InlineCode> options, eight by default, the list opens with a search at
              its top. It ignores case and accents and keeps the order of the list, so “cantu” finds Cantù.
            </React.Fragment>
          )}
        >
          <Example of={search} />
          <Prose>
            <p>
              Two engines sit under one look. Up to the threshold the field runs on Base UI’s{' '}
              <InlineCode>Select</InlineCode>; past it, on its <InlineCode>Combobox</InlineCode>, because a select
              cannot hold a search. From the outside the two behave the same, and the switch never happens while the
              list is open: options that cross the threshold under an open list, from a load or a filter upstream,
              change the engine the next time it opens.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Controlled and uncontrolled'}
          lead={(
            <React.Fragment>
              <InlineCode>value</InlineCode> and <InlineCode>onValueChange</InlineCode> for a form that owns its state,{' '}
              <InlineCode>defaultValue</InlineCode> for one that reads the submitted <InlineCode>name</InlineCode>. The
              value is the option’s <InlineCode>value</InlineCode>, or <InlineCode>null</InlineCode> when empty.
            </React.Fragment>
          )}
        >
          <Example of={controlled} />
        </Section>

        <Section
          title={'Required and optional'}
          lead={(
            <React.Fragment>
              An optional field with a value has a button that empties it. It is not a Tab stop: from the keyboard,
              Delete or Backspace on the closed field do the same. A required field has no such button, and a{' '}
              <InlineCode>required</InlineCode> label of its <InlineCode>Field</InlineCode> is enough to say so.
            </React.Fragment>
          )}
        >
          <Example of={required} />
        </Section>

        <Section
          title={'States'}
          lead={(
            <React.Fragment>
              Read only, the field stays reachable and its text selectable, and it does not open. Disabled, it leaves
              the Tab order. Invalid, the frame turns red: inside a <InlineCode>Field</InlineCode> with a{' '}
              <InlineCode>Field.Error</InlineCode> that happens on its own. Loading, a spinner takes the place of the
              chevron, the value stays and the list does not open.
            </React.Fragment>
          )}
        >
          <Example of={states} />
          <Callout>
            <InlineCode>loadingLabel</InlineCode> is required with <InlineCode>loading</InlineCode>, by the type: the
            spinner says it to a screen reader, which would otherwise meet a field that does not open for no reason.
          </Callout>
        </Section>

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              <InlineCode>sm</InlineCode> in a filter bar or a table row, <InlineCode>md</InlineCode> in a form,{' '}
              <InlineCode>lg</InlineCode> where a field is the point of the screen. The heights are the ones of every
              text control, and grow one step on a touch screen.
            </React.Fragment>
          )}
        >
          <Example of={sizes} />
        </Section>

        <Section
          title={'An option no longer offered'}
          lead={(
            <React.Fragment>
              A value that the list no longer offers is still passed, <InlineCode>disabled</InlineCode>: the field
              shows its label instead of an empty box or a raw key, and the option cannot be chosen again.
            </React.Fragment>
          )}
        >
          <Example of={disabledOptions} />
        </Section>

        <Section
          title={'Options from the server'}
          lead={(
            <React.Fragment>
              A list that arrives from the server arrives whole: while it travels the field is{' '}
              <InlineCode>loading</InlineCode>, then it takes the options. The value can be there before the options
              are, and shows as soon as they arrive.
            </React.Fragment>
          )}
        >
          <Example of={server} />
        </Section>

        <Section
          title={'In context'}
          lead={'Planning a collection round: two short choices side by side, a longer one with a search under them.'}
        >
          <Example of={inContext} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The field is a button that opens a listbox; past the threshold, a combobox whose search holds the focus
              while the arrows move through the options. The label of the <InlineCode>Field</InlineCode> names it, and
              its description and error are joined to it.
            </p>
            <p>
              A letter typed on the closed field opens the list on the first option starting with it,{' '}
              <strong>and does not change the value</strong>: a key pressed by mistake never changes a form in
              silence. A press anywhere on the frame opens the list, its own buttons excepted.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'On the closed field, opens the list. In the list, chooses the option and closes it.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'On the closed field, opens the list.' ],
              [ <InlineCode key={'k'}>↓</InlineCode>, 'Opens the list, then moves to the next option.' ],
              [ <InlineCode key={'k'}>↑</InlineCode>, 'Moves to the previous option.' ],
              [ <InlineCode key={'k'}>A letter</InlineCode>, 'On the closed field, opens the list on the first option starting with it. In the search, types.' ],
              [ <InlineCode key={'k'}>Delete</InlineCode>, 'On the closed field of an optional Select, empties it. Backspace does the same.' ],
              [ <InlineCode key={'k'}>Esc</InlineCode>, 'Closes the list without changing the value.' ]
            ]}
          />
        </Section>

        <Section
          title={'Slots and data attributes'}
          lead={'The frame is the one of every text control; the list is the panel Menu and MultiSelect share.'}
        >
          <SlotsTable
            rows={[
              { slot: 'select', part: 'The frame', attributes: [ 'data-size', 'data-loading', 'data-invalid', 'data-readonly', 'data-disabled' ] },
              { slot: 'select-trigger', part: 'The button that opens the list, which takes the focus', attributes: [ 'data-field-control', 'data-popup-open' ] },
              { slot: 'select-value', part: 'The text of the value, or the placeholder', attributes: [ 'data-placeholder' ] },
              { slot: 'list-field-end', part: 'The end of the frame: the clear button and the chevron, or the spinner' },
              { slot: 'select-clear', part: 'The button that empties an optional field' },
              { slot: 'list-chevron', part: 'The chevron' },
              { slot: 'select-panel', part: 'The list, in a portal' },
              { slot: 'select-search', part: 'The search at the top of a long list' },
              { slot: 'select-search-input', part: 'Its input' },
              { slot: 'select-item', part: 'An option', attributes: [ 'data-option-value', 'data-selected', 'data-highlighted', 'data-disabled' ] },
              { slot: 'select-item-label', part: 'The label of an option' },
              { slot: 'select-item-tick', part: 'The tick of the chosen option' },
              { slot: 'select-empty', part: 'The line that replaces a search with no result' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={selectProps}
            rest={(
              <React.Fragment>
                The frame takes <InlineCode>className</InlineCode> and the shared props; every other prop, with the{' '}
                <InlineCode>ref</InlineCode>, reaches the button that opens the list, the element that takes the focus:{' '}
                <InlineCode>id</InlineCode>, <InlineCode>aria-*</InlineCode>, <InlineCode>onBlur</InlineCode> for a form
                library.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A Select for a foreign key'}>
              A field that points to another record is always a choice among the real records, never a text box where
              someone types an opaque id. When the records do not fit in one list, it is a Combobox.
            </Guidance>
            <Guidance kind={'dont'} title={'Repeat the label in the placeholder'}>
              “Select” is enough. The label is above, and a placeholder that repeats it is read twice and helps nobody.
            </Guidance>
            <Guidance kind={'do'} title={'A description on every field'}>
              Say what the value is for, or what it constrains: “Where the round starts” tells more than the word
              Depot alone.
            </Guidance>
            <Guidance kind={'dont'} title={'A Select for two or three options'}>
              Options that fit on screen are a RadioGroup: they are read at a glance and chosen with one click.
            </Guidance>
            <Guidance kind={'do'} title={'Pass a value that is no longer offered'}>
              Keep it in the options, disabled: the field shows its name, and the user sees why it can no longer be
              chosen.
            </Guidance>
            <Guidance kind={'dont'} title={'Load a long registry into a Select'}>
              A Select holds every option at once. A list of contracts or customers that the server pages is a
              Combobox, which searches on the server.
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

export const Route = createFileRoute('/forms/select')({
  component: SelectPage
});
