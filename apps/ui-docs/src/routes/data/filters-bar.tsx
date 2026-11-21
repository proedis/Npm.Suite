import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';
import dateFilterProps from 'virtual:ui-props/DateFilter';
import labelsProps from 'virtual:ui-props/FiltersBarLabels';
import searchProps from 'virtual:ui-props/FiltersBarSearch';
import multipleProps from 'virtual:ui-props/MultipleListFilter';
import remoteProps from 'virtual:ui-props/RemoteListFilter';
import singleProps from 'virtual:ui-props/SingleListFilter';
import filtersBarProps from 'virtual:ui-props/StrictFiltersBarProps';
import themeDoc from 'virtual:ui-theme/data/filters-bar';

import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import FormatsShell from '@/examples/data/FormatsShell';
import basic from '@/examples/data/filters-bar/basic.tsx?example';
import dates from '@/examples/data/filters-bar/dates.tsx?example';
import lists from '@/examples/data/filters-bar/lists.tsx?example';
import overflow from '@/examples/data/filters-bar/overflow.tsx?example';
import remote from '@/examples/data/filters-bar/remote.tsx?example';
import withTable from '@/examples/data/table/in-context.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/data/filters-bar');

const STRETCH = 'p-4 sm:p-6';


/* --------
 * Page
 * -------- */

