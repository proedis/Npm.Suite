import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { DocTable } from '@/docs/Tables';
import rowsAsButtons from '@/examples/display/item/list.tsx?example';
import primaryActions from '@/examples/patterns/list/primary-actions.tsx?example';
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
              Each item runs its action with <InlineCode>onSelect</InlineCode>, called once the menu has closed, so a
              dialog it opens finds the focus back on the row&apos;s control. The action to add a record sits in the
              card&apos;s header when the list is one card among others; when the list is what the page is about, it moves
              to the header of the page, as in <Link to={'/ui/patterns/page'} className={LINK}>A page</Link>.
            </p>
            <p>
              The menu names the record it acts on (<InlineCode>Actions on FT-234-KL</InlineCode>), so a screen reader
              hears which of three identical buttons it is on. Its trigger is an <InlineCode>IconButton</InlineCode>, which
              shows the same name as a tooltip.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Primary and secondary actions'}
          lead={(
            <React.Fragment>
              A row shows its primary actions and keeps the secondary ones in its menu, and it never shows more than
              three things to press: up to three icon buttons, or two and the trigger of the menu.
            </React.Fragment>
          )}
        >
          <Example of={primaryActions} />
          <Prose>
            <p>
              <strong>Primary</strong> is what a reader does on most rows, most of the time: edit a vehicle, find it on
              the map. Those are <InlineCode>IconButton</InlineCode>s on the row, each named by its{' '}
              <InlineCode>label</InlineCode>, which is also its tooltip, with the record in
              it: <InlineCode>Edit FT-234-KL</InlineCode>. <strong>Secondary</strong> is everything else, and goes in the menu
              so that the row stays light: duplicating, and a destructive action, which always sits last after a
              separator. With no primary action at all, the row holds the menu alone, as in the first example.
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
            <Guidance kind={'do'} title={'Primary on the row, secondary in the menu'}>
              The actions used on most rows are icon buttons; the rest, and every destructive one, are items of the menu.
            </Guidance>
            <Guidance kind={'dont'} title={'More than three things to press on a row'}>
              Three icon buttons, or two and the menu, at most. A fourth action is secondary by definition.
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
