---
name: proedis-ui-forms
description: "Build forms with Proedis UI: a record form bound to react-hook-form and a Zod schema through @proedis/form (useSchemaForm, BoundForm, BoundField), where the schema gives every label, asterisk, counter and bound; a form whose state is yours with Form and Field from @proedis/ui; sections on a grid of six, the error summary, Submit and Cancel, forms inside a Dialog or a Drawer, server errors. Use it whenever you create or change a form, a field or a validation in a project that uses @proedis/ui or @proedis/form."
---

# Forms with Proedis UI

Written for `@proedis/ui` 2 and `@proedis/form` 1. Six pieces, each built on the one before: **Label**, **FieldShell**
(the frame), **each control** (TextInput, NumberInput, Select, DatePicker…), **Field** (label above, one line under),
**Form** (sections, summary, footer), **BoundForm / BoundField** (react-hook-form and Zod, bound by name).

## Which one to reach for

| You have | Reach for |
| --- | --- |
| A form that creates or edits a record, with a schema | `BoundForm` with `useSchemaForm`, a `BoundField` per value |
| A form whose state is yours (a filter, a wizard step) | `Form` and `Field`, the value and the error as props |
| One control on its own: a search in a toolbar, a quantity in a row | The control alone, with an `aria-label` |
| A value to read, not to edit | `LabeledContent` or `Detail`, never a field in read only |

## A record form, bound to a schema

```bash
yarn add @proedis/form @proedis/ui @base-ui/react react-hook-form @hookform/resolvers zod
```

`@proedis/zod` comes with `@proedis/form` (a dependency of it): import its helpers without adding it.

1. **Write the schema once, with the label in `.describe()`.** Requiredness, bounds and messages live next to the
   rules that check them. `nullableString(refine?)` and `nullableNumber(refine?)` from `@proedis/zod` edit a string
   or a number and submit `null` when the field is left empty; the optional `refine` receives the inner schema and
   returns it with its rules, `nullableString((text) => text.max(120, 'At most 120 characters'))`, and those bounds
   still reach the field (its counter, its limits).
2. **`useSchemaForm(schema, options)`** is `useForm` with the schema as its resolver; every option but `resolver`
   passes through. Put every text in `defaultValues`, empty strings included; a number, a choice or a date may be left
   out.
3. **`<BoundForm form={form} onSubmit={…}>`** submits through `handleSubmit` and hands the schema to its fields.
   `onSubmit` receives the output of the schema. Return its promise: `Form.Submit` spins until it settles.
4. **`<BoundField name={…}>` around one control.** The name is the path of the value (`plate`, `address.town`,
   `rows.0.qty`). Label, asterisk, counter and bounds come from the schema; any prop of a Field (`span`, `hint`,
   `description`, `label`) still wins.
5. **Lay the fields out in `Form.Section`**, a grid of six columns: `span` is how many a field takes, and below 32rem of
   the section the fields reflow on their own.

```tsx
import * as React from 'react';

import { BoundField, BoundForm, useSchemaForm } from '@proedis/form';
import { Form } from '@proedis/ui/forms/form';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { TextInput } from '@proedis/ui/forms/text-input';
import { z } from 'zod';

import { nullableString } from '@proedis/zod';

const vehicleSchema = z.object({
  plate   : z.string().min(1, 'Write the plate').max(10, 'At most 10 characters').describe('Plate'),
  model   : z.string().min(2, 'At least 2 characters').max(40, 'At most 40 characters').describe('Model'),
  capacity: z.number({ error: 'Write the capacity' }).int('Whole kilograms').min(500, 'At least 500 kg').max(26000, 'At most 26,000 kg')
    .describe('Capacity'),
  notes   : nullableString((text) => text.max(120, 'At most 120 characters')).describe('Notes')
});

export function VehicleForm(props: { onSave: (vehicle: z.output<typeof vehicleSchema>) => Promise<void> }): React.ReactNode {
  const form = useSchemaForm(vehicleSchema, { defaultValues: { plate: '', model: '', notes: '' } });

  return (
    <BoundForm form={form} onSubmit={props.onSave}>
      <Form.ErrorSummary title={(count) => `${count} fields to fix`} />
      <Form.Section title={'Identity'}>
        <BoundField name={'plate'} span={2}><TextInput width={'code'} /></BoundField>
        <BoundField name={'model'} span={4}><TextInput /></BoundField>
        <BoundField name={'capacity'} span={3} hint={'The legal payload, not the tare'}>
          <NumberInput suffix={'kg'} locale={'en-GB'} />
        </BoundField>
        <BoundField name={'notes'} span={6}><TextInput /></BoundField>
      </Form.Section>
      <Form.Footer>
        <Form.Cancel>Reset</Form.Cancel>
        <Form.Submit loadingLabel={'Saving'}>Save</Form.Submit>
      </Form.Footer>
    </BoundForm>
  );
}
```

## A form whose state is yours

`Form` and `Field` take everything as props: `Form` takes `submitting` and `dirty`, `Field` takes `label`,
`description` (under the label), `hint` (under the control, replaced by the error), `error`, `required`, `optional`,
`status`, `counter`, `span`. The control is the one child; it reads `required`, `invalid` and `disabled` from the Field.

```tsx
<Field label={'Plate'} required error={errors.plate}>
  <TextInput width={'code'} value={plate} onChange={(event) => setPlate(event.currentTarget.value)} />
</Field>
```

## In a Dialog or a Drawer

A Form inside a `Dialog` or a `Drawer` reports to it: while the form is sent the overlay waits and nothing closes it;
when the form was changed, leaving asks first (with the texts you give `discard`); `Form.Cancel` closes through the
same gate instead of resetting. Read the "In a dialog" section of BoundForm for the shape.

## Pitfalls

- **A plain `Field` inside a `BoundForm` sits there unbound**, silently: its control edits nothing of the form. Every
  field of a BoundForm is a BoundField. The names differ (`BoundForm`, `BoundField`) so this is visible in review.
- **No `value` or `onChange` on a bound control**: the binding writes them; yours is replaced or runs first.
- **`.describe()` is one language.** A page in another language passes `label` on the field; the schema keeps the rules.
- **Errors from the server** go through `form.setError(name, { type: 'server', message })` inside `onSubmit`, when the
  server refuses; they show on the field like the schema's, and `'root'` takes the ones of no field. See the "Errors
  from the server" section of BoundForm.
- **A control the package does not have**: draw its frame with `FieldShell` and declare its binding with `bindable`
  (from `@proedis/ui`), so a BoundField can bind it. See "A control of your own" on BoundField.
- **Every visible text is yours**: `loadingLabel` on `Form.Submit` is required, the `title` of the summary is a function
  of the count, the labels of a Select or a DatePicker are props.

## Looking things up

When the Proedis UI MCP server is connected (`@proedis/mcp`): `get_item_doc` on `BoundForm`, `BoundField`, `Form`,
`Field` for the sections named above, `get_item_props` for the props of any control. Without it:
https://platform.container.proedis.com/llms.txt, the Forms and Form binding groups.
