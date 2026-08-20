<div align="center">

# `@proedis/zod`

**Your Zod schema already knows that the field is called "Nome", is required and stops at 50
characters. Stop writing it a second time on the control.** 🔍

[![npm](https://img.shields.io/npm/v/@proedis/zod.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/zod)
[![license](https://img.shields.io/npm/l/@proedis/zod.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

One function that matters: give it a schema and a field path, get back everything a control needs.
No React, no UI kit, no form library — and no runtime import of Zod either, only its types. 🧬

| | |
| --- | --- |
| `describeField(schema, path)` | The descriptor for one dotted path. Throws when the path is not in the schema |
| `tryDescribeField(schema, path)` | Same, `null` instead of throwing |
| `describeSchema(schema)` | The descriptor of a schema you already hold |
| `describeShape(schema)` | Every first-level field of an object schema, keyed by name |
| `unwrapSchema(schema)` | The wrapper walk on its own: peels `optional` / `nullable` / `default` / `readonly` / `.transform()` |

Plus the validators every form needs and nobody wants to write twice: `nullableString`,
`nullableNumber`, `requiredUid` / `nullableUid`, and four date-only truncations.

Published as `@proedis/zod`, `@proedis/zod/fields` and `@proedis/zod/validators`.

## 📦 Installation

```bash
yarn add @proedis/zod
```

`zod` is a **peer** dependency, `^4.0.0`. Zod 4 only, deliberately: the Zod 3 version of this code
read class identities (`instanceof z.ZodEffects`) and Zod 4 restructured all of it. A package that
satisfies both majors grows a compatibility layer nobody maintains.

| Peer | Range |
| --- | --- |
| `zod` | `^4.0.0` |

## 🚀 Quick start

```ts
import { z } from 'zod';
import { describeField } from '@proedis/zod';

const userSchema = z.object({
  name : z.string().min(3).max(50).describe('Nome'),
  email: z.email().describe('Email'),
  age  : z.number().int().min(18).describe('Età'),
  note : z.string().nullable().describe('Nota')
});

describeField(userSchema, 'name');
// { kind: 'string', label: 'Nome', required: true, nullable: false, optional: false,
//   readOnly: false, minLength: 3, maxLength: 50 }

describeField(userSchema, 'note');
// { kind: 'string', label: 'Nota', required: false, nullable: true, … }
```

Turn that into props once, and every field in the app stops repeating itself:

```ts
import { describeField } from '@proedis/zod';
import type { FieldDescriptor } from '@proedis/zod';

interface TextFieldProps {
  label?: string;
  required: boolean;
  maxLength?: number;
  minLength?: number;
  type: 'email' | 'text' | 'url';
}

function toTextFieldProps(descriptor: FieldDescriptor): TextFieldProps {
  return {
    label    : descriptor.label,
    required : descriptor.required,
    minLength: descriptor.minLength,
    maxLength: descriptor.maxLength,
    type     : descriptor.format === 'email' ? 'email' : descriptor.format === 'url' ? 'url' : 'text'
  };
}

const emailProps = toTextFieldProps(describeField(userSchema, 'email'));
// { label: 'Email', required: true, type: 'email' }
```

In a real form the descriptor is read once per field and the control's own props win on top of it,
so `<TextInput name={'email'} label={'E-mail aziendale'} />` still overrides the schema. That merge
order — schema first, caller last — is the whole convention.

## 📖 API

### The descriptor

Every constraint is `undefined` when absent, never `null`: Zod's own accessors answer `null` for
"no bound", which reads as a value once spread onto component props.

| Field | Present for | Meaning |
| --- | --- | --- |
| `kind` | always | `string` `number` `bigint` `boolean` `date` `enum` `literal` `file` `array` `object` `unknown` |
| `label` | when `.describe()`d | Zod's closest thing to a label |
| `required` | always | Not optional, not nullable, no default — the flag a control turns into its marker |
| `optional` / `nullable` | always | Kept separate from `required`: "clearable" and "required" are different questions |
| `readOnly` | always | From `z.readonly()` |
| `defaultValue` | when declared | |
| `format` / `pattern` | strings | `email`, `uuid`, `url`, … and the regex of a `.regex()` |
| `minLength` / `maxLength` | strings | |
| `min` / `max` / `integer` / `multipleOf` | numbers | |
| `minDate` / `maxDate` | dates | |
| `options` | enums, literals | `[ { key, value } ]` — key and value differ for a keyed enum |
| `minItems` / `maxItems` / `items` | arrays | `items` is the element's own descriptor |

### Paths

`describeField` walks object shapes by key and arrays by index, with the same dotted syntax every
form library uses for a field name — so a control passes the `name` it already has:

```ts
describeField(schema, 'address.town.id');   // through two nested objects
describeField(schema, 'rows.0.quantity');   // through an array element
```

### What it sees through

Three shapes that a naive walker gets wrong, and that real schemas are full of:

- **`.transform()` is not a wrapper**, it is a `pipe`. The walk follows the pipe's *input* side —
  what the user types — so a validator like `z.string().trim().transform(v => v || null).nullable()`
  still describes itself as a nullable string.
- **`.describe()` lands on the level it was called on.** Both
  `z.string().describe('x').nullable()` and `z.string().nullable().describe('x')` are common; the
  first description found from the outside wins.
- **`z.union([ z.string(), z.null() ])`** is a nullable string, not an `unknown`: the value-carrying
  member decides the kind, and the `null` / `undefined` members fold into `nullable` / `optional`.

### Throwing is the default

`describeField` throws on a path the schema does not contain. That is deliberate: a mistyped field
name silently produces a control with no label, no requiredness and no bounds — a defect that reaches
production looking like a design choice. Use `tryDescribeField` where a missing path is a legitimate
answer.

### `validators`

Six validators, all of them answers to a shape a form actually produces rather than to a shape the
schema would like.

| Validator | What it solves |
| --- | --- |
| `nullableString(refine?)` | An untouched input hands over `''`, the column expects `null`. `z.string().nullable()` stores the empty string |
| `nullableNumber(refine?)` | A text input hands over strings, an emptied one `''`, a half-typed one garbage. The alternative to `z.coerce.number()`, whose `NaN` reaches the form as an unreadable error |
| `requiredUid(message?)` / `nullableUid(message?)` | A relation, guarded as a UUID |
| `requiredStartDateOnly(refine?)` / `nullableStartDateOnly(refine?)` | A date truncated to the first millisecond of its day |
| `requiredEndDateOnly(refine?)` / `nullableEndDateOnly(refine?)` | …and to the last, which is the off-by-one every range filter reinvents |

```ts
const schema = z.object({
  note    : nullableString(s => s.max(256)).describe('Nota'),
  ownerId : requiredUid('Devi scegliere un valore').describe('Proprietario'),
  discount: nullableNumber(n => n.min(0).max(100)).describe('Sconto'),
  from    : requiredStartDateOnly().describe('Da'),
  to      : nullableEndDateOnly(d => d.min(new Date())).describe('A')
});
```

The `refine` callback is what makes these more than sugar: it applies **only to the values that
survived** as a string, a number or a date, so `null` is never measured against a `min`. That is the
whole point — an empty optional field means "absent", not "invalid".

`requiredUid` takes its message instead of shipping one: a validator that mostly guards a *selector*
wants "you must choose a value", and only the application knows which language to say it in.

Dates are truncated in the **runtime's timezone**, deliberately: a user picking "20 August" means
their own 20 August, and truncating in UTC would drop the first or the last hours of it depending on
the season. The backend still receives an instant.

⚠️ **The two halves interact, up to a point.** A constraint declared inside a `refine` callback is
enforced but **invisible** to `describeField`: it lives in a function, and no introspection can read
it. So `nullableString(s => s.max(256))` validates at 256 characters while the descriptor reports no
`maxLength`, and a control driven by the descriptor will not show the limit. When the control must
display it, declare it on the field as well.

## 🤝 Compatibility

| | |
| --- | --- |
| `zod` | `^4.0.0` (verified against 4.4.3) |
| Entry points | `@proedis/zod`, `/fields`, `/validators` |
| TypeScript | `>=5.5` |
| Runtime | ES2022, any JS runtime — no DOM, no React |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
