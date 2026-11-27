import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable } from '@/docs/Tables';
import skeleton from '@/examples/layout/overview/skeleton.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/layout/overview');

const LINK = 'font-medium text-primary hover:underline';


/* --------
 * Page
 * -------- */

function LayoutOverviewPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Nearly every screen is built from the primitives of this section, with their props: a column, a row, a grid,
            a rail beside the content, the page column. This page says which one to reach for, and what to do in the
            few places where none of them fits.
          </React.Fragment>
        )}
      />

      <PageBody>
        <Section title={'Which one to reach for'} lead={'Start from what the children do, not from the CSS you would write.'}>
          <DocTable
            head={[ 'The children', 'Reach for' ]}
            rows={[
              [ 'One under the other, or side by side, with a gap', <Link key={'k'} to={'/ui/layout/stack'} className={LINK}>Stack</Link> ],
              [ 'A fixed number of equal columns per breakpoint', <React.Fragment key={'k'}><Link to={'/ui/layout/stack'} className={LINK}>Stack</Link> with <InlineCode>columns</InlineCode></React.Fragment> ],
              [ 'As many columns as fit, each at least so wide', <Link key={'k'} to={'/ui/layout/grid'} className={LINK}>Grid</Link> ],
              [ 'A row that wraps: tags, actions, filters', <Link key={'k'} to={'/ui/layout/cluster'} className={LINK}>Cluster</Link> ],
              [ 'A rail beside the content, stacked on a small screen', <Link key={'k'} to={'/ui/layout/split'} className={LINK}>Split</Link> ],
              [ 'The column of a page: a maximum width and the side padding', <Link key={'k'} to={'/ui/layout/container'} className={LINK}>Container</Link> ],
              [ 'Centred on both axes, with a maximum width', <Link key={'k'} to={'/ui/layout/center'} className={LINK}>Center</Link> ],
              [ 'Pushed to the end of a row or a column', <Link key={'k'} to={'/ui/layout/spacer'} className={LINK}>Spacer</Link> ],
              [ 'Pinned to an edge while the parent scrolls', <Link key={'k'} to={'/ui/layout/sticky'} className={LINK}>Sticky</Link> ],
              [ 'Reaching the edges of a padded container', <Link key={'k'} to={'/ui/layout/bleed'} className={LINK}>Bleed</Link> ],
              [ 'Kept in proportion at any width', <Link key={'k'} to={'/ui/layout/aspect-ratio'} className={LINK}>AspectRatio</Link> ],
              [ 'An element with the shared props and nothing else', <Link key={'k'} to={'/ui/layout/box'} className={LINK}>Box</Link> ]
            ]}
          />
        </Section>

        <Section
          title={'A screen, in primitives'}
          lead={(
            <React.Fragment>
              The bones of a list page with no look yet: the header turns from a column into a row at{' '}
              <InlineCode>md</InlineCode>, the rail moves beside the cards at <InlineCode>lg</InlineCode>, and the cards
              take as many columns as fit. Drag the handle to watch it. Every gap is a step of the scale by name.
            </React.Fragment>
          )}
        >
          <Example of={skeleton} resizable />
          <Prose>
            <p>
              Each primitive takes <InlineCode>as</InlineCode>, so the structure carries its meaning too: a list of rows is
              a <InlineCode>ul</InlineCode>, a toolbar of links a <InlineCode>nav</InlineCode>. The look comes after, from
              the components that sit in the boxes: a <Link to={'/ui/display/surface'} className={LINK}>Surface</Link> for
              a card, an <Link to={'/ui/display/item'} className={LINK}>Item</Link> for a row. The{' '}
              <Link to={'/ui/patterns/page'} className={LINK}>Patterns</Link> put both together.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Where the primitives stop'}
          lead={(
            <React.Fragment>
              A few layouts are beyond them on purpose, because a prop for each would cost more than it gives. In an
              application, write those with classes, directly.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'The layout', 'Why no primitive covers it' ]}
            rows={[
              [ 'Named grid tracks, a subgrid', 'A template is a decision of one screen, not a step of a scale' ],
              [ 'Columns counted from the data', 'The number is known at run time, so the class has to be built for it' ],
              [ 'A different gap across and along', 'The primitives take one gap, which is what almost every layout wants' ],
              [ 'A display switched by a container query', 'A container query is a decision about one component in one place' ]
            ]}
          />
          <CodeBlock
            snippet={tsx`
              {/* A form of filters: wide gaps between the columns, tight ones between the rows */}
              <div className={'grid grid-cols-2 gap-x-8 gap-y-2'}>
                …
              </div>
            `}
          />
          <Prose>
            <p>
              Free does not mean anything goes. The values stay those of the theme, never an arbitrary one like{' '}
              <InlineCode>gap-[13px]</InlineCode>, which no theme can reach and the React preset of{' '}
              <InlineCode>eslint-config-proedis</InlineCode> reports. And a box that is a card or a row is still a{' '}
              <InlineCode>Surface</InlineCode> or an <InlineCode>Item</InlineCode> inside the free layout: only the
              arrangement is written by hand.
            </p>
          </Prose>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Reach for a primitive first'}>
              A <InlineCode>Stack</InlineCode> with props says what a <InlineCode>flex flex-col gap-4</InlineCode> says, in
              the place a reader looks for it, and it follows the theme.
            </Guidance>
            <Guidance kind={'dont'} title={'Override a primitive through className'}>
              <InlineCode>{"gap={'md'} className={'gap-8'}"}</InlineCode> is a gap of 8 that the props deny. Change the prop,
              or write the layout freely.
            </Guidance>
            <Guidance kind={'do'} title={'Write the responsive map where it is used'}>
              The layout of a screen at each width reads in one place, next to what it lays out.
            </Guidance>
            <Guidance kind={'dont'} title={'Hand-write what a primitive covers'}>
              A free layout is for the four cases above. A column with a gap written by hand is a column nobody can
              retune.
            </Guidance>
          </GuidanceGrid>
        </Section>
      </PageBody>
    </React.Fragment>
  );
}

export const Route = createFileRoute('/ui/layout/overview')({
  component: LayoutOverviewPage
});
