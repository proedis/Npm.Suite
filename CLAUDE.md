# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`@proedis/suite` — a private Yarn 4 + Lerna monorepo that publishes the public `@proedis/*` npm
packages (plus `eslint-config-proedis`). Nothing is deployed from here: the deliverable is a set of
libraries consumed by Proedis applications. Versioning is **independent per package**.

One workspace is not a package: `apps/platform`, Proedis Internal Platform, the internal site whose
first section is the documentation of `@proedis/ui`; private, never published to npm, deployed on
CapRover. See `.claude/rules/platform.md`.

## Commands

The package manager is **Yarn 4** (`packageManager: yarn@4.18.0`), resolved through corepack. Run
`corepack enable` once per machine: without it a globally installed Yarn 1 runs against a Berry
lockfile it cannot parse (`__metadata: version: 10` instead of `# yarn lockfile v1`).

There is **no test runner configured** in this repository — no jest/vitest, no spec files. Do not
invent a `yarn test`. Verification means typecheck + lint + build.

```bash
# lint everything (the release gate)
yarn release:lint                                  # eslint .

# typecheck a single package (run from inside the package directory)
npx tsc -p tsconfig.json --noEmit                  # base-preset packages
npx tsc -p tsconfig.json                           # react-preset packages (noEmit already on)

# build
yarn release:build                                 # lerna run build, topological order
yarn workspace @proedis/client build               # one package
npx lerna run build --scope @proedis/client        # one package, alternative

# verify the built artifacts are publishable (needs a completed build)
yarn release:verify                                # node ./scripts/verify-artifacts.mjs

# dependency graph
yarn release:graph                                 # nx graph

# regenerate the vendored Airbnb rule sets inside eslint-config-proedis
yarn rules:sync                                    # node ./scripts/sync-airbnb-rules.mjs

```

Linting runs on **ESLint 9 with a flat config**: the root `eslint.config.mjs` consumes the
`eslint-config-proedis` it publishes, so the suite is its own first consumer. There is no
`.eslintrc.js` and no `.eslintignore` any more — ignores live in the config, and `--ext` was removed
from ESLint 9 (which is why `release:lint` is a bare `eslint .`).

Root `tsconfig.dev.json` extends the **base** preset (no `jsx`), so it cannot typecheck
`packages/react*`. It is an IDE convenience only — always typecheck per package.

### Yarn 4 specifics

`.yarnrc.yml` sets **`nodeLinker: node-modules`**, and that is not a preference. The default PnP
linker breaks this repository: every package points `main` at `src/index.ts`, so in-repo consumers
compile their siblings' TypeScript source, and under PnP a plain `tsc` cannot resolve a workspace
sibling — verified, `TS2307` — without the Yarn SDK injected into every tool. node-modules keeps
the symlinked layout everything relies on.

**Berry only exposes binaries a workspace declares.** Yarn 1 hoisted the root `node_modules/.bin`
into every workspace script; Yarn 4 does not. Every package whose `build` invokes `rollup` therefore
declares `rollup` as its own devDependency.
This is easy to miss when adding a package, because it fails asymmetrically:
`yarn workspace <name> build` reports `command not found: rollup` while `yarn release:build` keeps
working, since nx builds its own PATH.

### Release

```bash
yarn release:preflight  # lint + build + verify, before anything is bumped
yarn release:version    # lerna version, interactive per package: bumps, tags, pushes
# then GitHub → Actions → Publish → Run workflow, on master (trusted publishing)
```

Two halves with a manual seam between them, on purpose: `release:version` pushes, so the irreversible
step runs first and a red verify after it would leave tags on the remote for a release that cannot be
published. Why the steps cannot be reordered, how trusted publishing authenticates and how `npm trust`
is configured: `.claude/rules/release.md`. The `release-prep` skill runs the first half and stops.

**Never run any of the release scripts, `git push`, or `lerna publish` unless explicitly asked.** The
hook `.claude/hooks/outbound-guard.mjs` asks for a confirmation on every command that leaves the
machine (push, publish, version, a workflow run, a release, a pull request), whatever form it is
written in.

### Source-first resolution in-repo

