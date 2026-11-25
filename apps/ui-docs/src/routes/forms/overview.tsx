import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { CodeBlock } from '@/docs/CodeBlock';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable } from '@/docs/Tables';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/overview');

const LINK = 'font-medium text-primary hover:underline';


/* --------
 * Page
 * -------- */

function FormsOverviewPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Six pieces, each with one job, each built on the one before it. Read this page once and the others say how
            each piece works; this one says which piece to reach for.
          </React.Fragment>
        )}
      />

      <PageBody>
        <Section title={'The pieces'}>
          <DocTable
            head={[ 'Piece', 'Its one job', 'Built on' ]}
            rows={[
              [ <Link key={'k'} to={'/primitives/label'} className={LINK}>Label</Link>, 'The name of anything, with its asterisk, its optional word, its description and a glyph', 'nothing' ],
              [ <Link key={'k'} to={'/forms/field-shell'} className={LINK}>FieldShell</Link>, 'The frame of a control: border, surface, three heights, states, focus', 'nothing' ],
              [ 'Each control', 'One kind of value: TextInput, NumberInput, Select, DatePicker…', 'FieldShell, and a binding it declares' ],
              [ <Link key={'k'} to={'/forms/field'} className={LINK}>Field</Link>, 'The label above a control, the line under it, the state handed down', 'Label, one control' ],
              [ <Link key={'k'} to={'/forms/form'} className={LINK}>Form</Link>, 'Sections on a grid, the error summary, the footer, Submit and Cancel, the focus after a submit', 'Fields' ],
              [ <React.Fragment key={'k'}><Link to={'/form-binding/bound-form'} className={LINK}>BoundForm</Link>, <Link to={'/form-binding/bound-field'} className={LINK}>BoundField</Link></React.Fragment>, 'The values, the errors and the schema of react-hook-form and Zod, bound by name', 'Form, Field, the bindings' ]
            ]}
          />
          <Prose>
            <p>
              The state goes one way, down. A Form tells its Fields nothing but where they sit; a Field tells its
              control whether it is required, invalid, disabled and its status; a control reads that with{' '}
              <InlineCode>useFieldControl</InlineCode> and its FieldShell draws it. Nothing below reports upwards, except
              a Form to the dialog or the drawer around it, which then waits while it is sent and asks before closing it
              changed.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Which one to reach for'}
          lead={'Start from what the value is attached to, not from the look.'}
        >
          <DocTable
            head={[ 'You have', 'Reach for' ]}
            rows={[
              [ 'A form that creates or edits a record, with a schema', 'BoundForm with useSchemaForm, a BoundField per value' ],
              [ 'A form whose state is yours (a filter, a wizard step)', 'Form and Field, the value and the error as props' ],
              [ 'One control on its own: a search in a toolbar, a quantity in a row', 'The control alone, with an aria-label' ],
              [ 'A label with a control written by hand', 'Field around it; Label only where there is no field at all' ],
              [ 'A control the package does not have', <React.Fragment key={'k'}>FieldShell for the frame, <InlineCode>bindable</InlineCode> for the binding</React.Fragment> ],
              [ 'A value to read, not to edit', <React.Fragment key={'k'}>LabeledContent or Detail, not a field in read only</React.Fragment> ]
            ]}
          />
        </Section>

        <Section
          title={'The same field, three ways'}
          lead={'From the most written to the least: each step leaves the same markup and takes away code.'}
        >
          <CodeBlock
            title={'Field, the state yours'}
            snippet={tsx`
              <Field label={'Plate'} required error={errors.plate}>
                <TextInput width={'code'} value={plate} onChange={(event) => setPlate(event.currentTarget.value)} />
              </Field>
            `}
          />
          <CodeBlock
            title={'BoundField, the label yours'}
            snippet={tsx`
              <BoundField name={'plate'} label={'Plate'} required>
                <TextInput width={'code'} />
              </BoundField>
            `}
          />
          <CodeBlock
            title={'BoundField, everything from the schema'}
            snippet={tsx`
              // plate: z.string().min(1).max(10).describe('Plate')
              <BoundField name={'plate'}>
                <TextInput width={'code'} />
              </BoundField>
            `}
          />
        </Section>

        <Section title={'What every piece promises'}>
          <Prose>
            <p>
              No text of its own: every label, message and count comes from the application, in its language. The
              control is named by its label alone, and described by the description and the line under it. A required
              field says so with an asterisk and with <InlineCode>aria-required</InlineCode>, and only an error makes it{' '}
              <InlineCode>aria-invalid</InlineCode>. A hint that turns into an error moves nothing on the page. Every
              control of one size has one height, the frame lights from the element that has the focus, and every part
              has a <InlineCode>data-slot</InlineCode> a product&apos;s stylesheet can reach.
            </p>
          </Prose>
        </Section>
      </PageBody>
    </React.Fragment>
  );
}


/* --------
 * Route
 * -------- */

export const Route = createFileRoute('/forms/overview')({
  component: FormsOverviewPage
});
