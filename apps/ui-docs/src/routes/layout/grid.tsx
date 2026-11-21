import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import gridProps from 'virtual:ui-props/StrictGridProps';
import { Callout } from '@/docs/Callout';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/layout/grid/basic.tsx?example';
import fill from '@/examples/layout/grid/fill.tsx?example';
import inContext from '@/examples/layout/grid/in-context.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/layout/grid');


/* --------
 * Page
 * -------- */

function GridPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A grid whose columns size themselves: as many as fit, each at least{' '}
            <InlineCode>minColWidth</InlineCode> wide, sharing what is left. No breakpoint is declared, because
            the room decides, which is what a gallery of cards wants at every width, in a page or in a drawer.
          </React.Fragment>
        )}
        imports={tsx`
          import { Grid } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={basic} resizable align={'stretch'} />
        <Prose>
          <p>
            Each column is at least 160 pixels here. Drag the handle of the preview and the grid drops a column every time one
            no longer fits, down to a single one. On a screen narrower than the minimum, that single column takes
            the whole width instead of overflowing it.
          </p>
        </Prose>

        <Section
          title={'Fill or fit'}
          lead={(
            <React.Fragment>
              What happens to the columns there is room for but nothing to put in.{' '}
              <InlineCode>fill</InlineCode>, the default, keeps them, so two cards keep the width they would have
              in a full row. <InlineCode>fit</InlineCode> collapses them, and the two cards stretch over the whole
              width.
            </React.Fragment>
          )}
        >
          <Example of={fill} resizable align={'stretch'} />
        </Section>

        <Section
          title={'In context'}
          lead={'The vehicles of a fleet, as cards of at least 240 pixels: four across a wide page, one on a phone.'}
        >
          <Example of={inContext} resizable align={'stretch'} />
        </Section>

        <Section
          title={'Grid or Stack with columns'}
          lead={(
            <React.Fragment>
              <InlineCode>{'<Stack columns={{ base: 1, md: 3 }}>'}</InlineCode> is a grid whose count is the
              design: three columns from <InlineCode>md</InlineCode>, whatever the content. Grid is the other
              case, where the content has a minimum width and the count follows. A form or a dashboard of three
              figures is a Stack; a list of cards is a Grid.
            </React.Fragment>
          )}
        >
          <Callout tone={'warning'} title={'The columns are an inline style'}>
            The template is written as <InlineCode>grid-template-columns</InlineCode> in an inline style, since
            Tailwind cannot express a minimum width that comes from a prop. An inline style beats every class, so a{' '}
            <InlineCode>grid-cols-3</InlineCode> in <InlineCode>className</InlineCode> does nothing. Pass a{' '}
            <InlineCode>style</InlineCode> instead, which is merged after the template and wins.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A <InlineCode>{'<div>'}</InlineCode> with no role. A list of cards is a list: render it with{' '}
              <InlineCode>{'as={\'ul\'}'}</InlineCode>, each card in a <InlineCode>li</InlineCode>. Cards flow in DOM
              order, row by row, which is the order the keyboard follows.
            </p>
          </Prose>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable rows={[ { slot: 'grid', part: 'The grid itself, unless a data-slot is passed', attributes: [ 'data-fill' ] } ]} />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={gridProps}
            rest={(
              <React.Fragment>
                <InlineCode>as</InlineCode> picks the element, <InlineCode>div</InlineCode> by default, and every other
                prop goes to it.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Pick the minimum from the content'}>
              The narrowest a card can be and still read well: the longest plate, a title on one line, a badge
              beside it. The grid does the rest at every width.
            </Guidance>
            <Guidance kind={'dont'} title={'Add breakpoints to a Grid'}>
              If the count has to change at given widths, that is a design decision, and it is{' '}
              <InlineCode>Stack columns</InlineCode>.
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

export const Route = createFileRoute('/layout/grid')({
  component: GridPage
});
