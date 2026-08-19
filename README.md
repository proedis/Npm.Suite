<div align="center">

# Proedis Suite

**The libraries every Proedis application is built on — an authenticated HTTP client, the model
layer that speaks .NET, the React bindings around both, and the tooling that keeps them
consistent.** 🧰

[![CI](https://img.shields.io/github/actions/workflow/status/proedis/Npm.Suite/ci.yml?branch=master&style=flat-square&label=CI&logo=github)](https://github.com/proedis/Npm.Suite/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@proedis/client.svg?style=flat-square&color=blue)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D22.13.0-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![yarn](https://img.shields.io/badge/yarn-4.18.0-2c8ebb?style=flat-square&logo=yarn&logoColor=white)](https://yarnpkg.com)

</div>

---

## 📦 The packages

Each one is published on its own and versioned independently. Follow a name for its full
documentation.

### 🌐 Runtime

| Package | What it is |
| --- | --- |
| [`@proedis/client`](./packages/client) [![npm](https://img.shields.io/npm/v/@proedis/client.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@proedis/client) | The centre of gravity: an authenticated HTTP client over `fetch`, with persisted observable state, a token handshake per token, and environment-dependent settings |
| [`@proedis/modeler`](./packages/modeler) [![npm](https://img.shields.io/npm/v/@proedis/modeler.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@proedis/modeler) | `class-transformer` models that speak .NET — `DateTime`, `TimeSpan`, `Enum`, `Flags` — with colour and icon tokens supplied by the application |
| [`@proedis/utils`](./packages/utils) [![npm](https://img.shields.io/npm/v/@proedis/utils.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@proedis/utils) | `Guard`, `AugmentedMap`, `Deferred`, `ArraySorter`, hashing and deep object access. Publishes a subpath per module |
| [`@proedis/formatters`](./packages/formatters) [![npm](https://img.shields.io/npm/v/@proedis/formatters.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@proedis/formatters) | Numbers and durations turned into strings a person actually reads, in Italian or English |
| [`@proedis/types`](./packages/types) [![npm](https://img.shields.io/npm/v/@proedis/types.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@proedis/types) | The shared primitives everything else is written in terms of — `Nullable`, `AnyObject`, `Environment`, path types |

### ⚛️ React

| Package | What it is |
| --- | --- |
| [`@proedis/react`](./packages/react) [![npm](https://img.shields.io/npm/v/@proedis/react.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@proedis/react) | Framework-agnostic hooks and utilities — `contextBuilder`, `useAutoControlledState`, the shorthand renderers |
| [`@proedis/react-client`](./packages/react-client) [![npm](https://img.shields.io/npm/v/@proedis/react-client.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@proedis/react-client) | React bindings for the client, plus a react-query layer where the query key **is** the endpoint |
| [`@proedis/react-native-client`](./packages/react-native-client) [![npm](https://img.shields.io/npm/v/@proedis/react-native-client.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@proedis/react-native-client) | The AsyncStorage-backed storage provider that makes the client persist on React Native |

### 🛠️ Tooling

| Package | What it is |
| --- | --- |
| [`eslint-config-proedis`](./packages/eslint-config-proedis) [![npm](https://img.shields.io/npm/v/eslint-config-proedis.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/eslint-config-proedis) | The ESLint 9 flat config, self-contained: every plugin is a real dependency, so a consumer installs one package |
| [`@proedis/tsconfig`](./packages/tsconfig) [![npm](https://img.shields.io/npm/v/@proedis/tsconfig.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@proedis/tsconfig) | The TypeScript presets — `base` → `web` → `react` → `react-native`, plus the `declaration` overlay |
| [`@proedis/cli`](./packages/cli) [![npm](https://img.shields.io/npm/v/@proedis/cli.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@proedis/cli) | The `proedis` binary: scaffolds enums and models straight out of a running API |

Dependencies run one way only, and `types` and `utils` are the leaves.

## 🚀 Using them

Nothing here has to be installed together. Take the client and its React bindings:

```bash
yarn add @proedis/client @proedis/react-client
```

```ts
import { ClientBuilder } from '@proedis/client';

export const client = new ClientBuilder('MyApp')
  .withUserData<AccountData>()
  .withServer({
    domain   : { development: 'localhost:5000', production: 'api.example.com' },
    namespace: 'v1',
    secure   : true
  })
  .build();
```

The builder **widens its own generics as you call it**, so the client that comes out of `build()`
carries your user data, your stored shape and your token names — and `@proedis/react-client` picks
all three up through a single module augmentation. Each package's README covers its own surface.

## 🧑‍💻 Working on the suite

The package manager is **Yarn 4**, resolved through corepack:

```bash
corepack enable
yarn install
```

⚠️ Without `corepack enable` a globally installed Yarn 1 runs against a Berry lockfile it cannot
parse. And `.yarnrc.yml` pins `nodeLinker: node-modules` deliberately: every package points `main`
at `src/index.ts`, so in-repo consumers compile their siblings' TypeScript **source** with no build
step in between — a layout the default PnP linker breaks.

| Command | Does |
| --- | --- |
| `yarn release:lint` | `eslint .` over the whole repository — the suite is the first consumer of the config it publishes |
| `yarn release:build` | builds every package in topological order |
| `yarn release:verify` | checks the built artifacts are actually publishable |
| `yarn release:graph` | opens the dependency graph |
| `yarn rules:sync` | regenerates the vendored Airbnb rule sets inside `eslint-config-proedis` |

There is **no test runner** in this repository, and that is not an oversight to work around:
verification means typecheck, lint and build. Typecheck one package at a time, from inside it —
the root `tsconfig.dev.json` extends the base preset and cannot typecheck anything React.

### ✅ What `release:verify` catches

A green build is not enough, so a second gate reads the built output and asks what the compiler
cannot: that every published manifest declares everything its own emitted files import, that each
entry point and `bin` target exists and carries a hashbang, that the per-directory `type` markers
are right, that declared assets reached every output directory, and that a `README.md` and a
`LICENSE` are there to be published.

That last one is a checklist, not a formality: publishing runs with `--contents build`, so a file
that never gets copied there does not exist for a consumer.

## 📤 Releasing

Deliberately manual, and run one step at a time — there is no aggregate `release` script:

```bash
yarn release:version    # interactive, per package
yarn release:build
yarn release:verify
yarn release:publish
```

Versioning is **independent per package**, so a release usually produces several tags at the same
commit. CI runs lint → build → verify on every push to `master`, every pull request and on demand,
and **never publishes**: releasing stays a deliberate local action.

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
