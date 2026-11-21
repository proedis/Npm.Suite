import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import commonProps from 'virtual:ui-props/ModalSelectorCommonProps';
import fieldLabelsProps from 'virtual:ui-props/ModalSelectorFieldLabels';
import labelsProps from 'virtual:ui-props/ModalSelectorLabels';
import multipleProps from 'virtual:ui-props/MultipleModalSelectorProps';
import singleProps from 'virtual:ui-props/SingleModalSelectorProps';
import fieldProps from 'virtual:ui-props/StrictModalSelectorFieldProps';

import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import customersSource from '@/examples/data/modal-selector/customers.ts?source';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import FormatsShell from '@/examples/data/FormatsShell';
import multiple from '@/examples/data/modal-selector/multiple.tsx?example';
import server from '@/examples/data/modal-selector/server.tsx?example';
import single from '@/examples/data/modal-selector/single.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/data/modal-selector');

/** Only what a selector adds to the props every selector shares */
const SINGLE_OWN = singleProps.filter((prop) => !prop.from);

const MULTIPLE_OWN = multipleProps.filter((prop) => !prop.from);


/* --------
 * Page
 * -------- */

function ModalSelectorPage(): React.ReactNode {
  return (
    <FormatsShell>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The choice of one record, or several, from a list too long for a dropdown: a customer among thousands, the
            contracts of a town. A dialog with a search, the filters of the FiltersBar and a compact table with the
            kinds of the Table. <InlineCode>ModalSelectorField</InlineCode> is the field of a form that opens it and
            shows what was chosen.
          </React.Fragment>
        )}
        imports={tsx`
          import { ModalSelector, ModalSelectorField } from '@proedis/ui/data/modal-selector';

          import type { ModalSelectorColumn, ModalSelectorLabels } from '@proedis/ui/data/modal-selector';
        `}
      />

      <PageBody>
        <Example of={single} />

        <Section
          title={'Setup'}
          lead={(
            <React.Fragment>
              The cells read the same <InlineCode>TableFormatsProvider</InlineCode> as the Table, so a date or an enum
              reads the same in a list and in its selector. The module of the entity declares its columns, the name a
              chosen row reads as, and the texts, once:
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={customersSource} title={customersSource.file} />
          <Prose>
            <p>
              A column is a column of the Table without <InlineCode>custom</InlineCode>, sorting and links: here the
              code does not open the detail, and the order is the server’s, relevance with the exact code first. Four
              columns at most, one of them <InlineCode>fill</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section
          title={'One value'}
          lead={(
            <React.Fragment>
              With one value, the arrows choose a row and the primary button confirms it. The dialog opens on the
              current value, and the footer shows it even when the search does not find it, with a “Current” note on its
              row. <InlineCode>confirmLabel</InlineCode> names the primary: “Choose”, “Assign”.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              <InlineCode>enableRowSelection</InlineCode> returns <InlineCode>true</InlineCode> or a{' '}
              <InlineCode>&#123; note, reason &#125;</InlineCode>: the note sits after the name, the reason is read by a
              screen reader. In the first example the customers with unpaid invoices cannot be chosen.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Several values'}
          lead={(
            <React.Fragment>
              <InlineCode>multiple</InlineCode> ticks rows instead of choosing one, and the primary takes them all, its
              label built with the count. The choices stay when the search and the filters change; “Show only the
              chosen ones” in the footer suspends both, to review what is ticked. The field shows the first chosen
              values as chips and the rest as “+N”.
            </React.Fragment>
          )}
        >
          <Example of={multiple} />
          <Prose>
            <p>
              <InlineCode>supportsAll</InlineCode> says the action works on a filter too: “Select all” appears in the
              count line and chooses every row of the search, and <InlineCode>onConfirm</InlineCode> receives the same{' '}
              <InlineCode>TableSelection</InlineCode> as the Table, <InlineCode>&#123; all: true, excludedIds &#125;</InlineCode>{' '}
              for the server to resolve. Changing the search or the filters undoes it. Closing with choices not
              confirmed asks first, with <InlineCode>discard</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Searching the server'}
          lead={(
            <React.Fragment>
              The default mode is <InlineCode>server</InlineCode>: the page searches, filters and hands over the rows, at
              most <InlineCode>limit</InlineCode> of them, 50 by default. One more row than the limit only says there are
              others: <InlineCode>hasMore</InlineCode> and <InlineCode>rowCount</InlineCode> word the line under the
              list. <InlineCode>status</InlineCode> is the Table’s: the rows of the last answer stay while the next one
              arrives.
            </React.Fragment>
          )}
        >
          <Example of={server} />
          <Prose>
            <p>
              <InlineCode>onConfirm</InlineCode> can return a promise: the dialog stays open behind a veil until it
              settles, and a rejection shows <InlineCode>labels.confirmError</InlineCode> at the top of the body with
              the choice still made. The example fails the first time on purpose; confirm twice.
            </p>
          </Prose>
          <Callout>
            In <InlineCode>client</InlineCode> mode the page passes every row and the dialog searches them itself,
            without waiting, and still shows the first <InlineCode>limit</InlineCode> of the result: the first two
            examples above hold two hundred customers and list fifty. Filters are then the page’s to apply: pass the
            rows already filtered.
          </Callout>
        </Section>

        <Section
          title={'The field'}
          lead={(
            <React.Fragment>
              <InlineCode>ModalSelectorField</InlineCode> has the shape and the states of the Combobox, with a list icon
              in place of the arrow: it says a dialog opens, not a list under the field. The value reads as its name and
              then its code; the name is the part that is cut. An optional field has an x that empties it without
              opening the selector.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              Enter, Space, ↓ and Alt ↓ open the selector; a letter typed on the field opens it with that letter already
              in the search, through <InlineCode>onOpen(text)</InlineCode>. Pass <InlineCode>buttonRef</InlineCode> to the
              field and the same ref as <InlineCode>returnFocus</InlineCode> to the selector, so the focus comes back to
              the field when the dialog closes.
            </p>
          </Prose>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The list is a <InlineCode>listbox</InlineCode> drawn as a table, with the search as its{' '}
              <InlineCode>combobox</InlineCode>: the rows are options named by their cells, the header is hidden from
              assistive technology, and the focus never leaves the search. The dialog gives its first focus to the
              search, the field a selector opens on. <InlineCode>labels.instructions</InlineCode> tells a screen reader
              the keys that the line of keys shows on screen.
            </p>
            <p>
              The field is a button with <InlineCode>aria-haspopup=&quot;dialog&quot;</InlineCode>, named by the label of
              its Field, with its value in <InlineCode>aria-describedby</InlineCode>. Its x is not a Tab stop.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>↑ ↓</InlineCode>, 'Moves the row: the chosen one with one value, the active one with several.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Confirms with one value, ticks the active row with several. During a search it waits for the answer, and picks on its own only a row whose code matches the text.' ],
              [ <InlineCode key={'k'}>Ctrl Enter</InlineCode>, 'Confirms with several values. ⌘ Enter on a Mac.' ],
              [ <InlineCode key={'k'}>Esc</InlineCode>, 'Empties the search, then closes, asking first when choices are not confirmed.' ]
            ]}
          />
        </Section>

        <Section
          title={'Slots and data attributes'}
          lead={(
            <React.Fragment>
              The selector is a Dialog, so its shell, header and footer carry the dialog’s slots. These are its own;
              open a selector above to find them.
            </React.Fragment>
          )}
        >
          <SubSection title={'ModalSelector'} id={'slots-modal-selector'}>
            <SlotsTable
              rows={[
                { slot: 'modal-selector-toolbar', part: 'The search, the filters and the count line' },
                { slot: 'modal-selector-toolbar-row', part: 'A row of the toolbar' },
                { slot: 'modal-selector-query', part: 'The search and the filters' },
                { slot: 'modal-selector-only-selected', part: 'The filter “Only the chosen ones”' },
                { slot: 'modal-selector-only-selected-label', part: 'Its label' },
                { slot: 'modal-selector-count', part: 'The count line' },
                { slot: 'modal-selector-keys', part: 'The line of keys' },
                { slot: 'modal-selector-key', part: 'One key of it' },
                { slot: 'modal-selector-chosen', part: 'The chosen value in the footer' },
                { slot: 'modal-selector-body', part: 'The body of the dialog' },
                { slot: 'modal-selector-frame', part: 'The frame of the list', attributes: [ 'data-mode', 'data-multiple', 'data-status' ] },
                { slot: 'modal-selector-list', part: 'The listbox, a <table>' },
                { slot: 'modal-selector-row', part: 'A row, an option', attributes: [ 'data-selected', 'data-active', 'data-disabled' ] },
                { slot: 'modal-selector-row-box', part: 'The box of a row with several values', attributes: [ 'data-locked' ] },
                { slot: 'modal-selector-row-name', part: 'The name of a row, with its note' }
              ]}
            />
          </SubSection>

          <SubSection title={'ModalSelectorField'} id={'slots-modal-selector-field'}>
            <SlotsTable
              rows={[
                { slot: 'modal-selector-field', part: 'The frame', attributes: [ 'data-size', 'data-invalid', 'data-disabled', 'data-readonly' ] },
                { slot: 'modal-selector-field-button', part: 'The button that opens the selector' },
                { slot: 'modal-selector-field-content', part: 'What the field shows' },
                { slot: 'modal-selector-field-placeholder', part: 'The invitation, with no value' },
                { slot: 'modal-selector-field-single', part: 'One value' },
                { slot: 'modal-selector-field-value', part: 'Its name' },
                { slot: 'modal-selector-field-code', part: 'Its code' },
                { slot: 'modal-selector-field-chips', part: 'The chips of several values' },
                { slot: 'modal-selector-field-chip', part: 'One chip' },
                { slot: 'modal-selector-field-more', part: 'The +N past the chips' },
                { slot: 'modal-selector-field-end', part: 'The end of the field' },
                { slot: 'modal-selector-field-clear', part: 'The x of an optional field' },
                { slot: 'modal-selector-field-glyph', part: 'The list icon' }
              ]}
            />
          </SubSection>
        </Section>

        <Section title={'API'}>
          <SubSection
            title={'ModalSelector'}
            id={'api-modal-selector'}
            lead={'The props every selector takes, with one value or several.'}
          >
            <PropsTable props={commonProps} />
          </SubSection>

          <SubSection title={'With one value'} id={'api-modal-selector-single'}>
            <PropsTable props={SINGLE_OWN} />
          </SubSection>

          <SubSection title={'With several values'} id={'api-modal-selector-multiple'}>
            <PropsTable props={MULTIPLE_OWN} />
          </SubSection>

          <SubSection title={'ModalSelectorField'} id={'api-modal-selector-field'}>
            <PropsTable
              props={fieldProps}
              rest={(
                <React.Fragment>
                  <InlineCode>className</InlineCode> and the shared props reach the frame; the native props reach the
                  button that opens the selector, the element that takes the focus: <InlineCode>id</InlineCode>,{' '}
                  <InlineCode>aria-*</InlineCode>, <InlineCode>onBlur</InlineCode> for a form library.
                </React.Fragment>
              )}
            />
          </SubSection>

          <SubSection title={'ModalSelectorLabels'} id={'api-modal-selector-labels'}>
            <PropsTable props={labelsProps} />
          </SubSection>

          <SubSection title={'ModalSelectorFieldLabels'} id={'api-modal-selector-field-labels'}>
            <PropsTable props={fieldLabelsProps} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Reach for it past a few hundred records'}>
              A Select holds every option at once, a Combobox shows names. When the choice needs a code, a town and a
              state side by side to be made right, it is a selector.
            </Guidance>
            <Guidance kind={'dont'} title={'Give it more than four columns'}>
              The dialog is for choosing, not for browsing. The columns are what tells two similar records apart, and
              four is the ceiling.
            </Guidance>
            <Guidance kind={'do'} title={'Say why a row cannot be chosen'}>
              A blocked row with a note and a reason explains itself. A row that is missing from the list sends the
              user looking for it.
            </Guidance>
            <Guidance kind={'dont'} title={'Close on the first click'}>
              The primary confirms. A click that closes the dialog leaves no room to look at the row before it is
              taken.
            </Guidance>
            <Guidance kind={'do'} title={'Let the confirmation fail visibly'}>
              Return the promise of the save from onConfirm: a failure keeps the dialog and the choices, and says so.
            </Guidance>
            <Guidance kind={'dont'} title={'Offer Select all without supportsAll'}>
              Every row of a search is a decision for the server. Turn it on only when the action really works on a
              filter.
            </Guidance>
          </GuidanceGrid>
        </Section>
      </PageBody>
    </FormatsShell>
  );
}


/* --------
 * Route
 * -------- */

export const Route = createFileRoute('/data/modal-selector')({
  component: ModalSelectorPage
});
