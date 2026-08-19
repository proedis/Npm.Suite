<div align="center">

# `@proedis/formatters`

**Numbers and durations turned into the strings a person actually reads — in Italian or in
English.** 🔢

[![npm](https://img.shields.io/npm/v/@proedis/formatters.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/formatters)
[![license](https://img.shields.io/npm/l/@proedis/formatters.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

Three formatters, zero dependencies. 🪶

| Formatter | Turns | Into |
| --- | --- | --- |
| `formatNumber` | `1234.5678` | `'1,234.57'` |
| `formatDuration` | `90061000` | `'1 day, 1 hour, 1 minute and 1 second'` |
| `pluralize` | `3` | `'3 files'` |

Each one is callable straight away, and each one carries a **`create`** method that hands back a
preconfigured copy — so an application declares its currency style or its duration style once, and
passes only the value from then on.

## 📦 Installation

```bash
yarn add @proedis/formatters
```

## 🚀 Quick start

```ts
import { formatDuration, formatNumber, pluralize } from '@proedis/formatters';

formatNumber(1234.5678, { precision: 2 });               // '1,234.57'
formatDuration(90061000, { locale: 'it' });              // '1 giorno, 1 ora, 1 minuto e 1 secondo'
pluralize(3, 'file', 'files');                           // '3 files'

/** …or declare the style once */
const currency = formatNumber.create({ precision: 2, prefix: '€', pattern: '%p%m%n' });

currency(1234.5);                                        // '€1,234.50'
currency(1234.5, { prefix: '$' });                       // '$1,234.50' — a per call override
```

## 📖 API

### 🔢 `formatNumber(value, config?)`

| Option | Default | What it does |
| --- | --- | --- |
| `precision` | `0` | how many decimals to render |
| `flexibleDecimals` | `false` | drop trailing zeros, down to `minPrecision` |
| `minPrecision` | `0` | the floor for flexible decimals |
| `decimalSeparator` | `'.'` | |
| `thousandSeparator` | `','` | |
| `prefix` / `suffix` | `''` | |
| `pattern` | `'%p %m %n %s'` | how the pieces are arranged |

The **pattern** is what makes the arrangement yours rather than the formatter's. It holds four
placeholders — `%p` prefix, `%m` minus sign, `%n` number, `%s` suffix. Runs of whitespace collapse to
one space and the result is trimmed, so an unused placeholder leaves no gap behind.

⚠️ The default pattern puts a space on both sides of the minus sign, which is rarely what a currency
wants:

```ts
formatNumber(-1234.5, { precision: 2, prefix: '€' });                     // '€ - 1,234.50'
formatNumber(-1234.5, { precision: 2, prefix: '€', pattern: '%p%m%n' });  // '€-1,234.50' ✅
```

Flexible decimals are for prices and quantities that should not shout `.00` at you, while still
lining up:

```ts
formatNumber(1.5, { precision: 4, flexibleDecimals: true });                   // '1.5'
formatNumber(1.5, { precision: 4, flexibleDecimals: true, minPrecision: 2 });  // '1.50'
formatNumber(1,   { precision: 4, flexibleDecimals: true, minPrecision: 2 });  // '1.00'
```

### ⏱️ `formatDuration(value, config?)`

The value is split across the requested units from the largest down, each unit taking what is left
after the ones before it, and the **smallest unit keeps the remainder as decimals**. Only non zero
parts are rendered, so nothing pads the output with zeros.

| Option | Default | What it does |
| --- | --- | --- |
| `units` | `[ 'y', 'mo', 'w', 'd', 'h', 'm', 's' ]` | which units may appear |
| `sourceUnit` | `'ms'` | the unit the input is expressed in |
| `locale` | `'en'` | `'en'` or `'it'` |
| `largest` | `null` | render at most this many parts |
| `maxDecimals` | `2` | precision of the smallest unit |
| `round` | `false` | round every part, carrying a full unit up into the next larger one |
| `delimiter` | `', '` | between all parts but the last two |
| `conjunction` | per locale | between the last two parts |
| `decimals` | per locale | the decimal separator of a count |

```ts
const units: DurationUnit[] = [ 'd', 'h', 'm' ];

formatDuration(90061000, { units });                  // '1 day, 1 hour and 1.02 minutes'
formatDuration(90061000, { units, round: true });     // '1 day, 1 hour and 1 minute'
formatDuration(90061000, { largest: 2 });             // '1 day and 1 hour'
formatDuration(3.5, { sourceUnit: 'h' });             // '3 hours and 30 minutes'
formatDuration(0);                                    // '0 seconds'
```

💡 `round` is the option to reach for when a UI must never show `59.6 minutes`: it rounds each part
and, when a rounded part adds up to a whole larger unit, moves it up instead of printing `60 minutes`.

Locales bring their own separator and conjunction, so `'it'` is not just a word swap:

```ts
formatDuration(5400000, { units: [ 'h' ] });                  // '1.5 hours'
formatDuration(5400000, { units: [ 'h' ], locale: 'it' });    // '1,5 ore'
```

An unrecognised locale silently falls back to English. `Locale` is a literal union, so that can only
happen from untyped JavaScript — and a formatter in a render path is the wrong place to throw.

### 🔤 `pluralize(value, ifSingular, ifPlural)`

Only an exact `1` is singular; `0` and any decimal take the plural. Each form is either a suffix
appended after the count, or a function taking full control:

```ts
pluralize(1, 'file', 'files');    // '1 file'
pluralize(0, 'file', 'files');    // '0 files'
pluralize(null, 'file', 'files'); // '0 files'

pluralize(3, (n) => `only ${n} left`, (n) => `${n} in stock`);   // '3 in stock'

const files = pluralize.create('file', 'files');
files(12);                        // '12 files'
```

### 🏭 `create`, and how configuration layers

`formatNumber.create` and `formatDuration.create` return a formatter that carries defaults and can
itself be narrowed further:

```ts
const currency = formatNumber.create({ precision: 2, prefix: '€', pattern: '%p%m%n' });
const dollars  = currency.create({ prefix: '$' });

dollars(9.5);   // '$9.50'
```

Configuration layers at three points — the parent's defaults, the ones given to `create`, the ones
passed to a single call — with the later always winning. ⚠️ The layering is a **shallow** spread, one
level deep: a nested object in a configuration replaces its counterpart rather than merging with it.
Every configuration in this package is flat, so this only matters if you build your own formatter on
`instantiateFormatter`.

### 🧮 Number coercion, everywhere

Every formatter runs its input through the same coercion: `null`, `undefined`, a string that does not
parse, `NaN` and both infinities all become the fallback, normally `0`. A formatter sits in a render
path, and returning `'0'` always beats propagating `NaN` into the interface.

## 🔀 Migrating to 2.x

This release is mostly **bug fixes**, and three of them changed output you may have worked around:

| Fixed | Before | Now |
| --- | --- | --- |
| Single part durations | the conjunction was glued to the front of the result: `formatDuration(1000)` returned `' and 1 second'` | `'1 second'` |
| `round: true` | **threw** `TypeError` on every call — the loop read one index past the end of the parts array | rounds, and carries a full unit up |
| `conjunction` / `decimals` | written straight into the shared locale dictionary, so **one** call leaked its override into every later call for the lifetime of the process | resolved per call, nothing is mutated |
| The `decimals` option | declared in the config interface, never read. The per locale values were also swapped — `en` carried `','` and `it` carried `'.'` | wired up, and each locale carries its own correct separator |
| Unrecognised locale | reached for `global.console`, which does not exist in a browser: a `ReferenceError` instead of a warning | a silent fallback to English |

⚠️ Because `decimals` now works and the locale separators were corrected, **Italian durations render
`1,5 ore` where they used to render `1.5 ore`**. That is the fix, but it is a visible change.

The internal locale layer was reshaped along the way (`LocaleTransformer`, `LocaleDictionary` and
`extractLocaleDictionary` are gone, replaced by `DurationLocaleDictionary` and `DurationUnitLabel`).
None of it was ever exported from the package root, so a normal import is unaffected.

## 🤝 Compatibility

| Requirement | Range |
| --- | --- |
| Dependencies | none |
| `typescript` | `>=5.2.0` |
| Runtime | ES2022 — roughly Safari 16.4 / Chrome 94 / Node 16.11 |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