Every publishable package declares `"main": "src/index.ts"` (or `index.ts`). Inside the workspace,
consumers compile sibling TypeScript **source** directly; there is no
build step between packages during development. The compiled entry points only exist in the
generated `build/package.json`.

## Where the rest lives

This file holds what every session needs. The rest loads when the work reaches it.

**`.claude/rules/`**: one file per area, each loaded as soon as Claude reads or edits a file matching
its `paths`. The text is the one that used to sit here, moved, not rewritten.

| Rule | Loads on |
| --- | --- |
| `build-pipeline.md` | `rollup.config.mjs`, `scripts/**`, a package manifest or tsconfig |
| `peers.md` | a package manifest, the source of a React package |
| `release.md` | `lerna.json`, `.github/**`, the root manifest, `verify-artifacts.mjs` |
| `tsconfig.md` | `packages/tsconfig/**`, any tsconfig |
| `eslint-config.md` | `packages/eslint-config-proedis/**`, `eslint.config.mjs` |
| `client.md` | `client`, `react-client`, `react-native-client` |
| `modeler.md`, `react-hooks.md`, `cli.md` | their package |
| `platform.md` | `apps/platform/**`, the captain definitions |
| `ui/<section>.md` | one section of `@proedis/ui`, with its documentation pages and examples |

**`packages/<name>/CLAUDE.md`**: the inside of a package and what must not change in it, for `ui`,
`form`, `zod`, `react-query` and `mcp`. Claude Code loads one when it touches a file of that package.

**`.claude/skills/`**: procedures, invoked when the task matches.

- `ui-component`: a new component of `@proedis/ui`, from the source to its documentation page.
- `verify-change`: the smallest verification that covers what changed, before the full gate.
- `release-prep`: the first half of a release, stopping before the bump.

**`.claude/agents/convention-reviewer.md`**: reviews a diff against the rules of this repository,
the ones written here and in the files above, and nothing else.

## Package map

Dependency direction is strictly one-way; `utils` and `types` are the leaves.

