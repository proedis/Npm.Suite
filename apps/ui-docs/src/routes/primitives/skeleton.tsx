import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import skeletonProps from 'virtual:ui-props/SkeletonProps';
import themeDoc from 'virtual:ui-theme/primitives/skeleton';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import card from '@/examples/primitives/skeleton/card.tsx?example';
import loading from '@/examples/primitives/skeleton/loading.tsx?example';
import shapes from '@/examples/primitives/skeleton/shapes.tsx?example';
import item from '@/examples/primitives/skeleton/item.tsx?example';
import sizes from '@/examples/primitives/skeleton/sizes.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Page
 * -------- */

const PAGE = pageAt('/primitives/skeleton');

function SkeletonPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The shape of what is coming, for a first load in a page or a card: a line of text, a badge, a field. The
            frame, the titles and the labels are real from the start; only the values wait.
          </React.Fragment>
        )}
        imports={tsx`
          import { Skeleton } from '@proedis/ui/primitives';
        `}
      />

      <PageBody>
        <Example of={shapes} />

        <Section
          title={'Shapes'}
          lead={(
            <React.Fragment>
              Three shapes, each the height of what it stands for. The width is yours, as a class:{' '}
              <InlineCode>className</InlineCode> comes last and wins.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'shape', 'Stands for', 'Size' ]}
            rows={[
              [ <InlineCode key={'s'}>text</InlineCode>, 'A line of text. The default.', '10px tall, full width' ],
              [ <InlineCode key={'s'}>pill</InlineCode>, 'A badge or a short state', '20px tall, 64px wide, round' ],
              [ <InlineCode key={'s'}>field</InlineCode>, 'A form control', 'The height of a control, full width' ]
            ]}
          />
          <Prose>
            <p>
              <InlineCode>lines</InlineCode> with the text shape draws a paragraph: as many lines as asked, the last one
              shorter, so it reads as the end of a sentence and not as a table.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Text sizes'}
          lead={(
            <React.Fragment>
              A line of text stands for a size of text: <InlineCode>size</InlineCode> takes Tailwind’s names,{' '}
              <InlineCode>xs</InlineCode> to <InlineCode>2xl</InlineCode>, <InlineCode>sm</InlineCode> by default. The
              line is as tall as a line of that text, with the bar across its middle half, so a title and a paragraph of
              skeleton take the room the real ones will, and the page does not jump when they arrive.
            </React.Fragment>
          )}
        >
          <Example of={sizes} />
        </Section>

        <Section
          title={'An Item'}
          lead={(
            <React.Fragment>
              <InlineCode>{"shape={'item'}"}</InlineCode> is the row of an <InlineCode>Item</InlineCode>: a square where
              the leading visual goes, a title and a description, with the gap of an Item. A list loading is a column
              of them; the padding is the list’s, through <InlineCode>className</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={item} />
        </Section>

        <Section
          title={'In a card'}
          lead={'Everything that does not depend on the data is drawn for real: the frame, the title, the labels. The shapes stand only where a value will appear, at about its length.'}
        >
          <Example of={card} />
        </Section>

        <Section
          title={'Loading and back'}
          lead={(
            <React.Fragment>
              With <InlineCode>useDelayedBusy</InlineCode> the shapes appear only past 300ms, and once shown they stay at
              least 400ms: a fast answer never flashes grey bars. Load the list again.
            </React.Fragment>
          )}
        >
          <Example of={loading} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Every skeleton is <InlineCode>aria-hidden</InlineCode>: a shape has nothing to say. The wait is announced by
              the container, with <InlineCode>aria-busy</InlineCode>. The pulse stops with reduced motion and the shapes
              stay, still.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'skeleton', part: 'One shape, or one line of text', attributes: [ 'data-shape', 'data-size' ] },
              { slot: 'skeleton-bar', part: 'The bar inside a line of text' },
              { slot: 'skeleton-lines', part: 'The column around the lines of a paragraph' },
              { slot: 'skeleton-item', part: 'The row of an item shape' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable props={skeletonProps} rest={'Every other prop goes to the shape, or to the column of a paragraph.'} />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Draw the real frame'}>
              Header, titles, labels, buttons: what does not depend on the data is there from the first frame, still.
            </Guidance>
            <Guidance kind={'dont'} title={'Skeletons in a dialog or a drawer'}>
              An overlay that loads shows its veil through <InlineCode>busy</InlineCode>: the form behind it cannot be
              used anyway, and the veil says why.
            </Guidance>
            <Guidance kind={'do'} title={'Size each shape like its value'}>
              A plate is short, an address is long. Shapes of the right length make the arrival of the data a small
              change, not a jump.
            </Guidance>
            <Guidance kind={'dont'} title={'Use a skeleton for an update'}>
              Rows already on screen stay and dim under a LoadingBar. Replacing them with shapes throws away what the
              user was reading.
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

export const Route = createFileRoute('/primitives/skeleton')({
  component: SkeletonPage
});
