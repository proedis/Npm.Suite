import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import rangeDatePickerProps from 'virtual:ui-props/StrictRangeDatePickerProps';
import themeDoc from 'virtual:ui-theme/forms/range-date-picker';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/range-date-picker/basic.tsx?example';
import inContext from '@/examples/forms/range-date-picker/in-context.tsx?example';
import labels from '@/examples/forms/range-date-picker/labels.ts?source';
import openRange from '@/examples/forms/range-date-picker/open-range.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/range-date-picker');


/* --------
 * Page
 * -------- */

function RangeDatePickerPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A period in one field, “09/11/2026 – 22/11/2026”, typed one date after the other without stopping or picked
            on one calendar. It is the field of <InlineCode>DatePicker</InlineCode> with a period in it: the typing, the
            limits, the holidays, the language, the states and the sizes are the same, and documented there.
          </React.Fragment>
        )}
        imports={tsx`
          import { RangeDatePicker } from '@proedis/ui/forms/range-date-picker';
          import type { DateRange, DateValidity, RangeDatePickerLabels } from '@proedis/ui/forms/range-date-picker';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Picking a period'}
          lead={(
            <React.Fragment>
              The value is <InlineCode>{'{ from, to }'}</InlineCode>, each a <InlineCode>2026-11-16</InlineCode> string or{' '}
              <InlineCode>null</InlineCode>. On the calendar the first click picks the start and the second the end, with
              a preview under the pointer; closing after one click gives back the period there was. The footer says the
              period in words, with its number of days.
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={labels} title={labels.file} />
          <Prose>
            <p>
              The labels are the DatePicker’s without “Today”, which has no meaning for a period, and with the two
              sentences of the footer: <InlineCode>pickEnd</InlineCode> while the end is missing,{' '}
              <InlineCode>rangeSummary</InlineCode> once both ends are there.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Open periods'}
          lead={(
            <React.Fragment>
              In a filter one end may stay empty, “since” or “until”: <InlineCode>allowOpenRange</InlineCode> accepts it.
              Without it a period with one end is reported as <InlineCode>open</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={openRange} />
        </Section>

        <Section
          title={'Errors'}
          lead={(
            <React.Fragment>
              The codes of a DatePicker, and two of a period. <InlineCode>onValidityChange</InlineCode> says which end the
              report is about, <InlineCode>from</InlineCode> or <InlineCode>to</InlineCode>. The end typed before the start
              is reported, never swapped: someone who typed it that way may have meant something else.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Code', 'When' ]}
            rows={[
              [ <InlineCode key={'c'}>incomplete</InlineCode>, 'A part of one end is missing.' ],
              [ <InlineCode key={'c'}>impossible</InlineCode>, 'One end does not exist: 31 February.' ],
              [ <InlineCode key={'c'}>outOfRange</InlineCode>, 'An end before min or after max. The value is kept.' ],
              [ <InlineCode key={'c'}>order</InlineCode>, 'The end comes before the start.' ],
              [ <InlineCode key={'c'}>open</InlineCode>, 'One end only, without allowOpenRange.' ]
            ]}
          />
        </Section>

        <Section title={'In context'} lead={'Suspending a service: a period that cannot start in the past.'}>
          <Example of={inContext} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The keyboard is the DatePicker’s. The footer says in words what is chosen, so a period is read as one
              sentence and not as two clicks on a grid.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'date-picker', part: 'The wrapper', attributes: [ 'data-mode' ] },
              { slot: 'date-picker-field', part: 'The frame of the text', attributes: [ 'data-size', 'data-invalid', 'data-readonly', 'data-disabled' ] },
              { slot: 'date-picker-input', part: 'The text, both dates' },
              { slot: 'date-picker-panel', part: 'The calendar, in a portal' },
              { slot: 'date-picker-footer-text', part: 'The period in words' },
              { slot: 'calendar-day', part: 'A day of the grid', attributes: [ 'data-selected', 'data-in-range' ] }
            ]}
          />
          <Prose>
            <p>
              The slots are the DatePicker’s, with <InlineCode>data-mode</InlineCode> at{' '}
              <InlineCode>range</InlineCode> on the wrapper, so one stylesheet reaches both and a rule can still tell
              them apart.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <SubSection title={'RangeDatePicker'} id={'api-range-date-picker'}>
            <PropsTable
              props={rangeDatePickerProps}
              rest={(
                <React.Fragment>
                  The wrapper takes <InlineCode>className</InlineCode> and the shared props; every other prop an{' '}
                  <InlineCode>{'<input>'}</InlineCode> accepts, with the <InlineCode>ref</InlineCode>, reaches the text.
                </React.Fragment>
              )}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'One field for a period'}>
              A start and an end in two fields drift apart and allow an end before the start.
            </Guidance>
            <Guidance kind={'dont'} title={'Swap the ends'}>
              An end before the start is a mistake to report, not to correct in silence.
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

export const Route = createFileRoute('/forms/range-date-picker')({
  component: RangeDatePickerPage
});
