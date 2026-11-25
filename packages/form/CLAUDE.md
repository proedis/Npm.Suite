# CLAUDE.md — `@proedis/form`

## Why this package exists

Marco could not tell, from the code, how `Label`, `Field`, `FieldShell`, the controls and `Form` fit,
nor write a form without wiring every field by hand. The UI layer was made props-only and its state
made to flow down; this package is the other half: react-hook-form and Zod **bound** to that layer, so
a field gives its name and the schema gives the rest.

It is a package of its own, and not a peer of `@proedis/ui`, on purpose (decided 2026-11-24): the UI
package stays free of any form library, a `Field` outside a form and a form without a schema keep
working with `@proedis/ui` alone, and a major of react-hook-form is a major of this package, not of
the UI. Orbit's `ui-forms` (Mantine form, one wrapper component per control) is the ancestor; what it
derived per control is derived here once, from `@proedis/zod`.

## What does NOT go in here

- A control, or anything with a look: every element on screen is `@proedis/ui`'s. This package
  renders a `Form` and a `Field` and clones the control it is given.
- Knowledge of a control. The binding is declared by the control (`TextInput.binding`, `bindable`),
  so nothing here imports `@proedis/ui/forms/text-input` & co., and installing this package pulls none
  of their optional peers (Base UI, dayjs, TanStack Table).
- Schema introspection. That is `@proedis/zod` (`tryDescribeField`); this package maps a descriptor to
  props (`schemaProps`) and nothing else.
- Validation of its own, a submit state of its own, a server-error convention of its own. react-hook-form
  owns the state, Zod the rules, the caller the server (`setError`).

## Names

`BoundForm` and `BoundField`, never `Form` and `Field` (Marco, 2026-11-24): with the same names a plain
`Field` of the UI would end up inside a bound form unbound, silently. The hook is `useSchemaForm`.

## Invariants

- **The schema is found through the form, not passed twice.** `useSchemaForm` registers the schema in
  a `WeakMap` keyed by `form.control`, an object react-hook-form keeps for the life of the form;
  `BoundForm` reads it from there unless given `schema` (or `null` for none). Weak, so a form that goes
  away takes its entry.
- **The order of the props is the contract.** On the control: the schema's bounds, then the props the
  caller wrote on it, then the binding; a handler written on the control is composed with the
  binding's and runs first; the ref is forked. On the field: an explicit prop of `BoundField` always
  wins over the schema. `undefined` from the schema is dropped, never spread over a default.
- **The asterisk tells the truth, from what the control holds empty** (`isRequired` in `schemaProps`).
  `describeField.required` is "neither optional, nor nullable, nor defaulted", which over-promises for a
  text: a cleared text control holds `''`, which `z.string()` accepts. So a string is required under a
  text control only with a minimum length or a format; under a choice or a date control, whose empty
  is `null`, a plain `z.string()` is required. A literal (`z.literal(true)`, a box that must be ticked)
  is required; any other boolean is not. Measured on the built artifacts, every case.
- **`onSubmit` errors are never swallowed.** `BoundForm` hands `handleSubmit`'s promise back to the
  form event and does not catch it: an error the caller did not catch reaches the console.
- **The state goes to the UI, not around it.** `isSubmitting` and `isDirty` (through `useFormState`, so
  only those two re-render the form) become `submitting` and `dirty` of the UI `Form`, which spins
  `Form.Submit` and reports to the Dialog or Drawer around it. Nothing here knows about overlays.
- **A native reset is replaced by `form.reset()`**: the browser's reset would empty the inputs behind
  react-hook-form's back.

## The in-repo subpath imports

This is the first package of the suite to import a sibling's **subpaths** (`@proedis/ui/forms/field`,
`@proedis/ui/forms/form`). In the workspace a sibling's `main` is its source and its manifest declares
no subpath, so:

- `tsconfig.json` maps `@proedis/ui/*` onto `../ui/src/*`: the development typecheck reads the source.
- `tsconfig.declaration.json` maps `@proedis/ui` and `@proedis/ui/*` onto `../ui/build/types`: the
  declarations are built against what a consumer will see. ⚠️ Pointing this one at the source makes tsc
  emit `.d.ts` of the UI **into `packages/ui/src`** (it emits despite the `rootDir` errors), which then
  breaks the lint of the whole repository. Lerna builds `@proedis/ui` first, since it is a dependency here.
- Rollup keeps every `@proedis/ui/**` import external (`name/**` regex from the peers), so nothing of the
  UI is bundled: the emitted modules import only declared names.

## Verification

- `tsc`, `eslint`, `yarn build` and `release:verify` green; the emitted modules and `.d.ts` import only
  the package's own modules and declared dependencies and peers.
- `schemaProps` run on the built artifacts against a schema of every kind: labels, the four requiredness
  cases, `min` / `max` / `step` of an integer, `maxLength` of a text.
- In the browser, on the documentation site: a form submitted empty listing five errors in its summary
  and focusing it; filled through the UI (a Select clicked, a date picked in the calendar) and submitted
  with the output of the schema (`capacity` a number, the date `YYYY-MM-DD`, an empty nullable `null`);
  every control of the package bound and changing the form; in a Dialog, the discard prompt on Esc with
  no `dirty` written and the dialog inert with the submit spinning while saving, then closed; a 422 of
  the server on its field, with the focus, and a 409 on `root`.
