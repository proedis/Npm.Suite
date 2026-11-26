---
paths:
  - "rollup.config.mjs"
  - "scripts/**"
  - "packages/*/package.json"
  - "packages/*/tsconfig*.json"
---

# Build pipeline

Moved verbatim from the root `CLAUDE.md`.

## Build pipeline (the non-obvious part)

Two build strategies coexist:

1. **Rollup packages** — everything except the two below, so `client`, `react-client`,
   `react-native-client`, `react`, `react-query`, `utils`, `types`, `modeler`, `formatters`, `zod`,
   `ui` and `cli`: `rollup --config ../../rollup.config.mjs`, always executed from the package's own
   cwd. The single root config derives everything from `process.cwd()`.
   Output: `build/cjs`, `build/esm` (both `preserveModules`, sourcemaps) and `build/types`.
   Two of them chain a copy step after rollup, for files rollup does not emit: `cli` its `.ejs`
   templates, `ui` its `.css`.
2. **Plain-copy packages** (`tsconfig`, `eslint-config-proedis`):
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
- `noMain: true` — skip the `main`/`module`/`types`/`exports` block. It also suppresses the
  per-directory `type` markers, which those packages must not have. Three packages set it: the two
  config-only ones (`tsconfig`, `eslint-config-proedis`) and `cli`, which is published bin-only.
  ⚠️ `types` used to be on this list and is not any more: since 2.0.0 it is a rollup package like
  the others, with a real `exports` map.
- `sideEffects: false` — emitted verbatim so bundlers can tree-shake. Set on `types`, `utils`,
  `formatters`, `react`, `react-query`, `zod` and `ui`; deliberately unset on `client`, `modeler`,
  `react-client` and `react-native-client`, where module-level purity is not obvious.
- `buildFormats: string[]` — which rollup output formats to emit, `['cjs', 'esm']` by
  default. The CLI sets `['cjs']`: consumed only through its `bin`, nothing referenced its
  ESM output and it was shipped as dead weight. A package narrowing this must also narrow
  anything that writes into the dropped directory.
- `reactCompiler: true` — run the React Compiler over the package while it is built
  (`scripts/rollup-plugins/reactCompiler.mjs`), so the published code is already memoised and no
  consumer configures anything. Only `ui` sets it. It costs three things, all load-bearing: the
  TypeScript plugin leaves JSX in place (`jsx: 'preserve'`) because the compiler recognises a
  component by its JSX; `target: '19'` imports the cache from `react/compiler-runtime`, which React
  ships since 19.0, so the package's React range **must start at 19** (under 18 the import does not
  resolve, and it fails at the consumer's runtime, not in the build); and the compiler **skips in silence** any function it cannot
  prove safe, so the build prints every skip with its reason. A skip is a defect to fix, not noise:
  the first build skipped `AspectRatio` over an inline `16 / 9` default.
- `exports: string[]` — directory names below `src`, each holding its own barrel `index.ts`,
  published as additional entry points (`@proedis/utils/array`). `createPackageJson` writes them
  into both `exports` and `typesVersions` — the second one so a consumer whose `moduleResolution`
  predates `exports` still finds the declarations. **A subpath must also be added to the rollup
  `input` list**, which `rollup.config.mjs` derives from this same field: with `preserveModules`
  rollup keeps the module graph but still elides a module that holds nothing but re-exports, and
  every one of these barrels is exactly that. Verified the hard way — the subpaths pointed at files
  that were never written, and `npm pack` + install outside the workspace is what caught it.
- `styles: string[]` — stylesheets the package publishes, by file name. Each becomes an `exports`
  subpath (`@proedis/ui/theme.css`), and the **first** one also becomes the `style` condition of
  `exports['.']`, which is what makes `@import '@proedis/ui'` resolve to a stylesheet while
  `import { Stack } from '@proedis/ui'` still resolves to the module: one name, two resolvers,
  the way `tailwindcss` ships its own `index.css`. The files themselves are copied by the package's
  own `build` script, exactly like `assets` below — this field only writes the manifest.
- `assets: string[]` — file extensions that a build step copies into the output rather than
  rollup emitting them (the CLI's `.ejs` templates). `release:verify` then requires every
  matching file under `src/` to exist at the same relative path in each output directory.
  Nothing else notices when a copy step stops running: the package would publish without its
  templates and fail at runtime with every other check green. For the same reason the copy is
  chained inside `build` rather than living in a `postbuild` hook — Yarn Berry does not run
  `pre`/`post` scripts, and `lerna run` delegates to the package manager.

- `generated: string[]` — files a build step writes from somewhere other than `src`, relative to
  `build/`, which `release:verify` requires to exist. Only `mcp` sets it (`data/index.json`, rendered
  from the documentation site by the second half of its `build`): a rollup-only build compiles and
  publishes a server that fails at start, with every other check green.

Rollup externals (`scripts/utils/getExternalDependenciesFromPackage.mjs`) = `dependencies` +
`peerDependencies` + `reflectPeerDependencies` (each also matched as a `name/**` subpath regex,
and it understands both metadata forms). Consequence: **anything only in `devDependencies` gets
bundled into the output.**

A package must declare the `@types/*` of everything it imports, even when the type package happens
to be hoisted at the root. `packages/cli` used to import `semver` while relying on `@types/semver`
arriving transitively through the root's `@typescript-eslint` 6; removing those devDependencies
during the ESLint 9 migration broke the CLI build with `TS7016`. The hoist was never a declaration.
(That import is gone — `semver` left with the package-manager layer — but the rule it taught holds
for every package here.)

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

Rollup packages get `main`/`module`/`types` **and** an `exports` map. Both are kept on purpose.
The presets here no longer need the legacy fields — every one of them resolves with `bundler` since
`@proedis/tsconfig` 2.0.1 — but a consumer is not obliged to use these presets, and a project still
on classic resolution ignores `exports` entirely and would resolve nothing. The same reasoning puts
every subpath into `typesVersions` next to `exports`. Inside `exports` the `types` condition must
stay first.

`producePackageFiles` also writes `{ "type": "module" }` into `build/esm` and
`{ "type": "commonjs" }` into `build/cjs` on `writeBundle` — not `buildEnd`, where those
directories do not exist yet. Node reads a `.js` file's format from the nearest `package.json`
`type`, never from the `exports` condition that selected it, so without those markers correct
ESM loading depends on Node's module-syntax detection: it works on Node 22.13 by default and
fails under `--no-experimental-detect-module` or on Node < 22.7.

Verified by packing the real tarballs with `npm pack` from `build/`, installing them outside the
workspace, and loading each through both `require()` and native `import`; plus `tsc` resolution
under `moduleResolution` `node`, `bundler` and `nodenext`.

`producePackageFiles` creates the build directory itself. Rollup only creates output directories
during the write phase, after `buildEnd`, so a package without a `tsconfig.declaration.json` (the
CLI) has nothing to create it — this used to work only because the declaration build happened to
run first.

