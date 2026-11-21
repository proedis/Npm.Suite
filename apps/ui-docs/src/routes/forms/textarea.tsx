import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import textareaProps from 'virtual:ui-props/TextareaProps';
import { Callout } from '@/docs/Callout';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/forms/textarea/basic.tsx?example';
import counter from '@/examples/forms/textarea/counter.tsx?example';
import rows from '@/examples/forms/textarea/rows.tsx?example';
import states from '@/examples/forms/textarea/states.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/textarea');

const PROPS = refineProps(textareaProps, {
  rows     : { default: '3' },
  maxRows  : { default: '12' },
  className: { description: 'Classes for the textarea, last so they win.' }
});


/* --------
 * Page
 * -------- */

function TextareaPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The multi-line text field: the border of a TextInput, three lines to start, longer by hand. One size, the{' '}
            <InlineCode>md</InlineCode> of a TextInput, so its first line falls where the text of the field beside it
            does.
          </React.Fragment>
        )}
        imports={tsx`
          import { Textarea } from '@proedis/ui/forms/textarea';
          import type { TextareaProps } from '@proedis/ui/forms/textarea';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Rows'}
          lead={(
            <React.Fragment>
              <InlineCode>rows</InlineCode> is the height to start, <InlineCode>maxRows</InlineCode> how far the handle
              can drag it. The height does not change while typing, so the form around it stays still: whoever wants
              more room takes it, vertically only.
            </React.Fragment>
          )}
        >
          <Example of={rows} />
        </Section>

        <Section
          title={'Limits and the counter'}
          lead={(
            <React.Fragment>
              There is no <InlineCode>maxLength</InlineCode>, by the type: a native limit blocks typing and cuts a pasted
              text without saying so. The limit is the caller’s, shown with <InlineCode>Field.Counter</InlineCode> and
              checked like any other rule. Write past the limit, then trim it.
            </React.Fragment>
          )}
        >
          <Example of={counter} />
          <Callout>
            Someone who pastes a long text and sees it cut keeps typing at the end of a sentence that is not there. A
            counter in red with an error they can read loses nothing.
          </Callout>
        </Section>

        <Section
          title={'Read only, disabled, invalid'}
          lead={(
            <React.Fragment>
              Read only, the field is as tall as its text, from one line to <InlineCode>maxRows</InlineCode>, measured
              rather than left to <InlineCode>field-sizing</InlineCode>, which is not in every browser. Read only and
              disabled, the handle goes.
            </React.Fragment>
          )}
        >
          <Example of={states} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The textarea is the control itself, the bordered element that takes the focus, tied to the label of its
              field through Base UI’s <InlineCode>Field.Control</InlineCode>. It says{' '}
              <InlineCode>aria-required</InlineCode> and <InlineCode>aria-invalid</InlineCode> from the field.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'A new line, never a submit.' ],
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Leaves the field: it never writes a tab.' ]
            ]}
          />
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'textarea', part: 'The textarea, frame and control in one', attributes: [ 'data-field-control', 'data-invalid', 'data-readonly', 'data-disabled' ] }
            ]}
          />
          <Prose>
            <p>
              The lines are two custom properties, <InlineCode>--textarea-rows</InlineCode> and{' '}
              <InlineCode>--textarea-max-rows</InlineCode>, which the stylesheet turns into the minimum and the maximum
              height.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={PROPS}
            rest={'Every other prop of a <textarea> but maxLength: value, onChange, name, readOnly, disabled, placeholder, aria-*, ref.'}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A whole row of the section'}>
              A text of several lines takes <InlineCode>span={'{6}'}</InlineCode>: a narrow column of prose is a column
              nobody reads.
            </Guidance>
            <Guidance kind={'dont'} title={'A Textarea for a short value'}>
              A name, a code, a town are one line: a TextInput says so before anyone types.
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

export const Route = createFileRoute('/forms/textarea')({
  component: TextareaPage
});
