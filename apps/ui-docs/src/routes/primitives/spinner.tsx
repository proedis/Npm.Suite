import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import spinnerProps from 'virtual:ui-props/StrictSpinnerProps';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import colour from '@/examples/primitives/spinner/colour.tsx?example';
import label from '@/examples/primitives/spinner/label.tsx?example';
import sizes from '@/examples/primitives/spinner/sizes.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/primitives/spinner');

const PROPS = refineProps(spinnerProps, {
  size: { description: '12, 16, 20 or 32 pixels.' }
});


/* --------
 * Page
 * -------- */

function SpinnerPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The house spinner: a ring with one open quarter, turned by CSS. No icon library and no markup inside, so a
            loading state costs four borders and one keyframe, and it takes the colour of whatever it sits in.
          </React.Fragment>
        )}
        imports={tsx`
          import { Spinner } from '@proedis/ui/primitives';
        `}
      />

      <PageBody>
        <Example of={sizes} />

        <Section title={'Sizes'}>
          <DocTable
            head={[ 'size', 'Box', 'Where' ]}
            rows={[
              [ <InlineCode key={'s'}>xs</InlineCode>, '12px, 1px ring', 'Next to small text, in a badge or a cell' ],
              [ <InlineCode key={'s'}>sm</InlineCode>, '16px, 2px ring', 'Inside a button or next to body text' ],
              [ <InlineCode key={'s'}>md</InlineCode>, '20px, 2px ring', 'The default: a veil, a panel' ],
              [ <InlineCode key={'s'}>lg</InlineCode>, '32px, 2px ring', 'Alone in an empty region' ]
            ]}
          />
        </Section>

        <Section
          title={'Colour'}
          lead={(
            <React.Fragment>
              The ring is drawn in <InlineCode>currentColor</InlineCode>, so it needs no tone of its own: it inherits the
              ink of its parent. Set a text colour around it, or on it with <InlineCode>className</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={colour} />
        </Section>

        <Section
          title={'With a label'}
          lead={(
            <React.Fragment>
              Alone, with no text around it saying what is happening, give it a <InlineCode>label</InlineCode>. The
              spinner becomes a polite live region and the label is announced; it stays out of sight.
            </React.Fragment>
          )}
        >
          <Example of={label} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Without <InlineCode>label</InlineCode> the spinner is <InlineCode>aria-hidden</InlineCode>, which is right when
              the text next to it already says what is going on: a button with a loading label, a veil with its
              sentence. With a <InlineCode>label</InlineCode> it is a <InlineCode>status</InlineCode> region with the label as
              hidden text. One of the two is always right, and the default is the quiet one.
            </p>
            <p>
              With reduced motion the ring stands still. A spinner runs unattended for as long as a request takes, and
              someone who asked the system to reduce motion asked about exactly this.
            </p>
          </Prose>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'spinner', part: 'The ring', attributes: [ 'data-size' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={PROPS}
            rest={(
              <React.Fragment>
                Polymorphic: <InlineCode>as</InlineCode> picks the element, a <InlineCode>span</InlineCode> by default, and
                every other prop goes to it.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Label it when it is alone'}>
              A spinner in the middle of an empty panel is the only thing on screen. Without a label a screen reader
              user hears nothing at all.
            </Guidance>
            <Guidance kind={'dont'} title={'Label it twice'}>
              Next to a sentence that says the same thing, a label makes it heard twice. Leave it out.
            </Guidance>
            <Guidance kind={'do'} title={'Let the component show it'}>
              Button, Surface, the veil and the overlays draw their own spinner from <InlineCode>loading</InlineCode> or{' '}
              <InlineCode>busy</InlineCode>. Reach for Spinner where nothing does.
            </Guidance>
            <Guidance kind={'dont'} title={'Bring an icon library for it'}>
              A rotating icon from a library puts the library on the path of every loading state. This is the same
              shape, in CSS.
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

export const Route = createFileRoute('/primitives/spinner')({
  component: SpinnerPage
});
