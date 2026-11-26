---
paths:
  - "lerna.json"
  - ".github/**"
  - "package.json"
  - "scripts/verify-artifacts.mjs"
---

# Release

Moved verbatim from the root `CLAUDE.md`.

### Release

```bash
yarn release:preflight  # lint + build + verify, before anything is bumped
yarn release:version    # lerna version, interactive per package: bumps, tags, pushes
# then GitHub → Actions → Publish → Run workflow, on master (trusted publishing, below)
```

`yarn release:finalize` (build + verify + publish) still works from a machine, but only with a token
or a one time password: npm asks for a second factor on every publish from outside the workflow.

**There is deliberately no single `release` script, and the reason is the order of the steps.**
`lerna version` bumps, commits, tags and — with no `--no-push` in `lerna.json` or in the script —
**pushes**, so the irreversible half of a release is the *first* thing that runs, while
`release:verify` only speaks two steps later. Chaining the whole thing with `&&` would not create
that problem, but it would automate it: a red verify would leave version commits and one tag per
package already on the remote for a release that cannot be published, to be undone by hand.

The order cannot simply be rearranged either. `createPackageJson` copies `version` from the source
manifest, so artifacts built before `lerna version` would carry the previous number: the build has
to happen after the bump.

Hence the two halves. `release:preflight` checks everything a release can fail on **except** the
version strings, which is nearly all of it — the missing README that kept this repository from
releasing would have surfaced there rather than after tagging. `release:finalize` aggregates the
tail, which is safe to group because both `build` and `verify` are idempotent and
`lerna publish from-package` compares each local version against the registry: it publishes only
what is missing and is a no-op on a re-run.

What stays manual is the seam between them — the one place a human decision belongs, between the
interactive bump of fourteen packages and pushing them to npm.

Publishing ships the generated `build/` directory, never the repo source.

`--exact` was dropped from `release:version`, so lerna now writes `^x.y.z` instead of `x.y.z` into
sibling ranges (in `dependencies` *and* `devDependencies`), letting consumers dedupe a single
`@proedis/utils`. It does **not** reduce the version cascade: `collectDependents` pulls every
dependent into the bump set unconditionally, so one change to `types` still bumps everything
downstream of it.

`.github/workflows/ci.yml` runs lint → build → verify on every push to `master`, every pull
request, and on demand, and never publishes.

**Publishing runs in `.github/workflows/publish.yml`, through npm's trusted publishing** (Marco,
2026-11-25, when npm's mandatory second factor made publishing from a machine a one time password per
package). It changes who authenticates, not how versions are chosen: the bump stays local and
interactive, and the workflow publishes what the bump committed. It starts **only by hand**
(`workflow_dispatch`), only from `master`, in the GitHub environment `npm`: releasing stays a
deliberate action, now a button instead of a command. A tag must never start it, since independent
versioning pushes one tag per package (13 at the same commit in the last multi-package release), and
each would start a run. `lerna publish from-package` needs no tag: it reads every version from the
manifests, publishes what the registry lacks, and is a no-op on a re-run.

How it authenticates, read in lerna 10's own `oidc.ts`: with `id-token: write`, lerna asks GitHub for
the identity of the job, exchanges it with npm for a token valid for one package, and, the repository
being public, turns provenance on. No secret lives anywhere. `setup-node` gets no `registry-url`, which
would write an empty `_authToken` into `.npmrc`. The build happens in the workflow, after the bump, which
is what `createPackageJson` needs.

What npm must know, once per package: the repository `proedis/Npm.Suite`, the workflow `publish.yml`,
the environment `npm`. It is set from the terminal, all the packages in one loop, by whoever owns them:

```bash
npx -y npm@11 trust github <package> --repo proedis/Npm.Suite --file publish.yml --env npm --allow-publish --yes
npx -y npm@11 trust list <package>
```

`npm trust` arrived in npm 11 and is not in the npm 10 of this machine; npm 12 has it too but asks for
Node 22.22 or later, hence `npm@11`. It needs an interactive `npm login` session (a token that bypasses
the second factor is refused); the first call asks for the second factor, and ticking the five minute
skip there lets the other packages through. All fifteen were configured that way on 2026-11-25, and npm
records `createPackage` and `createStagedPackage` for each.

A package that is not on the registry yet cannot be configured: its first version is published from a
machine, after `npm login`, and configured right after. That first publish may land in npm's staged
publishing, as `@proedis/form` did: the registry then holds a `0.0.0-stage` placeholder as `latest`
while the real version waits for approval on npmjs.com; the placeholder is enough to configure the
package, and the workflow publishes the real version. A publish that answers `404 Not Found` on a `PUT`
is an authentication failure, not a missing package: `npm whoami` says so with a `401`.

With every package configured, "Require two-factor authentication and disallow tokens" in the settings of
each package makes a stolen token useless for publishing.

**Never run any of the release scripts, `git push`, or `lerna publish` unless explicitly asked.**

There is no commit-message validation and no git hook: husky and commitlint were removed
deliberately. The history still reads as Conventional Commits (and `lerna version` writes
`chore(release): publish`), so match that style, but nothing enforces it.

