import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import fieldControlState from 'virtual:ui-props/FieldControlState';
import fieldProps from 'virtual:ui-props/FieldProps';
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
import anatomy from '@/examples/forms/field/anatomy.tsx?example';
import basic from '@/examples/forms/field/basic.tsx?example';
import customControl from '@/examples/forms/field/custom-control.tsx?example';
import disabled from '@/examples/forms/field/disabled.tsx?example';
import error from '@/examples/forms/field/error.tsx?example';
import messages from '@/examples/forms/field/messages.tsx?example';
import orientation from '@/examples/forms/field/orientation.tsx?example';
import requiredOptional from '@/examples/forms/field/required-optional.tsx?example';
import status from '@/examples/forms/field/status.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/forms/field');


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
            What dresses every form control: the label, the asterisk or the optional word, a description, a hint, the
            message of a status, a counter. All of it props, and the control is the one child. On Base UI’s{' '}
            <InlineCode>Field</InlineCode>, which owns what is easy to get subtly wrong: the label tied to the control,
            the description and the message in its <InlineCode>aria-describedby</InlineCode>, the ids.
          </React.Fragment>
        )}
        imports={tsx`
          import { Field, FIELD_SPAN, useFieldControl } from '@proedis/ui/forms/field';
          import type { FieldControlState, FieldSpan, FieldStatus } from '@proedis/ui/forms/field';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Anatomy'}
          lead={(
            <React.Fragment>
              Three rows, always in this order. On top the label, with its glyph (<InlineCode>icon</InlineCode>) and,
              under it, the <InlineCode>description</InlineCode>. In the middle the control, the one child. At the
              bottom one line: the <InlineCode>hint</InlineCode>, or the message of a status in its place, with the{' '}
              <InlineCode>counter</InlineCode> at its end. A row with nothing in it is not drawn.
            </React.Fragment>
          )}
        >
          <Example of={anatomy} />
          <DocTable
            head={[ 'Prop', 'Where', 'For' ]}
            rows={[
              [ <InlineCode key={'k'}>label</InlineCode>, 'Above', 'The name, tied to the control: a noun, no trailing colon' ],
              [ <InlineCode key={'k'}>description</InlineCode>, 'Under the label', 'What is worth knowing before typing. It stays when a message appears' ],
              [ <InlineCode key={'k'}>hint</InlineCode>, 'Under the control', 'A reminder while typing, an example. A message takes its place' ],
              [ <InlineCode key={'k'}>error</InlineCode>, 'Under the control', 'The error: the field is invalid and the message replaces the hint' ],
              [ <InlineCode key={'k'}>status</InlineCode>, 'Frame and line', <React.Fragment key={'k'}><InlineCode>warning</InlineCode> or <InlineCode>success</InlineCode>, with its <InlineCode>message</InlineCode></React.Fragment> ],
              [ <InlineCode key={'k'}>counter</InlineCode>, 'End of the line', 'A count, written by the caller; red with counterExceeded' ]
            ]}
          />
        </Section>

        <Section
          title={'Required and optional'}
          lead={(
            <React.Fragment>
              <InlineCode>required</InlineCode> draws the asterisk after the label, hidden from assistive technology,
              and makes the control <InlineCode>aria-required</InlineCode> through the field: the two cannot disagree. In a
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
          title={'Error'}
          lead={(
            <React.Fragment>
              The error comes from the caller, a schema or a server answer. With content the field is invalid; empty,
              meaning <InlineCode>null</InlineCode>, <InlineCode>undefined</InlineCode>, <InlineCode>false</InlineCode>{' '}
              or an empty string, it renders nothing and the field is valid again. The description above stays: it is
              what to write, the error is what went wrong. Type five digits.
            </React.Fragment>
          )}
        >
          <Example of={error} />
          <Prose>
            <p>
              Under a short field the message is one or two words. Inside a <InlineCode>Form</InlineCode> the same error
              also reaches the error summary, where it needs the name of the field:{' '}
              <InlineCode>errorSummary</InlineCode> gives that longer line, and defaults to the error.
            </p>
          </Prose>
        </Section>

        <Section
          title={'One line under the control'}
          lead={(
            <React.Fragment>
              The hint and the message of every status share one line: the same size, the same line height, and a mark
              in a box exactly one line tall. When the hint turns into an error, or the error into a warning, the field
              under it does not move by a pixel. Switch the line below and watch the second field.
            </React.Fragment>
          )}
        >
          <Example of={messages} />
          <Callout>
            The line is there only when it says something. A field with no hint has no line, and its first error opens
            one: if a form must not move at all, give every field a hint, which reserves the line.
          </Callout>
        </Section>

        <Section
          title={'Status'}
          lead={(
            <React.Fragment>
              Besides the error, a field can show a <InlineCode>warning</InlineCode>, a value that is accepted but worth a
              look, or a <InlineCode>success</InlineCode>, a value checked. Both colour the border of the control and the
              line with the ink of their tone; neither makes the field invalid nor stops a submit. The error keeps a
              double border: it is the one status that blocks.
            </React.Fragment>
          )}
        >
          <Example of={status} />
          <Prose>
            <p>
              <InlineCode>status</InlineCode> takes the tone, <InlineCode>message</InlineCode> the text; an{' '}
              <InlineCode>error</InlineCode> wins over both. The status reaches the control through{' '}
              <InlineCode>useFieldControl</InlineCode>, so a FieldShell of your own colours its border too.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Counter'}
          lead={(
            <React.Fragment>
              <InlineCode>counter</InlineCode> sits at the end of the line under the control, there with or without a
              hint or a message, and turns to the colour of an error with <InlineCode>counterExceeded</InlineCode>. It is
              visible only: a count read at every key is noise, so announcing the limit, near it and past it, is the
              caller’s. The anatomy above has one; write past 120 characters.
            </React.Fragment>
          )}
        />

        <Section
          title={'Orientation'}
          lead={(
            <React.Fragment>
              <InlineCode>horizontal</InlineCode> puts the label and its description beside the control, on a third of the
              width, and the line under the control. The third is a percentage of the field, not a fraction of what is left, so a
              counter does not move the control. It takes one value per breakpoint, like every layout prop.
            </React.Fragment>
          )}
        >
          <Example of={orientation} resizable />
          <Callout>
            In a <Link to={'/ui/forms/form'} className={'font-medium underline'}>Form.Section</Link> the orientation is
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
                <Field label={'Street'} span={4}><TextInput /></Field>
                <Field label={'Number'} span={2}><TextInput /></Field>
                <Field label={'Postcode'} span={FIELD_SPAN['text-short']} breakBefore><TextInput /></Field>
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
              <InlineCode>disabled</InlineCode>, the <InlineCode>status</InlineCode> and the <InlineCode>labelId</InlineCode>{' '}
              of the label. Outside a field the three flags are <InlineCode>false</InlineCode> and there is no status.
              Move the slider past 90.
            </React.Fragment>
          )}
        >
          <Example of={customControl} />
          <Prose>
            <p>
              Two things make it a citizen of the form. The element that takes the focus carries{' '}
              <InlineCode>data-field-control</InlineCode>: it is what the error summary of a form focuses, and what lights
              a <Link to={'/ui/forms/field-shell'} className={'font-medium text-primary hover:underline'}>FieldShell</Link>{' '}
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
              The description and the line under the control are in the <InlineCode>aria-describedby</InlineCode> of the
              control while they are rendered, and neither is ever inside the label, so the name of the control is the
              label alone. The asterisk is hidden and replaced by <InlineCode>aria-required</InlineCode>, an error makes
              the control <InlineCode>aria-invalid</InlineCode>, a warning and a success do not. The counter is hidden
              from assistive technology on purpose.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={error}
            rows={[
              { slot: 'field', part: 'The root, a grid of named tracks', attributes: [ 'data-span', 'data-break-before', 'data-required', 'data-status', 'data-orientation', 'data-invalid', 'data-disabled' ] },
              { slot: 'field-label', part: 'The label: a Label, with the slot the grid places', attributes: [ 'data-required', 'data-optional', 'data-leading' ] },
              { slot: 'label-text', part: 'The name, the <label> tied to the control' },
              { slot: 'label-required', part: 'The asterisk' },
              { slot: 'label-description', part: 'The description, under the label' },
              { slot: 'field-message', part: 'The line under the control: the hint or a message', attributes: [ 'data-status' ] },
              { slot: 'field-message-icon-box', part: 'The box one line tall around the mark' },
              { slot: 'field-message-icon', part: 'The mark of the status' },
              { slot: 'field-message-text', part: 'The text of the line' },
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
          <SubSection title={'useFieldControl'} id={'api-use-field-control'}>
            <PropsTable props={fieldControlState} rest={'What the hook returns. Outside a field: false, false, false, no status and no labelId.'} />
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
              <InlineCode>errorSummary</InlineCode>.
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

export const Route = createFileRoute('/ui/forms/field')({
  component: FieldPage
});
