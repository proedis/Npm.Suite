import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import dateModeProps from 'virtual:ui-props/DateModeProps';
import rangeModeProps from 'virtual:ui-props/RangeModeProps';
import themeDoc from 'virtual:ui-theme/forms/date-picker';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/date-picker/basic.tsx?example';
import inContext from '@/examples/forms/date-picker/in-context.tsx?example';
import labels from '@/examples/forms/date-picker/labels.ts?source';
import limits from '@/examples/forms/date-picker/limits.tsx?example';
import locale from '@/examples/forms/date-picker/locale.tsx?example';
import openRange from '@/examples/forms/date-picker/open-range.tsx?example';
import range from '@/examples/forms/date-picker/range.tsx?example';
import states from '@/examples/forms/date-picker/states.tsx?example';
import validity from '@/examples/forms/date-picker/validity.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/date-picker');

/** What the period adds to the shared props, which the date table already lists */
const RANGE_OWN = rangeModeProps.filter((prop) => [ 'mode', 'value', 'defaultValue', 'onValueChange', 'allowOpenRange' ].includes(prop.name));


/* --------
 * Page
 * -------- */

function DatePickerPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A date or a period, typed or picked. The separators arrive on their own while typing, the button at the
            end opens a calendar, and a period is one field with both dates in it. The value is a string,{' '}
            <InlineCode>2026-11-16</InlineCode>, never a <InlineCode>Date</InlineCode>.
          </React.Fragment>
        )}
        imports={tsx`
          import { DatePicker } from '@proedis/ui/forms/date-picker';
          import type { DatePickerLabels, DateRange, DateValidity, DayMeta } from '@proedis/ui/forms/date-picker';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Typed or picked'}
          lead={(
            <React.Fragment>
              The order of the parts is the language’s: day, month and year in British English and in Italian, month
              first in American English. Typing “16112026” writes “16/11/2026”. A click in the text opens the calendar
              and leaves the focus there to type; the calendar button and the x are not Tab stops.
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={labels} title={labels.file} />
          <Callout tone={'warning'} title={'A string, never a Date'}>
            A date with no time serialized from a <InlineCode>Date</InlineCode> in Italy is the day before at 23:00. The
            value is the ISO day, <InlineCode>2026-11-16</InlineCode>, in and out, and nothing in the field converts
            it to a moment in time.
          </Callout>
        </Section>

        <Section
          title={'A period'}
          lead={(
            <React.Fragment>
              <InlineCode>{'mode={\'range\'}'}</InlineCode> holds both dates in one field, “09/11/2026 – 22/11/2026”, and
              one calendar. The first click picks the start, the second the end, with a preview under the pointer;
              closing after one click gives back the period there was. The value is{' '}
              <InlineCode>{'{ from, to }'}</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={range} />
          <Prose>
            <p>
              The end typed before the start is reported, never swapped: someone who typed it that way may have meant
              something else, and only they know what.
            </p>
          </Prose>

          <SubSection
            title={'Open periods'}
            lead={(
              <React.Fragment>
                In a filter one end may stay empty, “since” or “until”: <InlineCode>allowOpenRange</InlineCode> accepts
                it. Without it a period with one end is reported as <InlineCode>open</InlineCode>.
              </React.Fragment>
            )}
          >
            <Example of={openRange} />
          </SubSection>
        </Section>

        <Section
          title={'Limits, days off and holidays'}
          lead={(
            <React.Fragment>
              <InlineCode>min</InlineCode> and <InlineCode>max</InlineCode> are included. <InlineCode>isDateUnavailable</InlineCode>{' '}
              takes days out of the calendar, <InlineCode>dayMeta</InlineCode> marks the ones to notice: a holiday is
              muted, with its name as a hint.
            </React.Fragment>
          )}
        >
          <Example of={limits} />
        </Section>

        <Section
          title={'Errors'}
          lead={(
            <React.Fragment>
              The field never complains while someone types. On leaving it, <InlineCode>onValidityChange</InlineCode>{' '}
              says what was wrong, as a code, and the message is yours. A half date and an impossible one leave the
              value <InlineCode>null</InlineCode>; a date out of the limits is kept and reported; an empty field is not
              an error.
            </React.Fragment>
          )}
        >
          <Example of={validity} />
          <DocTable
            head={[ 'Code', 'When' ]}
            rows={[
              [ <InlineCode key={'c'}>incomplete</InlineCode>, <React.Fragment key={'w'}>A part is missing, named in <InlineCode>missing</InlineCode>: day, month or year.</React.Fragment> ],
              [ <InlineCode key={'c'}>impossible</InlineCode>, 'The date does not exist: 31 February.' ],
              [ <InlineCode key={'c'}>outOfRange</InlineCode>, 'Before min or after max. The value is kept.' ],
              [ <InlineCode key={'c'}>order</InlineCode>, 'A period whose end comes before its start.' ],
              [ <InlineCode key={'c'}>open</InlineCode>, 'A period with one end only, without allowOpenRange.' ]
            ]}
          />
        </Section>

        <Section
          title={'Language'}
          lead={(
            <React.Fragment>
              <InlineCode>locale</InlineCode> sets the order of the parts, the names of months and days and the first day
              of the week. The order and the names come from <InlineCode>Intl</InlineCode>; dayjs needs the locale
              loaded by the application.
            </React.Fragment>
          )}
        >
          <Example of={locale} />
        </Section>

        <Section
          title={'States and sizes'}
          lead={(
            <React.Fragment>
              Required, it has no x and no “Clear”. <InlineCode>sm</InlineCode> sits in a filter bar or a table. Read only,
              disabled and invalid work as in every text control.
            </React.Fragment>
          )}
        >
          <Example of={states} />
        </Section>

        <Section
          title={'In context'}
          lead={'Suspending a service: a period that cannot start in the past.'}
        >
          <Example of={inContext} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The text is the control, and the label of its <InlineCode>Field</InlineCode> names it. The format, “dd/mm/yyyy”,
              shows in the empty field. The calendar is a grid of buttons with the arrows of a grid, and the footer says in
              words what is chosen, so a period is read as one sentence.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Alt ↓</InlineCode>, 'Opens the calendar with the focus in the grid.' ],
              [ <InlineCode key={'k'}>Ctrl Backspace</InlineCode>, 'Empties the field. ⌘ Backspace on a Mac.' ],
              [ <InlineCode key={'k'}>Arrows</InlineCode>, 'In the grid, move by a day or a week.' ],
              [ <InlineCode key={'k'}>Home</InlineCode>, 'In the grid, the first day of the week. End, the last.' ],
              [ <InlineCode key={'k'}>Page Up</InlineCode>, 'In the grid, the previous month; with Shift, the previous year. Page Down goes forward.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'In the grid, picks the day. Space does the same.' ],
              [ <InlineCode key={'k'}>Esc</InlineCode>, 'From the months or the years, back to the days; from the days, closes the calendar.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'date-picker', part: 'The wrapper', attributes: [ 'data-mode' ] },
              { slot: 'date-picker-field', part: 'The frame of the text', attributes: [ 'data-size', 'data-invalid', 'data-readonly', 'data-disabled' ] },
              { slot: 'date-picker-input', part: 'The text, which takes the focus' },
              { slot: 'date-picker-actions', part: 'The x and the calendar button' },
              { slot: 'date-picker-calendar-button', part: 'The button that opens the calendar' },
              { slot: 'date-picker-clear', part: 'The x' },
              { slot: 'date-picker-panel', part: 'The calendar, in a portal' },
              { slot: 'date-picker-footer', part: 'The footer of the calendar' },
              { slot: 'date-picker-footer-text', part: 'What is chosen, in words' },
              { slot: 'date-picker-footer-actions', part: 'The row of the two actions' },
              { slot: 'date-picker-today', part: '“Today”' },
              { slot: 'date-picker-footer-clear', part: '“Clear”' },
              { slot: 'calendar', part: 'The calendar', attributes: [ 'data-view' ] },
              { slot: 'calendar-day', part: 'A day of the grid', attributes: [ 'data-day', 'data-selected', 'data-in-range', 'data-today', 'data-outside', 'data-weekend', 'data-muted', 'data-unavailable' ] }
            ]}
          />
          <Prose>
            <p>
              The rest of the calendar: <InlineCode>calendar-header</InlineCode>, <InlineCode>calendar-title</InlineCode>,{' '}
              <InlineCode>calendar-previous</InlineCode>, <InlineCode>calendar-next</InlineCode>,{' '}
              <InlineCode>calendar-grid</InlineCode>, <InlineCode>calendar-weekdays</InlineCode>,{' '}
              <InlineCode>calendar-weekday</InlineCode>, <InlineCode>calendar-week</InlineCode>,{' '}
              <InlineCode>calendar-cell</InlineCode>, and for the choice of a month or a year{' '}
              <InlineCode>calendar-months</InlineCode>, <InlineCode>calendar-month</InlineCode>,{' '}
              <InlineCode>calendar-years</InlineCode> and <InlineCode>calendar-year</InlineCode>, each with{' '}
              <InlineCode>data-selected</InlineCode>. <InlineCode>data-view</InlineCode> on the calendar says which
              of the three is shown.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <SubSection title={'A date'} id={'api-date'}>
            <PropsTable
              props={dateModeProps}
              rest={(
                <React.Fragment>
                  The wrapper takes <InlineCode>className</InlineCode> and the shared props; every other prop an{' '}
                  <InlineCode>{'<input>'}</InlineCode> accepts, with the <InlineCode>ref</InlineCode>, reaches the text.
                  The component’s own handlers run after yours. <InlineCode>size</InlineCode> defaults to{' '}
                  <InlineCode>md</InlineCode>.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'A period'} id={'api-range'}>
            <PropsTable props={RANGE_OWN} rest={'Every other prop is the one of a date, above.'} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Keep dates as strings'}>
              Store, send and compare <InlineCode>2026-11-16</InlineCode>. A <InlineCode>Date</InlineCode> carries a
              time and a zone the value never had.
            </Guidance>
            <Guidance kind={'dont'} title={'Two fields for a period'}>
              A start and an end in two fields drift apart and allow an end before the start. One field with
              <InlineCode>mode={'\'range\''}</InlineCode> keeps the period together.
            </Guidance>
            <Guidance kind={'do'} title={'Name the holidays'}>
              A muted day with its name tells why a date is unusual without forbidding it.
            </Guidance>
            <Guidance kind={'dont'} title={'Validate while typing'}>
              A half date is not an error yet. The field reports on leaving, and so should the form.
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

export const Route = createFileRoute('/forms/date-picker')({
  component: DatePickerPage
});
