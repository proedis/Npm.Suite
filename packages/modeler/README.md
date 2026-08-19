<div align="center">

# `@proedis/modeler`

**Typed domain models on top of `class-transformer`: enums that know their own label, flag sets that
behave like sets, and .NET durations that survive a round trip.** 🧩

[![npm](https://img.shields.io/npm/v/@proedis/modeler.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/modeler)
[![license](https://img.shields.io/npm/l/@proedis/modeler.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

| | |
| --- | --- |
| `ModelerObject` | the base class every model extends: `from`, `clone`, `equals`, `hash`, `toObject` |
| `Enum` | a value plus its label, int value, colour and icon, resolved from a registered collection |
| `Flags` | a set of enums that *is* an `Array`, with `hasAll` / `hasAny` / `toggleFlag` and friends |
| `TimeSpan` | a .NET style duration, parsed and rendered as `[-][d.]hh:mm:ss.fff` |
| `AsDayJs` `AsEnum` `AsFlags` `AsTimeSpan` | the decorators that wire all of the above into a model |

## 📦 Installation

```bash
yarn add @proedis/modeler class-transformer reflect-metadata dayjs
```

All four peers are **required**, and `reflect-metadata` has to be imported once, before any model is
defined:

```ts
import 'reflect-metadata';
```

Your `tsconfig` needs `experimentalDecorators` and `emitDecoratorMetadata` — both are on in every
[`@proedis/tsconfig`](https://www.npmjs.com/package/@proedis/tsconfig) preset, together with the
`useDefineForClassFields: false` pin that keeps declared-but-unassigned class fields from being
initialised to `undefined` behind the decorators' back.

## 🚀 Quick start

```ts
import 'reflect-metadata';
import { AsDayJs, AsEnum, AsFlags, AsTimeSpan, Enum, Flags, ModelerObject } from '@proedis/modeler';
import type { DateTime, TimeSpan } from '@proedis/modeler';

/** Register the enum collections once, at startup */
Enum.configureCollections({
  status: [
    { intValue: 1, label: 'Open',   value: 'open' },
    { intValue: 2, label: 'Closed', value: 'closed' }
  ]
});

class Ticket extends ModelerObject {
  public id!: number;

  @AsEnum('status')
  public status!: Enum<'status'>;

  @AsFlags('status')
  public visited!: Flags<'status'>;

  @AsDayJs()
  public createdAt!: DateTime;

  @AsTimeSpan()
  public estimate!: Nullable<TimeSpan>;
}

/** Build one from an API payload */
const ticket = Ticket.from({
  id       : 7,
  status   : 'open',
  visited  : [ 'open' ],
  createdAt: '2024-01-15T10:00:00Z',
  estimate : '1.02:30:00'
});

ticket.status.label;              // 'Open'
ticket.status.is('open');         // true
ticket.visited.hasAny('closed');  // false
ticket.estimate!.totalHours;      // 26.5

/** …and turn it back into a payload the API understands */
ticket.toObject();                // status: 'open', estimate: '01.02:30:00', createdAt: Date
```

## 📖 API

### 🏛️ `ModelerObject`

| Member | What it does |
| --- | --- |
| `static from(source)` | build an instance — or an array of them — from a plain payload |
| `static isModelerObject(value)` | type guard |
| `static isSameModelerObject(a, b)` | same constructor **and** same hash |
| `clone(options?)` | a new instance through `instanceToInstance`, decorators respected |
| `equals(other)` | guarded comparison against any value |
| `hash()` | a content fingerprint, via `@proedis/utils` |
| `toObject(options?)` | the plain object |
| `toJSON()` | the plain object — the hook `JSON.stringify` calls |
| `toJsonString(options?)` | the JSON string |

⚠️ `toJSON()` takes **no arguments**, and it must not: `JSON.stringify` invokes that hook passing the
*property key* the value sits under. Pass transform options to `toObject` or `toJsonString` instead.

### 🏷️ `Enum<C>`

An enum is resolved from a registered collection and cached, so two lookups of the same value give the
same instance.

```ts
Enum.configureCollections({ status: [ { intValue: 1, label: 'Open', value: 'open' } ] });
Enum.configureColors('gray', { status: { open: 'green' } });
Enum.configureIcons('bug', { status: { open: 'folder-open' } });
Enum.setLabelFormatter((label) => t(label));   // run every label through i18n
```

| Member | Notes |
| --- | --- |
| `value` / `label` / `hashCode` | the value, the label (through the formatter, if set), the int value |
| `color` / `iconName` | resolved from `configureColors` / `configureIcons`, with a default |
| `is` / `isOneOf` | accept an instance or a value |
| `lt` `lte` `gt` `gte` | ordered by `hashCode`, so the int value is your sort order |
| `toString` / `toJSON` | the value |

💡 Colour and icon tokens are **your** types, not this package's. Declare them the same way you declare
your enums:

```ts
declare module '@proedis/modeler' {
  interface ModelerOverride {
    enums: MyEnumsRegistry;
    color: MantineColor;
    icon: IconName;
  }
}
```

That is what makes `EnumName`, `EnumValue<'status'>` and `Enum<'status'>` resolve to your registry
instead of `string`. It also keeps a UI kit out of this package's type surface — the tokens used to be
typed against `@mantine/core` and `@fortawesome`, which meant the emitted declarations referenced two
modules nobody was required to install.

⚠️ Comparisons never throw: `is('somethingUnknown')` is `false`, not an error. A *lookup*
(`Enum.getEnum`) still throws, because there is no sensible answer to give.

### 🚩 `Flags<C>`

`Flags` extends `Array<Enum<C>>`, so everything you know about arrays works — and `Symbol.species` is
`Array`, so `map` and `filter` give you plain arrays rather than half-built flag sets.

| Group | Members |
| --- | --- |
| Read | `flags`, `labels`, `hasFlag`, `hasAll`, `hasAny`, `hasNone`, `isSubsetOf`, `isSupersetOf` |
| Write | `addFlag(s)`, `removeFlag(s)`, `toggleFlag(s)`, `set`, `clear` |
| Derive | `where(predicate)`, `except(...values)`, `only(...values)` |
| Serialize | `toObject` / `toJSON` give the value array, `toString` the joined labels |

A `Flags` property is never `null`: an absent value becomes an empty set, which is what makes
`ticket.visited.hasAny(…)` safe to write without a guard.

### ⏳ `TimeSpan`

A duration in the .NET format `[-][d.]hh:mm:ss[.fff]` — note the **dot** before the days.

```ts
TimeSpan.parse('1.02:30:00');          // throws on a malformed value
TimeSpan.tryParse('nope');             // { success: false, value: null }
TimeSpan.fromHours(2.5);
TimeSpan.fromDateDifference(start, end);

const span = TimeSpan.parse('1.02:30:00');

span.totalHours;        // 26.5
span.hours;             // 2 — the component, not the total
span.add(other);
span.addTo(new Date());
span.toString();        // '01.02:30:00.000', and it parses back
```

Constants worth knowing: `TimeSpan.zero`, `TimeSpan.maxValue`, `TimeSpan.minValue`, and the
`millisecondsPerSecond` / `Minute` / `Hour` / `Day` factors.

`valueOf()` is the millisecond count, so `spanA < spanB` and `spanA - spanB` work as arithmetic, while
a string context gives the formatted duration.

### 🎀 The decorators

| Decorator | To class | To plain |
| --- | --- | --- |
| `AsDayJs()` | a Day.js instance | a `Date` |
| `AsEnum(name)` | an `Enum`, or `null` | the value string |
| `AsFlags(name)` | a `Flags` set, never null | the array of values |
| `AsTimeSpan()` | a `TimeSpan`, or `null` | the formatted string |

`AsDayJs` handles arrays as well as single values. Every decorator accepts the `Transform` options —
minus `toClassOnly` and `toPlainOnly`, which each decorator declares for itself.

## 🔀 Migrating to 2.x

Six bug fixes, and one of them was corrupting data on the way out:

| Fixed | Before | Now |
| --- | --- | --- |
| `TimeSpan.toString()` | joined the days with a **colon** (`01:02:03:04.005`), a string `TimeSpan.parse` refuses — so any duration of a day or more could not round trip, and `AsTimeSpan` serializes through here | a dot (`01.02:03:04.005`), and it parses back |
| `toJSON()` on models, `Flags` and `Enum` | returned a **string**, so `JSON.stringify` encoded it again: a model nested in a payload came out as `{"user":"{\"id\":7}"}` | returns the plain value; the string form moved to `toJsonString()` |
| `TimeSpan` in `JSON.stringify` | had no hook at all, leaking its private field as `{"_milliseconds":3600000}` | the formatted string |
| `DateTime` as a value | exported as `undefined`, because `dayjs` does not expose `Dayjs` at runtime — `new DateTime()` threw | the `dayjs` factory: the type is an instance, the value builds one |
| `Flags.isSubsetOf` | compared enum instances against value strings, so the documented `Enum[]` overload reported every non empty set as not a subset | both overloads work |
| `Enum` collections cache | never dropped, so a second `configureCollections` — a hot reload, a tenant switch, a test resetting fixtures — kept serving instances built from the old collections | cleared on every reconfiguration |

And three type corrections:

| Change | What to do |
| --- | --- |
| `NullableDateTime` | it used to be `Nullable<typeof DateTime>`, the *constructor* type. It is now `Nullable<DateTime>`, an instance — which is what every usage meant. Assignments that compiled by accident may now need fixing. |
| `DecoratorOptions` | written with `Exclude` where `Omit` was meant, so it removed nothing: `toClassOnly` and `toPlainOnly` were still accepted, and passing either one broke the transform direction. They are gone from the type, and the direction now wins over whatever options you pass. |
| `Enum.is` / `isOneOf` | threw on a value outside the collection — and `isOneOf` threw or not depending on argument order. They return `false`. |

## 🤝 Compatibility

| Requirement | Range |
| --- | --- |
| `class-transformer` | `^0.5.1` (peer) |
| `reflect-metadata` | `^0.1.13 \|\| ^0.2.0` (peer) |
| `dayjs` | `>=1.11.0` (peer) |
| `typescript` | `>=5.2.0`, with `experimentalDecorators` and `emitDecoratorMetadata` |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
