import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import tableFormatsProps from 'virtual:ui-props/TableFormats';
import tableLabelsProps from 'virtual:ui-props/TableLabels';
import tableProps from 'virtual:ui-props/StrictTableProps';
import rowActionProps from 'virtual:ui-props/TableRowAction';
import selectionActionProps from 'virtual:ui-props/TableSelectionAction';
import viewStateProps from 'virtual:ui-props/TableViewState';
import themeDoc from 'virtual:ui-theme/data/table';

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
import FormatsShell from '@/examples/data/FormatsShell';
import formatsShell from '@/examples/data/FormatsShell.tsx?example';
import basic from '@/examples/data/table/basic.tsx?example';
import columns from '@/examples/data/table/columns.tsx?example';
import focusRow from '@/examples/data/table/focus-row.tsx?example';
import inContext from '@/examples/data/table/in-context.tsx?example';
import kinds from '@/examples/data/table/kinds.tsx?example';
import rowActions from '@/examples/data/table/row-actions.tsx?example';
import selection from '@/examples/data/table/selection.tsx?example';
import server from '@/examples/data/table/server.tsx?example';
import states from '@/examples/data/table/states.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/data/table');


/* --------
 * Page
 * -------- */

function TablePage(): React.ReactNode {
  return (
    /* The formats of the examples, mounted once around the page as an application mounts them in its shell */
    <FormatsShell>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The table of every list. The page declares the columns, each with its <strong>kind</strong>, the rows
            and the state; the table draws the cells, the order, the pages, the selection, the row actions and every
            state between the first load and an error. On TanStack Table, headless: the markup, the keyboard and the
            selection are the package’s.
          </React.Fragment>
        )}
        imports={tsx`
          import { sortingToFields, Table, TableFormatsProvider, useTableFormats } from '@proedis/ui/data/table';

          import type { TableColumn, TableLabels, TableSelection, TableViewState } from '@proedis/ui/data/table';
        `}
      />

      <PageBody>
        <Example of={basic} align={'stretch'} previewClassName={'p-3 sm:p-5'} />

        <Section
          title={'Setup'}
          lead={(
            <React.Fragment>
              A table knows no locale and no date library: an application mounts{' '}
              <InlineCode>TableFormatsProvider</InlineCode> once, at the top, with its own formatters, and every Table
              and ModalSelector reads its dates, numbers and enum labels there. Without a provider a value reads as it
              is: visible in a review, never thrown.
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={formatsShell} title={formatsShell.file} />
          <Prose>
            <p>
              The texts arrive in <InlineCode>labels</InlineCode>, about forty of them with the counts and the
              announcements of a new order, and the package writes none. An application writes them once per entity,
              from a function that takes the name of the entity and its plural, as the examples on this page do
              with <InlineCode>tableLabels(&#123; one: &apos;round&apos;, many: &apos;rounds&apos; &#125;)</InlineCode>.
              The columns too belong to the module of the entity: every example after the first imports the same{' '}
              <InlineCode>roundColumns</InlineCode> from it.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Columns'}
          lead={(
            <React.Fragment>
              A column says what it holds with its <InlineCode>kind</InlineCode>, and the kind decides the rest: the
              format, the alignment, the direction of the first click, the width of its placeholder and the value that
              is not there. Eleven kinds, every one below, and <InlineCode>custom</InlineCode> as the way out for what
              they do not cover, to be justified in review.
            </React.Fragment>
          )}
        >
          <Example of={kinds} align={'stretch'} previewClassName={'p-3 sm:p-5'} />
          <DocTable
            head={[ 'Kind', 'What it draws' ]}
            rows={[
              [ <InlineCode key={'k'}>code</InlineCode>, 'The code of the record, weight 500, a link with target. Pinned at the start when the table scrolls sideways, never hidden, and the first stop of the keyboard.' ],
              [ <InlineCode key={'k'}>reference</InlineCode>, 'Another entity, a town or a contract: a link at weight 400, or text without a target.' ],
              [ <InlineCode key={'k'}>person</InlineCode>, 'A TablePersonValue as avatar and name, or an array of AvatarGroupItem as an avatar group, which never sorts.' ],
              [ <InlineCode key={'k'}>text</InlineCode>, 'Text, truncated on one line with the whole of it in a tooltip.' ],
              [ <InlineCode key={'k'}>enum</InlineCode>, 'The label of a domain value, from formats.enumLabel.' ],
              [ <InlineCode key={'k'}>status</InlineCode>, 'A badge with its dot: the label from enumLabel, tone and fill from the column’s tone function.' ],
              [ <InlineCode key={'k'}>date</InlineCode>, 'formats.date. The first click sorts the most recent first.' ],
              [ <InlineCode key={'k'}>datetime</InlineCode>, 'formats.datetime. The most recent first too.' ],
              [ <InlineCode key={'k'}>number</InlineCode>, 'Right aligned, tabular figures, formats.number with one of eight formats. The largest first.' ],
              [ <InlineCode key={'k'}>boolean</InlineCode>, 'A tick for true, nothing for false, both named for a screen reader. “Yes” sorts first.' ],
              [ <InlineCode key={'k'}>custom</InlineCode>, 'Whatever cell(row) returns, aligned with align. The first click ascending unless sortDescFirst.' ]
            ]}
          />
          <Prose>
            <p>
              A value that is not there, <InlineCode>null</InlineCode>, <InlineCode>undefined</InlineCode> or an empty
              string, reads as a quiet dash named with <InlineCode>labels.noValue</InlineCode>, in every kind but{' '}
              <InlineCode>boolean</InlineCode> and <InlineCode>custom</InlineCode>. The value is read from the key
              named like the <InlineCode>id</InlineCode>, or from <InlineCode>accessor</InlineCode>: a key, or a
              function for a value the row does not hold as it is, as the driver above.
            </p>
          </Prose>

          <SubSection
            title={'Widths and visibility'}
            lead={(
              <React.Fragment>
                Four steps, <InlineCode>xs</InlineCode> 64px, <InlineCode>sm</InlineCode> 96px,{' '}
                <InlineCode>md</InlineCode> 140px, <InlineCode>lg</InlineCode> 200px, and <InlineCode>fill</InlineCode>{' '}
                for the one column that takes the rest. The table never shrinks a column below its step: past the
                width of the page it scrolls sideways, with the checkbox and the code pinned and a shade on the side
                where there is more. “Columns”, on the right of the toolbar, shows and hides them: a column is
                hideable unless it says <InlineCode>hideable: false</InlineCode>, the code never hides, and{' '}
                <InlineCode>defaultHidden</InlineCode> leaves a column out until the user asks for it.
              </React.Fragment>
            )}
          >
            <Example of={columns} align={'stretch'} previewClassName={'p-3 sm:p-5'} />
          </SubSection>
        </Section>

        <Section
          title={'Sorting'}
          lead={(
            <React.Fragment>
              A column sorts only when it says <InlineCode>sortable</InlineCode>. The first click sorts in the direction
              of its kind, the second turns it, the third goes back to <InlineCode>defaultSorting</InlineCode>. Shift
              adds a column as the second one, two at most. The order is never empty: the default one shows its arrow
              too, and every new order is announced with <InlineCode>labels.sortedBy</InlineCode>. Try it on the first
              example, with and without Shift.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              On a server table the order goes to the server. <InlineCode>sortingToFields</InlineCode> turns it into
              what the server reads, each column’s <InlineCode>sortKey</InlineCode> or its id, and the data hook adds
              the id at the end, so a row never shows on two pages:
            </p>
          </Prose>
          <CodeBlock
            snippet={tsx`
              const orderBy = sortingToFields(view.sorting, roundColumns)
                .map(({ desc, field }) => (desc ? \`-\${field}\` : field));
            `}
          />
        </Section>

        <Section
          title={'Client and server'}
          lead={(
            <React.Fragment>
              <InlineCode>mode=&#123;&apos;client&apos;&#125;</InlineCode> takes every row and sorts and pages them in
              memory: for a list under a hundred rows. The default, <InlineCode>server</InlineCode>, takes the current
              page and the total in <InlineCode>rowCount</InlineCode>, and the page asks for the next one when the
              state changes.
            </React.Fragment>
          )}
        >
          <Example of={server} align={'stretch'} previewClassName={'p-3 sm:p-5'} />
          <Prose>
            <p>
              Every part of the view, the order, the page, its size and the visible columns, is either controlled or
              kept by the table: the parts passed in <InlineCode>state</InlineCode> are the page’s, the others start
              from <InlineCode>defaultState</InlineCode>. Every change of either kind comes out of{' '}
              <InlineCode>onStateChange(state, change)</InlineCode>, whole and in one call, and{' '}
              <InlineCode>change</InlineCode> says which part moved, so a page that keeps only some parts in its address
              writes it once. A new order already brings page 1 with it: watch the readout under the table.
            </p>
            <p>
              <InlineCode>status</InlineCode> tells the two waits apart. <InlineCode>loading</InlineCode> is the first
              load, with placeholder rows; <InlineCode>fetching</InlineCode> is a new request with rows on screen, which
              keeps them, dims them and runs a bar under the header, after a short delay so a fast answer shows nothing.
              A refresh in the background is neither: leave it <InlineCode>ready</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Selection'}
          lead={(
            <React.Fragment>
              The checkboxes appear with <InlineCode>selectionActions</InlineCode>, and the toolbar turns into the bar
              of the selection: the count, up to two actions as buttons, the others behind a menu, and “Deselect”.
              A click on a box chooses the row, Shift chooses the rows between the last one and this one, the box of
              the header chooses the page.
            </React.Fragment>
          )}
        >
          <Example of={selection} align={'stretch'} previewClassName={'p-3 sm:p-5'} />
          <Prose>
            <p>
              The selection lives outside TanStack Table, because the engine can only choose the rows it has loaded.
              A <InlineCode>TableSelection</InlineCode> is either <InlineCode>&#123; ids &#125;</InlineCode> or{' '}
              <InlineCode>&#123; all: true, excludedIds &#125;</InlineCode>: every row of the filter but a few, which is
              what a server list needs. “Select all” appears once the whole page is chosen, and only when every action
              says <InlineCode>supportsAll</InlineCode>. Choose the page above, then take one row out: the readout
              shows the shape the actions receive.
            </p>
            <p>
              <InlineCode>enableRowSelection</InlineCode> returns <InlineCode>true</InlineCode> or the reason a row
              cannot be chosen: its box is read only with the reason in a tooltip, and it never shows as chosen, not
              even under “all”. A new <InlineCode>filterKey</InlineCode> empties the selection, as it brings page 1.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Row actions'}
          lead={(
            <React.Fragment>
              <InlineCode>rowActions(row)</InlineCode> returns the actions of a row as data. The ⋯ at the end of the row
              lists them all; <InlineCode>inline</InlineCode> puts up to two of them on the row as icon buttons, a shortcut
              for the pointer that the keyboard skips, since the ⋯ holds the same actions. An id with no action keeps
              its place empty, so the buttons never slide from one row to the next. A right
              click on the row opens the same menu at the pointer, Shift F10 and the Menu key open it from the
              keyboard. One menu is shared by every row of the table, so a list of fifty rows mounts one.
            </React.Fragment>
          )}
        >
          <Example of={rowActions} align={'stretch'} previewClassName={'p-3 sm:p-5'} />
          <Prose>
            <p>
              A disabled action stays reachable, with its <InlineCode>description</InlineCode> under the label; an
              action with <InlineCode>to</InlineCode> is a real link. The destructive one goes last, after a separator,
              and opens a confirmation of the page’s. <InlineCode>null</InlineCode> means the row has no actions: no ⋯,
              and the browser’s own menu on a right click, as on the cancelled rounds above. On a chosen row the
              right click opens the menu of the selection instead.
            </p>
          </Prose>
        </Section>

        <Section
          title={'With its filters'}
          lead={(
            <React.Fragment>
              <InlineCode>toolbar</InlineCode> holds the row above the table, which is a{' '}
              <InlineCode>FiltersBar</InlineCode>. The table then needs to know two things:{' '}
              <InlineCode>filterKey</InlineCode>, the signature of the filters and the search, which brings page 1 and
              an empty selection when it changes and tells an empty list from an empty result; and{' '}
              <InlineCode>searchActive</InlineCode>, so the empty result offers “Clear filters and search” rather than
              “Clear filters”. Filter down to nothing to see it.
            </React.Fragment>
          )}
        >
          <Example of={inContext} align={'stretch'} previewClassName={'p-3 sm:p-5'} />
        </Section>

        <Section
          title={'States'}
          lead={'Every state a list goes through, drawn by the table from status, error, filterKey and empty.'}
        >
          <Example of={states} align={'stretch'} previewClassName={'p-3 sm:p-5'} />
          <DocTable
            head={[ 'State', 'How it comes', 'What it shows' ]}
            rows={[
              [ 'First load', <InlineCode key={'w'}>status=&apos;loading&apos;</InlineCode>, 'Eight placeholder rows shaped by the kinds of the columns. No count, no footer.' ],
              [ 'Fetching', <InlineCode key={'w'}>status=&apos;fetching&apos;</InlineCode>, 'The rows stay, dimmed and not clickable, with a bar under the header.' ],
              [ 'Error', <InlineCode key={'w'}>status=&apos;error&apos;</InlineCode>, 'With no rows: the error and Retry, from onRetry. With rows on screen: they stay, and the footer says which ones did not arrive.' ],
              [ 'Invalid view', <InlineCode key={'w'}>error=&#123;&#123; retryable: false &#125;&#125;</InlineCode>, 'A request the server refused: “Clear filters and search” instead of Retry.' ],
              [ 'First use', <InlineCode key={'w'}>empty</InlineCode>, 'No rows and no filter: the page’s own icon, text and action.' ],
              [ 'No results', <InlineCode key={'w'}>filterKey</InlineCode>, 'No rows with a filter or a search on: the offer to clear them.' ]
            ]}
          />
        </Section>

        <Section
          title={'Back from a detail'}
          lead={(
            <React.Fragment>
              <InlineCode>focusRowId</InlineCode> is the row a detail was opened from: the table scrolls it into view
              and gives the focus to its code, so the user comes back where they left. Open a round, then go back.
            </React.Fragment>
          )}
        >
          <Example of={focusRow} align={'stretch'} previewClassName={'p-3 sm:p-5'} />
          <Prose>
            <p>
              When the code is a link, as here, the focus lands on the link, the element the grid would give it to; a code
              without a link takes the focus on its cell.
            </p>
          </Prose>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A real HTML table with the role of a <InlineCode>grid</InlineCode>, named by its{' '}
              <InlineCode>caption</InlineCode>. It is one stop in the Tab order: the first visit lands on the code of the
              first row, and the next one on the last cell visited. A cell with a control gives the focus to it, a link,
              a checkbox, the ⋯; a cell without one takes it itself, so a truncated value can be read in its tooltip.
              The rows carry <InlineCode>aria-rowindex</InlineCode> over the whole result and{' '}
              <InlineCode>aria-selected</InlineCode> when they can be chosen.
            </p>
            <p>
              The count above the table and a new order are announced politely. When the focused control leaves with its
              row, the focus goes to the same place in the rows that remain.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Into the grid on the last cell visited, the code of the first row the first time; out of it in one press.' ],
              [ <InlineCode key={'k'}>↑ ↓ ← →</InlineCode>, 'From cell to cell, header included. Right to left in a right to left page.' ],
              [ <InlineCode key={'k'}>Home</InlineCode>, 'The first cell of the row. With Ctrl or ⌘, the first cell of the first row.' ],
              [ <InlineCode key={'k'}>End</InlineCode>, 'The last cell of the row. With Ctrl or ⌘, the last cell of the table.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Chooses the row, Shift the rows between. On a button, presses it.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Follows the link or presses the button of the cell: on a header, sorts.' ],
              [ <InlineCode key={'k'}>Shift F10</InlineCode>, 'The menu of the row, anchored to its ⋯. The Menu key does the same.' ]
            ]}
          />
          <Callout>
            A field in a cell keeps its own keys: the arrows move the caret, not the focus. A custom cell holding a
            control should mark it <InlineCode>data-grid-target</InlineCode> so the grid gives the focus to it.
          </Callout>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section
          title={'Slots and data attributes'}
          lead={'Every part a stylesheet can reach, and what each one reports.'}
        >
          <SlotsInspector of={selection}
            rows={[
              { slot: 'table', part: 'The root, around the toolbar, the card and the footer', attributes: [ 'data-mode', 'data-status' ] },
              { slot: 'table-toolbar', part: 'The row above the table' },
              { slot: 'table-toolbar-content', part: 'Where the toolbar prop goes' },
              { slot: 'table-count', part: 'The count of the result' },
              { slot: 'table-columns', part: 'The “Columns” button' },
              { slot: 'table-selection-bar', part: 'The toolbar while rows are chosen' },
              { slot: 'table-card', part: 'The card around the grid and the footer' },
              { slot: 'table-scroller', part: 'The scrolling box, whose shades follow where there is more', attributes: [ 'data-scrolled-x', 'data-more-x', 'data-scrolled-y', 'data-more-y' ] },
              { slot: 'table-grid', part: 'The <table>' },
              { slot: 'table-head', part: 'The <thead>' },
              { slot: 'table-header-cell', part: 'A header cell', attributes: [ 'data-kind' ] },
              { slot: 'table-sort', part: 'The button of a sortable header' },
              { slot: 'table-select-all', part: 'The header cell of the page checkbox' },
              { slot: 'table-actions-header', part: 'The hidden header of the actions column' },
              { slot: 'table-body', part: 'The <tbody>' },
              { slot: 'table-row', part: 'A row', attributes: [ 'data-selected' ] },
              { slot: 'table-select-cell', part: 'The cell of a row checkbox' },
              { slot: 'table-select-blocked', part: 'The read only box of a row that cannot be chosen' },
              { slot: 'table-cell', part: 'A cell', attributes: [ 'data-kind' ] },
              { slot: 'table-cell-empty', part: 'The dash of a value that is not there' },
              { slot: 'table-cell-check', part: 'The tick of a true boolean' },
              { slot: 'table-row-actions', part: 'The actions cell of a row', attributes: [ 'data-empty' ] },
              { slot: 'table-row-actions-buttons', part: 'The inline icon buttons of a row' },
              { slot: 'table-skeleton-row', part: 'A placeholder row of the first load' },
              { slot: 'table-state', part: 'The cell holding an empty state or an error' },
              { slot: 'table-pagination', part: 'The footer with the pages' },
              { slot: 'table-pagination-arrows', part: 'The four buttons of the pages' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Table'} id={'api-table'}>
            <PropsTable
              props={tableProps}
              rest={(
                <React.Fragment>
                  The native props of a <InlineCode>{'<div>'}</InlineCode> reach the root, around the toolbar, the grid
                  and the footer. <InlineCode>status</InlineCode> defaults to <InlineCode>&apos;ready&apos;</InlineCode>,{' '}
                  <InlineCode>pageSizeOptions</InlineCode> to <InlineCode>[ 25, 50, 100 ]</InlineCode> with 50 as the
                  first size, <InlineCode>filterKey</InlineCode> to the empty string.
                </React.Fragment>
              )}
            />
          </SubSection>

          <SubSection
            title={'TableColumn'}
            id={'api-table-column'}
            lead={(
              <React.Fragment>
                A union over <InlineCode>kind</InlineCode>: every column takes <InlineCode>id</InlineCode>,{' '}
                <InlineCode>header</InlineCode>, <InlineCode>accessor</InlineCode>, <InlineCode>width</InlineCode>,{' '}
                <InlineCode>sortable</InlineCode>, <InlineCode>sortKey</InlineCode>, <InlineCode>hideable</InlineCode>{' '}
                and <InlineCode>defaultHidden</InlineCode>, and each kind adds its own.
              </React.Fragment>
            )}
          >
            <DocTable
              head={[ 'Kind', 'Adds' ]}
              rows={[
                [ <InlineCode key={'k'}>code</InlineCode>, <span key={'a'}><InlineCode>target?: (row) =&gt; LinkTarget | undefined</InlineCode></span> ],
                [ <InlineCode key={'k'}>reference</InlineCode>, <span key={'a'}><InlineCode>target?: (row) =&gt; LinkTarget | undefined</InlineCode></span> ],
                [ <InlineCode key={'k'}>person</InlineCode>, <span key={'a'}><InlineCode>group?: (items, row) =&gt; &#123; label, title &#125;</InlineCode>, the name and the head of the list of a group</span> ],
                [ <InlineCode key={'k'}>status</InlineCode>, <span key={'a'}><InlineCode>tone: (value, row) =&gt; &#123; tone, fill? &#125;</InlineCode>, required</span> ],
                [ <InlineCode key={'k'}>number</InlineCode>, <span key={'a'}><InlineCode>format?</InlineCode>: integer, decimal, quantity, weight, distance, percentage, duration, currency. Defaults to integer</span> ],
                [ <InlineCode key={'k'}>custom</InlineCode>, <span key={'a'}><InlineCode>cell: (row) =&gt; ReactNode</InlineCode>, <InlineCode>align?</InlineCode>, <InlineCode>sortDescFirst?</InlineCode></span> ],
                [ 'text, enum, date, datetime, boolean', 'Nothing.' ]
              ]}
            />
          </SubSection>

          <SubSection title={'TableViewState'} id={'api-table-view-state'}>
            <PropsTable props={viewStateProps} />
          </SubSection>

          <SubSection title={'TableRowAction'} id={'api-table-row-action'}>
            <PropsTable
              props={rowActionProps}
              rest={(
                <React.Fragment>
                  Returned in <InlineCode>&#123; actions, inline? &#125;</InlineCode> by <InlineCode>rowActions</InlineCode>.
                </React.Fragment>
              )}
            />
          </SubSection>

          <SubSection title={'TableSelectionAction'} id={'api-table-selection-action'}>
            <PropsTable props={selectionActionProps} />
          </SubSection>

          <SubSection title={'TableFormats'} id={'api-table-formats'}>
            <PropsTable
              props={tableFormatsProps}
              rest={(
                <React.Fragment>
                  Given to <InlineCode>TableFormatsProvider</InlineCode> as <InlineCode>formats</InlineCode>, and read
                  back with <InlineCode>useTableFormats()</InlineCode>.
                </React.Fragment>
              )}
            />
          </SubSection>

          <SubSection title={'TableLabels'} id={'api-table-labels'}>
            <PropsTable props={tableLabelsProps} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Pick the kind, not the look'}>
              The kind gives the format, the alignment, the sort direction and the placeholder in one word. A custom
              column gives up all of them and has to say why in review.
            </Guidance>
            <Guidance kind={'dont'} title={'Use the client mode for a list that grows'}>
              A client table holds every row in memory. Past about a hundred rows, or for anything that grows with the
              business, page on the server.
            </Guidance>
            <Guidance kind={'do'} title={'Keep the view in the address'}>
              onStateChange says which part moved: write the order, the page and the filters to the address, and the
              back button and a shared link restore the list exactly.
            </Guidance>
            <Guidance kind={'dont'} title={'Show fetching for a background refresh'}>
              Dimming the rows for a refresh nobody asked for makes the list blink. fetching is for a request the user
              made.
            </Guidance>
            <Guidance kind={'do'} title={'Give every list its filterKey'}>
              It is what brings page 1 and an empty selection after a new filter, and what tells “nothing yet” from
              “nothing with these filters”.
            </Guidance>
            <Guidance kind={'dont'} title={'Put a destructive action inline'}>
              The inline buttons are for what is done often, on every row. Deleting belongs at the end of the menu,
              after its separator, with a confirmation.
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

export const Route = createFileRoute('/ui/data/table')({
  component: TablePage
});
