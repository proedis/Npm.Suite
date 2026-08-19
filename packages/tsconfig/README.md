<div align="center">

# `@proedis/tsconfig`

**The TypeScript settings every Proedis project starts from, so nobody has to remember why
`useDefineForClassFields` must stay `false`.** 🧱

[![npm](https://img.shields.io/npm/v/@proedis/tsconfig.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/tsconfig)
[![license](https://img.shields.io/npm/l/@proedis/tsconfig.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

Five presets, arranged as a chain plus one overlay. You extend exactly one of the first four and,
if you publish a library, you compose the fifth on top.

| Preset | Extends | Use it for |
| --- | --- | --- |
| `@proedis/tsconfig/base` | — | Node tools, CLIs, plain TypeScript libraries |
| `@proedis/tsconfig/web` | `base` | Anything that ends up in a bundler but is not React |
| `@proedis/tsconfig/react` | `web` | React applications and React libraries |
| `@proedis/tsconfig/react-native` | `react` | React Native / Expo applications |
| `@proedis/tsconfig/declaration` | *(overlay)* | Emitting `.d.ts` files for a published package |

No dependencies, no plugins, no build step. It is JSON all the way down. 🍰

## 📦 Installation

```bash
yarn add --dev @proedis/tsconfig typescript
```

## 🚀 Quick start

A React application:

```json
{
  "extends": "@proedis/tsconfig/react",
  "include": [ "src" ]
}
```

A Node package:

```json
{
  "extends": "@proedis/tsconfig/base",
  "include": [ "src" ],
  "compilerOptions": {
    "outDir": "build"
  }
}
```

That's it. Every preset already carries `strict: true` and excludes `node_modules`.

## 🎛️ The presets in detail

### `base`

The single source of truth. Everything else is this file plus a handful of overrides.

| Setting | Value | Why |
| --- | --- | --- |
| `target` | `ES2022` | Stable on purpose. A published library must never emit against a target that moves with the compiler, so every preset shares this one. Class static blocks are the binding constraint downstream: roughly Safari 16.4 / Chrome 94 / Node 16.11. |
| `module` | `ESNext` | Leaves module handling to the bundler or to the emitting tool. |
| `moduleResolution` | `node` | Classic Node resolution, kept for maximum reach on this preset. It ignores the `exports` field of your dependencies — see [`web`](#web) if that matters to you. |
| `useDefineForClassFields` | `false` | **Load-bearing.** From `ES2022` TypeScript flips this to `true`, which initialises declared-but-unassigned class fields to `undefined` and quietly breaks every decorator-driven model. |
| `experimentalDecorators` + `emitDecoratorMetadata` | `true` | Required by `class-transformer`, which the Proedis model and client layers are built on. |
| `isolatedModules` | `true` | Each file must be transpilable on its own — which is exactly what esbuild, SWC and Babel do. Const enum re-export tricks are out. |
| `importHelpers` | `true` | Emit helpers come from `tslib` instead of being inlined in every file. Add `tslib` to your dependencies if you emit. |
| `allowJs` | `true` | Convenient while migrating a JavaScript codebase. Library builds in this repository switch it off explicitly. |
| `skipLibCheck` | `true` | Your build should not fail because of a third party's declaration file. Note the trade-off: it also hides a *missing* declaration behind an `any`. |
| `strict`, `noImplicitAny`, `noImplicitReturns`, `noFallthroughCasesInSwitch` | `true` | The non-negotiable part. |
| `noUnusedLocals`, `noUnusedParameters` | `false` | Deliberately off: this is ESLint's job, and it should not stop a build while you are mid-thought. |

### `web`

`base`, plus the two things a bundled project needs:

- `moduleResolution: "bundler"` — the modern algorithm. It honours the `exports` map of your
  dependencies, which is how Vite, webpack and Rollup actually resolve modules at build time.
- `lib: [ "DOM", "DOM.Iterable", "ESNext" ]` — browser globals, and types for JavaScript APIs
  newer than the `target`. Emit stays at ES2022; only the type surface is generous.

### `react`

`web`, plus:

- `jsx: "react-jsx"` — the automatic runtime. No `import * as React from 'react'` required just to
  return some JSX.
- `noEmit: true` — because a React project is compiled by Vite, Metro or esbuild, and `tsc` is
  there to typecheck, not to produce output.

### `react-native`

`react`, plus an `exclude` list for the config files that live in a React Native project root
(`babel.config.js`, `metro.config.js`, `jest.config.js`).

It inherits `jsx: "react-jsx"` — matching the automatic runtime that the React Native Babel preset
has used by default for several versions now — and it inherits the DOM lib, because React Native's
own typings expect a handful of browser-shaped globals (`fetch`, `URL`, `FormData`) to be present.

### `declaration`

An **overlay**, not a preset: it deliberately does not extend anything, so it can be composed on
top of whichever preset your package already uses.

```json
{
  "extends": [
    "@proedis/tsconfig/react",
    "@proedis/tsconfig/declaration"
  ],
  "include": [ "src" ],
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "build/types"
  }
}
```

⚠️ **Order matters.** The overlay has to come last: it flips `noEmit` back to `false` and turns on
`composite`, and the last entry of an `extends` array wins.

It sets `declaration`, `emitDeclarationOnly`, `composite`, `noEmit: false` and `stripInternal`, and
excludes `*.spec.ts*` / `*.test.ts*` so your tests never leak into the published type surface.

💡 `stripInternal` means a symbol documented with `@internal` is removed from the emitted `.d.ts`
entirely — handy for the exports you need across your own modules but do not want to support:

```ts
/** @internal */
export function unsafeReset(): void {}
```

## 🧠 Two questions people always ask

**"Why `moduleResolution: node` in `base`, in this decade?"**
Because `base` is also what libraries emit their declarations with, and a declaration file that
resolves through `exports` is unreadable to any consumer whose own project still uses classic
resolution. The bundled presets (`web` and up) are free of that constraint, and use `bundler`.

**"Can I turn on `noUncheckedIndexedAccess` / `exactOptionalPropertyTypes`?"**
Yes, in your own `compilerOptions` — that is the whole point of extending. They are not in the
presets because switching them on across an existing codebase is a project, not a setting.

## 🔀 Migrating to 2.x

| Change | What to do |
| --- | --- |
| `web`, `react` and `react-native` now use `moduleResolution: "bundler"` | Nothing, if you build with Vite / webpack / Rollup / Metro. If you run the output through plain Node instead, extend `base`. |
| `declaration` no longer extends `base` | Turn `"extends": "@proedis/tsconfig/declaration"` into the two-entry array shown [above](#declaration), with the overlay **last**. |
| `declaration` no longer forces `jsx: "react-jsx"` | Nothing, provided the preset you compose it with is `react` or `react-native`. |
| `declaration` now sets `stripInternal` | Check that nothing you actually publish is documented as `@internal`. |
| `react-native` no longer overrides `jsx` | Nothing on the automatic runtime. If your Babel setup is pinned to the classic runtime, set `"jsx": "react-native"` back in your own config. |

## 🤝 Compatibility

| Requirement | Range |
| --- | --- |
| `typescript` | `>=5.2.0` (peer) — 5.2 is where `extends` arrays became reliable |
| Emitted output runs on | Safari 16.4+ / Chrome 94+ / Node 16.11+ |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
