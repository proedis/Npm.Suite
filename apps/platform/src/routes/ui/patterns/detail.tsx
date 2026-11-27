import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { DocTable } from '@/docs/Tables';
import inCard from '@/examples/data/detail/in-context.tsx?example';
import inDrawer from '@/examples/overlays/drawer/basic.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/patterns/detail');

const LINK = 'font-medium text-primary hover:underline';


/* --------
 * Page
 * -------- */

function DetailPatternPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A record to read: its name and state at the top, its values in sections below, aligned on the same grid of
            six as the form that edits it. The values are a Detail; where it sits is the screen&apos;s choice, a card in
            a page or a drawer beside a list.
          </React.Fragment>
        )}
      />

      <PageBody>
        <Section
          title={'In a page'}
          lead={'The record is the page: a card whose header names it and holds its state and the action to edit it.'}
        >
          <Example of={inCard} />
          <Prose>
            <p>
              <InlineCode>Surface.SectionGroup divided</InlineCode> draws the line between the header and the body, with
              room on both sides. The header is an <InlineCode>Item</InlineCode>: the code and what it is in{' '}
              <InlineCode>Item.Heading</InlineCode>, the state and the edit button in <InlineCode>Item.Actions</InlineCode>.
              The <InlineCode>Detail</InlineCode> inside is content, not a container: it brings no border of its own.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Beside a list'}
          lead={'When the reader goes from one record to the next, the record opens in a Drawer and the list stays in sight.'}
        >
          <Example of={inDrawer} />
          <Prose>
            <p>
              The drawer takes the name of the record as its <InlineCode>title</InlineCode> and its state as its{' '}
              <InlineCode>description</InlineCode>; the body is the same content the page would show. To edit from there,
              see <Link to={'/ui/patterns/form-in-drawer'} className={LINK}>A form in a drawer</Link>.
            </p>
          </Prose>
        </Section>

        <Section title={'The pieces'}>
          <DocTable
            head={[ 'Part', 'Component' ]}
            rows={[
              [ 'The values, in sections on a grid', <Link key={'k'} to={'/ui/data/detail'} className={LINK}>Detail</Link> ],
              [ 'The card, its header and its body', <React.Fragment key={'k'}><Link to={'/ui/display/surface'} className={LINK}>Surface</Link>, <Link to={'/ui/display/item'} className={LINK}>Item</Link></React.Fragment> ],
              [ 'The panel beside a list', <Link key={'k'} to={'/ui/overlays/drawer'} className={LINK}>Drawer</Link> ],
              [ 'One value with its name, on its own', <Link key={'k'} to={'/ui/display/labeled-content'} className={LINK}>LabeledContent</Link> ]
            ]}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Read with Detail, edit with a form'}>
              The two share the grid of six, so a value sits in the same place in both.
            </Guidance>
            <Guidance kind={'dont'} title={'A form in read only to show a record'}>
              Fields drawn disabled or read only look editable and read badly. A value to read is a Detail item.
            </Guidance>
            <Guidance kind={'do'} title={'A drawer to go through records'}>
              The list stays visible and the next record is one click away.
            </Guidance>
            <Guidance kind={'dont'} title={'A border around the Detail'}>
              It is content: the card, the drawer or the page around it draws the frame.
            </Guidance>
          </GuidanceGrid>
        </Section>
      </PageBody>
    </React.Fragment>
  );
}

export const Route = createFileRoute('/ui/patterns/detail')({
  component: DetailPatternPage
});
