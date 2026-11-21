import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import safeAreaProps from 'virtual:ui-props/StrictSafeAreaProps';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/layout/safe-area/basic.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/layout/safe-area');


/* --------
 * Page
 * -------- */

function SafeAreaPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Pads its content out of the notch, the home indicator and the rounded corners of a phone, by the amounts
            the device reports. On a desktop those amounts are zero, and it adds nothing.
          </React.Fragment>
        )}
        imports={tsx`
          import { SafeArea } from '@proedis/ui/layout';
        `}
      />

      <PageBody>
        <Example of={basic} />
        <Prose>
          <p>
            The bottom bar of a driver’s app. On a phone with a home indicator the bar grows by its height, so the
            icons stay clear of it; in this browser it looks exactly like a bar without SafeArea, which is the point.
          </p>
        </Prose>

        <Section title={'The document has to opt in'}>
          <Callout tone={'warning'}>
            The insets are <InlineCode>0</InlineCode> until the page asks for the whole screen. Without{' '}
            <InlineCode>viewport-fit=cover</InlineCode> in the viewport meta tag, SafeArea renders no padding at all
            and looks like it does nothing.
          </Callout>
          <CodeBlock
            title={'index.html'}
            snippet={tsx`
              <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
            `}
          />
        </Section>

        <Section
          title={'Sides'}
          lead={(
            <React.Fragment>
              Which edges to keep clear. A bottom bar wants <InlineCode>bottom</InlineCode>, a full screen map{' '}
              <InlineCode>all</InlineCode>, a page in landscape <InlineCode>horizontal</InlineCode>, where the notch
              moves to a side.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'sides', 'Class', 'Pads' ]}
            rows={[
              [ <InlineCode key={'s'}>all</InlineCode>, <InlineCode key={'c'}>p-safe</InlineCode>, 'Every edge, the default' ],
              [ <InlineCode key={'s'}>top</InlineCode>, <InlineCode key={'c'}>pt-safe</InlineCode>, 'The top: the notch, the status bar' ],
              [ <InlineCode key={'s'}>bottom</InlineCode>, <InlineCode key={'c'}>pb-safe</InlineCode>, 'The bottom: the home indicator' ],
              [ <InlineCode key={'s'}>horizontal</InlineCode>, <InlineCode key={'c'}>px-safe</InlineCode>, 'Left and right' ],
              [ <InlineCode key={'s'}>vertical</InlineCode>, <InlineCode key={'c'}>py-safe</InlineCode>, 'Top and bottom' ]
            ]}
          />
          <Prose>
            <p>
              The classes are utilities the package declares, each reading the{' '}
              <InlineCode>env(safe-area-inset-*)</InlineCode> of its edges. You can write them yourself on any element,
              where they replace that element’s padding on those sides.
            </p>
          </Prose>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              No role. Content inside a safe area stays reachable by touch, which is the point: a button under the home
              indicator is a button that swipes the app away.
            </p>
          </Prose>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable rows={[ { slot: 'safe-area', part: 'The padded element, unless a data-slot is passed', attributes: [ 'data-sides' ] } ]} />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={safeAreaProps}
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
            <Guidance kind={'do'} title={'Pad the bar, not the page'}>
              Only what touches an edge needs the inset: a bottom bar, a header pinned at the top. The content between
              them scrolls freely.
            </Guidance>
            <Guidance kind={'dont'} title={'Add your own padding on the same sides'}>
              The safe area padding replaces it. Put your padding on an element inside, as the bar above does.
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

export const Route = createFileRoute('/layout/safe-area')({
  component: SafeAreaPage
});
