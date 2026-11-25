import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import rangeSliderProps from 'virtual:ui-props/RangeSliderProps';
import themeDoc from 'virtual:ui-theme/forms/range-slider';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { PropsTable } from '@/docs/Tables';
import apart from '@/examples/forms/range-slider/apart.tsx?example';
import basic from '@/examples/forms/range-slider/basic.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/range-slider');


/* --------
 * Page
 * -------- */

function RangeSliderPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The two ends of a range on a scale: a load from and to, a window of hours. The looks, the dots of the steps
            and the formatting are the ones of <InlineCode>Slider</InlineCode>, documented there.
          </React.Fragment>
        )}
        imports={tsx`
          import { RangeSlider } from '@proedis/ui/forms/range-slider';
          import type { RangeSliderLabels, SliderRange } from '@proedis/ui/forms/range-slider';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Two thumbs'}
          lead={(
            <React.Fragment>
              The value is <InlineCode>[start, end]</InlineCode>, the lower first. Each thumb is a control with a name of
              its own, from <InlineCode>labels</InlineCode>, required by the type. The ends never cross: a thumb stops
              against the other.
            </React.Fragment>
          )}
        />

        <Section
          title={'Keeping a distance'}
          lead={(
            <React.Fragment>
              <InlineCode>minStepsBetweenValues</InlineCode> keeps the two ends that many steps apart: a window of at least
              two hours.
            </React.Fragment>
          )}
        >
          <Example of={apart} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Two native range inputs, one per thumb, each with its name and its value. Tab moves from the first to the
              second; the keys are the Slider’s.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'range-slider', part: 'The root', attributes: [ 'data-variant', 'data-size', 'data-dragging', 'data-disabled' ] },
              { slot: 'range-slider-value', part: 'The two values, written' },
              { slot: 'range-slider-indicator', part: 'The fill between the ends' },
              { slot: 'range-slider-thumb', part: 'A thumb', attributes: [ 'data-index' ] }
            ]}
          />
          <Prose>
            <p>
              The other parts are the Slider’s, with <InlineCode>range-slider</InlineCode> in place of{' '}
              <InlineCode>slider</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <PropsTable props={rangeSliderProps} rest={'Every other prop goes to the root.'} />
        </Section>
      </PageBody>
    </React.Fragment>
  );
}


/* --------
 * Route
 * -------- */

export const Route = createFileRoute('/forms/range-slider')({
  component: RangeSliderPage
});
