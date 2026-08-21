<div align="center">

# `eslint-config-proedis`

**One package, one line of config, the whole Proedis house style. No list of peer plugins to keep in
sync.** 🧹

[![npm](https://img.shields.io/npm/v/eslint-config-proedis.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/eslint-config-proedis)
[![license](https://img.shields.io/npm/l/eslint-config-proedis.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

- **Two presets** — `base` for anything without React, `react` for anything with it
- **Every plugin included** as a real dependency: `typescript-eslint`, `@stylistic`,
  `eslint-plugin-import`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `globals`,
  `@eslint/js`. You install *this*, and nothing else. 📦
- **The Airbnb rule decisions, vendored** — the curated part, without the frozen package
- **All formatting through `@stylistic`**, so the config survives ESLint 10 and understands
  TypeScript and JSX syntax instead of guessing at it
- **Composable by construction** — the presets return plain flat config arrays, plus the individual
  blocks and the plugin instances, so nothing is a closed box 🔓
- **One Tailwind decision**, in the React preset: an arbitrary value in a class is an error 🚫

Flat config only, ESLint 9. No type aware linting: it needs a tsconfig per lint run and turns a two
second lint into a full typecheck, which your build already does, and does better.

## 📦 Installation

```bash
yarn add --dev eslint-config-proedis eslint
```

That is the entire dependency list. `typescript` is an optional peer — you need it only if you are
linting TypeScript, which you almost certainly are.

## 🚀 Quick start

```js
// eslint.config.mjs
import proedis from 'eslint-config-proedis';

export default proedis.react();
```

Non React project? `proedis.base()`. Done. 🎉

## 🔧 Making it yours

A flat config **is** an array, and for any given file the last entry that matches it wins. So
overriding anything is a matter of appending, and `defineConfig` is there to flatten whatever you
pass it — nested arrays, single objects, conditionals that evaluate to nothing.

```js
import proedis from 'eslint-config-proedis';
import tanstack from '@tanstack/eslint-plugin-query';

export default proedis.defineConfig(
  proedis.react({
    reactVersion: '19',
    ignores     : [ 'src/generated/**' ]
  }),

  // 1. relax a rule of the shared config
  { rules: { 'no-console': [ 'off' ] } },

  // 2. add a plugin of your own — installed by your project, not by this one
  {
    plugins: { '@tanstack/query': tanstack },
    rules  : { '@tanstack/query/exhaustive-deps': [ 'error' ] }
  },

  // 3. loosen something for one directory only
  {
    files: [ 'src/legacy/**' ],
    rules: { '@stylistic/max-len': [ 'off' ] }
  },

  // 4. a conditional entry: falsy entries are dropped
  process.env.CI && { rules: { 'no-console': [ 'error' ] } }
);
```

💡 Want to reconfigure a rule of a plugin the presets already ship? You do **not** need to install
that plugin — it is here, exposed as `proedis.plugins['@stylistic']`, `proedis.plugins.react`, and so
on. `proedis.globals` re-exports the `globals` package for the same reason.

### Preset options

| Option | Default | What it does |
| --- | --- | --- |
| `files` | every JS and TS extension | The patterns to lint. This is what makes `eslint .` pick up `.ts` and `.tsx` at all. |
| `ignores` | `[]` | Extra ignore patterns, appended to the defaults (`build`, `dist`, `out`, `coverage`, `node_modules`, `.git`, `.yarn`, `.next`, `.turbo`, `.nx`, `.cache`) |
| `defaultIgnores` | `true` | Set it to `false` to start the ignore list from scratch |
| `globals` | `'node'` (base) / `'browser'` (react) | A set name from the `globals` package, an array of them, or a raw object |
| `reactVersion` | `'detect'` | React preset only. Pin it to skip the detection. |

### Composing from scratch

If the presets are not the shape you want, build your own from the blocks. They are applied in this
order for a reason: the upstream recommended sets first, the Airbnb decisions on top, the Proedis
adjustments last.

```js
import proedis from 'eslint-config-proedis';

export default proedis.defineConfig(
  proedis.configs.ignores(),
  proedis.configs.files(),
  proedis.configs.languageOptions('node'),

  proedis.configs.javascript,               // eslint recommended
  proedis.configs.imports,                  // import plugin recommended
  proedis.configs.typescript,               // typescript-eslint recommended

  proedis.configs.airbnb,                   // the vendored Airbnb decisions

  proedis.configs.typescriptCoreOverrides,  // core rules the compiler already enforces, off again
  proedis.configs.importOverrides,
  proedis.configs.style,                    // the Proedis house style
  proedis.configs.typescriptOverrides
);
```

The React preset adds `proedis.configs.react(version)`, `reactOverrides`, `reactHooks` and
`tailwind` after those, in that order.

There is also `proedis.configs.commonjs(patterns)`, for the paths you know are CommonJS — a linter
reading one file at a time cannot tell, since a `.js` file's module system comes from the nearest
`package.json`:

```js
proedis.configs.commonjs([ 'scripts/**/*.js' ])
```

## 🎨 The house style, in one table

The parts you will actually notice, all of them enforced:

| | |
| --- | --- |
| Indentation | 2 spaces, with decorators and type unions left alone |
| Braces | Stroustrup — `}` on its own line, `else` below it |
| Arrays | spaces inside brackets: `[ 'a', 'b' ]` |
| Objects | colons aligned **by hand** — `key-spacing` is off precisely so you can |
| Line length | 130 columns; strings, template literals, URLs and regexes exempt |
| Trailing commas | never |
| Blank lines | at most two in a row |
| Type imports | `import type` required |
| `console` | `console.error` only |
| Underscore prefix | allowed everywhere — it *is* the marker for anything private |

## 🧠 Four decisions worth knowing about

**Formatting comes from `@stylistic`, not from ESLint core.** Core deprecated every formatting rule
in 9 and removed them in 10, and `@typescript-eslint` dropped its own copies in v8. The `@stylistic`
ports are the maintained path, and they also *see* TypeScript: `semi` checks a type alias
declaration, `indent` handles a conditional type, `operator-linebreak` inspects a union. Which means
they report things the core rules never looked at.

**Airbnb is vendored, not depended on.** `eslint-config-airbnb-base` never shipped a flat config, and
its manifest still declares a peer dependency on ESLint 7 or 8 — which npm treats as an `ERESOLVE`
failure, not a warning, next to a current ESLint. Its rule decisions are still good, so they live
here under `lib/airbnb`, regenerated with `yarn rules:sync`, with the formatting half remapped to
`@stylistic` and two rules ESLint has since deleted dropped.

**Some rules the compiler already enforces are switched off** — deliberately, and *after* the Airbnb
layer, because whichever entry comes last wins. `typescript-eslint` publishes exactly this list, and
leaving it on means every DOM type used in a type position is reported as an undefined variable.

**An arbitrary value in a Tailwind class is an error.** `size-[18px]`, `text-[13px]`,
`max-w-[96rem]` are lengths invented at the call site: they have no name, so no theme can reach them
and no consumer can retune them, and an interface stops being made of tokens one class at a time
with nothing reporting it. The escalation is a token, a step of an existing scale, a **new declared
token**, and only then an arbitrary value.

Arbitrary **variants** are a different construct and stay allowed — `[&_svg]:size-4`,
`data-[state=open]:bg-muted`, `has-[input:focus]:ring`, `min-[600px]:flex`,
`supports-[display:grid]:grid` are selectors, not invented design values. What separates the two is
the colon: a variant is followed by one, a value is not, which is the whole rule. It reads string
literals and template elements, so a class assembled in a `cn()` call or a variant map is checked as
well as one written in `className`, and it lives in the React preset only — a project with no JSX has
no class attribute for it to fire on. ⚠️ It re-enables `no-restricted-syntax`, which the shared
layers turn off: a project that sets its own selectors after the preset replaces these rather than
adding to them.

## 🔀 Migrating from 2.x

Version 2 was an eslintrc config. This is a flat config, so the shape of your project's setup
changes:

| Then | Now |
| --- | --- |
| `.eslintrc.js` with `extends: [ 'proedis' ]` | `eslint.config.mjs` with `export default proedis.react()` |
| `extends: [ 'proedis/base' ]` | `export default proedis.base()` |
| `.eslintignore` | the `ignores` option, or an `{ ignores: [ … ] }` entry |
| `eslint --ext .ts,.tsx .` | `eslint .` — the `--ext` flag was removed in ESLint 9 |
| ESLint 8, `@typescript-eslint` 6 | ESLint 9, `typescript-eslint` 8 |
| plugins installed by your project | plugins installed by this package |

Two things to grep for afterwards:

1. **`eslint-disable` comments naming a formatting rule.** `// eslint-disable-next-line max-len` no
   longer suppresses anything, because the active rule is now `@stylistic/max-len`. ESLint points
   every one of them out for you as an *unused disable directive* — rename them and the warnings go.
2. **`@typescript-eslint/indent`, `@typescript-eslint/brace-style`** and friends in your own
   overrides. Those rules were removed in `typescript-eslint` v8; use the `@stylistic/` versions.

⚠️ Version 2 extended `eslint-config-airbnb-typescript/base`, which carries only the TypeScript
overrides and *not* the Airbnb rule sets themselves. So v2 never actually applied the Airbnb
decisions, and this is the first version that does. Expect real findings on a codebase that was
"clean" under v2 — `eslint . --fix` handles most of them.

## 🤝 Compatibility

| Requirement | Range |
| --- | --- |
| `eslint` | `>=9.0.0 <10.0.0` (peer) |
| `typescript` | `>=5.2.0` (optional peer) |
| Config format | flat config only — `eslint.config.mjs` / `.js` / `.ts` |

ESLint 10 is not supported **yet**, and the reason is not this config: `eslint-plugin-react` and
`eslint-plugin-import` still cap their peer range at ESLint 9. Everything else here already accepts
10, and because the formatting rules come from `@stylistic` rather than from a core that removed
them, that upgrade will be a dependency bump.

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