function FiltersBarPage(): React.ReactNode {
  return (
    <FormatsShell>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The row of filters between the header of a page and its table: the search, a button per filter, “More
            filters” and, with a filter on, “Clear filters”. Every choice filters at once, with no Apply. The bar holds
            no value: the page does, usually in its address, and the bar draws and counts what it is given.
          </React.Fragment>
        )}
        imports={tsx`
          import { FiltersBar } from '@proedis/ui/data/filters-bar';

          import type { DateFilter, DateRange, FilterOption, FiltersBarFilter, FiltersBarLabels } from '@proedis/ui/data/filters-bar';
        `}
      />

      <PageBody>
        <Example of={basic} align={'stretch'} previewClassName={STRETCH} />

        <Section
          title={'The row'}
          lead={(
            <React.Fragment>
              Everything in the bar is small, 28px high, to sit above a table without weighing on it. A filter that is
              off is a quiet button with its name and an arrow. Once on, it turns into two buttons on the soft tint of
              the primary: the first says “Name: values” and opens the list again, the x takes the filter off without
              opening it and gives the focus back to the first. Two values are shown, cut at 240px, and the rest is a
              “+N” that never truncates and lists them all in its tooltip.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              The bar counts the active filters by itself. “Clear filters” appears with the first of them, takes every
              filter off, the ones in “More filters” too, asks no confirmation, and gives the focus to the first filter.
              The search stays: clearing it is the x of the search, and the empty table offers both at once.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Lists'}
          lead={(
            <React.Fragment>
              A list filter is <InlineCode>kind: &apos;list&apos;</InlineCode>, the default. With one value, a tick on the
              right and choosing closes the list; with <InlineCode>multiple</InlineCode>, a box per value and “Select
              all” and “Clear” in the footer. Past <InlineCode>searchThreshold</InlineCode> values, eight by default, a
              list gets a search of its own, as Driver below.
            </React.Fragment>
          )}
        >
          <Example of={lists} align={'stretch'} previewClassName={STRETCH} />
          <Prose>
            <p>
              A filter that does not apply to a page is left out of the bar. <InlineCode>disabled</InlineCode> is for one
              that applies but cannot be used now: it stays reachable, at half strength, with{' '}
              <InlineCode>disabledReason</InlineCode> in its tooltip, and never holds a value.{' '}
              <InlineCode>loading</InlineCode> says its values are on their way: a spinner in place of the arrow, and
              the list does not open yet.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Searching the server'}
          lead={(
            <React.Fragment>
              <InlineCode>kind: &apos;remote&apos;</InlineCode> is a list too long to hold: several values, searched on the
              server, with the panel and the states of the Combobox. <InlineCode>onSearchChange</InlineCode> hands over
              every change of the text, <InlineCode>items</InlineCode> are the results of the current one. Under{' '}
              <InlineCode>minChars</InlineCode>, two by default, nothing is searched; “Searching…” shows only when the
              answer is slow; past the limit, <InlineCode>hasMore</InlineCode> says to type more. Type “pan” or
              “CL-0048”.
            </React.Fragment>
          )}
        >
          <Example of={remote} align={'stretch'} previewClassName={STRETCH} />
          <Callout>
            The names of the active values come from <InlineCode>selectedItems</InlineCode>, never from the results:
            a chosen customer that the next search does not find still reads as its name. Keep the items that{' '}
            <InlineCode>onValueChange(value, items)</InlineCode> gives you.
          </Callout>
        </Section>

        <Section
          title={'Dates'}
          lead={(
            <React.Fragment>
              <InlineCode>kind: &apos;date&apos;</InlineCode> is a period, from the calendar alone. The first click does
              not filter, the second does; after one click the footer offers “From this date” and “Until this date”,
              and closing after one click filters that day. Either end may stay open, so the value is{' '}
              <InlineCode>&#123; from, to &#125;</InlineCode> with ISO dates or <InlineCode>null</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={dates} align={'stretch'} previewClassName={STRETCH} />
          <Prose>
            <p>
              <InlineCode>min</InlineCode> and <InlineCode>max</InlineCode> bound the period,{' '}
              <InlineCode>isDateUnavailable</InlineCode> rules days out, <InlineCode>dayMeta</InlineCode> mutes a day and
              names it on hover, as the holidays of Date above. The names of the months and the first day of the week
              follow <InlineCode>locale</InlineCode>, which dayjs must have loaded: the reason dayjs is a peer of this
              subpath. How the active value reads, “09/11–20/11/2026” or “from 01/11/2026”, is{' '}
              <InlineCode>labels.date.value</InlineCode>, the application’s.
            </p>
          </Prose>
        </Section>

        <Section
          title={'More filters'}
          lead={(
            <React.Fragment>
              The buttons never shrink. The ones that do not fit go into “More filters”, the last ones first; an active
              one at the edge cuts its values before it moves. When not even the first fits, every filter goes into one
              “Filters” button. Switch the width.
            </React.Fragment>
          )}
        >
          <Example of={overflow} align={'stretch'} previewClassName={STRETCH} />
          <Prose>
            <p>
              “More filters” is one panel in two steps: the names, each with the values already chosen, then the values
              of the one chosen, under a header that goes back. Enter and → go into the values, ← with an empty search
              and Esc come back, Esc on the names closes. Its count says how many filters inside it are on.
            </p>
            <p>
              The count of what fits is done again when the width changes and when a list closes, never while one is
              open, so a button never moves under the pointer; and a filter that went into “More filters” stays there
              when it turns on. The widths are measured on a hidden copy of the row, marked{' '}
              <InlineCode>inert</InlineCode> and <InlineCode>aria-hidden</InlineCode>, so measuring never moves what the
              user sees.
            </p>
          </Prose>
        </Section>

        <Section
          title={'With its table'}
          lead={(
            <React.Fragment>
              The bar is the <InlineCode>toolbar</InlineCode> of a <Link to={'/data/table'} className={'font-medium text-primary hover:underline'}>Table</Link>,
              which needs two things from the page: a <InlineCode>filterKey</InlineCode> that changes with the filters
              and the search, and <InlineCode>searchActive</InlineCode>. The same example as on the page of the table.
            </React.Fragment>
          )}
        >
          <Example of={withTable} align={'stretch'} previewClassName={'p-3 sm:p-5'} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The search is named by <InlineCode>search.label</InlineCode>, and its placeholder is an example, not a
              name. Each filter is a real button with its name; an active one is announced with its values, and its x
              is named with <InlineCode>labels.remove(name)</InlineCode>. Inside a list the focus stays on the search,
              or on the list when there is none, and the value under the arrows follows{' '}
              <InlineCode>aria-activedescendant</InlineCode>: typing filters without leaving the keyboard.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'Where', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>↓ ↑</InlineCode>, 'On a filter', 'Opens its list, as a click does.' ],
              [ <InlineCode key={'k'}>↓ ↑ Home End</InlineCode>, 'In a list', 'Moves among the values, skipping the disabled ones.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'In a list', 'Chooses the value: closes a single list, ticks a box of a multiple one.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'In a list without a search', 'The same as Enter. In the search it types a space.' ],
              [ 'A letter', 'In a list without a search', 'Jumps to the next value starting with it.' ],
              [ <InlineCode key={'k'}>Enter →</InlineCode>, 'On a name in More filters', 'Goes into its values.' ],
              [ <InlineCode key={'k'}>← Esc</InlineCode>, 'In the values of More filters', 'Back to the names; ← only with an empty search.' ],
              [ <InlineCode key={'k'}>Esc</InlineCode>, 'In any panel', 'Closes it and gives the focus back to its button.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section
          title={'Slots and data attributes'}
          lead={'Every part a stylesheet can reach. The panels are rendered in a portal, so open one to find them.'}
        >
          <SlotsTable
            rows={[
              { slot: 'filters-bar', part: 'The root', attributes: [ 'data-narrow', 'data-active' ] },
              { slot: 'filter', part: 'A filter of the row', attributes: [ 'data-kind', 'data-active', 'data-open', 'data-disabled', 'data-loading' ] },
              { slot: 'filter-trigger', part: 'The button that opens its list' },
              { slot: 'filter-values', part: 'The values of an active filter' },
              { slot: 'filter-remove', part: 'The x of an active filter' },
              { slot: 'filter-panel', part: 'The panel of a filter' },
              { slot: 'filter-list', part: 'A list of values' },
              { slot: 'filter-list-search', part: 'The search of a long or remote list' },
              { slot: 'filter-list-input', part: 'Its input' },
              { slot: 'filter-list-items', part: 'The values' },
              { slot: 'filter-list-item', part: 'One value', attributes: [ 'data-highlighted', 'data-selected', 'data-disabled' ] },
              { slot: 'filter-list-box', part: 'The box of a value in a multiple list' },
              { slot: 'filter-list-tick', part: 'The tick of the value in a single list' },
              { slot: 'filter-list-item-text', part: 'The text of a value' },
              { slot: 'filter-list-item-label', part: 'Its first line' },
              { slot: 'filter-list-item-description', part: 'Its second line, with the code' },
              { slot: 'filter-list-message', part: 'Nothing found, too few characters, searching' },
              { slot: 'filter-list-retry', part: 'Retry after a failed search' },
              { slot: 'filter-list-too-many', part: 'The line past the limit of a remote list' },
              { slot: 'filter-list-status', part: 'The announcement of the results' },
              { slot: 'filter-list-footer', part: 'The footer of a list' },
              { slot: 'filter-list-select-all', part: 'Select all' },
              { slot: 'filter-list-clear', part: 'Clear' },
              { slot: 'filter-date', part: 'The calendar of a date filter' },
              { slot: 'filter-date-footer', part: 'Its footer after one click' },
              { slot: 'filter-date-from', part: 'From this date' },
              { slot: 'filter-date-until', part: 'Until this date' },
              { slot: 'filter-date-clear', part: 'Clear' },
              { slot: 'more-filters', part: 'The More filters button, or Filters in a narrow bar', attributes: [ 'data-narrow', 'data-active', 'data-open' ] },
              { slot: 'more-filters-panel', part: 'Its panel', attributes: [ 'data-step' ] },
              { slot: 'more-filters-header', part: 'The header of the second step' },
              { slot: 'more-filters-back', part: 'Its back arrow' },
              { slot: 'more-filters-title', part: 'The name of the filter in the header' },
              { slot: 'more-filters-names', part: 'The list of the names, the first step' },
              { slot: 'more-filters-row', part: 'One name', attributes: [ 'data-active', 'data-disabled', 'data-loading' ] },
              { slot: 'more-filters-row-text', part: 'Its text' },
              { slot: 'more-filters-row-label', part: 'Its name' },
              { slot: 'more-filters-row-values', part: 'The values already chosen' },
              { slot: 'more-filters-row-end', part: 'The arrow or the spinner at the end' },
              { slot: 'filters-bar-clear', part: 'Clear filters' },
              { slot: 'filters-bar-measure', part: 'The hidden copy of the row that measures it' },
              { slot: 'filters-bar-measure-filter', part: 'A filter in the hidden copy' },
              { slot: 'filters-bar-measure-more', part: 'More filters in the hidden copy' },
              { slot: 'filters-bar-measure-clear', part: 'Clear filters in the hidden copy' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'FiltersBar'} id={'api-filters-bar'}>
            <PropsTable
              props={filtersBarProps}
              rest={'The native props of a <div> and the ref reach the root; the search, the filters and the panels take their own props.'}
            />
          </SubSection>

          <SubSection title={'FiltersBarSearch'} id={'api-filters-bar-search'}>
            <PropsTable props={searchProps} />
          </SubSection>

          <SubSection
            title={'Filters'}
            id={'api-filters'}
            lead={(
              <React.Fragment>
                <InlineCode>FiltersBarFilter</InlineCode> is a union of four shapes, told apart by{' '}
                <InlineCode>kind</InlineCode> and <InlineCode>multiple</InlineCode>. Each takes{' '}
                <InlineCode>id</InlineCode>, <InlineCode>label</InlineCode>, <InlineCode>disabled</InlineCode>,{' '}
                <InlineCode>disabledReason</InlineCode> and <InlineCode>loading</InlineCode>.
              </React.Fragment>
            )}
          >
            <SubSection title={'SingleListFilter'} id={'api-single-list-filter'}>
              <PropsTable props={singleProps} />
            </SubSection>
            <SubSection title={'MultipleListFilter'} id={'api-multiple-list-filter'}>
              <PropsTable props={multipleProps} />
            </SubSection>
            <SubSection title={'RemoteListFilter'} id={'api-remote-list-filter'}>
              <PropsTable props={remoteProps} />
            </SubSection>
            <SubSection title={'DateFilter'} id={'api-date-filter'}>
              <PropsTable
                props={dateFilterProps}
                rest={(
                  <React.Fragment>
                    The period is a <InlineCode>DateRange</InlineCode>, exported by this subpath:{' '}
                    <InlineCode>{'{ from, to }'}</InlineCode>, either end <InlineCode>null</InlineCode> while open, the
                    type a page keeps in its state.
                  </React.Fragment>
                )}
              />
            </SubSection>
          </SubSection>

          <SubSection
            title={'FiltersBarLabels'}
            id={'api-filters-bar-labels'}
            lead={(
              <React.Fragment>
                Every text of the bar, separators included. <InlineCode>date</InlineCode> holds the texts of the calendar,{' '}
                <InlineCode>remote</InlineCode> those of a search on the server.
              </React.Fragment>
            )}
          >
            <PropsTable props={labelsProps} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Keep the values in the address'}>
              The bar holds nothing. Read the filters from the address and write them back: a shared link and the back
              button then restore the list as it was.
            </Guidance>
            <Guidance kind={'dont'} title={'Add an Apply button'}>
              Every choice filters at once. A list that waits for Apply makes the user wonder whether what they see is
              already filtered.
            </Guidance>
            <Guidance kind={'do'} title={'Order the filters by use'}>
              The last ones are the first to go into More filters on a narrow screen. The filter people reach for every
              day goes first.
            </Guidance>
            <Guidance kind={'dont'} title={'Disable a filter that does not apply'}>
              Leave it out of the bar. disabled is for a filter that applies and cannot be used now, and it says why.
            </Guidance>
            <Guidance kind={'do'} title={'Use remote past a few hundred values'}>
              A local list holds every value at once. Customers, contracts and addresses are searched on the server.
            </Guidance>
            <Guidance kind={'dont'} title={'Put the search in a filter'}>
              The search is the field at the start of the row, with an example in its placeholder. A filter named
              “Search” is a second search box nobody finds.
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

export const Route = createFileRoute('/data/filters-bar')({
  component: FiltersBarPage
});
