---
name: verify-change
description: Verify a change to the Npm.Suite monorepo with the smallest set of checks that covers it, starting from the files it touched, before reaching for the full release gate. There is no test runner here, so verification means typecheck, lint, build, release:verify and, for anything the documentation site renders, a look in the browser. Use it after editing code in packages/* or apps/platform and before proposing a commit, and say plainly which checks ran and which did not.
---

# Verifying a change

There is no test runner in this repository, and no `yarn test` to invent: verification is typecheck,
lint, build and `release:verify`, plus the browser for what the site renders. Start from the smallest
check that can fail on this change, and widen only when the change reaches further.

## 1. What changed

```bash
git status --short
git diff --name-only master...HEAD
```

Group the files by package (`packages/<name>`), by the site (`apps/platform`), and by what belongs to
the whole repository (`rollup.config.mjs`, `scripts/`, `eslint.config.mjs`, the root manifest,
`lerna.json`, `.github/`).

## 2. Per package touched

From inside the package directory, the typecheck its preset asks for (read `extends` in its
`tsconfig.json`):

| Preset | Packages | Command |
| --- | --- | --- |
| `@proedis/tsconfig/base` | `cli`, `client`, `formatters`, `modeler`, `types`, `utils`, `zod` | `npx tsc -p tsconfig.json --noEmit` |
| `@proedis/tsconfig/react` | `form`, `react`, `react-client`, `react-native-client`, `react-query`, `ui` | `npx tsc -p tsconfig.json` (`noEmit` already on) |

Never typecheck through the root `tsconfig.dev.json`: it extends the base preset and cannot compile
the React packages.

For `@proedis/ui`, also `npx tsc -p tsconfig.types-check.json`: the negative assertions of
`types.check.tsx`. A new negative case is believed only after making it valid for a moment and
watching `tsc` fail on the unused directive.

Then, from the repository root, lint the files that changed:

```bash
npx eslint <changed files>
```

Then build the package when its source, its manifest or its declaration config changed:

```bash
yarn workspace <name> build
```

`@proedis/ui` prints `react compiler: N functions compiled, M skipped`: **M stays 0**. A package whose
build cannot find `rollup` is missing it from its own devDependencies (see `.claude/rules/build-pipeline.md`).

## 3. When the change reaches the published artifacts

A manifest, `proedisMetadata`, an entry point, a subpath, the build pipeline, a README or a LICENSE:
`release:verify` checks what a green build cannot, and it reads every build directory, so it needs
the whole build first.

```bash
yarn release:build && yarn release:verify
```

## 4. When the site renders the change

The site compiles the source of `ui` and `form`, so a change there or in `apps/platform` needs:

```bash
yarn workspace @proedis/platform typecheck
```

And a look at the page: the preview server is `platform` in `.claude/launch.json` (port 3200). Check
the pages that show the change, in light and dark, with no console error, and at 375px when the
layout is responsive.

## 5. Before a merge

The whole gate, the one CI runs:

```bash
yarn release:preflight
```

## Report

Close with what ran and its result, what did not run and why, and what remains unverified (a browser
check not done, a consumer outside the workspace not tried). A check skipped is said, never implied.
