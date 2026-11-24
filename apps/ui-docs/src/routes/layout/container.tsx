import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import containerProps from 'virtual:ui-props/StrictContainerProps';
import themeDoc from 'virtual:ui-theme/layout/container';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { css, tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/layout/container/basic.tsx?example';
import padded from '@/examples/layout/container/padded.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/layout/container');


/* --------
 * Page
 * -------- */

function ContainerPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The column of a page: centred, never wider than its size, with a side padding that grows with the
            window. It constrains the content and nothing else; the layout inside it is a Stack, a Grid or a Split.
          </React.Fragment>
        )}
        imports={tsx`
          import { Container } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={basic} resizable align={'stretch'} />

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              Six names for the width a page may reach. <InlineCode>default</InlineCode> is the house page width and
              what you get by saying nothing; it is the same width as <InlineCode>lg</InlineCode>, but it is reported
              apart, so a product can restyle the pages nobody chose a width for without touching the ones that
              asked for <InlineCode>lg</InlineCode>.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'size', 'Maximum width', 'For' ]}
            rows={[
              [ <InlineCode key={'s'}>sm</InlineCode>, <span key={'w'}><InlineCode>max-w-3xl</InlineCode>, 48rem</span>, 'A form, an article, a sign in page' ],
              [ <InlineCode key={'s'}>md</InlineCode>, <span key={'w'}><InlineCode>max-w-5xl</InlineCode>, 64rem</span>, 'A detail page, settings' ],
              [ <InlineCode key={'s'}>default</InlineCode>, <span key={'w'}><InlineCode>max-w-7xl</InlineCode>, 80rem</span>, 'Most pages' ],
              [ <InlineCode key={'s'}>lg</InlineCode>, <span key={'w'}><InlineCode>max-w-7xl</InlineCode>, 80rem</span>, 'The same width, chosen on purpose' ],
              [ <InlineCode key={'s'}>xl</InlineCode>, <span key={'w'}><InlineCode>max-w-8xl</InlineCode>, 96rem</span>, 'A wide table, a dashboard' ],
              [ <InlineCode key={'s'}>full</InlineCode>, 'None', 'A map, a planner, anything that uses every pixel' ]
            ]}
          />
          <Prose>
            <p>
              <InlineCode>max-w-8xl</InlineCode> is a step the package adds to Tailwind’s container scale, which
              stops at <InlineCode>7xl</InlineCode>. It is declared as <InlineCode>--container-8xl</InlineCode>, so
              a product can retune it like any other step.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Padding'}
          lead={(
            <React.Fragment>
              On by default: <InlineCode>1rem</InlineCode> on each side, <InlineCode>1.5rem</InlineCode> from{' '}
              <InlineCode>sm</InlineCode>, <InlineCode>2rem</InlineCode> from <InlineCode>lg</InlineCode>.{' '}
              <InlineCode>{'padded={false}'}</InlineCode> takes it away, for content that draws its own edges. To
              take a single band out of the padding, keep it and wrap the band in <InlineCode>Bleed</InlineCode>,
              which undoes exactly this amount.
            </React.Fragment>
          )}
        >
          <Example of={padded} resizable align={'stretch'} />
        </Section>

        <Section
          title={'In context'}
          lead={'A page: the container caps the width, the layout inside is somebody else’s job.'}
        >
          <CodeBlock
            snippet={tsx`
              <Container as={'main'} className={'py-10'}>
                <Stack gap={8}>
                  <RoundsHeader />
                  <Grid minColWidth={280}>{cards}</Grid>
                </Stack>
              </Container>
            `}
          />
        </Section>

        <Section
          title={'Styling the default'}
          lead={(
            <React.Fragment>
              Every container reports its size, <InlineCode>default</InlineCode> included, so a product can give its
              own width to the pages that did not ask for one.
            </React.Fragment>
          )}
        >
          <CodeBlock
            title={'app.css'}
            snippet={css`
              /* A narrower house width, for the pages that did not choose one */
              [data-slot='container'][data-size='default'] {
                max-width: 72rem;
              }
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A container is a <InlineCode>{'<div>'}</InlineCode>. The one around the content of a page is its main
              landmark: render it with <InlineCode>{'as={\'main\'}'}</InlineCode>, once per page.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic} rows={[ { slot: 'container', part: 'The column, unless a data-slot is passed', attributes: [ 'data-size', 'data-padded' ] } ]} />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={containerProps}
            rest={(
              <React.Fragment>
                <InlineCode>as</InlineCode> picks the element, <InlineCode>div</InlineCode> by default, and every
                other prop goes to it.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'One Container per page'}>
              At the top of the page, around everything. Nested containers add their padding twice.
            </Guidance>
            <Guidance kind={'dont'} title={'Use Container to lay out'}>
              It has no gap and no direction. What goes inside it is a Stack, a Grid or a Split.
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

export const Route = createFileRoute('/layout/container')({
  component: ContainerPage
});
