import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import searchInputProps from 'virtual:ui-props/SearchInputProps';
import themeDoc from 'virtual:ui-theme/forms/search-input';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/search-input/basic.tsx?example';
import filter from '@/examples/forms/search-input/filter.tsx?example';
import server from '@/examples/forms/search-input/server.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/forms/search-input');

const LINK = 'font-medium text-primary hover:underline';

/** Its own props: the ones of TextInput are described there */
const OWN_PROPS = searchInputProps.filter((prop) => prop.from !== 'StrictTextInputProps');


/* --------
 * Page
 * -------- */

function SearchInputPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A <Link to={'/ui/forms/text-input'} className={LINK}>TextInput</Link> for a search: a lens at the start, a
            clear action at the end, and Esc that empties it. No visible label as a rule: the lens says what it does,
            the title or the table beside it says what it searches.
          </React.Fragment>
        )}
        imports={tsx`
          import { SearchInput } from '@proedis/ui/forms/search-input';
          import type { SearchInputLabels, SearchInputProps } from '@proedis/ui/forms/search-input';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'The query'}
          lead={(
            <React.Fragment>
              The value is a string, owned by the field with <InlineCode>defaultValue</InlineCode> or by the caller with{' '}
              <InlineCode>value</InlineCode>. <InlineCode>onValueChange</InlineCode> reports every change, typing, the
              clear action and Esc alike, so a filter needs one handler.
            </React.Fragment>
          )}
        >
          <Example of={filter} />
        </Section>

        <Section
          title={'Clear and Esc'}
          lead={(
            <React.Fragment>
              The clear action shows only with a value, and gives the focus back to the field. Esc empties a field that
              has a value and stops there; on an empty field it goes through, so the dialog or the popover around it
              closes as it would anyway.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              The field is <InlineCode>type=&quot;search&quot;</InlineCode>, with the browser’s own clear button hidden:
              there is one already, with a name and a tooltip.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Searching the server'}
          lead={(
            <React.Fragment>
              <InlineCode>loading</InlineCode> shows a spinner while the results are on their way, with the{' '}
              <InlineCode>loadingLabel</InlineCode> it requires. The spinner takes the place of the clear action while it
              turns.
            </React.Fragment>
          )}
        >
          <Example of={server} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The name comes from the caller, with <InlineCode>aria-label</InlineCode> or a label elsewhere on the page.
              The lens is decoration; the clear action is an IconButton named by <InlineCode>labels.clear</InlineCode>.
              When the results update in place, announce them with a live region, as the filter example does with its
              list.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Esc</InlineCode>, 'Empties the field when it has a value; goes through when it is empty.' ],
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'From the text to the clear action, when there is one.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={filter}
            rows={[
              { slot: 'text-input', part: 'The frame', attributes: [ 'data-size', 'data-loading', 'data-invalid', 'data-readonly', 'data-disabled' ] },
              { slot: 'text-input-leading', part: 'The lens' },
              { slot: 'text-input-control', part: 'The input, of type search' },
              { slot: 'text-input-trailing', part: 'Where the clear action sits' },
              { slot: 'text-input-action', part: 'The clear action' },
              { slot: 'text-input-spinner', part: 'The spinner, while loading' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={OWN_PROPS}
            rest={(
              <React.Fragment>
                Every prop of <Link to={'/ui/forms/text-input'} className={LINK}>TextInput</Link> but{' '}
                <InlineCode>type</InlineCode>, <InlineCode>leading</InlineCode>, <InlineCode>trailing</InlineCode> and{' '}
                <InlineCode>onChange</InlineCode>, which the search owns.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Say what it searches'}>
              In its accessible name and its placeholder: “Search the customers”, “Name, VAT number or code”.
            </Guidance>
            <Guidance kind={'dont'} title={'A search field in a form'}>
              To choose a record in a form, a Combobox searches and chooses in one control. The SearchInput narrows what
              is already on the page.
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

export const Route = createFileRoute('/ui/forms/search-input')({
  component: SearchInputPage
});