| Package | Role |
| --- | --- |
| `@proedis/types` | Shared primitives (`AnyObject`, `Nullable`, `Nillable`, `Primitive`, `Awaitable`, `ValueOf`, `DeepPartial`, `Environment`, `Instantiable`, path types). A rollup package like the others since 2.0.0 — it used to ship raw `.ts`, which assumed every consumer's bundler was willing to transpile TypeScript found inside `node_modules`. Each type still has a runtime counterpart const, so a plain value import cannot resolve to nothing. |
| `@proedis/tsconfig` | tsconfig presets: `base` → `web` → `react` → `react-native`, plus `declaration`. |
| `eslint-config-proedis` | ESLint 9 **flat config**, ESM, self-contained: every plugin is a real dependency, so a consumer installs one package. `base()` / `react()` return plain config arrays; `configs.*` exposes the individual blocks and `plugins.*` the plugin instances, so nothing is a closed box. The Airbnb rule decisions are **vendored** under `lib/airbnb` (regenerate with `yarn rules:sync`) and all formatting goes through `@stylistic`. |
| `@proedis/utils` | `Guard`, `AugmentedMap`, `Deferred`, `will`, `sorter`, hashing, deep object access, the `Blob` gestures. Publishes a subpath per module (`array`, `dom`, `guard`, `hash`, `object`, `promise`, `runtime`, `string`). |
| `@proedis/formatters` | Locale-aware duration/number/pluralize formatters. |
| `@proedis/modeler` | `class-transformer` model base + decorators. Color/icon tokens are consumer-supplied via `ModelerOverride`, not typed against a UI kit. |
| `@proedis/client` | The core: authenticated HTTP client over `fetch`. Zero HTTP dependencies — `store2` for browser storage is the only runtime one left besides the workspace packages. |
| `@proedis/react` | Framework-agnostic React hooks/utils (`contextBuilder`, `useAutoControlledState`, shorthands). |
| `@proedis/react-client` | React bindings for `@proedis/client` + `@tanstack/react-query` integration. |
| `@proedis/react-native-client` | `AsyncStorage`-backed storage provider for `@proedis/client`. |
| `@proedis/react-query` | The query boundary and the gated cache invalidation, extracted from the `query-suspense` pattern Orbit had copy-pasted for years. Three subpaths: `suspense` presupposes `useClientQuery` and therefore sits beside `react-client`; `invalidation` works against a bare `QueryClient` and `search` (`useSearchQuery`, what the ui `Combobox` takes its results from) against TanStack Query alone, and neither depends on anything of the suite. Ships **no** visible component: the five views arrive from the host application. |
| `@proedis/form` | react-hook-form and Zod bound to the form layer of `ui`: `useSchemaForm`, `BoundForm`, `BoundField` (never named `Form`/`Field`, so a plain ui Field cannot sit in a bound form unnoticed). A field gives its name; the schema, read through `@proedis/zod`, gives the label, the requiredness and the bounds; the control binds itself through the `binding` every ui control declares, so the package imports no control and none of their optional peers. It exists apart so that `ui` depends on no form library. The first package to import a sibling's **subpaths**: its declaration build reads `ui`'s built types, see its CLAUDE.md for why it must not read the source. |
| `@proedis/zod` | Schema in, field descriptor out, so a form reads its label, its requiredness and its bounds off the schema instead of repeating them per field. Two subpaths, `fields` and `validators`, and neither imports the other. **No runtime import of zod**, only `import type`, which is what makes it immune to two zod instances in one bundle. |
| `@proedis/ui` | The interface layer a Proedis frontend starts from: twelve layout primitives, the primitives and display components reading a token contract, the components with behaviour on Base UI, the class machinery and the stylesheet behind all of it. Sections in dependency order (`core`, `layout`, `primitives`, the private `internal`, `actions`, `display`, `feedback`, `forms`, `overlays`, `data`, plus `hooks`), with one subpath per component from `display` on (e.g. `data/table`), plus two published stylesheets, with `theme.css` reachable from the package name alone. Spacing is a scale by name (`xs` to `2xl`, `--space-*` in the theme, `md` is 1rem) on every spacing prop and in the classes, and every control takes `sm`, `md` and `lg` with one height per size, and one corner, `--control-radius`, which a button refines with `--button-radius` and four finish variables of its solid fill. Lint blocks hold it: the sections import only from earlier ones, every container of every component is a layout primitive, and a control height is written in one place, and every bordered control is drawn by `FieldShell`. Base UI, dayjs and TanStack Table are **optional** peers: each subpath brings only its own, so a project that imports none of them installs nothing new. No visible string ships in a component: every label arrives as a prop. Depends on `@proedis/react` for every hook and helper that knows nothing of it (`useMediaQuery`, `useDelayedBusy`, `useForkRef`, the context builders…), outside the root barrel only. The root barrel (core, layout, primitives, static display) stays renderable from a React Server Component, and `release:verify` fails if it reaches an optional peer. Documented, one page per component, by the UI section of `apps/platform`. |
| `@proedis/mcp` | The documentation of `ui` and `form` for a coding agent, over MCP (stdio, five read only tools). Bin-only like the CLI. Its data is rendered from the platform at build time (`apps/platform/scripts/llms.mjs --mcp`) and ships in the package; at start it compares the documented versions with the ones the project installs. `ui` and `form` are devDependencies for the lerna cascade alone. See its CLAUDE.md. |
| `@proedis/cli` | `proedis` binary: `scaffold enums`, `scaffold models` and `scaffold hooks`, all fed by an Orbit-style API. `init` and `generate` were removed unpublished. Published **bin-only**: `noMain`, `buildFormats: ['cjs']`, no declaration build — shipping types would force `@proedis/types`, `type-fest` and `@types/inquirer` into runtime deps for an API nobody imports. It is the only package declaring `engines` (Node `>=22.13.0`), which `createPackageJson` passes through untouched: a CLI that fails at runtime on an old Node should refuse to install instead, while the libraries must not inherit a floor that has nothing to do with them. ESLint is resolved from the *target* project at runtime, never bundled. |

## Architecture

The inside of `client`, `react-client` and `cli` is in their rules (`.claude/rules/client.md`,
`.claude/rules/cli.md`). What crosses packages stays here.

