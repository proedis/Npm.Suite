---
paths:
  - "packages/eslint-config-proedis/**"
  - "eslint.config.mjs"
  - "scripts/sync-airbnb-rules.mjs"
---

# `eslint-config-proedis` and the root ESLint config

Moved verbatim from the root `CLAUDE.md`.

### The shared ESLint config lints this repository

`eslint-config-proedis` is consumed by the root `eslint.config.mjs`, so any change to it is felt here
first. Five things about it are load-bearing:

**Layer order is the whole mechanism.** For any file, the last flat-config entry that matches wins.
The presets therefore apply the upstream recommended sets, then the vendored Airbnb decisions, then
the Proedis adjustments — and `typescript-eslint`'s `eslintRecommended` is **re-applied after
Airbnb**, because Airbnb switches several of the rules it disables back on. Getting that order wrong
does not fail loudly: it double-reports, and it makes `no-undef` flag every DOM type used in a type
position.

**Airbnb is vendored, not depended on.** `eslint-config-airbnb-base@15` never shipped a flat config
and still declares `eslint: ^7 || ^8` as a peer, which npm treats as an `ERESOLVE` failure next to a
current ESLint. `scripts/sync-airbnb-rules.mjs` reads its rule files, remaps the 68 formatting rules
to the `@stylistic` namespace, drops the ones ESLint has since deleted (`valid-jsdoc`,
`require-jsdoc`) and writes `lib/airbnb/*.js`. Those files are generated — edit the preset that
consumes them, not them, and re-run `yarn rules:sync` after bumping the source package.

**Formatting comes from `@stylistic`.** ESLint core deprecated its formatting rules in 9 and removed
them in 10; `@typescript-eslint` dropped its copies in v8. The `@stylistic` ports also *see*
TypeScript, which means they report on syntax the core rules never inspected — `semi` on a type alias
declaration, `indent` in a conditional type, `operator-linebreak` on the `=` of a generic alias.
That last one is why `operator-linebreak` deliberately relaxes Airbnb's `'=': 'none'` to `'ignore'`:
a long generic type alias has nowhere to go but the next line, and the rule cannot tell an alias from
an assignment. **A consequence to remember: an `eslint-disable` comment naming a core formatting rule
stops suppressing anything.** ESLint reports those itself, as unused disable directives.

**An arbitrary Tailwind value is an error, and that rule is the `proedis/tailwind` block.** A
`no-restricted-syntax` selector over string literals and template elements, matching `-[…]` **not**
followed by a colon — which is what separates a value (`size-[18px]`) from a variant
(`data-[state=open]:`, `[&_svg]:`, `min-[600px]:`, `has-[input:focus]:`). Validated against both sets
before being added, and it is in the **React preset only**, since a project without JSX has no class
attribute for it to fire on. It re-enables a rule the shared layers switch off, so a consumer
declaring its own `no-restricted-syntax` selectors replaces these rather than adding to them. The
reason it exists as a rule rather than a convention is that the convention had already been stated
and broken: `@proedis/ui` shipped `size-[18px]`, `text-[13px]` and `max-w-[96rem]`, each of them
a length with no name, invisible to a theme.

**Version 2 never actually applied Airbnb.** It extended `eslint-config-airbnb-typescript/base`,
which carries only the TypeScript overrides and not the Airbnb rule sets, so the suite had never been
checked against them. Adopting v3 surfaced 253 findings in code that was green — most of them
mechanical, a few genuine bugs (a `throw new Error('… ${runner}')` written with single quotes, so the
message printed the placeholder; `Guard.ifIn` / `ifNotIn` asserting the opposite of their names).

Equivalence with Orbit's own flat config is verified by diffing `eslint --print-config` output rule by
rule, not by eyeballing the rule lists: zero rules active in Orbit are missing here, and the option
differences are all `@stylistic` writing schema defaults in full where core leaves them implicit.

**The layout rules stay in this repository** (Marco, 2026-11-27). `suite/ui-layout` (inside `@proedis/ui`) and
`suite/platform-layout` (the site) are blocks of the root `eslint.config.mjs`, not of the published config: an
application reaches for the layout primitives first, as the Layout overview of the documentation says, and writes
the few layouts they do not cover (named tracks, columns counted from the data, a gap per axis, a container query)
with classes. Do not move them into `eslint-config-proedis`.
