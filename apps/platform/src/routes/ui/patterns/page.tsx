import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { DocTable } from '@/docs/Tables';
import overviewPage from '@/examples/patterns/page/overview-page.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/patterns/page');

const LINK = 'font-medium text-primary hover:underline';


/* --------
 * Page
 * -------- */

function PagePatternPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The page of a section of an application: what it is about and its actions at the top, a few figures, then
            the list it exists for. Three levels, each with its own weight, laid out by the primitives.
          </React.Fragment>
        )}
      />

      <PageBody>
        <Section title={'The page'} lead={'A column on a phone; from md the header turns into a row and the figures into three columns.'}>
          <Example of={overviewPage} resizable />
        </Section>

        <Section title={'How it is built'}>
          <Prose>
            <p>
              <strong>The header is a Stack that changes direction</strong>, a column below{' '}
              <InlineCode>md</InlineCode> and a row from it, with <InlineCode>justify={'{\'between\'}'}</InlineCode>: the
              title at one end, the actions at the other. The title is a <InlineCode>Heading</InlineCode> of size{' '}
              <InlineCode>lg</InlineCode> rendered as the <InlineCode>h2</InlineCode> of the page; the primary action is
              the solid button, the others soft.
            </p>
            <p>
              <strong>A figure is a Surface around a LabeledContent</strong>, the pair with the emphasis inverted: a
              quiet name over a loud value, because the value is the point. Three of them are a{' '}
              <InlineCode>Stack</InlineCode> with <InlineCode>columns</InlineCode>, one per row on a phone.
            </p>
            <p>
              <strong>The list is a Surface with a header and rows.</strong> The rows are a{' '}
              <InlineCode>Stack as={'{\'ul\'}'} divided</InlineCode> of <InlineCode>Item</InlineCode>s: a row that opens its
              record is the button itself, since nothing inside it is a control. The next pattern has rows that do hold
              controls.
            </p>
          </Prose>
        </Section>

        <Section title={'The pieces'}>
          <DocTable
            head={[ 'Part', 'Component' ]}
            rows={[
              [ 'The column of the page, around it all in the application (not in this preview)', <Link key={'k'} to={'/ui/layout/container'} className={LINK}>Container</Link> ],
              [ 'Header, figures, list, one under the other', <Link key={'k'} to={'/ui/layout/stack'} className={LINK}>Stack</Link> ],
              [ 'Title and description', <Link key={'k'} to={'/ui/display/heading'} className={LINK}>Heading</Link> ],
              [ 'A figure', <React.Fragment key={'k'}><Link to={'/ui/display/surface'} className={LINK}>Surface</Link>, <Link to={'/ui/display/labeled-content'} className={LINK}>LabeledContent</Link></React.Fragment> ],
              [ 'A row', <React.Fragment key={'k'}><Link to={'/ui/display/item'} className={LINK}>Item</Link>, <Link to={'/ui/display/badge'} className={LINK}>Badge</Link></React.Fragment> ]
            ]}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'One solid button per page header'}>
              The action the page exists for. Every other action beside it is soft or plain, so the eye finds the first one
              at once.
            </Guidance>
            <Guidance kind={'dont'} title={'A bordered box written by hand'}>
              A box with a border and a radius is a Surface: its corner, padding and border follow the theme.
            </Guidance>
            <Guidance kind={'do'} title={'Levels by weight'}>
              The title of the page, then the figures, then the list: a heading size, a loud value, a row. Not three cards
              of the same weight.
            </Guidance>
            <Guidance kind={'dont'} title={'A figure as a heading'}>
              A number with its name is a LabeledContent. A Heading puts the name above and in charge.
            </Guidance>
          </GuidanceGrid>
        </Section>
      </PageBody>
    </React.Fragment>
  );
}

export const Route = createFileRoute('/ui/patterns/page')({
  component: PagePatternPage
});
