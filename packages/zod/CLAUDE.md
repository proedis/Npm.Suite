# CLAUDE.md — `@proedis/zod`

## Why this package exists

`Orbit.Web/packages/ui-forms` derives a field's label, requiredness and bounds from its Zod schema,
so each fact is declared once. Neither newer frontend does: `GeoStore.Web` and `PinTips` both write
`<FormControl label description required>` by hand, per field, per form. The capability was lost in
the copy, and the reason it could not travel is that the Orbit implementation is welded to two
things at once — Zod 3 class identities and Mantine's `Factory` types.

This package is the half that can travel: **schema in, field descriptor out.** Nothing else.

## What does NOT go in here

- React. Not a hook, not a context, not a component — this package must be usable from a Node script
  and from React Native without either pulling a DOM.
- Any form library. `react-hook-form`, `@mantine/form` and whatever comes next each get a thin
  binding in the consuming repo, roughly thirty lines over `describeField`.
- Any UI vocabulary. The descriptor says `format: 'email'`, never `type: 'email'`; it says
  `kind: 'string'`, never `control: 'TextInput'`. The mapping from descriptor to props is the
  consumer's design system, and it is where the two are allowed to disagree.
- Anything that is not either introspection or a validator. The two entry points are the boundary:
  `fields` reads a schema, `validators` builds one, and neither imports the other.

## Structure

```
src/
  fields/                   # schema in, field descriptor out
    zod-internals.ts        # the ONLY file that knows Zod's internal shape
    unwrap-schema.ts        # the wrapper / pipe walk
    describe-field.ts       # descriptor construction + path resolution
    field-descriptor.types.ts
  validators/               # the validators a form needs
    refine.ts               # the superRefine bridge, written once
    strings.ts · numbers.ts · dates.ts
```

Both are published subpaths (`proedisMetadata.exports`); a third module must be added there **and**
to the rollup input, which the root config derives from the same field.

## Invariants

- **No runtime import of Zod, only `import type`.** The emitted JS touches `def.type` as a string
  and never runs an `instanceof`. That is what makes the package immune to two Zod instances in one
  bundle — the exact failure that made the Zod 3 ancestor fragile.
- **`zod-internals.ts` is the blast radius.** Every structural assumption about `def`, its checks and
  Zod's public accessors lives there. A Zod release that renames something breaks one file.
- **Public accessors first, checks second.** `.minLength`, `.maxValue`, `.isInt`, `.minDate` are
  documented Zod 4 API and are preferred wherever they exist. Checks are read only where no accessor
  does: array bounds (`min_length` / `max_length`), `multiple_of`, and the `string_format` check that
  carries a `.regex()` pattern.
- **`pipe` is followed on its `in` side.** A form describes what the user types, not what the schema
  outputs. Following `out` makes every `.transform()`ed validator report `kind: 'unknown'`.
- **Absent means `undefined`, never `null`.** Zod answers `null` for "no bound"; spread onto props,
  `null` is a value and overrides a component default.
- **`required`, `optional` and `nullable` stay three separate flags.** A control needs "show the
  asterisk" and "offer a clear button" independently, and a `.default()` makes a field not required
  without making it nullable.
- **`describeField` throws, `tryDescribeField` returns `null`.** A path that does not resolve is
  almost always a typo in a `name`, and the silent version of that bug is invisible in review.

## Invariants — `validators`

- **The refine callback runs after the transform, on non-nullish values only.** That is the whole
  contract: an empty optional field means "absent", not "invalid", so `nullableString(s => s.min(3))`
  must accept `''` and reject `'ab'`. Moving the constraint onto the base schema — which would make
  it introspectable — silently breaks this, because `''` would then be measured against the `min`.
  The consequence is documented in the README: a constraint inside a refine is invisible to
  `describeField`. It is a real limit of the two halves together, not an oversight.
- **`applyDynamicRefine` reads `error.issues`.** Zod 4 removed the `errors` alias the Zod 3 ancestor
  used; that alone would have thrown at runtime on every failed refinement.
- **No validator ships copy.** `requiredUid` takes its message. The Zod 3 ancestor hardcoded
  «Devi scegliere un valore per questo campo» inside library code.
- **No validator lies about its type.** The ancestor's `nullableNumber` returned
  `as unknown as z.ZodNullable<z.ZodNumber>` while actually returning a pipe. The honest inferred
  type is what lets `describeField` resolve it.
- **Dates truncate in local time.** See the README for why, and do not "fix" it to UTC.

## Verification

No test runner in this repository. What was run when the package was written:

- `npx tsc -p tsconfig.json --noEmit` and `npx eslint packages/zod` — clean.
- A seventeen-path behaviour table against **zod 4.4.3**, asserting kind, label, required, nullable,
  optional, readOnly, default, format, pattern, string and number bounds, dates, enum options and
  array bounds. It covers the shapes that actually appear in `Orbit.Web`: a `.superRefine()`d root
  object, `z.string().trim().transform(…).nullable()`, `z.uuid()`, nested object paths
  (`address.town.id`), array element paths (`rows.0.qty`) and a `z.union([ z.string(), z.null() ])`.
- Both README examples compiled against `src` and executed; the printed descriptors are what the
  README shows.
- The validators exercised on **twenty cases**: empty / whitespace / null / undefined / valid for
  `nullableString`, its refine rejecting a long string while letting `null` through, a bad UUID with
  and without a custom message, `''` / `'12.5'` / `'x'` / `5` and a failing `min` for
  `nullableNumber`, and the four date truncations including a failing `min`. Plus an interop pass:
  a schema built entirely out of these validators, described field by field with `describeField` —
  which is how the invisible-constraint limit was found.

The union case is worth keeping in whatever the next table looks like: it was wrong first (reported
`required: true` for a nullable union) and the fix is the reason `resolveUnion` returns flags rather
than a schema.
