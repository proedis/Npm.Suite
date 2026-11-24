import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import fieldControlState from 'virtual:ui-props/FieldControlState';
import fieldProps from 'virtual:ui-props/FieldProps';
import fieldCounterProps from 'virtual:ui-props/StrictFieldCounterProps';
import fieldErrorProps from 'virtual:ui-props/StrictFieldErrorProps';
import fieldLabelProps from 'virtual:ui-props/StrictFieldLabelProps';
import themeDoc from 'virtual:ui-theme/forms/field';
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
import basic from '@/examples/forms/field/basic.tsx?example';
import customControl from '@/examples/forms/field/custom-control.tsx?example';
import disabled from '@/examples/forms/field/disabled.tsx?example';
import error from '@/examples/forms/field/error.tsx?example';
import orientation from '@/examples/forms/field/orientation.tsx?example';
import parts from '@/examples/forms/field/parts.tsx?example';
import requiredOptional from '@/examples/forms/field/required-optional.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/field');


/* --------
 * Page
 * -------- */

function FieldPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            What dresses every form control: the label, the asterisk or the optional word, a description, an error,
            a counter. Parts only and no shortcut props, with the control as a direct child. On Base UI’s{' '}
            <InlineCode>Field</InlineCode>, which owns what is easy to get subtly wrong: the label tied to the control,
            the description and the error in its <InlineCode>aria-describedby</InlineCode>, the ids.
          </React.Fragment>
        )}
        imports={tsx`
          import { Field, FIELD_SPAN, useFieldControl } from '@proedis/ui/forms/field';
          import type { FieldControlState, FieldSpan } from '@proedis/ui/forms/field';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'The parts'}
          lead={(
            <React.Fragment>
              <InlineCode>Field.Label</InlineCode>, <InlineCode>Field.Description</InlineCode>,{' '}
              <InlineCode>Field.Error</InlineCode> and <InlineCode>Field.Counter</InlineCode>, in any order: each part
              finds its own row by its slot, not by where it was written. The label goes on top, the control under it,
              and the message row under the control, with the counter at its end.
            </React.Fragment>
          )}
        >
          <Example of={parts} />
        </Section>

        <Section
          title={'Required and optional'}
          lead={(
            <React.Fragment>
              <InlineCode>required</InlineCode> on the label draws the asterisk, hidden from assistive technology, and
              makes the control <InlineCode>aria-required</InlineCode> through the field: the two cannot disagree. In a
              form where almost everything is required, mark the rest with <InlineCode>optional</InlineCode> instead, a
              word in the language of the page. It is not shown together with <InlineCode>required</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={requiredOptional} />
          <Callout>
            The field never writes the native <InlineCode>required</InlineCode> attribute. Validation is the
            caller’s, and the browser’s bubble would be a second message, in the browser’s language.
          </Callout>
        </Section>

        <Section
          title={'Description and error'}
          lead={(
            <React.Fragment>
              The description says what is worth knowing before typing: a format, a constraint, what the value is for.
              The error comes from the caller, a schema or a server answer. With content the field is invalid; empty,
              meaning <InlineCode>null</InlineCode>, <InlineCode>undefined</InlineCode>, <InlineCode>false</InlineCode>{' '}
              or an empty string, it renders nothing and the field is valid again. Type five digits.
            </React.Fragment>
          )}
        >
          <Example of={error} />
          <Prose>
            <p>
              While the field shows an error the description is not rendered: the error takes its place and usually
              repeats what it said. It is not hidden but absent, so it also leaves the{' '}
              <InlineCode>aria-describedby</InlineCode> of the control. The mark in front of the message sits in a box one
              line tall, so it stays on the first line whatever the size of the text.
            </p>
            <p>
              Under a short field the message is one or two words. Inside a <InlineCode>Form</InlineCode> the same error
              also reaches the error summary, where it needs the name of the field:{' '}
              <InlineCode>summary</InlineCode> gives that longer line, and defaults to the message.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Counter'}
          lead={(
            <React.Fragment>
              <InlineCode>Field.Counter</InlineCode> sits at the end of the message row, there with or without a
              description or an error, and turns to the colour of an error with <InlineCode>exceeded</InlineCode>. It is
              visible only: a count read at every key is noise, so announcing the limit, near it and past it, is the
              caller’s. The first example on this page has one; write past 120 characters.
            </React.Fragment>
          )}
        />

        <Section
          title={'Orientation'}
          lead={(
            <React.Fragment>
              <InlineCode>horizontal</InlineCode> puts the label beside the control, on a third of the width, and the
              messages under the control. The third is a percentage of the field, not a fraction of what is left, so a
              counter does not move the control. It takes one value per breakpoint, like every layout prop.
            </React.Fragment>
          )}
        >
          <Example of={orientation} resizable />
          <Callout>
            In a <Link to={'/forms/form'} className={'font-medium underline'}>Form.Section</Link> the orientation is
            ignored: the grid of the section aligns the labels of a row, and a field turned sideways would break the
            row it sits in.
          </Callout>
        </Section>

        <Section
          title={'Disabled and read only'}
          lead={(
            <React.Fragment>
              <InlineCode>disabled</InlineCode> on the field disables the control inside it. Read only is a state of the
              control, not of the field: the value stays reachable, selectable and submitted, on a muted surface.
            </React.Fragment>
          )}
        >
          <Example of={disabled} />
        </Section>

        <Section
          title={'In a form section'}
          lead={(
            <React.Fragment>
              <InlineCode>span</InlineCode> and <InlineCode>breakBefore</InlineCode> only mean something inside a{' '}
              <InlineCode>Form.Section</InlineCode>, a grid of six columns: anywhere else a field takes one cell like any
              other child. The Form page shows them at work.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              <Form.Section title={'Address'}>
                <Field span={4}>…</Field>
                <Field span={2}>…</Field>
                <Field span={FIELD_SPAN['text-short']} breakBefore>…</Field>
              </Form.Section>
            `}
          />
          <DocTable
            head={[ 'FIELD_SPAN key', 'Span', 'For' ]}
            rows={[
              [ <InlineCode key={'k'}>text-short</InlineCode>, '1', 'A postcode, a floor, a short number' ],
              [ <InlineCode key={'k'}>text-code</InlineCode>, '2', 'A plate, a code, a phone number' ],
              [ <InlineCode key={'k'}>text</InlineCode>, '3', 'A name, a town: the default span' ],
              [ <InlineCode key={'k'}>text-long</InlineCode>, '4', 'A street, a company name, an email' ]
            ]}
          />
          <Prose>
            <p>
              <InlineCode>FIELD_SPAN</InlineCode> is there for a form builder that knows the kind of a value and not the
              number of columns; the detail view uses the same table, so a detail and its form line up.
            </p>
          </Prose>
        </Section>

        <Section
          title={'A control of your own'}
          lead={(
            <React.Fragment>
              <InlineCode>useFieldControl</InlineCode> is what every control of the package reads, and a control of the
              application reads it the same way: <InlineCode>required</InlineCode>, <InlineCode>invalid</InlineCode>,{' '}
              <InlineCode>disabled</InlineCode> and the <InlineCode>labelId</InlineCode> of the label. Outside a field the
              three flags are <InlineCode>false</InlineCode>. Move the slider past 90.
            </React.Fragment>
          )}
        >
          <Example of={customControl} />
          <Prose>
            <p>
              Two things make it a citizen of the form. The element that takes the focus carries{' '}
              <InlineCode>data-field-control</InlineCode>: it is what the error summary of a form focuses, and what lights
              a <Link to={'/forms/field-shell'} className={'font-medium text-primary hover:underline'}>FieldShell</Link>{' '}
              around it. And it takes its name with <InlineCode>aria-labelledby</InlineCode> from{' '}
              <InlineCode>labelId</InlineCode>, since the native label of the field points at the controls Base UI
              registers, and a plain input of yours is not one.
            </p>
          </Prose>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The label is a real <InlineCode>{'<label>'}</InlineCode> tied to a text control, so a press on it focuses
              the control. For a control that is not a text box (a trigger, a group of options) the control asks the
              field for a plain element instead: a click on it must not press the trigger or pick the first option.
            </p>
            <p>
              The description and the error are in the <InlineCode>aria-describedby</InlineCode> of the control while
              they are rendered, the asterisk is hidden and replaced by <InlineCode>aria-required</InlineCode>, and the
              error makes the control <InlineCode>aria-invalid</InlineCode>. The counter is hidden from assistive
              technology on purpose.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={error}
            rows={[
              { slot: 'field', part: 'The root, a grid of named tracks', attributes: [ 'data-span', 'data-break-before', 'data-required', 'data-orientation', 'data-invalid', 'data-disabled' ] },
              { slot: 'field-label', part: 'The label', attributes: [ 'data-required', 'data-optional' ] },
              { slot: 'field-required', part: 'The asterisk' },
              { slot: 'field-optional', part: 'The optional word' },
              { slot: 'field-description', part: 'The description' },
              { slot: 'field-error', part: 'The error row: the mark and the message' },
              { slot: 'field-error-icon-box', part: 'The box one line tall around the mark' },
              { slot: 'field-error-icon', part: 'The mark' },
              { slot: 'field-error-message', part: 'The message' },
              { slot: 'field-counter', part: 'The counter', attributes: [ 'data-exceeded' ] }
            ]}
          />
          <Prose>
            <p>
              <InlineCode>data-span</InlineCode>, <InlineCode>data-break-before</InlineCode> and{' '}
              <InlineCode>data-orientation</InlineCode> report the value at the narrowest width when the prop takes a map;
              in a form section the orientation reads <InlineCode>vertical</InlineCode>, the one the section imposes.
              Base UI adds the states of its own field to the root, the parts and the control, such as{' '}
              <InlineCode>data-filled</InlineCode> and <InlineCode>data-dirty</InlineCode>: they are Base UI’s
              contract, not this package’s.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <SubSection title={'Field'} id={'api-field'}>
            <PropsTable props={fieldProps} rest={'Every other prop goes to the root div: id, className, data-*, ref.'} />
          </SubSection>
          <SubSection title={'Field.Label'} id={'api-field-label'}>
            <PropsTable props={fieldLabelProps} rest={'Every other prop goes to the label element.'} />
          </SubSection>
          <SubSection title={'Field.Description'} id={'api-field-description'}>
            <Prose>
              <p>No props of its own: every prop goes to the paragraph. Not rendered while the field is invalid.</p>
            </Prose>
          </SubSection>
          <SubSection title={'Field.Error'} id={'api-field-error'}>
            <PropsTable props={fieldErrorProps} rest={'The message is the children. Every other prop goes to the error row.'} />
          </SubSection>
          <SubSection title={'Field.Counter'} id={'api-field-counter'}>
            <PropsTable props={fieldCounterProps} rest={'The count is the children, written by the caller. Every other prop goes to the span.'} />
          </SubSection>
          <SubSection title={'useFieldControl'} id={'api-use-field-control'}>
            <PropsTable props={fieldControlState} rest={'What the hook returns. Outside a field: false, false, false, and no labelId.'} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Give every field a description'}>
              The format, the unit, the constraint that is not obvious, or at least what the value is for. A field that
              says nothing is a field someone fills in twice.
            </Guidance>
            <Guidance kind={'dont'} title={'A placeholder as the label'}>
              It disappears at the first key, and it is read differently by every screen reader. The label is always
              there, a noun, with no trailing colon.
            </Guidance>
            <Guidance kind={'do'} title={'Short under the field, whole in the summary'}>
              “5 digits” under a postcode; “Postcode: it must have 5 digits” in the summary, through{' '}
              <InlineCode>summary</InlineCode>.
            </Guidance>
            <Guidance kind={'dont'} title={'The native required or maxLength'}>
              Both bring the browser’s own messages and behaviour. The asterisk and the counter say it, the caller
              validates.
            </Guidance>
            <Guidance kind={'do'} title={'Read the field from your own control'}>
              <InlineCode>useFieldControl</InlineCode> and <InlineCode>data-field-control</InlineCode> are the whole
              contract: then the asterisk, the error and the summary work for it too.
            </Guidance>
            <Guidance kind={'dont'} title={'A label and an input by hand'}>
              Every control of a form is inside a Field. An error drawn with a red span is an error no screen reader
              hears and no summary lists.
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

export const Route = createFileRoute('/forms/field')({
  component: FieldPage
});
