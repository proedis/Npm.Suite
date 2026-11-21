import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import checkboxGroupProps from 'virtual:ui-props/CheckboxGroupProps';
import checkboxProps from 'virtual:ui-props/CheckboxProps';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/forms/checkbox/basic.tsx?example';
import description from '@/examples/forms/checkbox/description.tsx?example';
import group from '@/examples/forms/checkbox/group.tsx?example';
import inContext from '@/examples/forms/checkbox/in-context.tsx?example';
import locked from '@/examples/forms/checkbox/locked.tsx?example';
import orientation from '@/examples/forms/checkbox/orientation.tsx?example';
import required from '@/examples/forms/checkbox/required.tsx?example';
import states from '@/examples/forms/checkbox/states.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/checkbox');


/* --------
 * Page
 * -------- */

function CheckboxPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A tick that is saved with the form: a confirmation, an option, a few options together. The whole row is the
            target, label and description included. Something that takes effect at once, with no Save, is a Switch.
          </React.Fragment>
        )}
        imports={tsx`
          import { Checkbox, CheckboxGroup } from '@proedis/ui/forms/checkbox';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Description'}
          lead={(
            <React.Fragment>
              <InlineCode>description</InlineCode> is a line under the label, joined to the box as its description. It
              is also the place for the reason an option is off: disabled, the label fades with the box and the
              description does not, because a reason at half opacity is a reason nobody reads.
            </React.Fragment>
          )}
        >
          <Example of={description} />
        </Section>

        <Section
          title={'A group'}
          lead={(
            <React.Fragment>
              <InlineCode>CheckboxGroup</InlineCode> holds several options checked together, up to seven, all in view. Its
              value is the array of the checked ones. In a <InlineCode>Field</InlineCode> the label names the group and
              is not clickable, since it belongs to no single box.
            </React.Fragment>
          )}
        >
          <Example of={group} />

          <SubSection
            title={'The parent box'}
            lead={(
              <React.Fragment>
                A <InlineCode>parent</InlineCode> box is computed from the others: checked when all are, partial when some
                are, empty when none is. A click checks every option that can change when it is empty or partial, and
                clears them when it is checked. The options under it are indented; two levels at most.
              </React.Fragment>
            )}
          >
            <Example of={locked} />
          </SubSection>

          <SubSection
            title={'Orientation'}
            lead={(
              <React.Fragment>
                <InlineCode>vertical</InlineCode> by default. A row suits at most three short options, and{' '}
                <InlineCode>orientation</InlineCode> takes one value per breakpoint, so the row can stay a column on a
                phone.
              </React.Fragment>
            )}
          >
            <Example of={orientation} />
          </SubSection>
        </Section>

        <Section
          title={'States'}
          lead={(
            <React.Fragment>
              Partial is set by hand anywhere but on a parent box, where the group computes it. Read only keeps the
              box reachable and submitted, grey at full opacity; disabled is half opacity and out of the Tab order: two
              different states that look different on purpose.
            </React.Fragment>
          )}
        >
          <Example of={states} />
        </Section>

        <Section
          title={'A required tick'}
          lead={(
            <React.Fragment>
              A single box that must be ticked, the conditions of a service, has no label above it: its own label
              carries the asterisk, and the messages of its <InlineCode>Field</InlineCode> line up with it.{' '}
              <InlineCode>required</InlineCode> marks the box <InlineCode>aria-required</InlineCode>; the check stays
              with the form.
            </React.Fragment>
          )}
        >
          <Example of={required} />
        </Section>

        <Section title={'In context'} lead={'The settings of a depot: a group in a row, and a single option with its consequence.'}>
          <Example of={inContext} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Each box is a checkbox announced with its label and its description; a parent box is announced as mixed
              when partial. In a field, the group carries the field’s name, its requiredness and its error.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Ticks or clears the box.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Does nothing: Enter submits forms, and a box is not a submit.' ],
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves from box to box. A disabled box is skipped, a read-only one is not.' ]
            ]}
          />
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'checkbox', part: 'The row: a label around the box and its text', attributes: [ 'data-disabled', 'data-readonly', 'data-invalid', 'data-parent' ] },
              { slot: 'checkbox-box', part: 'The box, which takes the focus', attributes: [ 'data-checked', 'data-unchecked', 'data-indeterminate' ] },
              { slot: 'checkbox-indicator', part: 'The tick or the dash' },
              { slot: 'checkbox-text', part: 'The label and the description' },
              { slot: 'checkbox-label', part: 'The label' },
              { slot: 'checkbox-description', part: 'The description' },
              { slot: 'checkbox-group', part: 'The group', attributes: [ 'data-orientation', 'data-disabled', 'data-readonly', 'data-invalid' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Checkbox'} id={'api-checkbox'}>
            <PropsTable
              props={checkboxProps}
              rest={(
                <React.Fragment>
                  The row takes <InlineCode>className</InlineCode> and the shared props; every other prop, with the{' '}
                  <InlineCode>ref</InlineCode>, reaches the box, the element that takes the focus, so a checkbox can be the
                  trigger of a tooltip or the target of a form library.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'CheckboxGroup'} id={'api-checkbox-group'}>
            <PropsTable
              props={checkboxGroupProps}
              rest={(
                <React.Fragment>
                  Every other prop goes to the group. Outside a <InlineCode>Field</InlineCode> it needs a name of its own,{' '}
                  <InlineCode>aria-label</InlineCode> or <InlineCode>aria-labelledby</InlineCode>.
                </React.Fragment>
              )}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A Checkbox when the form is saved'}>
              The tick waits for the Save. A setting that applies at once, on its own, is a Switch.
            </Guidance>
            <Guidance kind={'dont'} title={'A group of more than seven'}>
              Past seven options, the eye stops reading. A longer list is a MultiSelect, with a search.
            </Guidance>
            <Guidance kind={'do'} title={'Say why an option is off'}>
              A disabled box with no description leaves the user guessing. The description is where the reason goes,
              and it stays readable.
            </Guidance>
            <Guidance kind={'dont'} title={'A label that says the opposite'}>
              “Do not notify” ticked means notify? Write the label for the ticked state, in the positive.
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

export const Route = createFileRoute('/forms/checkbox')({
  component: CheckboxPage
});
