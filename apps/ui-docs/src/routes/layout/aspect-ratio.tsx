import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import aspectRatioProps from 'virtual:ui-props/AspectRatioProps';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/layout/aspect-ratio/basic.tsx?example';
import media from '@/examples/layout/aspect-ratio/media.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/layout/aspect-ratio');


/* --------
 * Page
 * -------- */

function AspectRatioPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A box that keeps its proportions at any width: as wide as its parent, as tall as the ratio says. The
            child fills it, and a picture or a video is cropped rather than stretched.
          </React.Fragment>
        )}
        imports={tsx`
          import { AspectRatio } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={basic} align={'stretch'} />

        <Section
          title={'Ratio'}
          lead={(
            <React.Fragment>
              <InlineCode>ratio</InlineCode> is the width over the height, as a number: <InlineCode>16 / 9</InlineCode>,
              the default, <InlineCode>4 / 3</InlineCode>, <InlineCode>1</InlineCode> for a square. Writing it as a
              division keeps the intent readable.
            </React.Fragment>
          )}
        />

        <Section
          title={'Pictures, maps and video'}
          lead={(
            <React.Fragment>
              The child is laid on an inner layer that covers the box and stretched to fill it. An{' '}
              <InlineCode>img</InlineCode> or a <InlineCode>video</InlineCode> gets <InlineCode>object-cover</InlineCode>,
              so a picture wider than the box is cropped at the sides, never squashed. A child with no size of its own,
              like the canvas of a map, gets the size of the box.
            </React.Fragment>
          )}
        >
          <Example of={media} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The box says nothing; the child does. A picture keeps its <InlineCode>alt</InlineCode>, an embedded
              frame its <InlineCode>title</InlineCode>. When the crop hides something the picture means, say it in
              the text around it.
            </p>
          </Prose>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable rows={[ { slot: 'aspect-ratio', part: 'The outer box that holds the ratio' } ]} />
          <Prose>
            <p>The inner layer around the child has no slot.</p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={aspectRatioProps}
            rest={(
              <React.Fragment>
                Always a <InlineCode>div</InlineCode>, with no <InlineCode>as</InlineCode>: it owns its inner layer.
                Every attribute of a <InlineCode>div</InlineCode> goes to the outer box, and a{' '}
                <InlineCode>style</InlineCode> is merged after the ratio.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Reserve the space of media'}>
              A picture in an AspectRatio has its height before it loads, so the page does not jump when it arrives.
            </Guidance>
            <Guidance kind={'dont'} title={'Put text in it'}>
              Text that does not fit is clipped, since the box hides its overflow. A ratio is for media.
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

export const Route = createFileRoute('/layout/aspect-ratio')({
  component: AspectRatioPage
});
