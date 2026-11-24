import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import fieldShellProps from 'virtual:ui-props/FieldShellProps';
import themeDoc from 'virtual:ui-theme/forms/field-shell';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { PropsTable } from '@/docs/Tables';
import plateTags from '@/examples/forms/field-shell/plate-tags.tsx?example';
import sizes from '@/examples/forms/field-shell/sizes.tsx?example';
import states from '@/examples/forms/field-shell/states.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/field-shell');

const LINK = 'font-medium text-primary hover:underline';


/* --------
 * Page
 * -------- */

function FieldShellPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The frame of every bordered control: the border, the surface, the three heights, the states and the focus.
            TextInput, NumberInput, Select, MultiSelect, Combobox, DatePicker and the field of ModalSelector are each
            this frame around their own content, and a control of your own is too: one the package does not have sits
            in a form and looks like the ones it does, because it is drawn by the same component.
          </React.Fragment>
        )}
        imports={tsx`
          import { FieldShell } from '@proedis/ui/forms/field-shell';
          import type { FieldShellProps, FieldShellSize } from '@proedis/ui/forms/field-shell';
        `}
      />

      <PageBody>
        <Example of={plateTags} maxCodeHeight={560} />

        <Section
          title={'The focus is the control’s'}
          lead={(
            <React.Fragment>
              The frame lights when the element inside it that carries <InlineCode>data-field-control</InlineCode> has
              the focus, and only then: not when a button or a link inside the frame has it. The focus is drawn by CSS,
              never by a prop, so it cannot fall out of step with where the focus really is.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              A press on the frame outside the control moves the focus to it, as a TextInput does: on a chip, on the
              padding, on an icon. A press on a button, a link or another input inside the frame is left alone. The same
              attribute is what the error summary of a{' '}
              <Link to={'/forms/form'} className={LINK}>Form</Link> focuses when it points at the field.
            </p>
          </Prose>
        </Section>

        <Section
          title={'What goes inside'}
          lead={(
            <React.Fragment>
              The children sit in the row as they are, between <InlineCode>leading</InlineCode> and{' '}
              <InlineCode>trailing</InlineCode>: the control fills it with <InlineCode>flex-1</InlineCode>, and marks the
              element that takes the focus with <InlineCode>data-field-control</InlineCode>. The frame fills its own row
              (<InlineCode>w-full min-w-0</InlineCode>); a control sized by its content says so in{' '}
              <InlineCode>className</InlineCode>, as DatePicker does with <InlineCode>w-auto min-w-auto</InlineCode>.
              The icons of the two slots are quiet; whatever you put in the middle keeps its own colours.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              The slots follow the slot of the frame: given a <InlineCode>data-slot</InlineCode> of its own, the frame
              names its parts after it, which is how a TextInput is a <InlineCode>text-input</InlineCode> with{' '}
              <InlineCode>text-input-leading</InlineCode> and <InlineCode>text-input-trailing</InlineCode>. Name yours,
              and a product’s stylesheet can reach your control apart from the others.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              The three heights of every control, from the same tokens: a custom control in a row lines up with the
              TextInput beside it, on a touch screen too, where the heights grow one step together.
            </React.Fragment>
          )}
        >
          <Example of={sizes} />
        </Section>

        <Section
          title={'States'}
          lead={(
            <React.Fragment>
              The frame reads its field through <InlineCode>useFieldControl</InlineCode>: inside a field with an error
              it is invalid, inside a disabled field it is disabled. <InlineCode>invalid</InlineCode> and{' '}
              <InlineCode>disabled</InlineCode> on the frame add to what the field says and never take it away.{' '}
              <InlineCode>readOnly</InlineCode> is the frame’s alone: the surface of a value that cannot change.
            </React.Fragment>
          )}
        >
          <Example of={states} />
          <Callout>
            The frame draws the states, it does not apply them: a disabled field disables the frame, and your control
            still has to disable its own input, from the same <InlineCode>useFieldControl</InlineCode>.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The frame is presentation only and adds nothing to the accessibility tree. Naming the control is yours:
              take <InlineCode>labelId</InlineCode> from <InlineCode>useFieldControl</InlineCode> and put it in{' '}
              <InlineCode>aria-labelledby</InlineCode>, with <InlineCode>aria-required</InlineCode> and{' '}
              <InlineCode>aria-invalid</InlineCode> from the same hook. The example above does exactly that.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={sizes}
            rows={[
              { slot: 'field-shell', part: 'The frame', attributes: [ 'data-size', 'data-invalid', 'data-readonly', 'data-disabled' ] },
              { slot: 'field-shell-leading', part: 'The icon before the content' },
              { slot: 'field-shell-trailing', part: 'The icon or the quiet action after it' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable props={fieldShellProps} rest={'Every other prop goes to the frame: className, onMouseDown (which runs first), ref.'} />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Mark one element as the control'}>
              Exactly one focusable element carries <InlineCode>data-field-control</InlineCode>: the one that holds the
              value. Two would light the frame from either and leave the summary guessing.
            </Guidance>
            <Guidance kind={'dont'} title={'Rebuild a control the package has'}>
              A text with an icon and an action is a TextInput; a number is a NumberInput. The frame is for what is
              genuinely new: chips, a time range, a colour.
            </Guidance>
            <Guidance kind={'do'} title={'Read the field from the control'}>
              The frame and the control read the same hook, so the asterisk, the error and the disabled state agree on
              both.
            </Guidance>
            <Guidance kind={'dont'} title={'A focused prop'}>
              The focus is a fact of the page, not a state to keep: the frame reads it from CSS, and anything that
              stores it will be wrong sooner or later.
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

export const Route = createFileRoute('/forms/field-shell')({
  component: FieldShellPage
});
