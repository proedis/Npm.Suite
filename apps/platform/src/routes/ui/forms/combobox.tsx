import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import multipleProps from 'virtual:ui-props/StrictMultipleComboboxProps';
import singleProps from 'virtual:ui-props/StrictSingleComboboxProps';
import themeDoc from 'virtual:ui-theme/forms/combobox';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/combobox/basic.tsx?example';
import inContext from '@/examples/forms/combobox/in-context.tsx?example';
import labelsMultiple from '@/examples/forms/combobox/labels-multiple.ts?source';
import labels from '@/examples/forms/combobox/labels.ts?source';
import multiple from '@/examples/forms/combobox/multiple.tsx?example';
import required from '@/examples/forms/combobox/required.tsx?example';
import scanner from '@/examples/forms/combobox/scanner.tsx?example';
import states from '@/examples/forms/combobox/states.tsx?example';
import tooMany from '@/examples/forms/combobox/too-many.tsx?example';
import useContractSearch from '@/examples/forms/combobox/useContractSearch.ts?source';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/forms/combobox');

/** The search props both variants share are documented once, on the single field */
const MULTIPLE_OWN = multipleProps.filter((prop) => prop.from !== 'StrictComboboxSearchProps');


/* --------
 * Page
 * -------- */

function ComboboxPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The choice of a record among results that arrive from the server: registries, estates, contracts, the
            lists that never load whole. The text is typed in the field, the results arrive as the server answers, and
            the value is always a record, never a text.
          </React.Fragment>
        )}
        imports={tsx`
          import { Combobox } from '@proedis/ui/forms/combobox';
          import type { ComboboxItem, ComboboxLabels, MultipleComboboxLabels } from '@proedis/ui/forms/combobox';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'The search is yours'}
          lead={(
            <React.Fragment>
              The Combobox does not search. It reports every change of the text through{' '}
              <InlineCode>onInputValueChange</InlineCode>, and draws the <InlineCode>items</InlineCode> it is given,
              with the state of the search: <InlineCode>searching</InlineCode>, <InlineCode>searchError</InlineCode>,{' '}
              <InlineCode>hasMore</InlineCode>. In an application those come from <InlineCode>useSearchQuery</InlineCode>{' '}
              of <InlineCode>@proedis/react-query</InlineCode>, which debounces the term and keeps the last answer; the
              examples on this page use a small hook that does the same against a registry in memory, with a delay.
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={useContractSearch} title={useContractSearch.file} maxHeight={420} />
          <Prose>
            <p>
              An item is <InlineCode>{'{ value, label, code?, description? }'}</InlineCode>: the label is the first line
              and the text of the field at rest, the code sits on the right of the field and opens the second line,
              the description completes it.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Value and selectedItem'}
          lead={(
            <React.Fragment>
              <InlineCode>value</InlineCode> is the key of the chosen record, and <InlineCode>onValueChange</InlineCode>{' '}
              hands back the key and the record. <InlineCode>selectedItem</InlineCode> is that record: the field shows it
              without asking the server, so a form opened on an existing value draws it at once, even when no search
              would find it today.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              const [ contract, setContract ] = React.useState<ComboboxItem | null>(order.contract);

              <Combobox
                value={contract?.value ?? null}
                selectedItem={contract}
                onValueChange={(_key, item) => setContract(item)}
                labels={labels}
                {...search}
              />
            `}
          />
        </Section>

        <Section
          title={'Labels'}
          lead={(
            <React.Fragment>
              A search speaks a lot, and every word is yours: the hint under the minimum, the wait, the count announced
              on arrival, the empty answer with the term, the footer past the limit, the error and its retry. The ones
              with a number or a text in them are functions.
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={labels} title={labels.file} />
        </Section>

        <Section
          title={'States of a search'}
          lead={(
            <React.Fragment>
              Under <InlineCode>minChars</InlineCode>, two by default, nothing is searched and the list says why. The
              spinner and “Searching…” appear only past 300ms, so a fast server shows no flicker. An empty answer says
              what was not found. After an error the only item is “Retry”, already active: Enter retries.
            </React.Fragment>
          )}
        >
          <Example of={states} />
        </Section>

        <Section
          title={'More results than shown'}
          lead={(
            <React.Fragment>
              The server sends the first results and says there are more: <InlineCode>hasMore</InlineCode> adds a
              footer under the list that asks to narrow the search. A list of a hundred holders is never the answer.
            </React.Fragment>
          )}
        >
          <Example of={tooMany} />
        </Section>

        <Section
          title={'Enter and the barcode scanner'}
          lead={(
            <React.Fragment>
              A scanner types a code and presses Enter before the debounce is over. Enter during a search therefore
              waits for the answer to that very term, then picks a record on its own only when its code matches
              exactly. <InlineCode>resultsFor</InlineCode> says which term the items answer, and{' '}
              <InlineCode>onFlush</InlineCode> ends the debounce at once so the wait is the request alone.
            </React.Fragment>
          )}
        >
          <Example of={scanner} />
        </Section>

        <Section
          title={'Required and optional'}
          lead={(
            <React.Fragment>
              The defaults of a combobox lose records, so two are turned off: emptying the text does not empty the
              value on the spot, and Esc does not clear it. Leaving without choosing gives the value back; an emptied
              text empties an optional field on leaving, never a required one, which also has no x.
            </React.Fragment>
          )}
        >
          <Example of={required} />
          <Prose>
            <p>
              While someone types over a value, a line at the top of the list recalls what stays if they leave, “Current
              value: Gallo Anna · UT-004812”. The first Esc closes the list, the second gives the text back when it
              differs from the value, and only a third goes on to the container, so a dialog closes on purpose.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Several records'}
          lead={(
            <React.Fragment>
              <InlineCode>multiple</InlineCode> turns the field into the MultiSelect of a server list: chips in the
              order the records were chosen, a search inside the list, a box per result, a footer that clears them
              all. <InlineCode>selectedItems</InlineCode> holds the chosen records, so the chips keep their labels
              whatever the current search returns. In the list the chosen records come first, ticked, then the
              results that are not already among them: a record is unticked where it was ticked.
            </React.Fragment>
          )}
        >
          <Example of={multiple} />
          <CodeBlock snippet={labelsMultiple} title={labelsMultiple.file} />
          <Callout>
            The multiple field takes neither <InlineCode>resultsFor</InlineCode> nor <InlineCode>onFlush</InlineCode>:
            it has no pending Enter to resolve. Spread the search without them, as the example does, or the two reach
            the DOM.
          </Callout>
        </Section>

        <Section
          title={'In context'}
          lead={'Delivering a container: the contract is a record of a registry with thousands of rows, so it is searched, never listed.'}
        >
          <Example of={inContext} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The single field is a combobox: the text holds the focus while the arrows move through the results. Every
              answer that arrives is announced in a status region, “5 contracts found”, “No contract for…”, “Search
              failed”, so a screen reader hears what the eye sees appear under the field.
            </p>
            <p>
              The x of an optional field and the chevron are not Tab stops. The multiple field takes the focus on the
              button under its chips, as the MultiSelect does, and searches from inside the list.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>↓</InlineCode>, 'Opens the list, then moves to the next result.' ],
              [ <InlineCode key={'k'}>↑</InlineCode>, 'Moves to the previous result.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Chooses the result. During a search, waits for the answer and picks an exact code only.' ],
              [ <InlineCode key={'k'}>Esc</InlineCode>, 'Closes the list; again, gives the text back; again, goes on to the container.' ],
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Leaves the field. Without a choice, the value comes back.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SubSection title={'Single'} id={'slots-single'}>
            <SlotsInspector of={required}
              rows={[
                { slot: 'combobox', part: 'The frame', attributes: [ 'data-size', 'data-invalid', 'data-readonly', 'data-disabled' ] },
                { slot: 'combobox-input', part: 'The text, which takes the focus', attributes: [ 'data-field-control' ] },
                { slot: 'combobox-code', part: 'The code of the value, on the right of the text at rest' },
                { slot: 'combobox-end', part: 'The end of the frame: the x, the chevron or the spinner' },
                { slot: 'combobox-clear', part: 'The x of an optional field' },
                { slot: 'combobox-chevron', part: 'The chevron' },
                { slot: 'combobox-panel', part: 'The list, in a portal' },
                { slot: 'combobox-current', part: 'The line that recalls the value while typing' },
                { slot: 'combobox-message', part: 'The hint, the wait, the empty answer or the error' },
                { slot: 'combobox-item', part: 'A result, or “Retry” after an error', attributes: [ 'data-highlighted' ] },
                { slot: 'combobox-item-text', part: 'Its two lines' },
                { slot: 'combobox-too-many', part: 'The footer past the limit' },
                { slot: 'combobox-status', part: 'The status region that announces each answer' }
              ]}
            />
          </SubSection>
          <SubSection title={'Multiple'} id={'slots-multiple'}>
            <SlotsInspector of={multiple}
              rows={[
                { slot: 'combobox-trigger', part: 'The button under the chips, which takes the focus' },
                { slot: 'combobox-chips', part: 'The row of chips' },
                { slot: 'combobox-chip', part: 'A chip' },
                { slot: 'combobox-chip-remove', part: 'The x of a chip' },
                { slot: 'combobox-more', part: 'The “+N” chip' },
                { slot: 'combobox-search', part: 'The search inside the list' },
                { slot: 'combobox-item-box', part: 'The box of a result' },
                { slot: 'combobox-item-label', part: 'The label of a result' },
                { slot: 'combobox-retry', part: 'The “Retry” item after an error' },
                { slot: 'combobox-footer', part: 'The footer of actions, with “Clear all”' }
              ]}
            />
          </SubSection>
        </Section>

        <Section title={'API'}>
          <SubSection title={'Combobox'} id={'api-single'}>
            <PropsTable
              props={singleProps}
              rest={(
                <React.Fragment>
                  The frame takes <InlineCode>className</InlineCode> and the shared props; every other prop, with the{' '}
                  <InlineCode>ref</InlineCode>, reaches the text. <InlineCode>minChars</InlineCode> defaults to 2,{' '}
                  <InlineCode>size</InlineCode> to <InlineCode>md</InlineCode>.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'Combobox multiple'} id={'api-multiple'}>
            <PropsTable
              props={MULTIPLE_OWN}
              rest={(
                <React.Fragment>
                  With <InlineCode>multiple</InlineCode>, the search props of the single field above, except{' '}
                  <InlineCode>resultsFor</InlineCode> and <InlineCode>onFlush</InlineCode>. Every other prop, with the{' '}
                  <InlineCode>ref</InlineCode>, reaches the button under the chips. <InlineCode>maxChips</InlineCode>{' '}
                  defaults to 3.
                </React.Fragment>
              )}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A Combobox for a registry'}>
              Contracts, customers, estates: whatever the server pages is searched, never listed. A Select would load
              every row into the browser to show eight.
            </Guidance>
            <Guidance kind={'dont'} title={'A text field for a foreign key'}>
              Never let someone type an id. The field always ends on a record, chosen from what the server found.
            </Guidance>
            <Guidance kind={'do'} title={'Pass the record with the value'}>
              <InlineCode>selectedItem</InlineCode> lets the field show its value without a request, and keeps a record
              that a search would no longer find.
            </Guidance>
            <Guidance kind={'dont'} title={'Answer every keystroke'}>
              Debounce the term and keep the last answer, as <InlineCode>useSearchQuery</InlineCode> does: a request
              per letter is a race the user loses.
            </Guidance>
            <Guidance kind={'do'} title={'Search everything that identifies a record'}>
              The code, the holder, the address: the hint under the minimum says which, and the user types what they
              have in front of them.
            </Guidance>
            <Guidance kind={'dont'} title={'Hide that there are more'}>
              Pass <InlineCode>hasMore</InlineCode>. Eight results that look like all of them send the user away with
              the wrong record.
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

export const Route = createFileRoute('/ui/forms/combobox')({
  component: ComboboxPage
});
