<div align="center">

# `@proedis/cli`

**Your API already knows what your enums and your models look like. Stop typing them twice.** ⌨️

[![npm](https://img.shields.io/npm/v/@proedis/cli.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/cli)
[![license](https://img.shields.io/npm/l/@proedis/cli.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

> ⚠️ **This tool talks to a Proedis-style API.** Both commands read documents carrying the
> `x-api-enum`, `x-api-response-dto` and `x-element-namespace` extensions emitted by the Proedis
> .NET generator. Pointed at a generic OpenAPI document, `scaffold models` will find no models to
> generate. That is a deliberate scope, not an oversight.

## ✨ What's in the box

One binary, two commands, both fed by a running API. 📡

| Command | Downloads | Writes |
| --- | --- | --- |
| `proedis scaffold enums` | the shared objects definition | typed enum unions, their constants, and the `@proedis/modeler` configuration |
| `proedis scaffold models` | the OpenAPI document | `class-transformer` models, their barrel, and the endpoint namespaces |

Everything is **rendered before anything is written**, so a document the scaffolder cannot handle
leaves your working tree exactly as it found it.

## 📦 Installation

```bash
yarn add --dev @proedis/cli
```

Nothing else is required to run it. Two packages are worth having in the project it generates into,
because the generated code imports them:

- **`@proedis/modeler`** — the generated models, enums and configuration are built on it
- **`eslint`** — optional, but the generated files are formatted with *your* project's ESLint and
  *your* rules when it can be resolved. Without it the files are still written and correct, just
  unformatted

## 🚀 Quick start

```bash
yarn proedis scaffold enums
```

It asks for a host and an endpoint, remembers them in `.proedis.yml`, and reports what happened:

```
✔ Downloaded Enums Definition

Found 2 enums, 3 values.

All paths will be resolved from root src:
 - Saving Constants in ./constants
 - Saving Enums in ./interfaces/enums
 - Saving Utilities in ./interfaces/shared-objects

  A src/interfaces/enums/OrderState.ts
  A src/constants/enums/OrderState.ts
  = src/constants/shared-objects.colors.ts (kept, this file is yours to edit)
  …

Scaffold complete.
  15 created, 0 updated, 0 unchanged, 0 kept
  14 files fixed by ESLint
```

Answer everything upfront and it never stops to ask — which is what makes it usable from a script:

```bash
yarn proedis scaffold enums --host https://api.example.com --endpoint /v1/common/shared-objects -y
```

## 📖 API

### 🧩 `proedis scaffold <element>`

| Option | What it does |
| --- | --- |
| `--host <host>` | the host serving the definition, skipping its prompt |
| `--endpoint <endpoint>` | the endpoint serving the definition, skipping its prompt |
| `-y, --yes` | answer every optional prompt affirmatively |

Host and endpoint are remembered per command in a `.proedis.yml` at the project root, and offered as
the defaults next time:

```yaml
scaffold-enums:
  endpoint: /v1/common/shared-objects
  host: https://api.example.com
```

⚠️ They are written **after** a successful download, never before — a host that just failed is not
one worth suggesting again.

### 🎨 `scaffold enums`

Expects `Record<string, { name: string, label: string, value: number }[]>` and writes, under `src/`:

| Path | Holds |
| --- | --- |
| `interfaces/enums/` | one string union per enum, plus `ComposedSharedObjects` |
| `interfaces/shared-objects/` | the `SharedObject` shape and the union of every enum name |
| `constants/enums/` | one frozen collection per enum, plus the registry |
| `constants/shared-objects.ts` | `getSharedObjects`, `getSharedObject`, `getSharedObjectLabel` |
| `constants/shared-objects.{colors,icons}.ts` | the token maps, **yours to edit** |
| `modeler.configuration.ts` | the `ModelerOverride` declaration and the `Enum.configure*` calls |

The last two rows are optional and asked for separately.

**The generated code names no UI kit.** Colors and icons are typed through `EnumsColors` and
`EnumsIcons` from `@proedis/modeler`, which resolve to whatever your application declares:

```ts
declare module '@proedis/modeler' {
  export interface ModelerOverride {
    enums: ComposedSharedObjects;
    color: string;
    icon: string;
  }
}
```

Declared as `string` the two tokens behave exactly as the built-in fallback, and the block exists so
you can *see* a configuration that would otherwise be invisible. Swap `color` for your kit's colour
type — `MantineColor`, say — and both `shared-objects.colors.ts` and every `Enum.color` are
constrained to it immediately; the same goes for `icon`.

The `zod` helper in `shared-objects.ts` is emitted **only when your project can resolve `zod`** —
including when it is declared by the root manifest of a monorepo and used from a workspace that
never mentions it.

### 🏗️ `scaffold models`

Expects an OpenAPI document and writes, under `src/`:

| Path | Holds |
| --- | --- |
| `models/scaffold/<namespace>/` | one `class-transformer` model per DTO, foldered by `x-element-namespace` |
| `models/scaffold/index.ts` | the barrel |
| `namespaces/index.ts` | `Path`, `PathMethods`, `PathRouteParams`, `PathQueryParams` |

OpenAPI types map like this:

| Schema | Becomes |
| --- | --- |
| `string` + `format: date-time \| date` | `@AsDayJs() DateTime` |
| `string` + `format: date-span` | `@AsTimeSpan() TimeSpan` |
| `string` + `format: uuid` | `string` |
| `string` + `x-api-enum` | `Enum<'Name'>` / `Flags<'Name'>`, or the plain union |
| `integer` / `number` | `number` |
| `$ref` | `@Type(() => Model)` |

A property whose type nothing maps stops the run and names itself, rather than writing a file that
does not compile:

```
Cannot map property 'Job.payload': no property type handles {"type":"file","nullable":false}
```

### ♻️ These files are a clone, not a draft

Both commands **empty and rewrite their output directories on every run**, announcing which ones
before doing it. That is the point: they mirror a truth that lives in your API, so anything the
server stops returning has to disappear here too.

Two files are the exception — `shared-objects.colors.ts` and `shared-objects.icons.ts` — plus
`modeler.configuration.ts`. They are yours, they are reported as `kept`, and they are never
overwritten. ⚠️ Which also means **an existing project will not pick up an upstream change to those
templates**: delete them to have them regenerated.

### 🧹 Formatting

Generated files are fixed with the ESLint **installed in your project**, using your rules, run from
the directory holding your configuration. That last detail matters in a monorepo: a relative
`parserOptions.project` resolves against the working directory, so running from a workspace while
the config lives at the root used to fail on every file.

If ESLint cannot run, the scaffold still succeeds and says so — the files are correct, only
unformatted.

## 🔀 Migrating to 1.x

First public release. `init` and `generate` existed in the source but were never published, and are
gone: `scaffold` is the whole surface.

## 🤝 Compatibility

| Requirement | Range |
| --- | --- |
| Runtime | Node `>=22.13.0` |
| Generated code needs | `@proedis/modeler`, and `zod` only if you already have it |
| Formatting needs | any resolvable `eslint`, 8 or 9, flat config or eslintrc |
| `typescript` | `>=5.2.0` |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
