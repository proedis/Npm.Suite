import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { DocTable } from '@/docs/Tables';
import rowsAsButtons from '@/examples/display/item/list.tsx?example';
import rowsWithActions from '@/examples/patterns/list/rows-with-actions.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/patterns/list');

const LINK = 'font-medium text-primary hover:underline';


/* --------
 * Page
 * -------- */

function ListPatternPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A short list of records in a card: a header with what the list is and how to add to it, then one row per
            record. For a list that pages, sorts and filters, the Table is the component; this is the list that fits
            on a screen.
          </React.Fragment>
        )}
      />

      <PageBody>
        <Section
          title={'Rows with actions'}
          lead={'Each row has its own actions: a state and a menu. The row is then not a button, since a control cannot sit inside another.'}
        >
          <Example of={rowsWithActions} />
          <Prose>
            <p>
              The header is <InlineCode>Surface.Header</InlineCode>, which is an <InlineCode>Item</InlineCode>: title and
              description in <InlineCode>Item.Heading</InlineCode>, the action in <InlineCode>Item.Actions</InlineCode>. Each
              row is an <InlineCode>Item</InlineCode> with <InlineCode>inset</InlineCode>, the padding of a row, the icon in <InlineCode>Item.Icon</InlineCode> and the badge and the menu in{' '}
              <InlineCode>Item.Actions</InlineCode>. A long model truncates; the actions never leave the row.
            </p>
            <p>
              The menu names the record it acts on (<InlineCode>Actions on FT-234-KL</InlineCode>), so a screen reader
              hears which of three identical buttons it is on. Its trigger is an <InlineCode>IconButton</InlineCode>, which
              shows the same name as a tooltip.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Rows that open their record'}
          lead={'When nothing inside the row is a control, the whole row is the button: a larger target, and one stop of Tab per record.'}
        >
          <Example of={rowsAsButtons} />
        </Section>

        <Section title={'The pieces'}>
          <DocTable
            head={[ 'Part', 'Component' ]}
            rows={[
              [ 'The card and its header', <Link key={'k'} to={'/ui/display/surface'} className={LINK}>Surface</Link> ],
              [ 'The rows, with a line between them', <React.Fragment key={'k'}><Link to={'/ui/layout/stack'} className={LINK}>Stack</Link> as a <InlineCode>ul</InlineCode>, <InlineCode>divided</InlineCode></React.Fragment> ],
              [ 'A row', <Link key={'k'} to={'/ui/display/item'} className={LINK}>Item</Link> ],
              [ 'Its icon, its state', <React.Fragment key={'k'}><Link to={'/ui/display/icon-box'} className={LINK}>IconBox</Link>, <Link to={'/ui/display/badge'} className={LINK}>Badge</Link></React.Fragment> ],
              [ 'Its actions', <React.Fragment key={'k'}><Link to={'/ui/actions/menu'} className={LINK}>Menu</Link>, <Link to={'/ui/actions/button'} className={LINK}>IconButton</Link></React.Fragment> ]
            ]}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A list is a ul'}>
              <InlineCode>as={'{\'ul\'}'}</InlineCode> on the Stack and a <InlineCode>li</InlineCode> per row: a screen reader
              says how many records there are.
            </Guidance>
            <Guidance kind={'dont'} title={'A button inside a row that is a button'}>
              Either the row opens the record, or the row holds actions. Both at once is invalid markup and a confusing
              target.
            </Guidance>
            <Guidance kind={'do'} title={'Name the record in the menu'}>
              The label of every row&apos;s menu says on what it acts, not only &quot;Actions&quot;.
            </Guidance>
            <Guidance kind={'dont'} title={'A card per record'}>
              A card per row multiplies borders and shadows. One card, rows divided by a line.
            </Guidance>
          </GuidanceGrid>
        </Section>
      </PageBody>
    </React.Fragment>
  );
}

export const Route = createFileRoute('/ui/patterns/list')({
  component: ListPatternPage
});
