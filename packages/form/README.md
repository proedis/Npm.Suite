<div align="center">

# `@proedis/form`

**A field gives its name. The schema gives the label, the asterisk, the counter and the bounds. The
control binds itself.** 🔗

[![npm](https://img.shields.io/npm/v/@proedis/form.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/form)
[![license](https://img.shields.io/npm/l/@proedis/form.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

react-hook-form and Zod bound to the form layer of `@proedis/ui`. The UI package depends on no form
library; this one is the binding, and nothing else.

| | |
| --- | --- |
| `useSchemaForm(schema, options)` | `useForm` with the schema as its resolver, and the schema remembered for the form it builds |
| `BoundForm` | The `Form` of `@proedis/ui` bound to a form: it submits through `handleSubmit` and hands the form its state |
| `BoundField` | A `Field` of `@proedis/ui` bound by name: value and error from the form, label, requiredness and bounds from the schema |
| `schemaProps(descriptor, kind)` | The mapping a `BoundField` uses, from a field descriptor of `@proedis/zod` to the props of a field and its control |

## 📦 Installation

```bash
yarn add @proedis/form @proedis/ui react-hook-form @hookform/resolvers zod
```

| Peer | Range | Why a peer |
| --- | --- | --- |
| `@proedis/ui` | the installed `^` | the Form, the Field and the controls are the application's own copy |
| `react-hook-form` | `^7.55.0` | one form state: a second copy has its own context, and the fields find no form |
| `@hookform/resolvers` | `>=5.1.0 <8.0.0` | the resolver of the application; 5.1 is the first that reads Zod 4 |
| `zod` | `^4.0.0` | the schema is the application's |
| `react` | `>=19.0.0 <20.0.0` | as `@proedis/ui` |

`@proedis/zod`, which reads the schema, and `@proedis/react` come with it.

## 🚀 Quick start

```tsx
import { z } from 'zod';

import { BoundField, BoundForm, useSchemaForm } from '@proedis/form';
import { Form } from '@proedis/ui/forms/form';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { TextInput } from '@proedis/ui/forms/text-input';

const vehicleSchema = z.object({
  plate   : z.string().min(1, 'Write the plate').max(10).describe('Plate'),
  capacity: z.number({ error: 'Write the capacity' }).int().min(500).max(26000).describe('Capacity')
});

function VehicleForm(): React.ReactNode {
  const form = useSchemaForm(vehicleSchema, { defaultValues: { plate: '' } });

  return (
    <BoundForm form={form} onSubmit={(vehicle) => api.saveVehicle(vehicle)}>
      <Form.Section>
        <BoundField name={'plate'} span={2}><TextInput width={'code'} /></BoundField>
        <BoundField name={'capacity'} span={3}><NumberInput suffix={'kg'} /></BoundField>
      </Form.Section>

      <Form.Footer>
        <Form.Cancel>Reset</Form.Cancel>
        <Form.Submit loadingLabel={'Saving'}>Save</Form.Submit>
      </Form.Footer>
    </BoundForm>
  );
}
```

`Plate` with its asterisk and a `0 / 10` counter, `Capacity` with its asterisk and `min`, `max` and a
`step` of 1 on the NumberInput: none of it is written on a field. `onSubmit` receives the output of
the schema, and returning its promise keeps the form sent until it settles.

## 📖 API

### `useSchemaForm`

```ts
const form = useSchemaForm(schema, { defaultValues, mode: 'onBlur' });
```

Every option of `useForm` but `resolver` passes through. The form edits the input of the schema
(`SchemaInput`) and submits its output (`SchemaOutput`): a `nullableString` of `@proedis/zod` edits a
string and submits `null` for an empty field. Write the texts in `defaultValues`, empty strings
included; a number, a choice or a date may be left out, since each control stays controlled with no
value (the binding hands it its own empty).

### `BoundForm`

| Prop | |
| --- | --- |
| `form` | the form, from `useSchemaForm` or `useForm` |
| `onSubmit` | the values that passed validation; return a promise and the form is sent until it settles |
| `onInvalid` | validation failed: the errors are already on the fields |
| `schema` | the schema the fields read; defaults to the one `useSchemaForm` was given, `null` for none |

Every other prop goes to the `Form`. What follows from the state of the form, with nothing wired:

| The form | In a page | In a `Dialog` or a `Drawer` |
| --- | --- | --- |
| is being sent | `Form.Submit` spins, `Form.Cancel` is disabled | the overlay waits, nothing closes it |
| was changed | `data-dirty` on the form | leaving asks first, with the texts of `discard` |
| `Form.Cancel` | resets the form to its default values | closes, or asks first |

An error thrown by `onSubmit` and not caught is never swallowed: it reaches the console. Errors of the
server go on the fields with `form.setError`, so the summary and the focus follow.

### `BoundField`

```tsx
<BoundField name={'notes'} hint={'Read standing at the stop'} span={6}>
  <Textarea />
</BoundField>
```

`name` is the path of the value, `plate`, `address.town`, `rows.0.qty`. Every prop of `Field` is
accepted and wins over the schema; a prop on the control wins over the bounds of the schema, and a
handler on the control runs before the form's. It throws outside a `BoundForm`.

What the schema gives, by the kind of value the control declares:

| In the schema | Gives |
| --- | --- |
| `.describe('Plate')` | the `label` |
| refusing the empty value | `required`, the asterisk |
| `.max(n)` on a text | the counter, `12 / n`, red past `n` |
| `.min()`, `.max()`, `.int()`, `.multipleOf()` on a number | `min`, `max`, `step` on the control |
| a minimum and a maximum date | `min`, `max` on the DatePicker |
| `z.array(…).max(n)` of files | `maxFiles` on the FileUpload |
| every message | the `error` under the control and in the summary |

⚠️ The asterisk has to tell the truth, so a text is required only when it refuses the empty string a
cleared control holds: a minimum length or a format. `z.string()` alone accepts `''`, and gets no
asterisk; a choice or a date, whose empty is `null`, does.

### Binding a control

Every control of `@proedis/ui` declares how it binds (`TextInput.binding`): its kind and how the value
of the form becomes its props. A control of yours declares it with `bindable` from `@proedis/ui`:

```tsx
import { bindable } from '@proedis/ui';

export const TimeInput = bindable(TimeInputBase, {
  kind: 'text',
  bind: (field) => ({ ref: field.ref, value: field.value ?? '', onValueChange: field.onChange, onBlur: field.onBlur })
});
```

For a control you cannot touch, pass the same object as `binding` on the `BoundField`.

## ⚠️ Requirements

- A `BoundField` sits inside a `BoundForm`. A plain `Field` inside one is unbound, silently: its
  control edits nothing of the form.
- The labels of `.describe()` are one language. A page in another passes `label` on the field.

## 🔀 Migrating

`0.1.0` is the first release: nothing to migrate from.

## 🤝 Compatibility

| | |
| --- | --- |
| React | `>=19.0.0 <20.0.0` |
| react-hook-form | `^7.55.0` |
| `@hookform/resolvers` | `>=5.1.0 <8.0.0` |
| Zod | `^4.0.0` |
| TypeScript | `>=5.2.0` |

## 📄 License

MIT © Proedis S.r.l.
