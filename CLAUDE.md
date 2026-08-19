# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`@proedis/suite` — a private Yarn 1 + Lerna monorepo that publishes the public `@proedis/*` npm
packages (plus `eslint-config-proedis`). Nothing is deployed from here: the deliverable is a set of
libraries consumed by Proedis applications. Versioning is **independent per package**.

`apps/react-testing-app` is a throwaway Vite sandbox for manual verification, not a product.

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

# sandbox app
yarn workspace react-testing-app dev               # vite on :3000
```

Linting runs on **ESLint 9 with a flat config**: the root `eslint.config.mjs` consumes the
`eslint-config-proedis` it publishes, so the suite is its own first consumer. There is no
`.eslintrc.js` and no `.eslintignore` any more — ignores live in the config, and `--ext` was removed
from ESLint 9 (which is why `release:lint` is a bare `eslint .`).

`packages/cli` declares a `dev` script (`ts-node src/index.ts`), but **ts-node is not installed** in
the workspace, so it fails as written. Build the package and run `build/cjs/index.js` instead, or add
ts-node deliberately.

`producePackageFiles` creates the build directory itself. Rollup only creates output directories
during the write phase, after `buildEnd`, so a package without a `tsconfig.declaration.json` (the
CLI) has nothing to create it — this used to work only because the declaration build happened to
run first.

Root `tsconfig.dev.json` extends the **base** preset (no `jsx`), so it cannot typecheck
`packages/react*`. It is an IDE convenience only — always typecheck per package.

`@proedis/tsconfig` splits along one line: `base` keeps `moduleResolution: node` (node10), because it
is what a Node consumer and a declaration emit both need, while `web` and everything above it use
`moduleResolution: bundler` — those projects are always behind Vite, webpack or Metro. `declaration`
is **not** a preset but an overlay with no `extends` of its own, composed *last* in an `extends`
array so its `noEmit: false` and `composite: true` win:

```json
{ "extends": [ "@proedis/tsconfig/react", "@proedis/tsconfig/declaration" ] }
```

That composition is the point: before it, every React package emitted its declarations under the
base preset's resolution and a hardcoded `jsx` override, i.e. with different settings from the ones
it typechecked with.

### Yarn 4 specifics

`.yarnrc.yml` sets **`nodeLinker: node-modules`**, and that is not a preference. The default PnP
linker breaks this repository: every package points `main` at `src/index.ts`, so in-repo consumers
compile their siblings' TypeScript source, and under PnP a plain `tsc` cannot resolve a workspace
sibling — verified, `TS2307` — without the Yarn SDK injected into every tool. node-modules keeps
the symlinked layout everything relies on.

**Berry only exposes binaries a workspace declares.** Yarn 1 hoisted the root `node_modules/.bin`
into every workspace script; Yarn 4 does not. Every package whose `build` invokes `rollup` therefore
declares `rollup` as its own devDependency, and the sandbox app declares `eslint` and `typescript`.
This is easy to miss when adding a package, because it fails asymmetrically:
`yarn workspace <name> build` reports `command not found: rollup` while `yarn release:build` keeps
working, since nx builds its own PATH.

### Release

Releasing is manual and run step by step — there is deliberately no aggregate `release` script:

```bash
yarn release:version    # lerna version, interactive per package
yarn release:build
yarn release:verify
yarn release:publish    # lerna publish from-package --contents build
```

Publishing therefore ships the generated `build/` directory, never the repo source.

`--exact` was dropped from `release:version`, so lerna now writes `^x.y.z` instead of `x.y.z` into
sibling ranges (in `dependencies` *and* `devDependencies`), letting consumers dedupe a single
`@proedis/utils`. It does **not** reduce the version cascade: `collectDependents` pulls every
dependent into the bump set unconditionally, so one change to `types` still bumps everything
downstream of it.

`.github/workflows/ci.yml` runs lint → build → verify on every push to `master`, every pull
request, and on demand. **CI never publishes** — that was tried and pulled back out; releasing
stays a deliberate local action.

Should it ever be automated, the constraint to design around is that independent versioning
creates **one tag per package** — the last release pushed 7 tags at the same commit, so
`on: push: tags` would start 7 concurrent runs each trying to publish everything. The trigger has
to be a branch push or a manual dispatch, with `lerna publish from-package`, which needs no tags:
it compares each local version against the registry, publishes only what is missing, and is a
no-op on a re-run.

**Never run any of the release scripts, `git push`, or `lerna publish` unless explicitly asked.**

There is no commit-message validation and no git hook: husky and commitlint were removed
deliberately. The history still reads as Conventional Commits (and `lerna version` writes
`chore(release): publish`), so match that style, but nothing enforces it.

## Build pipeline (the non-obvious part)

Two build strategies coexist:

1. **Rollup packages** (`client`, `react-client`, `react-native-client`, `react`, `utils`,
   `modeler`, `formatters`, `cli`): `rollup --config ../../rollup.config.mjs`, always executed from
   the package's own cwd. The single root config derives everything from `process.cwd()`.
   Output: `build/cjs`, `build/esm` (both `preserveModules`, sourcemaps) and `build/types`.
2. **Plain-copy packages** (`tsconfig`, `eslint-config-proedis`, `types`):
   `node ../../scripts/compile-plain.js` — wipes `build/`, copies every non-dotfile entry
   except `build/`, `node_modules/`, `package.json` and `tsconfig.*`, then writes a
   generated `package.json`. Entries are copied one at a time on purpose: `fs.cpSync`
   rejects a destination inside the source directory before consulting any filter.

**The build is the correctness gate.** Two things make it fail instead of warn, and both
must stay: `typescript({ noEmitOnError: true })` in the rollup config (the plugin reports TS
diagnostics as rollup *warnings* otherwise, so rollup exits 0 on code that does not compile)
and the exit-code check in `createTypes` (a failing `tsc -p tsconfig.declaration.json` would
otherwise leave stale or missing `.d.ts` behind and still publish). The same config also
passes `allowJs: false`: the base preset enables it for application consumers, and with it on
`@rollup/plugin-typescript` >= 12 redirects emit to a temp directory that then fails its own
`outDir` validation.

`release:verify` (`scripts/verify-artifacts.mjs`) is the second gate, and it checks what a green
build cannot: that each published manifest declares everything its own emitted files import, that
every entry point and `bin` target exists and carries a hashbang, and that the per-directory `type`
markers are right. The dependency check exists because the build compiles happily while shipping a
`.d.ts` that imports a stripped `devDependency` — verified by reintroducing that exact regression:
the build still exits 0, `release:verify` exits 1.

It also fails when `README.md` or `LICENSE` is missing from a build directory. Publishing runs with
`--contents build`, so a file that never gets copied there does not exist for a consumer: the
rollup packages copy both through `producePackageFiles`, and `compile-plain` copies the root LICENSE
explicitly, since it sits outside every package and the entry loop can never reach it. **The gate is
therefore red until every package has a README** — that is deliberate, it is the release checklist.

It scans emitted `.d.ts` for rollup packages and the hand-written `.js`/`.ts` of the plain-copy
ones. Emitted `.js` is deliberately skipped: rollup's `external` list is built from
`dependencies` + `peerDependencies` + `reflectPeerDependencies`, so an undeclared runtime import
gets bundled rather than left as an import. Statement matching is line-anchored and comments are
stripped, or the CLI's scaffolder templates — which build `import ... from '${source}'` strings —
register as imports.

Both paths funnel through `scripts/utils/createPackageJson.js`, which rewrites the published
manifest: strips `scripts`/`devDependencies`/`gitHead`/`proedisMetadata`, injects
`main`/`module`/`types`, and inherits `license`/`author`/`homepage`/`repository`/`bugs`/
`publishConfig` from the root manifest.

### `proedisMetadata` — how dependencies are classified

This custom `package.json` field drives both externals and peer dependencies. Getting it wrong is
the most likely way to break a package silently.

- `reflectPeerDependencies` — becomes the published `peerDependencies`. Two authoring forms:
  - **object form (preferred)**, keyed by dependency name. `range` states the published
    compatibility range explicitly; `from: 'root' | 'self'` (default `'self'`) picks the
    devDependencies pool to reflect the version from when `range` is omitted; `optional: true`
    adds it to `peerDependenciesMeta`.
  - **legacy array form**, still supported: `"root:react"` reflects the root pin, a bare
    `"@proedis/client"` reflects the package's own devDependency, both widened to a caret.

  **Prefer an explicit `range`.** Reflecting a pin makes the published range exactly as narrow
  as whatever version happens to be installed here, which is what produces unmet-peer warnings
  downstream — a root `react` pin of `19.2.5` published `^19.2.5` and warned on every React 18
  and on 19.0.0–19.2.4. When `range` is omitted and the name is absent from the pool,
  `createPackageJson` **throws**.
- `noMain: true` — skip the `main`/`module`/`types`/`exports` block (used by the config-only
  packages and by `types`, which ships its `.ts` sources and keeps `main: index.ts`). It also
  suppresses the per-directory `type` markers, which those packages must not have.
- `sideEffects: false` — emitted verbatim so bundlers can tree-shake. Set on `utils`,
  `formatters` and `react`; deliberately unset where module-level purity is not obvious.
- `buildFormats: string[]` — which rollup output formats to emit, `['cjs', 'esm']` by
  default. The CLI sets `['cjs']`: consumed only through its `bin`, nothing referenced its
  ESM output and it was shipped as dead weight. A package narrowing this must also narrow
  anything that writes into the dropped directory.
- `exports: string[]` — directory names below `src`, each holding its own barrel `index.ts`,
  published as additional entry points (`@proedis/utils/array`). `createPackageJson` writes them
  into both `exports` and `typesVersions` — the second one so a consumer whose `moduleResolution`
  predates `exports` still finds the declarations. **A subpath must also be added to the rollup
  `input` list**, which `rollup.config.mjs` derives from this same field: with `preserveModules`
  rollup keeps the module graph but still elides a module that holds nothing but re-exports, and
  every one of these barrels is exactly that. Verified the hard way — the subpaths pointed at files
  that were never written, and `npm pack` + install outside the workspace is what caught it.
- `assets: string[]` — file extensions that a build step copies into the output rather than
  rollup emitting them (the CLI's `.ejs` templates). `release:verify` then requires every
  matching file under `src/` to exist at the same relative path in each output directory.
  Nothing else notices when a copy step stops running: the package would publish without its
  templates and fail at runtime with every other check green. For the same reason the copy is
  chained inside `build` rather than living in a `postbuild` hook — Yarn Berry does not run
  `pre`/`post` scripts, and `lerna run` delegates to the package manager.

Rollup externals (`scripts/utils/getExternalDependenciesFromPackage.mjs`) = `dependencies` +
`peerDependencies` + `reflectPeerDependencies` (each also matched as a `name/**` subpath regex,
and it understands both metadata forms). Consequence: **anything only in `devDependencies` gets
bundled into the output.**

A package must declare the `@types/*` of everything it imports, even when the type package happens
to be hoisted at the root. `packages/cli` imported `semver` while relying on `@types/semver` arriving
transitively through the root's `@typescript-eslint` 6; removing those devDependencies during the
ESLint 9 migration broke the CLI build with `TS7016`. The hoist was never a declaration.

A `devDependency` is *not* enough for a type-only import, because **the emitted `.d.ts` keeps
the import while `createPackageJson` strips `devDependencies`**. A consumer then resolves a
module that was never installed: hard `TS2307` errors without `skipLibCheck`, silently
degraded types with it (and the base preset turns `skipLibCheck` on, which is why this went
unnoticed for a long time). Anything referenced by the public type surface — `@proedis/types`
included — belongs in `dependencies`. Only build-time-only names such as `@proedis/tsconfig`
may stay in `devDependencies`.

Types are emitted by a side-channel: the `createTypes` rollup plugin runs
`tsc -p tsconfig.declaration.json` at `buildEnd`, resolving the compiler from the installed
`typescript` package rather than `PATH`. Each package declares its own `rootDir`/`outDir`
there; the root config used to rewrite that git-tracked file on every build and no longer
does. `producePackageFiles` strips the emitted `*.tsbuildinfo` so it stays out of the
published tarball.

### Published entry points

Rollup packages get `main`/`module`/`types` **and** an `exports` map. Both are required: the
`@proedis/tsconfig` presets still set `moduleResolution: node`, which ignores `exports` entirely,
so dropping the legacy fields would break every consumer on the current preset. Inside `exports`
the `types` condition must stay first.

`producePackageFiles` also writes `{ "type": "module" }` into `build/esm` and
`{ "type": "commonjs" }` into `build/cjs` on `writeBundle` — not `buildEnd`, where those
directories do not exist yet. Node reads a `.js` file's format from the nearest `package.json`
`type`, never from the `exports` condition that selected it, so without those markers correct
ESM loading depends on Node's module-syntax detection: it works on Node 22.13 by default and
fails under `--no-experimental-detect-module` or on Node < 22.7.

Verified by packing the real tarballs with `npm pack` from `build/`, installing them outside the
workspace, and loading each through both `require()` and native `import`; plus `tsc` resolution
under `moduleResolution` `node`, `bundler` and `nodenext`.

### The CLI resolves ESLint from the project it runs in

`lintAndFixFiles` fixes generated files with the ESLint **installed in the target project**,
using that project's own rules: `import type * as ESLintModule from 'eslint'` for typing, and
`createRequire(<project>/package.json)('eslint')` at runtime. Importing it for real would use
this package's copy and force every CLI installation to carry ESLint (93 modules, 14 MB).

Two behaviours there are verified against real ESLint installs and easy to break:

- `useEslintrc` was **removed in ESLint 9**, where passing it throws `Invalid Options`. The
  option is applied only when `ESLint.version` is below 9.
- A broken parser or invalid flat config makes `lintFiles` **reject**, but an unreadable
  `parserOptions.project` does **not** — it comes back as a `fatal` parsing error on each
  result. Both paths are handled: reject is caught, fatal messages are inspected and printed
  as ESLint worded them. There is deliberately no precondition on `tsconfig.eslint.json`
  anymore; that filename belongs to a project's eslintrc, not to this CLI, and a flat config
  project has no reason to own it.

### The shared ESLint config lints this repository

`eslint-config-proedis` is consumed by the root `eslint.config.mjs`, so any change to it is felt here
first. Four things about it are load-bearing:

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

**Version 2 never actually applied Airbnb.** It extended `eslint-config-airbnb-typescript/base`,
which carries only the TypeScript overrides and not the Airbnb rule sets, so the suite had never been
checked against them. Adopting v3 surfaced 253 findings in code that was green — most of them
mechanical, a few genuine bugs (a `throw new Error('… ${runner}')` written with single quotes, so the
message printed the placeholder; `Guard.ifIn` / `ifNotIn` asserting the opposite of their names).

Equivalence with Orbit's own flat config is verified by diffing `eslint --print-config` output rule by
rule, not by eyeballing the rule lists: zero rules active in Orbit are missing here, and the option
differences are all `@stylistic` writing schema defaults in full where core leaves them implicit.

### The client's transport is `fetch`, and the query string is the load-bearing part

`@proedis/client` performs its requests through `lib/Transport`, not through axios. The audit that
preceded the swap found the client used interceptors, cancel tokens, progress events, adapters,
`paramsSerializer`, `transformRequest`, `withCredentials` and `responseType` **zero** times; what it
used was a base url, a timeout, default headers, a status check, query serialization and an abort
signal.

`serializeParams` reproduces axios's query format **byte for byte**, and that is not politeness: a
server reading `ids[]=1&ids[]=2` differently from `ids[0]=1&ids[1]=2` fails silently and only in
production. The rules were measured against real requests, not read off the axios source — an earlier
reconstruction from memory contradicted the measurements twice. They are: nil values dropped at any
depth (`0` and `''` kept), `Date` as ISO, an array of scalars *at the top level* using `key[]`, every
other array using indices — including an array of scalars nested below the top level — and objects
nesting by key. The encoder is `encodeURIComponent` plus exactly four substitutions (`$`, `,`, `:`
literal, space as `+`); brackets stay percent-encoded. It is verified by a generative diff against
axios over hundreds of random shapes, which is the test to re-run after touching it.

**Never set `Content-Type` on a multipart body.** A `FormData` carries a boundary only the platform can
generate. The old code set `multipart/form-data` explicitly and got away with it because axios rewrote
the header; under `fetch` that produces a request no server can parse. `Client.request` no longer sets
it and the transport strips it defensively.

**The stores hand out frozen values.** `ClientSubject` clones what enters it and freezes the copy, on the
initial value as well as on every emission. Cloning protects the caller's object, freezing protects the
store from its subscribers — a BehaviorSubject keeps the value it emitted, so what a subscriber receives
*is* what the store holds, and writing to it used to change client state without persisting anything.

That freeze only works because `deepClone` normalizes writability: it copies property descriptors, and a
frozen source's descriptors carry `writable: false`, so `Storage.transact` — which clones the value and
hands it to the updater — would otherwise pass an updater a copy that silently refuses assignment. The
clone is always writable and configurable while enumerability is preserved, because that describes the
shape. The two changes are one decision and have to move together.

Freezing locks properties, not internal slots: a `Date`, `Map` or `Set` inside the value stays mutable
through its own methods. Objects and arrays — what storage data is made of — are genuinely protected. The
cost is 0.2–0.4 µs on a typical state against the 17 µs the `getHash` guard already spends on every
persist.

`RequestError` is still the shape consumers catch, unchanged. What changed is where it reads from:
`TransportError`, which carries `kind` (`status` / `abort` / `network` / `parse`), the response when one
arrived, and the request's method and url — so an abort or a timeout now reports the failing url instead
of the current page.

`AbortSignal.any` is deliberately not used to combine the caller's signal with the timeout: it landed in
Safari 17.4 and the emit target reaches back to 16.4. The manual bridge in `createRequestSignal` also
keeps accepting a mimicked signal, which the previous transport tolerated.

### The mappers carry .NET semantics, and they are load-bearing

`TimeSpan` renders and parses the .NET duration format `[-][d.]hh:mm:ss[.fff]` — the days component is
separated by a **dot**. It used to be emitted with a colon, which meant any duration of a day or more
produced a string `TimeSpan.parse` refused, and since `AsTimeSpan` serializes through `toString` such a
value could not survive a round trip through an API. Any change to that format has to keep
`parse(x.toString())` equal to `x` for a value with days, negative included.

`toJSON` on `ModelerObject`, `Flags`, `Enum` and `TimeSpan` is the hook `JSON.stringify` invokes, so it
takes **no arguments** and returns a value, never a JSON string. All four used to return strings, which
made `JSON.stringify` encode them a second time: a model nested in a payload came out as
`{"user":"{\"id\":7}"}`. The explicit string form lives on `toJsonString`.

`DateTime` is exported as both a type and a value — the type is a Day.js instance, the value is the
`dayjs` factory. The value half exists because 224 files in Orbit import the name through a plain value
import alongside the decorators; it used to be `export const DateTime = Dayjs`, and `dayjs` does not
expose `Dayjs` at runtime, so the published constant was `undefined`.

### `useSyncedRef` is the backbone of the React hooks

Six hooks in `@proedis/react` are built on it, and Orbit uses it directly in 13 places. It writes its
ref **during render**, which is what makes the value current for the commit it belongs to — and which
is why `react-hooks/refs` is suppressed inline, in that file, with the reasoning. Every alternative
loses the guarantee the hook exists for: writing in an effect makes `current` lag one commit behind,
which is the exact bug its callers are avoiding. Read it from an effect, a handler or a cleanup, never
while rendering.

Public signatures must avoid `React.RefObject`, `React.MutableRefObject` and
`ReturnType<typeof React.useRef<T>>`: those changed meaning between `@types/react` 18 and 19. Use
minimal structural shapes — `useForkRef` takes `{ current: T | null | undefined }` for that reason. The
18/19 matrix is verified by compiling the **emitted declarations** against both, with `skipLibCheck`
off, from outside the workspace; re-run it after touching any public React signature.

### Peer compatibility policy

Published peer ranges are deliberately wider than the versions pinned here: `react`/`react-dom`
`>=18.0.0 <20.0.0`, `reflect-metadata` `^0.1.13 || ^0.2.0`, `@tanstack/react-query` `^5.0.0`,
`rxjs` `^7.0.0`, `dayjs` `>=1.11.0`, `typescript` `>=5.2.0`.

The React range is not a guess — it is verified by compiling the **emitted `.d.ts`** of `react`,
`client` and `react-client` against `@types/react` 18 and 19 with `skipLibCheck: false`, from a
directory outside the workspace holding only the declared dependencies. Two hooks needed fixing
to hold it: `useForkRef` and `useClickOutside` both typed their parameters through React aliases
whose meaning changed between the two majors (`useRef<T>(null)` yields `RefObject<T>` in 18 and
`RefObject<T | null>` in 19). Both now use minimal structural shapes. **Re-run that check before
widening or narrowing the React range, and prefer structural ref shapes over `React.RefObject` /
`React.MutableRefObject` / `ReturnType<typeof React.useRef<T>>` in any new public signature.**

`dayjs` is a **required** peer of `utils`, not optional: `ArraySorterStep` imports it at module
top level and `utils/index` always pulls that module in. A peer is also the semantically correct
field — `dayjs.isDayjs` must see the consumer's own dayjs copy.

### Source-first resolution in-repo

Every publishable package declares `"main": "src/index.ts"` (or `index.ts`). Inside the workspace,
consumers — including the Vite app — compile sibling TypeScript **source** directly; there is no
build step between packages during development. The compiled entry points only exist in the
generated `build/package.json`.

## Package map

Dependency direction is strictly one-way; `utils` and `types` are the leaves.

| Package | Role |
| --- | --- |
| `@proedis/types` | Shared primitives (`AnyObject`, `Nullable`, `Nillable`, `Primitive`, `Awaitable`, `ValueOf`, `DeepPartial`, `Environment`, `Instantiable`, path types). A rollup package like the others since 2.0.0 — it used to ship raw `.ts`, which assumed every consumer's bundler was willing to transpile TypeScript found inside `node_modules`. Each type still has a runtime counterpart const, so a plain value import cannot resolve to nothing. |
| `@proedis/tsconfig` | tsconfig presets: `base` → `web` → `react` → `react-native`, plus `declaration`. |
| `eslint-config-proedis` | ESLint 9 **flat config**, ESM, self-contained: every plugin is a real dependency, so a consumer installs one package. `base()` / `react()` return plain config arrays; `configs.*` exposes the individual blocks and `plugins.*` the plugin instances, so nothing is a closed box. The Airbnb rule decisions are **vendored** under `lib/airbnb` (regenerate with `yarn rules:sync`) and all formatting goes through `@stylistic`. |
| `@proedis/utils` | `Guard`, `AugmentedMap`, `Deferred`, `will`, `ArraySorter`, hashing, deep object access. Publishes a subpath per module (`array`, `guard`, `hash`, `object`, `promise`, `runtime`, `string`). |
| `@proedis/formatters` | Locale-aware duration/number/pluralize formatters. |
| `@proedis/modeler` | `class-transformer` model base + decorators. Color/icon tokens are consumer-supplied via `ModelerOverride`, not typed against a UI kit. |
| `@proedis/client` | The core: authenticated HTTP client over `fetch`. Zero HTTP dependencies — `store2` for browser storage is the only runtime one left besides the workspace packages. |
| `@proedis/react` | Framework-agnostic React hooks/utils (`contextBuilder`, `useAutoControlledState`, shorthands). |
| `@proedis/react-client` | React bindings for `@proedis/client` + `@tanstack/react-query` integration. |
| `@proedis/react-native-client` | `AsyncStorage`-backed storage provider for `@proedis/client`. |
| `@proedis/cli` | `proedis` binary: `init`, `scaffold`, `generate`. Published **bin-only**: `noMain`, `buildFormats: ['cjs']`, no declaration build — shipping types would force `@proedis/types`, `type-fest` and `@types/inquirer` into runtime deps for an API nobody imports. ESLint is resolved from the *target* project at runtime, never bundled. |

## Architecture

### `@proedis/client` — the centre of gravity

`Client<UserData, StoredData, Tokens>` is generic in three parameters that propagate through the
entire stack. It is never constructed literally in application code: `ClientBuilder` is a fluent
builder whose methods **widen the generics as you call them** (`withUserData<T>()` swaps `UserData`,
`withToken('refreshToken', …)` adds to the `Tokens` union). `build()` throws if no server was set.
`variants/Gea/GeaAuthenticatedClient` is the reference example of a pre-wired builder.

Four collaborating primitives, all under `src/lib`:

- **`ClientSubject<T>`** — abstract rxjs `BehaviorSubject` wrapper with deferred initialization
  (`_initializeSubject` must run before any read, or it throws).
- **`Storage<Data> extends ClientSubject<Data>`** — namespaced, persisted, observable state keyed
  `<AppName>::AppClient::Storage::<namespace>`. Persistency is `local | session | page`; the actual
  backend is injected as a `StorageProvider` (`BrowserStorageProvider` from `providers/Storage`,
  `NativeAsyncStorage` from `@proedis/react-native-client`), so the client is platform-agnostic.
- **`TokenHandshake extends Storage<Partial<TokenSpecification>>`** — one instance per token name.
  Composed from mixins: **extractors** (`plainTokenExtractor`, `queryParamExtractor`,
  `authResponseExtractor`, `grantResponseExtractor`) say where a token comes from, **transporters**
  (`bearerTransporter`, `headerTransporter`, `queryParamTransporter`) say how it rides on a request.
- **`Options<T>`** — every configuration object is wrapped here. Any first-level key may be either a
  plain value or a `Partial<Record<Environment, value>>`, resolved against `process.env.NODE_ENV`
  with an optional runtime type assertion. That is the `EnvironmentDependentOptions<T>` type seen
  throughout the settings interfaces.

`Client` exposes `request` / `safeRequest` / `request$` (Observable), the auth lifecycle
(`login`, `signup`, `logout`, `flushAuth`, `forceReload`, `getUserData`), and two observable
surfaces consumers subscribe to: `client.state` and `client.storage`. Built-in endpoints are not
hardcoded — they are declared through `defineApi('login' | 'signup' | 'logout' | 'getUserData', …)`
and `_builtInApi` throws when an unconfigured one is invoked.

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

### `@proedis/react-client`

`clientContext.tsx` bridges rxjs to React through a single private `useClientSubject` hook, exposed
as `useClientState` / `useClientStorage` / `useClientToken`. `clientWithQueryContext.tsx` adds the
react-query layer, where **the query key array *is* the endpoint**: `useClientQuery(['projects', 5])`
performs a request to `<baseUrl>/projects/5`. It also applies `class-transformer`'s `plainToInstance`
when a transformer is declared on the request config.

### `@proedis/cli`

Three parallel abstraction layers, each with an `AbstractedX` base and a factory:
`commands/` (commander wiring, argument validation) → `actions/` (orchestration) → `lib/`
(`Project` for cwd-walking project discovery, `package-managers/` and `runners/` for
npm/yarn/pnpm parity, `scaffolders/` for code generation). Templates are `.ejs` files under
`src/actions/templates/`, some with interpolated filenames (`<%=name%>.tsx.template.ejs`), copied
into `build/{esm,cjs}` by a `postbuild` step — a new template directory needs no code change but
**does** need the postbuild glob to still match.

`scaffold models` downloads an OpenAPI document over HTTP and materialises `class-transformer`
models from it (`lib/scaffolders/lib/models/`, one `*Property` class per OpenAPI primitive).

## Conventions

ESLint (airbnb-typescript + `lib/shared.js`) enforces some of the house style; the rest is manual
and consistent everywhere — match the surrounding file.

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
