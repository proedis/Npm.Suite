import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import boundFormProps from 'virtual:form-props/StrictBoundFormProps';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { bash, tsx } from '@/docs/snippet';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/bound/basic.tsx?example';
import fromSchema from '@/examples/forms/bound/from-schema.tsx?example';
import inDialog from '@/examples/forms/bound/in-dialog.tsx?example';
import serverErrors from '@/examples/forms/bound/server-errors.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/form-binding/bound-form');

const LINK = 'font-medium text-primary hover:underline';


/* --------
 * Page
 * -------- */

function BoundFormPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The <Link to={'/ui/forms/form'} className={LINK}>Form</Link> of <InlineCode>@proedis/ui</InlineCode>, bound to
            a react-hook-form form and, when it has one, to a Zod schema. It submits through{' '}
            <InlineCode>handleSubmit</InlineCode>, hands the form its state, and gives every{' '}
            <Link to={'/ui/form-binding/bound-field'} className={LINK}>BoundField</Link> inside it the schema to read. From the
            package <InlineCode>@proedis/form</InlineCode>, so <InlineCode>@proedis/ui</InlineCode> itself depends on no
            form library.
          </React.Fragment>
        )}
        imports={tsx`
          import { BoundForm, useSchemaForm } from '@proedis/form';
          import type { BoundFormProps, SchemaForm } from '@proedis/form';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Installation'}
          lead={(
            <React.Fragment>
              <InlineCode>@proedis/form</InlineCode> carries the binding; react-hook-form, its resolvers and Zod are peers,
              one copy in the application. <InlineCode>@proedis/zod</InlineCode> comes with it.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={bash`
              yarn add @proedis/form @proedis/ui react-hook-form @hookform/resolvers zod
            `}
          />
        </Section>

        <Section
          title={'useSchemaForm'}
          lead={(
            <React.Fragment>
              <InlineCode>useForm</InlineCode> with the schema as its resolver, and the schema remembered for the
              BoundForm the form is given to, so it is written once. Every option of <InlineCode>useForm</InlineCode> but{' '}
              <InlineCode>resolver</InlineCode> passes through. The form edits the input of the schema and{' '}
              <InlineCode>onSubmit</InlineCode> receives its output: a <InlineCode>nullableString</InlineCode> edits a
              string and submits <InlineCode>null</InlineCode> for an empty field.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              const form = useSchemaForm(vehicleSchema, { defaultValues: { plate: '', model: '', notes: '' } });

              <BoundForm form={form} onSubmit={(vehicle) => api.saveVehicle(vehicle)}>
                …
              </BoundForm>
            `}
          />
          <Prose>
            <p>
              Write the texts in <InlineCode>defaultValues</InlineCode>, empty strings included. A number, a choice or a
              date may be left out: their control stays controlled with no value, because the binding hands it its own
              empty (<InlineCode>null</InlineCode>, an empty list). With <InlineCode>useForm</InlineCode> instead, pass
              the schema to the BoundForm, or none: the fields then take their props from you.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Submit and cancel'}
          lead={(
            <React.Fragment>
              <InlineCode>Form.Submit</InlineCode> spins while <InlineCode>onSubmit</InlineCode> runs: return its
              promise and the form is sent until it settles. <InlineCode>Form.Cancel</InlineCode> resets the form to
              its default values in a page; in a dialog or a drawer it leaves through their gate.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'The form', 'In a page', 'In a dialog or a drawer' ]}
            rows={[
              [ 'is being sent', 'Form.Submit spins, Form.Cancel is disabled', 'the overlay waits: nothing closes it, its veil after a moment' ],
              [ 'was changed', <InlineCode key={'k'}>data-dirty</InlineCode>, <React.Fragment key={'k'}>leaving asks first, with the texts of <InlineCode>discard</InlineCode></React.Fragment> ],
              [ 'Form.Cancel', 'resets the form', 'closes, or asks first when the form was changed' ],
              [ 'validation fails', 'the errors on the fields, the focus on the summary or the field', 'the same, inside the dialog' ]
            ]}
          />
        </Section>

        <Section
          title={'The whole form'}
          lead={(
            <React.Fragment>
              Every part of Form works inside a BoundForm: sections on a grid of six, the error summary, the footer.
              Submit it empty: the summary lists the errors of the schema and takes the focus.
            </React.Fragment>
          )}
        >
          <Example of={fromSchema} />
        </Section>

        <Section
          title={'In a dialog'}
          lead={(
            <React.Fragment>
              The dialog is told nothing about the form. It waits while the form is sent and asks before closing a
              form that was changed, because the form reports both to the dialog it sits in; its footer holds the
              buttons, outside the <InlineCode>{'<form>'}</InlineCode>, and they point at it on their own. Type
              something, then press Esc; or save.
            </React.Fragment>
          )}
        >
          <Example of={inDialog} />
          <Callout>
            <InlineCode>busy</InlineCode> and <InlineCode>dirty</InlineCode> on the dialog still win: a dialog loading
            its data says <InlineCode>{'busy={\'load\'}'}</InlineCode> itself. The prompt needs its texts:{' '}
            <InlineCode>discard</InlineCode> on the dialog, or a changed form closes without asking.
          </Callout>
        </Section>

        <Section
          title={'Errors from the server'}
          lead={(
            <React.Fragment>
              An answer of the server goes where the errors of the schema go: an error per field through{' '}
              <InlineCode>setError</InlineCode>, so the summary and the focus follow; one for the whole form on{' '}
              <InlineCode>root</InlineCode>, shown where the page decides. Try the plate &ldquo;XX 123&rdquo;, then the
              model &ldquo;test&rdquo;.
            </React.Fragment>
          )}
        >
          <Example of={serverErrors} />
          <Prose>
            <p>
              The order matters: field errors of a 422 on their fields; otherwise an error of the form; and nothing for a
              failure of the network or a 5xx the transport already reported. An error thrown by{' '}
              <InlineCode>onSubmit</InlineCode> and not caught reaches the console: the form never swallows it.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <SubSection title={'BoundForm'} id={'api-bound-form'}>
            <PropsTable props={boundFormProps} rest={'Every prop of Form but submitting and dirty, which come from the form: className, id, aria-*, onReset.'} />
          </SubSection>
          <SubSection title={'useSchemaForm'} id={'api-use-schema-form'}>
            <DocTable
              head={[ 'Argument', 'Type', 'For' ]}
              rows={[
                [ <InlineCode key={'k'}>schema</InlineCode>, 'a Zod 4 schema', 'the resolver, and what the fields read' ],
                [ <InlineCode key={'k'}>options</InlineCode>, <React.Fragment key={'k'}>the options of <InlineCode>useForm</InlineCode> but <InlineCode>resolver</InlineCode></React.Fragment>, <React.Fragment key={'k'}><InlineCode>defaultValues</InlineCode>, <InlineCode>mode</InlineCode>, <InlineCode>values</InlineCode>…</React.Fragment> ]
              ]}
            />
            <Prose>
              <p>
                It returns the form of react-hook-form, <InlineCode>{'SchemaForm<typeof schema>'}</InlineCode>: the
                input of the schema as the values, its output as what is submitted.
              </p>
            </Prose>
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Return the promise'}>
              <InlineCode>{'onSubmit={(values) => api.save(values)}'}</InlineCode>: the form is sent until it settles, and
              everything that follows from it does so by itself.
            </Guidance>
            <Guidance kind={'dont'} title={'A useState for saving'}>
              <InlineCode>isSubmitting</InlineCode> is the state, and the form already hands it to the submit and the
              dialog. A second one drifts from it.
            </Guidance>
            <Guidance kind={'do'} title={'Server errors on the fields'}>
              <InlineCode>setError</InlineCode> per field of a 422: a field error the summary lists and the focus
              reaches, not a toast nobody can match to a field.
            </Guidance>
            <Guidance kind={'dont'} title={'Wire busy and dirty by hand'}>
              Inside a dialog or a drawer the form reports them. Write them on the overlay only to say something else.
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

export const Route = createFileRoute('/ui/form-binding/bound-form')({
  component: BoundFormPage
});
