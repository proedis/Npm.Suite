import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import progressBarProps from 'virtual:ui-props/ProgressBarOwnProps';
import themeDoc from 'virtual:ui-theme/feedback/progress-bar';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/feedback/progress-bar/basic.tsx?example';
import bounds from '@/examples/feedback/progress-bar/bounds.tsx?example';
import live from '@/examples/feedback/progress-bar/live.tsx?example';
import meter from '@/examples/feedback/progress-bar/meter.tsx?example';
import radius from '@/examples/feedback/progress-bar/radius.tsx?example';
import sizes from '@/examples/feedback/progress-bar/sizes.tsx?example';
import theme from '@/examples/feedback/progress-bar/theme.tsx?example';
import tones from '@/examples/feedback/progress-bar/tones.tsx?example';
import valuePosition from '@/examples/feedback/progress-bar/value-position.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/feedback/progress-bar');

const PROPS = refineProps(progressBarProps, {
  min       : { default: '0' },
  max       : { default: '100' },
  tone      : { default: 'primary' },
  radius    : { default: 'default' },
  track     : { default: 'default' },
  showBounds: { default: 'false' }
});


/* --------
 * Page
 * -------- */

function ProgressBarPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            How far a piece of work has gone, and with <InlineCode>Meter</InlineCode> a quantity in a range: one bar, with
            its size, corner, ground and tone, the value written where it reads best, the bounds under its ends, and a
            fill that slides when the value changes.
          </React.Fragment>
        )}
        imports={tsx`
          import { Meter, ProgressBar } from '@proedis/ui/feedback/progress-bar';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Value'}
          lead={(
            <React.Fragment>
              <InlineCode>value</InlineCode> between <InlineCode>min</InlineCode> and <InlineCode>max</InlineCode>, 0 and 100
              by default, clamped to them. It is written by <InlineCode>Intl.NumberFormat</InlineCode>: a percentage of the
              range by default, the value itself with <InlineCode>format</InlineCode> (a unit, a currency, decimals), and{' '}
              <InlineCode>valueText</InlineCode> wraps the formatted number in words, “29 of 38 stops”. No word ships in the
              component.
            </React.Fragment>
          )}
        />

        <Section
          title={'Where the value is written'}
          lead={(
            <React.Fragment>
              <InlineCode>valuePosition</InlineCode>: over the bar at the end of the label (<InlineCode>top</InlineCode>,
              the default), after it, inside it, in a bubble that rides the end of the fill, or nowhere. Inside, the value
              is written twice and clipped by the fill, so its ink changes where the fill passes and reads at 3% as at
              97%; it needs the room of <InlineCode>lg</InlineCode> or <InlineCode>xl</InlineCode>, and on a smaller bar it
              does not compile. After the bar, the column keeps the width of the largest value, so the bar does not move
              as the number grows.
            </React.Fragment>
          )}
        >
          <Example of={valuePosition} />
        </Section>

        <Section title={'Sizes'} lead={'The height of the track: 4, 6, 8, 16 and 24 pixels, md by default.'}>
          <Example of={sizes} />
        </Section>

        <Section
          title={'Tones and ground'}
          lead={(
            <React.Fragment>
              The seven tones, <InlineCode>primary</InlineCode> by default. <InlineCode>track</InlineCode> is the ground under
              the fill: <InlineCode>default</InlineCode> reads the theme’s <InlineCode>--progress-track</InlineCode>{' '}
              (<InlineCode>--muted</InlineCode>), <InlineCode>tone</InlineCode> the soft of the tone,{' '}
              <InlineCode>none</InlineCode> nothing.
            </React.Fragment>
          )}
        >
          <Example of={tones} />
        </Section>

        <Section
          title={'Radius'}
          lead={(
            <React.Fragment>
              The corner of the track and of the fill. <InlineCode>default</InlineCode> is the theme’s{' '}
              <InlineCode>--progress-radius</InlineCode>, round when undeclared.
            </React.Fragment>
          )}
        >
          <Example of={radius} />
        </Section>

        <Section
          title={'Bounds'}
          lead={(
            <React.Fragment>
              <InlineCode>showBounds</InlineCode> writes the minimum and the maximum under the ends, in the format of the
              value: <InlineCode>0%</InlineCode> and <InlineCode>100%</InlineCode> by default, <InlineCode>0 kg</InlineCode>{' '}
              and <InlineCode>2,000 kg</InlineCode> with a unit.
            </React.Fragment>
          )}
        >
          <Example of={bounds} />
        </Section>

        <Section
          title={'Motion and the unknown'}
          lead={(
            <React.Fragment>
              A change of value slides the fill and the bubble in 300ms; under reduced motion they jump.{' '}
              <InlineCode>value={'{null}'}</InlineCode> is a ProgressBar that cannot say how far it is: a segment runs
              across, the value is not written, and a screen reader hears <InlineCode>indeterminateLabel</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={live} />
        </Section>

        <Section
          title={'Meter'}
          lead={(
            <React.Fragment>
              The same bar for a quantity in a range that is not a piece of work: the load of a vehicle, the space used, the
              share of a target. A screen reader hears a <InlineCode>meter</InlineCode> instead of a{' '}
              <InlineCode>progressbar</InlineCode>, and it is never indeterminate. The tone is yours to pick from the
              value.
            </React.Fragment>
          )}
        >
          <Example of={meter} />
          <DocTable
            head={[ 'Use', 'When' ]}
            rows={[
              [ <InlineCode key={'c'}>ProgressBar</InlineCode>, 'A piece of work moving towards its end: an upload, an import, a round' ],
              [ <InlineCode key={'c'}>Meter</InlineCode>, 'A measure that stays where it is: a load, a quota, a battery, a score' ]
            ]}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The root is a <InlineCode>progressbar</InlineCode> or a <InlineCode>meter</InlineCode> with{' '}
              <InlineCode>aria-valuenow</InlineCode>, its bounds and a <InlineCode>aria-valuetext</InlineCode> made of the
              formatted number, or of <InlineCode>getAriaValueText</InlineCode>. Its name is the visible{' '}
              <InlineCode>label</InlineCode>, or <InlineCode>aria-label</InlineCode> where the page already shows it: one
              of the two is required by the type. The written value is hidden from assistive technology, which hears it
              from the root.
            </p>
          </Prose>
          <Callout>
            A bar that only moves is not enough for a long wait: say what is happening in a status region too, once when it
            starts and once when it ends.
          </Callout>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Theming a bar'} lead={'The two variables on one bar, so only this one moves.'}>
          <Example of={theme} />
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={live}
            rows={[
              {
                slot      : 'progress-bar',
                part      : 'The root',
                attributes: [
                  'data-tone', 'data-size', 'data-radius', 'data-track', 'data-value-position', 'data-bounds',
                  'data-progressing', 'data-complete', 'data-indeterminate'
                ]
              },
              { slot: 'progress-bar-header', part: 'The row of the label and of a value on top' },
              { slot: 'progress-bar-label', part: 'The label' },
              { slot: 'progress-bar-value', part: 'The written value' },
              { slot: 'progress-bar-value-on-fill', part: 'The copy of an inside value, in the ink of the fill' },
              { slot: 'progress-bar-bubble-row', part: 'The room above the bar for the bubble' },
              { slot: 'progress-bar-bubble', part: 'The bubble at the end of the fill' },
              { slot: 'progress-bar-row', part: 'The bar and a value after it' },
              { slot: 'progress-bar-track', part: 'The ground' },
              { slot: 'progress-bar-indicator', part: 'The fill' },
              { slot: 'progress-bar-bounds', part: 'The row of the bounds' },
              { slot: 'progress-bar-min', part: 'The minimum' },
              { slot: 'progress-bar-max', part: 'The maximum' }
            ]}
          />
          <Prose>
            <p>
              A <InlineCode>Meter</InlineCode> writes <InlineCode>meter</InlineCode> in place of{' '}
              <InlineCode>progress-bar</InlineCode> in every slot.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={PROPS}
            rest={(
              <React.Fragment>
                Plus <InlineCode>size</InlineCode> (<InlineCode>xs</InlineCode> to <InlineCode>xl</InlineCode>,{' '}
                <InlineCode>md</InlineCode> by default), <InlineCode>valuePosition</InlineCode> (<InlineCode>top</InlineCode>{' '}
                by default, <InlineCode>inside</InlineCode> from <InlineCode>lg</InlineCode>) and the name, a{' '}
                <InlineCode>label</InlineCode> or an <InlineCode>aria-label</InlineCode>. A <InlineCode>Meter</InlineCode>{' '}
                takes the same props but <InlineCode>indeterminateLabel</InlineCode>, and a <InlineCode>value</InlineCode>{' '}
                that is never <InlineCode>null</InlineCode>. Every other prop goes to the root.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Say the unit'}>
              “29 of 38 stops” or “1,204 kg” says more than “76%”: <InlineCode>valueText</InlineCode> and{' '}
              <InlineCode>format</InlineCode> are there for it.
            </Guidance>
            <Guidance kind={'dont'} title={'Fake a progress'}>
              A bar that crawls to 90% and waits is a lie. When the end cannot be known, pass <InlineCode>null</InlineCode>.
            </Guidance>
            <Guidance kind={'do'} title={'Tone a meter by its value'}>
              A load near the limit is a warning: the tone is a function of the value, picked by the page.
            </Guidance>
            <Guidance kind={'dont'} title={'Use a ProgressBar for a measure'}>
              A quota or a load does not progress towards anything: it is a <InlineCode>Meter</InlineCode>.
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

export const Route = createFileRoute('/feedback/progress-bar')({
  component: ProgressBarPage
});
