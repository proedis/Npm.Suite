# Contributing

This repository publishes the `@proedis/*` packages. Nothing is deployed from it, so a change here
reaches a consumer only through a release, and a release is a deliberate manual act. Discuss a
change that moves a public surface before writing it.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Before opening a pull request

1. **Run the gate.** `yarn release:lint`, then `yarn release:build`, then `yarn release:verify`, or
   `yarn release:preflight` for all three. There is no test runner here and there is not going to be
   one: typecheck, lint and build *are* the verification. Typecheck a package from inside it, since
   the root `tsconfig.dev.json` extends the base preset and cannot read JSX.
2. **Document what you added.** A public export with no line in its package's `README.md` is an
   export nobody will find. A decision that will look wrong to the next reader belongs in that
   package's `CLAUDE.md`, next to the reason it is right.
3. **Declare what you import.** A dependency used by the published type surface goes in
   `dependencies`, not `devDependencies` — the emitted `.d.ts` keeps the import while the published
   manifest drops the dev ones. `release:verify` fails on it, which is exactly what it is for.
4. **Do not touch version numbers.** `lerna version` writes every one of them, in `package.json` and
   in the sibling ranges, at release time. A version edited by hand is a conflict waiting at the
   next bump. Versioning is independent per package and follows [SemVer](https://semver.org/).

Commit messages read as [Conventional Commits](https://www.conventionalcommits.org/) and nothing
enforces it: husky and commitlint were removed on purpose. Match the history.

## Review and merge

CI runs lint, build and verify on every push to `master` and on every pull request, and it **never
publishes**. A pull request needs one approving review from another developer on the team before it
is merged; merge it yourself once you have it, or ask the reviewer to.

Releasing is not part of merging. It happens locally, from a clean `master`, and the procedure is in
the [README](./README.md#-releasing).

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

* The use of sexualized language or imagery and unwelcome sexual attention or
  advances
* Trolling, insulting/derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or electronic
  address, without explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team at [m.cavanna@proedis.net](mailto:m.cavanna@proedis.net). All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an incident.
Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at [http://contributor-covenant.org/version/1/4][version]

[homepage]: http://contributor-covenant.org

[version]: http://contributor-covenant.org/version/1/4/
