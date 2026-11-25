import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import sliderProps from 'virtual:ui-props/SliderProps';
import themeDoc from 'virtual:ui-theme/forms/slider';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/slider/basic.tsx?example';
import field from '@/examples/forms/slider/field.tsx?example';
import variants from '@/examples/forms/slider/variants.tsx?example';
import words from '@/examples/forms/slider/words.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/slider');


/* --------
 * Page
 * -------- */

function SliderPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            One number picked on a scale, by dragging or with the arrows: a zoom, an opacity, a width. Two looks, a line
            with a thumb and a bar as tall as a field. The two ends of a range are{' '}
            <InlineCode>RangeSlider</InlineCode>.
          </React.Fragment>
        )}
        imports={tsx`
          import { Slider } from '@proedis/ui/forms/slider';
          import type { SliderProps, SliderVariant } from '@proedis/ui/forms/slider';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Two looks'}
          lead={(
            <React.Fragment>
              <InlineCode>track</InlineCode>, the default, writes the label and the value above a line with a thumb.{' '}
              <InlineCode>field</InlineCode> is a bar as tall as a control of its <InlineCode>size</InlineCode>, filled up
              to the value, with the label inside on the left, the value on the right and a short handle at the end of the
              fill; a press anywhere on the bar moves it there. A scale of twelve steps or fewer draws a dot at each step,
              where the fill has not reached yet; <InlineCode>ticks</InlineCode> forces them on or off.
            </React.Fragment>
          )}
        >
          <Example of={variants} />
        </Section>

        <Section
          title={'In a row of fields'}
          lead={(
            <React.Fragment>
              The <InlineCode>field</InlineCode> look has the height of the other controls of its size, so it lines up with
              them. In a <InlineCode>Field</InlineCode>, the label of the field names it, and its own{' '}
              <InlineCode>label</InlineCode> can say something shorter inside the bar.
            </React.Fragment>
          )}
        >
          <Example of={field} />
        </Section>

        <Section
          title={'The value in words'}
          lead={(
            <React.Fragment>
              The value is written by <InlineCode>Intl.NumberFormat</InlineCode>: <InlineCode>format</InlineCode> for a unit,
              a currency or decimals, <InlineCode>locale</InlineCode> for the language. <InlineCode>valueText</InlineCode>{' '}
              puts words around the formatted number. <InlineCode>showValue={'{false}'}</InlineCode> hides it.
            </React.Fragment>
          )}
        >
          <Example of={words} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              On Base UI’s Slider: the thumb is a native range input, named by the <InlineCode>Field</InlineCode>, by{' '}
              <InlineCode>label</InlineCode> or by <InlineCode>aria-label</InlineCode>, and it says its value as it is
              written. <InlineCode>onValueChange</InlineCode> follows the drag; <InlineCode>onValueCommitted</InlineCode>{' '}
              comes once the pointer or the key is released, where a request belongs.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Arrows</InlineCode>, 'One step.' ],
              [ <InlineCode key={'k'}>Page Up</InlineCode>, <React.Fragment key={'w'}><InlineCode>largeStep</InlineCode>, 10 by default; Page Down back. Shift with an arrow does the same.</React.Fragment> ],
              [ <InlineCode key={'k'}>Home</InlineCode>, 'The minimum. End, the maximum.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={variants}
            rows={[
              { slot: 'slider', part: 'The root', attributes: [ 'data-variant', 'data-size', 'data-dragging', 'data-disabled' ] },
              { slot: 'slider-header', part: 'The label and the value above a track' },
              { slot: 'slider-label', part: 'The label' },
              { slot: 'slider-value', part: 'The written value' },
              { slot: 'slider-control', part: 'The area that takes the press' },
              { slot: 'slider-track', part: 'The line, or the bar' },
              { slot: 'slider-indicator', part: 'The fill' },
              { slot: 'slider-thumb', part: 'The thumb, or the handle of a bar' },
              { slot: 'slider-tick', part: 'The dot of a step' },
              { slot: 'slider-content', part: 'The label and the value inside a bar' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable props={sliderProps} rest={'Every other prop goes to the root.'} />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A value one feels'}>
              A zoom, an opacity, a width: a value judged by its effect, where an approximate one is fine.
            </Guidance>
            <Guidance kind={'dont'} title={'A value one knows'}>
              A quantity to type exactly, 1,204 kg, is a NumberInput: nobody drags to a precise number.
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

export const Route = createFileRoute('/forms/slider')({
  component: SliderPage
});
