import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import formErrorSummaryProps from 'virtual:ui-props/StrictFormErrorSummaryProps';
import formHeaderProps from 'virtual:ui-props/StrictFormHeaderProps';
import formSectionProps from 'virtual:ui-props/StrictFormSectionProps';
import themeDoc from 'virtual:ui-theme/forms/form';
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
import basic from '@/examples/forms/form/basic.tsx?example';
import errorSummary from '@/examples/forms/form/error-summary.tsx?example';
import header from '@/examples/forms/form/header.tsx?example';
import inContext from '@/examples/forms/form/in-context.tsx?example';
import narrow from '@/examples/forms/form/narrow.tsx?example';
import responsiveSpan from '@/examples/forms/form/responsive-span.tsx?example';
import sections from '@/examples/forms/form/sections.tsx?example';
import spans from '@/examples/forms/form/spans.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/form');


const LINK = 'font-medium text-primary hover:underline';


/* --------
 * Page
 * -------- */

function FormPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A real <InlineCode>{'<form>'}</InlineCode>, made of parts: a header, the error summary, sections of fields on
            a grid of six columns, a footer. It does not validate and picks no validation library: the errors come from
            the caller, as the <InlineCode>error</InlineCode> of each Field. What it owns is what follows a submit, which is where
            forms usually leave the user alone.
          </React.Fragment>
        )}
        imports={tsx`
          import { Form, FormSubmit } from '@proedis/ui/forms/form';
          import type { FormHeadingLevel } from '@proedis/ui/forms/form';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'A form in a page'}
          lead={(
            <React.Fragment>
              <InlineCode>Form.Header</InlineCode> titles a form that stands in a page, and{' '}
              <InlineCode>Form.Footer</InlineCode> puts its actions at its end, on the right. In a dialog or a drawer
              neither is used: the container has a header and a footer of its own.
            </React.Fragment>
          )}
        >
          <Example of={header} />
          <Prose>
            <p>
              <InlineCode>onSubmit</InlineCode> is the native one, so a single page application calls{' '}
              <InlineCode>preventDefault</InlineCode> itself. <InlineCode>noValidate</InlineCode> is always on and cannot
              be turned off: the browser’s bubbles would be a second set of messages, untranslated.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Sections'}
          lead={(
            <React.Fragment>
              <InlineCode>Form.Section</InlineCode> groups related fields under a title and one line on what the section
              is for, never on how to fill it in. Two sections in a row are separated by a rule with room on both sides.
              Without a title the section is the only one of its form, named by its container.
            </React.Fragment>
          )}
        >
          <Example of={sections} />
          <Prose>
            <p>
              A titled section is a <InlineCode>div</InlineCode> with <InlineCode>role=&quot;group&quot;</InlineCode>,
              named by its title and described by its line, rather than a <InlineCode>section</InlineCode>: a named
              section is a landmark, and a form of four sections would add four landmarks to the page. The{' '}
              <InlineCode>fieldset</InlineCode> stays where it belongs, around a group of radios or checkboxes.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Six columns'}
          lead={(
            <React.Fragment>
              A section is a grid of six columns, and a <Link to={'/forms/field'} className={LINK}>Field</Link> takes{' '}
              <InlineCode>span</InlineCode> of them: 1, 2, 3, 4 or 6, three by default.{' '}
              <InlineCode>breakBefore</InlineCode> starts a new row for the first of a group of related fields, even
              when the row above still has room.
            </React.Fragment>
          )}
        >
          <Example of={spans} previewClassName={'p-4 sm:p-6'} />
          <Prose>
            <p>
              Each field is a subgrid of three rows the whole row of the section shares: label, control, messages. That
              is what keeps the controls of one row aligned when a label wraps on two lines, or when an error appears
              under the field beside them.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Narrow sections'}
          lead={(
            <React.Fragment>
              Below 32rem of its own width, measured on the section and not on the window, a section rearranges what a
              single span asked for: the short fields, span 1 and 2, take half a row, the others a whole one. That is
              what keeps the same form right in a drawer on a wide window.
            </React.Fragment>
          )}
        >
          <Example of={narrow} resizable previewClassName={'p-4 sm:p-6'} />
        </Section>

        <Section
          title={'Spans per breakpoint'}
          lead={(
            <React.Fragment>
              A span written as a map speaks of the window, like every responsive prop of the package, and the section no
              longer steps in: whoever passes a map has decided at every width. Drag the handle of the preview across{' '}
              <InlineCode>md</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={responsiveSpan} resizable previewClassName={'p-4 sm:p-6'} />
          <Callout>
            The container sizes of Tailwind share their names with the breakpoints but not their widths (
            <InlineCode>@sm</InlineCode> is 384px, <InlineCode>sm</InlineCode> 640px). That is why a map is always the
            window and never the section: two scales under one vocabulary would be read wrong.
          </Callout>
        </Section>

        <Section
          title={'Errors and the summary'}
          lead={(
            <React.Fragment>
              <InlineCode>Form.ErrorSummary</InlineCode> lists what is wrong from two errors up, each line a link that
              moves the focus to its field. Press Save contact with the fields as they are, then fix one.
            </React.Fragment>
          )}
        >
          <Example of={errorSummary} />
          <Prose>
            <p>
              After a submit, once the caller’s errors are on screen, the focus goes to the summary when there are two
              or more and a summary is mounted, otherwise to the first invalid field in the order of the screen. The
              errors may arrive later than the submit, from a server: the form waits for them until the user types
              again, so an answer that comes back late never pulls the focus away from someone already typing.
            </p>
            <p>
              Each line is the <InlineCode>errorSummary</InlineCode> of its field, or its
              error. The title is a function of the count, because a count needs the plural rules of the caller’s
              language and the package writes no text.
            </p>
          </Prose>
        </Section>

        <Section
          title={'In a dialog or a drawer'}
          lead={(
            <React.Fragment>
              A dialog, a drawer or a popover renders its submit button in its footer, outside the{' '}
              <InlineCode>{'<form>'}</InlineCode>. <InlineCode>FormSubmit</InlineCode> is that button: it points at the
              form through the <InlineCode>form</InlineCode> attribute, with the id the container hands to the form, so
              nobody writes an id by hand and Enter in a field still submits.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              import { Dialog } from '@proedis/ui/overlays/dialog';
              import { Form, FormSubmit } from '@proedis/ui/forms/form';

              <Dialog footer={<FormSubmit loading={saving} loadingLabel={'Saving'}>Save</FormSubmit>} …>
                <Form onSubmit={save}>
                  <Form.Section>…</Form.Section>
                </Form>
              </Dialog>
            `}
          />
        </Section>

        <Section
          title={'With react-hook-form'}
          lead={(
            <React.Fragment>
              The form owns no state, so a form library fits under it as it is. The errors of the library become the{' '}
              <InlineCode>error</InlineCode> of each field, and the summary and the focus follow.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              const form = useForm<Vehicle>({ resolver: zodResolver(vehicleSchema), defaultValues });
              const { errors } = form.formState;

              <Form onSubmit={form.handleSubmit(save)}>
                <Form.ErrorSummary title={(count) => t('FORM.ERRORS', { count })} />
                <Form.Section title={t('VEHICLE.IDENTITY')}>
                  <Field span={2} label={t('VEHICLE.PLATE')} required error={errors.plate?.message}>
                    <TextInput width={'code'} {...form.register('plate')} />
                  </Field>
                </Form.Section>
              </Form>
            `}
          />
          <Prose>
            <p>
              <InlineCode>register</InlineCode> spreads onto the <InlineCode>{'<input>'}</InlineCode> of a TextInput,
              whose ref is the input itself. A control with a value that is not a string, such as a NumberInput, goes
              through the library’s <InlineCode>Controller</InlineCode> and its <InlineCode>onValueChange</InlineCode>.
              Errors from the server reach the same fields through <InlineCode>setError</InlineCode>, and the form
              moves the focus to them when they arrive.
            </p>
          </Prose>
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              A new vehicle for the fleet. Press Add vehicle as it is: three errors, the focus in the summary. Fix them
              and press again: the server answers that the plate is taken, later, and the focus goes to the plate. Change
              the plate and save.
            </React.Fragment>
          )}
        >
          <Example of={inContext} align={'stretch'} previewClassName={'p-4 sm:p-8'} maxCodeHeight={560} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The summary is a <InlineCode>group</InlineCode> named by its title and focusable by script only (
              <InlineCode>tabIndex=-1</InlineCode>), so landing on it reads the title and the count. Each line is a real
              link to the field, which moves the focus to the element the control marks with{' '}
              <InlineCode>data-field-control</InlineCode>. The headings of the header and of the sections take the level
              of where the form sits: two in a page, three under the title of a dialog.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'In a text field, submits the form, through FormSubmit too when the button is outside it.' ],
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'From the summary, reaches its links in the order of the fields on screen.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={inContext}
            rows={[
              { slot: 'form', part: 'The form element' },
              { slot: 'form-header', part: 'The header of a form in a page' },
              { slot: 'form-header-title', part: 'Its title' },
              { slot: 'form-header-description', part: 'Its line' },
              { slot: 'form-error-summary', part: 'The summary, from two errors up' },
              { slot: 'form-error-summary-title', part: 'Its title' },
              { slot: 'form-error-summary-list', part: 'The list' },
              { slot: 'form-error-summary-item', part: 'One error' },
              { slot: 'form-error-summary-link', part: 'Its link to the field' },
              { slot: 'form-section', part: 'The section, which is the grid' },
              { slot: 'form-section-header', part: 'Title and line, the first row' },
              { slot: 'form-section-title', part: 'The title' },
              { slot: 'form-section-description', part: 'The line' },
              { slot: 'form-footer', part: 'The actions' }
            ]}
          />
          <Prose>
            <p>
              The section is the grid itself, so a class on it reaches the columns: <InlineCode>gap-x-10!</InlineCode>{' '}
              on one section is the lever that wins over a product’s skin for that one instance.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <SubSection title={'Form'} id={'api-form'}>
            <Prose>
              <p>
                The shared props, and every prop of a <InlineCode>{'<form>'}</InlineCode> but{' '}
                <InlineCode>noValidate</InlineCode>, which is always on. In a dialog, a drawer or a popover the id comes
                from the container unless one is given.
              </p>
            </Prose>
          </SubSection>
          <SubSection title={'Form.Header'} id={'api-form-header'}>
            <PropsTable props={formHeaderProps} rest={'Every other prop goes to the header, and children go under the line.'} />
          </SubSection>
          <SubSection title={'Form.ErrorSummary'} id={'api-form-error-summary'}>
            <PropsTable props={formErrorSummaryProps} rest={'Every other prop goes to the summary, which takes no children: its lines come from the fields.'} />
          </SubSection>
          <SubSection title={'Form.Section'} id={'api-form-section'}>
            <PropsTable props={formSectionProps} rest={'Every other prop goes to the grid.'} />
          </SubSection>
          <SubSection title={'Form.Footer'} id={'api-form-footer'}>
            <Prose>
              <p>The shared props, and every prop of a div. A horizontal row that wraps, at the end.</p>
            </Prose>
          </SubSection>
          <SubSection title={'FormSubmit'} id={'api-form-submit'}>
            <Prose>
              <p>
                Every prop of <Link to={'/actions/button'} className={LINK}>Button</Link>, with{' '}
                <InlineCode>type=&quot;submit&quot;</InlineCode> and the <InlineCode>form</InlineCode> of the container
                unless one is given.
              </p>
            </Prose>
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Add and edit in a dialog'}>
              A form that creates or changes a record opens in a dialog, with FormSubmit in its footer. A page of its
              own is for a form of exceptional size, and a drawer is for reading.
            </Guidance>
            <Guidance kind={'dont'} title={'Lay fields out by hand'}>
              Two fields side by side are two spans in a section, not a row of your own. The section is what keeps
              the labels aligned and the form right in a narrow container.
            </Guidance>
            <Guidance kind={'do'} title={'Mount the summary at the top'}>
              With two errors or more the focus goes there, and the user reads the whole list before fixing anything.
              Without it, the focus goes to the first field.
            </Guidance>
            <Guidance kind={'dont'} title={'Type an id into a text field'}>
              A field that points at another record is a Select or a Combobox fed by the real records, never a
              TextInput where someone types an identifier.
            </Guidance>
            <Guidance kind={'do'} title={'Put the server’s errors on their fields'}>
              A rejected value goes back under its field, where the summary picks it up; only what belongs to no field
              is a message for the whole form.
            </Guidance>
            <Guidance kind={'dont'} title={'Keep the saving state on the side'}>
              The submit shows it is working through <InlineCode>loading</InlineCode>, fed by the form library’s own{' '}
              <InlineCode>isSubmitting</InlineCode>, never by a second piece of state that can fall out of step with it.
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

export const Route = createFileRoute('/forms/form')({
  component: FormPage
});