### Consumer-side typing via declaration merging

Two packages let the **consuming application** fix generic parameters globally by augmenting an
empty interface, instead of threading generics through every call site:

- `@proedis/react-client`: augment `ContextClientOverride` with `{ client: MyClient }` — then
  `ContextClient`, `ClientUserData`, `ClientStorageData`, `ClientTokens` and every hook resolve to
  the app's concrete client.
- `@proedis/modeler`: augment `ModelerOverride` with `{ enums: … }` — then `EnumName`, `EnumValue`,
  `EnumsOf` resolve to the app's enum registry.

When adding public API to these packages, keep it expressed in terms of those derived aliases rather
than raw generics.

## Conventions

ESLint enforces some of the house style — the vendored Airbnb decisions under `lib/airbnb`, plus
the Proedis adjustments in `lib/presets.js` and `lib/blocks.js` of `eslint-config-proedis`; the rest
is manual and consistent everywhere — match the surrounding file.

Enforced: 2-space indent, Stroustrup braces (`}` on its own line before `else`), spaces inside array
brackets `[ 'a', 'b' ]`, `import type` for type-only imports (`consistent-type-imports`), max line
length 130, at most 2 consecutive blank lines, no `console` except `console.error`.

Not enforced but universal — do not break it:

- **Aligned colons** in object literals, class fields and interfaces (`key-spacing` is deliberately
  off so this can be done by hand).
- Section banners: `/* -------- * Title * -------- */` at file level, `// ---- // Title // ----`
  inside classes (`Private properties`, `Public methods`, `Constants`, …).
- Barrel `index.ts` in every folder, one blank line between each `export *`.
- Classes use `export default` and are re-exported by name from the package root
  (`export { default as Client } from './Client'`).
- `import * as React from 'react'` — never a default React import.
- Private class members prefixed `_` (`no-underscore-dangle` is off for this reason).
- JSDoc on public methods, and inline `/** … */` narration on non-trivial statements.
- English for all code, comments, commit messages and documentation.

Every published package carries a `README.md` following one shared skeleton, and
`release:verify` fails without it:

1. centred title, one-line pitch, npm + license badges
2. `## ✨ What's in the box` — the TL;DR table or bullet list
3. `## 📦 Installation` — including *why* a peer is required, when it is
4. `## 🚀 Quick start` — the shortest thing that actually works
5. `## 📖 API` — tables for surfaces, prose for the parts with a trade-off
6. `## 🔀 Migrating to <next major>` — a two column table, one row per breaking change
7. `## 🤝 Compatibility` — peer ranges, TypeScript floor, runtime floor
8. `## 📄 License`

**Every example in a README and in a JSDoc block is verified against the compiled artifact**, not
written from memory. That is not ceremony: this session's first drafts contained a `formatDuration`
example off by a unit, a claim about `normalizeNumberWithPrecision` that measurement disproved, and a
`RenderWhen` snippet that did not typecheck at all — each one found by running it.

Tone: relaxed and occasionally funny, never clowning. Emoji where they help a reader scan, not as
decoration. Warnings about real footguns get a ⚠️ and an explanation of the consequence, not just the
rule.

TypeScript is `5.9.3`, `strict`, and enables `experimentalDecorators` + `emitDecoratorMetadata`
(required by `class-transformer` in `modeler` and `client`), `isolatedModules: true` (so no
const-enum re-export tricks) and `importHelpers`.

The base preset targets **`ES2022`** and pins **`useDefineForClassFields: false`**. That pin is
load-bearing, not tidiness: from `ES2022` TypeScript defaults it to `true`, which initialises
declared-but-unassigned class fields to `undefined` and would break decorator-driven models in
`modeler`, `client` and every consuming app. The `react` preset no longer overrides `target` to
`ESNext` — a published library must not emit against a target that moves with the compiler, so all
packages now share one stable target. Consumed as-is, ES2022 output needs roughly Safari 16.4 /
Chrome 94 / Node 16.11 (class static blocks are the binding constraint); app bundlers configured
for a lower target downlevel it anyway.
