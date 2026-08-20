<div align="center">

# `@proedis/cli`

**Your API already knows what your enums and your models look like. Stop typing them twice.** ⌨️

[![npm](https://img.shields.io/npm/v/@proedis/cli.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/cli)
[![license](https://img.shields.io/npm/l/@proedis/cli.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

> ⚠️ **This tool talks to a Proedis-style API.** Every command reads documents carrying the
> `x-api-enum`, `x-api-response-dto`, `x-element-name` and `x-element-namespace` extensions emitted
> by the Proedis .NET generator. Pointed at a generic OpenAPI document, `scaffold models` will find
> no models to generate and `scaffold hooks` no operation it can name. That is a deliberate scope,
> not an oversight.

## ✨ What's in the box

One binary, three commands, all fed by the same API. 📡

| Command | Downloads | Writes |
| --- | --- | --- |
| `proedis scaffold enums` | the shared objects definition | typed enum unions, their constants, and the `@proedis/modeler` configuration |
| `proedis scaffold models` | the OpenAPI document | `class-transformer` models, their barrel, and the endpoint namespaces |
| `proedis scaffold hooks` | the OpenAPI document | a named hook, query key and arguments per operation, grouped by resource |

They build on each other, so run them in that order: the hooks import the models, and the models
carry the enums.

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
| `--spec <file>` | generate from a definition on disk, skipping the download entirely |
| `--save-spec <file>` | save the downloaded definition, so a later run can be fed from it |
| `--check` | report what a run would change and write nothing, exiting non-zero when it would |
| `-y, --yes` | answer every optional prompt affirmatively |

`--spec` and `--check` are what make the generated code verifiable where there is no API to ask.
Commit the definition next to the code generated from it, and a pipeline can tell whether the two
still agree:

```bash
# on your machine, against a running API
proedis scaffold models --host https://localhost:5001 --save-spec ./api/openapi.json

# in CI, against what the repository committed
proedis scaffold models --spec ./api/openapi.json --check
```

A check reports three kinds of drift — a file that is **missing**, one that is **stale**, and one
left **orphan** inside a directory the definition no longer fills. The last is the one a naive
comparison misses: a real run would have deleted it while emptying the directory, so an output that
looks clean file by file is not necessarily the output a run produces.

Host and endpoint are remembered per command in a `.proedis.yml` at the project root, and offered as
the defaults next time:

```yaml
scaffold-enums:
  endpoint: /v1/common/shared-objects
  host: https://api.example.com
```

⚠️ They are written **after** a successful download, never before — a host that just failed is not
one worth suggesting again. Anything else you put in a section survives a run: only the keys a
command answered are rewritten.

Two of those keys decide where the generated code goes, which a single package project never needs
and a monorepo always does:

```yaml
scaffold-models:
  output: packages/model/entities/src
scaffold-hooks:
  output: packages/api/generated/src
  models: '@proedis/yard-model-entities'
```

`output` is the directory the command writes into, relative to the project root, and it replaces
the `src` it would have used. For the hooks, `models` is the specifier their imports point at:
across packages the models cannot be reached by a relative path, they have to be imported by the
name of the package holding them. Leave both out and everything lands where it always did.

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

### 🪝 `scaffold hooks`

One hook per operation, named after the operation itself and grouped by the **resource** it acts
on — the first static segment of its route — under `src/`:

| Path | Holds |
| --- | --- |
| `hooks/scaffold/<resource>.ts` | every operation of that resource, with the models it needs imported once |
| `hooks/scaffold/index.ts` | the barrel |

⚠️ The tag would be the natural grouping and is not used: on a document where it is empty for most
operations, everything piles into one file of fifteen thousand lines. The resource is always there,
and it is how a hook gets looked up.

Which hook it becomes follows the method and the answer:

| Operation | Becomes |
| --- | --- |
| `GET` | `useClientQuery<Dto>`, with the model as its `transformer` |
| `GET` answering with a page | `usePaginatedClientQuery<Item>`, taking a `PaginatedRequest` |
| `POST` `PUT` `PATCH` `DELETE` | `useClientMutation<Body, Response>`, handing the payload to the request |

Every query is written in three pieces, because the hook is not the only way to spend them:

```ts
export function getSingleActivityQueryKey(id?: string): string[] {
  const key: string[] = [];
  key.push('activities');
  if (id === undefined) { return key; }
  key.push(id);
  return key;
}

export function getSingleActivityQueryArgs(id: string) {
  return [ getSingleActivityQueryKey(id), { transformer: ActivityCompleteDto } ] as const;
}

export function useGetSingleActivity(
  id: string,
  options?: Parameters<typeof useClientQuery<ActivityCompleteDto>>[2],
) {
  return useClientQuery<ActivityCompleteDto>(...getSingleActivityQueryArgs(id), options);
}
```

**The key** takes every route parameter as optional and stops at the first one missing: in full it
is the key of one entry, empty it is the prefix every entry under it shares. That is what
invalidation runs on — `@proedis/react-query` treats a key as a prefix filter — so invalidating a
resource is calling its key function with nothing:

```ts
const invalidateEveryActivity = useQueryInvalidation([ getSingleActivityQueryKey() ]);
const invalidateThisActivity = useQueryInvalidation([ getSingleActivityQueryKey(id) ]);
```

**The arguments** are the key and the request config, ready to spread. Anything built on
`useClientQuery` takes the same pair and decides the options itself, instead of repeating the key
and the transformer of an endpoint it does not own:

```ts
export function useActivityWhileVisible(id: string, isVisible: boolean) {
  return useClientQuery(...getSingleActivityQueryArgs(id), { enabled: isVisible, staleTime: 30_000 });
}
```

The key is the route split on slashes with its parameters in place, so nothing rebuilds the url at
runtime, and the options type is derived from the hook being called — no internal type is imported
to spell it out. A page is queried through `usePaginatedClientQuery`, whose transformer describes
the **item**: the envelope stays generic, which is why no class is generated per page shape.

#### 🏷️ Where the names come from

The name is the one the API gives the operation, in `x-element-name`. Two cases are handled rather
than assumed:

- **Names that collide.** The same handler can serve several routes — a list and the same list
  projected onto another DTO — and the document names the operation, not the route. Those are told
  apart by the path segments they do not share, or by their route parameters when even those match:
  `useGetAccountAssignedEstates` and `useGetAccountAssignedEstatesById`. Never by the order the
  document happens to list them in.
- **Names that cannot be identifiers.** A handler written as an inline lambda is named after the
  class the compiler generated for it, and an endpoint the framework never named carries a fully
  qualified method signature. Those operations are **skipped**: no hook, which is visible, rather
  than a file that does not parse.

⚠️ The generated hooks import from `@proedis/react-client`, so a project scaffolding them needs it
installed.

### ♻️ These files are a clone, not a draft

Every command **empties and rewrites its output directories on every run**, announcing which ones
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
| Generated code needs | `@proedis/modeler`, plus `@proedis/react-client` for the hooks |
| Keys pair well with | `@proedis/react-query`, whose invalidation takes them as prefix filters |
| Formatting needs | any resolvable `eslint`, 8 or 9, flat config or eslintrc |
| `typescript` | `>=5.2.0` |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
