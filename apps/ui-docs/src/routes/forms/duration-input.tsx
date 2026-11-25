import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import durationInputProps from 'virtual:ui-props/StrictDurationInputProps';
import themeDoc from 'virtual:ui-theme/forms/duration-input';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/duration-input/basic.tsx?example';
import labels from '@/examples/forms/duration-input/labels.ts?source';
import precision from '@/examples/forms/duration-input/precision.tsx?example';
import states from '@/examples/forms/duration-input/states.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/duration-input');


/* --------
 * Page
 * -------- */

function DurationInputPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A duration typed in segments, hours, minutes and seconds: the digits move to the next segment once it is
            full, the arrows change it with a carry. The value is a number of seconds, and two functions read and write the{' '}
            <InlineCode>TimeSpan</InlineCode> an API speaks.
          </React.Fragment>
        )}
        imports={tsx`
          import { DurationInput, durationFromTimeSpan, durationToTimeSpan } from '@proedis/ui/forms/duration-input';
          import type { DurationInputLabels, DurationPrecision } from '@proedis/ui/forms/duration-input';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Typing a duration'}
          lead={(
            <React.Fragment>
              Each segment is a spinbutton. Typing “0130” fills the hours and the minutes; a digit that cannot start two,
              a 7 in the minutes, fills its segment at once and moves on; a colon, a dot or a space moves on by hand. A
              segment left empty counts as zero beside one that is not, and the value is <InlineCode>null</InlineCode>{' '}
              only while every segment is empty. Pasting <InlineCode>1:30:00</InlineCode> or a TimeSpan fills them all.
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={labels} title={labels.file} />
        </Section>

        <Section
          title={'Seconds, and the TimeSpan of an API'}
          lead={(
            <React.Fragment>
              The value is whole seconds, a number, so a schema’s bounds reach the control through its binding.{' '}
              <InlineCode>durationFromTimeSpan</InlineCode> reads what an API sends, <InlineCode>'01:30:00'</InlineCode>{' '}
              or <InlineCode>'1.02:00:00'</InlineCode> past a day, and <InlineCode>durationToTimeSpan</InlineCode> writes it
              back.
            </React.Fragment>
          )}
        >
          <CodeBlock
            title={'round.ts'}
            snippet={tsx`
              const seconds = durationFromTimeSpan(dto.duration);   // '01:30:00' → 5400
              const payload = { duration: durationToTimeSpan(seconds) };   // 5400 → '01:30:00'

              // With a model of @proedis/modeler the bridge is already there
              const fromModel = round.duration.totalSeconds;
              const toModel = TimeSpan.fromSeconds(seconds);
            `}
          />
          <Callout>
            A TimeSpan of a day or more carries its days, <InlineCode>1.02:00:00</InlineCode>, while the field shows the
            hours uncapped, 26:00:00: a duration is read in hours, a date of a later day is another control.
          </Callout>
        </Section>

        <Section
          title={'Precision and length'}
          lead={(
            <React.Fragment>
              <InlineCode>precision={'{\'minutes\'}'}</InlineCode> drops the seconds. <InlineCode>max</InlineCode>, in
              seconds, stops the arrows there and gives the hours the digits it needs: 99 hours by default, two digits.
            </React.Fragment>
          )}
        >
          <Example of={precision} />
        </Section>

        <Section title={'States and sizes'} lead={'The frame of every text control: the three sizes, read only, disabled, an error.'}>
          <Example of={states} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The segments sit in a <InlineCode>group</InlineCode> named by the label of the <InlineCode>Field</InlineCode>;
              each is a <InlineCode>spinbutton</InlineCode> named by <InlineCode>labels</InlineCode>, with its value and its
              bounds, and a stop of Tab. The ref is the first segment, the element a form focuses on an error.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Digits</InlineCode>, 'Fill the segment, then move to the next.' ],
              [ <InlineCode key={'k'}>↑ ↓</InlineCode>, 'One more or one less, with a carry into the next unit.' ],
              [ <InlineCode key={'k'}>Page Up</InlineCode>, 'Ten more; Page Down, ten less.' ],
              [ <InlineCode key={'k'}>Home</InlineCode>, 'The segment to zero; End to its largest value.' ],
              [ <InlineCode key={'k'}>← →</InlineCode>, 'The segment before or after.' ],
              [ <InlineCode key={'k'}>Backspace</InlineCode>, 'Empties the segment; on an empty one, goes back.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'duration-input', part: 'The frame', attributes: [ 'data-size', 'data-invalid', 'data-readonly', 'data-disabled' ] },
              { slot: 'duration-input-segments', part: 'The group of the segments' },
              { slot: 'duration-input-segment', part: 'A segment', attributes: [ 'data-unit', 'data-empty' ] },
              { slot: 'duration-input-separator', part: 'A colon' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable props={durationInputProps} />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Seconds in the form, a TimeSpan at the edge'}>
              Convert where the data enters and leaves: the form compares numbers, the API reads its format.
            </Guidance>
            <Guidance kind={'dont'} title={'A time of day'}>
              08:30 as a moment of the day is not a duration: it does not carry, and it stops at 23:59.
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

export const Route = createFileRoute('/forms/duration-input')({
  component: DurationInputPage
});
