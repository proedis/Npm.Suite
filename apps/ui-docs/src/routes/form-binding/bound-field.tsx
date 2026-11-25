import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import boundFieldProps from 'virtual:form-props/StrictBoundFieldProps';
import controlBindingProps from 'virtual:ui-props/ControlBinding';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/bound/basic.tsx?example';
import customControl from '@/examples/forms/bound/custom-control.tsx?example';
import everyControl from '@/examples/forms/bound/every-control.tsx?example';
import fromSchema from '@/examples/forms/bound/from-schema.tsx?example';
import overrides from '@/examples/forms/bound/overrides.tsx?example';
import vehicle from '@/examples/forms/bound/vehicle.ts?source';
import withoutSchema from '@/examples/forms/bound/without-schema.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/form-binding/bound-field');

const LINK = 'font-medium text-primary hover:underline';


/* --------
 * Page
 * -------- */

function BoundFieldPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A <Link to={'/forms/field'} className={LINK}>Field</Link> bound to a value of the form around it, with its
            control. The name is the whole contract: from it the field reads its value and its error from the form,
            and, when the form has a schema, its label, whether it is required and the bounds of its control. The
            control binds itself, so nothing on it changes.
          </React.Fragment>
        )}
        imports={tsx`
          import { BoundField } from '@proedis/form';
          import type { BoundFieldProps } from '@proedis/form';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'The name, and nothing else'}
          lead={(
            <React.Fragment>
              <InlineCode>name</InlineCode> is the path of the value in the form: <InlineCode>plate</InlineCode>,{' '}
              <InlineCode>address.town</InlineCode>, <InlineCode>rows.0.qty</InlineCode>. The field hands the control
              its value, the change, the blur and the ref, and shows the error of the form under it. Every prop of a
              Field is accepted too: <InlineCode>span</InlineCode>, <InlineCode>hint</InlineCode>,{' '}
              <InlineCode>description</InlineCode>, <InlineCode>orientation</InlineCode>.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              <BoundField name={'capacity'} span={3} hint={'The legal payload, not the tare'}>
                <NumberInput suffix={'kg'} />
              </BoundField>
            `}
          />
        </Section>

        <Section
          title={'What the schema gives'}
          lead={(
            <React.Fragment>
              Inside a <Link to={'/form-binding/bound-form'} className={LINK}>BoundForm</Link> with a schema, each field
              reads its part of it. Not one label, asterisk, counter or bound below is written on a field: the schema
              under the form says all of it, once. Submit the form empty for the summary.
            </React.Fragment>
          )}
        >
          <Example of={fromSchema} />
          <CodeBlock snippet={vehicle} title={vehicle.file} />
          <DocTable
            head={[ 'In the schema', 'On the field', 'On the control' ]}
            rows={[
              [ <InlineCode key={'k'}>{'.describe(\'Plate\')'}</InlineCode>, 'label', '' ],
              [ 'not optional, not nullable, no default', <React.Fragment key={'k'}>required, the asterisk</React.Fragment>, '' ],
              [ <InlineCode key={'k'}>.max(40)</InlineCode>, <React.Fragment key={'k'}>counter, <InlineCode>12 / 40</InlineCode></React.Fragment>, '' ],
              [ <InlineCode key={'k'}>.min(500).max(26000).int()</InlineCode>, '', <InlineCode key={'k'}>min, max, step</InlineCode> ],
              [ 'a minimum and a maximum date', '', <InlineCode key={'k'}>min, max</InlineCode> ],
              [ <InlineCode key={'k'}>z.array(…).max(5)</InlineCode>, '', <React.Fragment key={'k'}><InlineCode>maxFiles</InlineCode> of an upload</React.Fragment> ],
              [ 'every message', 'error, under the control and in the summary', '' ]
            ]}
          />
          <Prose>
            <p>
              The asterisk tells the truth, and that takes a rule. A field is required when the schema refuses it
              empty: a <InlineCode>z.string()</InlineCode> alone accepts the empty string a cleared input holds, so it
              is required only with a minimum length or a format (<InlineCode>z.email()</InlineCode>); a boolean only
              as <InlineCode>z.literal(true)</InlineCode>, a box that must be ticked; a list with a minimum of one.
            </p>
            <p>
              The validators of <InlineCode>@proedis/zod</InlineCode> are read too: the maximum of{' '}
              <InlineCode>{'nullableString((text) => text.max(120))'}</InlineCode> counts the notes above, and the
              empty notes arrive as <InlineCode>null</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Every control'}
          lead={(
            <React.Fragment>
              Every control of the package declares how it binds, so any of them goes under a BoundField as it is:
              the field hands each one the value in the shape it takes. Fill it in and submit.
            </React.Fragment>
          )}
        >
          <Example of={everyControl} />
          <DocTable
            head={[ 'Control', 'Kind', 'Value in the form' ]}
            rows={[
              [ 'TextInput, PasswordInput, SearchInput, Textarea', 'text', 'a string, empty when cleared' ],
              [ 'NumberInput', 'number', <React.Fragment key={'k'}>a number, <InlineCode>null</InlineCode> when empty</React.Fragment> ],
              [ 'Select, RadioGroup, SegmentedControl', 'option', <React.Fragment key={'k'}>the value of the option, <InlineCode>null</InlineCode> when none</React.Fragment> ],
              [ 'MultiSelect, CheckboxGroup', 'options', 'an array of values' ],
              [ 'Combobox', 'option, options with multiple', 'a value, or an array' ],
              [ 'DatePicker', 'date', <React.Fragment key={'k'}><InlineCode>YYYY-MM-DD</InlineCode>, or a range <InlineCode>{'{ from, to }'}</InlineCode></React.Fragment> ],
              [ 'Checkbox, Switch', 'boolean', <React.Fragment key={'k'}><InlineCode>true</InlineCode> or <InlineCode>false</InlineCode></React.Fragment> ],
              [ 'FileUpload', 'files', 'an array of file entries' ]
            ]}
          />
          <Callout>
            A control with no value of its own (a SegmentedControl, never empty by its type) still takes a{' '}
            <InlineCode>defaultValue</InlineCode> to compile: the form&apos;s value replaces it. A Checkbox or a Switch
            alone carries its own text, so its field takes <InlineCode>{'label={undefined}'}</InlineCode> and shows no
            label above.
          </Callout>
        </Section>

        <Section
          title={'A prop of yours wins'}
          lead={(
            <React.Fragment>
              The schema is the fallback, never the last word. A prop of the field wins over the schema (a label in the
              language of the page, an icon, a hint, a counter of your own) and a prop of the control wins over the
              binding&apos;s bounds. A handler written on the control runs before the form&apos;s, and neither replaces
              the other.
            </React.Fragment>
          )}
        >
          <Example of={overrides} />
        </Section>

        <Section
          title={'A control of your own'}
          lead={(
            <React.Fragment>
              <InlineCode>bindable</InlineCode> from <InlineCode>@proedis/ui</InlineCode> declares how a control binds,
              once, next to the control: its kind, and how the value of the form becomes its props. From then on a
              BoundField takes it like any other. For a control you cannot touch, pass the same object as{' '}
              <InlineCode>binding</InlineCode> on the field.
            </React.Fragment>
          )}
        >
          <Example of={customControl} />
          <CodeBlock
            snippet={tsx`
              <BoundField name={'contract'} binding={{ kind: 'option', bind: (field) => ({ value: field.value, onSelect: field.onChange }) }}>
                <ContractPicker />
              </BoundField>
            `}
          />
        </Section>

        <Section
          title={'Without a schema'}
          lead={(
            <React.Fragment>
              The schema is optional. With <InlineCode>useForm</InlineCode> and the rules of react-hook-form the binding
              is the same, and what a schema would have said (the label, the asterisk) is written on the field.
            </React.Fragment>
          )}
        >
          <Example of={withoutSchema} />
        </Section>

        <Section title={'API'}>
          <SubSection title={'BoundField'} id={'api-bound-field'}>
            <PropsTable props={boundFieldProps} rest={'Every prop of Field, which wins over what the schema says. See the Field page.'} />
          </SubSection>
          <SubSection title={'ControlBinding'} id={'api-control-binding'}>
            <PropsTable props={controlBindingProps} rest={'What bindable() declares on a control, and what the binding prop takes.'} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Say it in the schema'}>
              The label, the bounds and the requiredness written once, next to the rules that check them: the form
              cannot promise what the schema does not enforce.
            </Guidance>
            <Guidance kind={'dont'} title={'value and onChange on a bound control'}>
              The binding writes them. A handler of yours runs before the form&apos;s; a value of yours is replaced.
            </Guidance>
            <Guidance kind={'do'} title={'Translate on the field'}>
              <InlineCode>.describe()</InlineCode> is one language. A page in another passes{' '}
              <InlineCode>label</InlineCode>, and the schema keeps the rules.
            </Guidance>
            <Guidance kind={'dont'} title={'A Field inside a BoundForm'}>
              A plain Field sits there unbound, silently: its control edits nothing of the form. Every field of a
              BoundForm is a BoundField.
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

export const Route = createFileRoute('/form-binding/bound-field')({
  component: BoundFieldPage
});
