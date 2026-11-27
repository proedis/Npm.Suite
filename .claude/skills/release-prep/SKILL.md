---
name: release-prep
description: Prepare a release of the Npm.Suite packages up to the point where a human takes over. Runs the preflight (lint, build, release:verify), lists the packages lerna would bump and why, and stops before lerna version, which bumps, tags and pushes. Use it when asked to prepare, check or get ready for a release. It never bumps, tags, pushes or publishes.
---

# Preparing a release

The release is two halves with a manual seam between them (`.claude/rules/release.md` says why the
order cannot change). This skill covers the first half and stops at the seam.

**It never runs `yarn release:version`, `yarn release:finalize`, `yarn release:publish`,
`lerna version`, `lerna publish`, `git push`, or the Publish workflow.** Those are the human's, each
time.

## 1. Where the repository stands

```bash
git branch --show-current
git status --short
git log --oneline -1
```

Releases are cut from `master`, clean. If the branch is another one or the tree is dirty, say so and
stop: switching branch or committing is not this skill's call.

## 2. The preflight

```bash
yarn release:preflight
```

Lint, the whole build, `release:verify`. A red step stops the skill, with the output of the failing
step. `release:verify` failing on a missing README or LICENSE is the gate doing its job.

## 3. What would be bumped

```bash
npx lerna changed --long
```

Read-only. Report each package with the reason it is in the set: changed itself, or pulled in by the
cascade (`collectDependents` bumps every dependent unconditionally, devDependencies included). Point
out the README ranges that go stale with the cascade: the in-suite peers (`@proedis/client`,
`@proedis/react`, `@proedis/react-client`) are published as a caret over the version built here, so a
README stating one of them needs re-reading from the built manifest.

## 4. Hand over

End with the next steps for the human, verbatim, and nothing run:

```bash
yarn release:version    # interactive per package: bumps, commits, tags, pushes
```

Then GitHub → Actions → Publish → Run workflow, on `master`.
