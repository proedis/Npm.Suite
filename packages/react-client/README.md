<div align="center">

# `@proedis/react-client`

**`@proedis/client` with React bindings — and a react-query layer where the query key *is* the
endpoint.** ⚛️

[![npm](https://img.shields.io/npm/v/@proedis/react-client.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/react-client)
[![license](https://img.shields.io/npm/l/@proedis/react-client.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

| Export | Does |
| --- | --- |
| `ClientProvider` | puts a client in context, optionally holding the tree back until it is ready |
| `ClientWithQueryProvider` | the same, plus a `QueryClient` already wired to that client |
| `useClient` | the client itself |
| `useClientState` | the auth state, re-rendering on every change |
| `useClientStorage` | the persisted storage, and its setter |
| `useClientToken` | one token's specification, as it changes |
| `useClientQuery` | `useQuery`, with the endpoint built from the query key |
| `useClientMutation` | `useMutation`, same idea |
| `useQueryClientOptions` | swap the QueryClient defaults at runtime, and put them back |
| `createQueryClientDefaultOptions` | the defaults, if you would rather assemble the QueryClient yourself |

## 📦 Installation

```bash
yarn add @proedis/react-client
```

`@proedis/client`, `@proedis/react`, `react`, `@tanstack/react-query`, `class-transformer` and
`reflect-metadata` are **peers**: they are the packages your application already owns, and a second
copy of any of them would mean a second client, a second query cache, or decorators writing metadata
nobody reads.

## 🚀 Quick start

```tsx
import { ClientWithQueryProvider, useClientQuery } from '@proedis/react-client';

import { client } from './client';

function Projects() {
  /** GET <baseUrl>/projects/5 — the key is the endpoint */
  const { data, isLoading } = useClientQuery<Project>([ 'projects', 5 ]);

  return isLoading ? <Spinner /> : <ProjectCard project={data} />;
}

export default function App() {
  return (
    <ClientWithQueryProvider client={client} suspense={<SplashScreen />}>
      <Projects />
    </ClientWithQueryProvider>
  );
}
```

### 🪄 Type it once, globally

Rather than threading three generics through every call site, augment `ContextClientOverride` with
your own client and the whole surface resolves to it:

```ts
declare module '@proedis/react-client' {
  export interface ContextClientOverride {
    client: typeof client;
  }
}
```

From then on `useClient()` returns *your* client, `useClientState()` carries your user data,
`useClientStorage()` your stored shape, and `useClientToken()` only accepts the token names you
actually declared. Without it everything degrades to `Client<any, any, any>` — it still works, it
just stops helping.

## 📖 API

### 🧭 Providers

```tsx
<ClientProvider client={client} suspense={<Splash />} renderEvenIfUnready={false}>
```

| Prop | Default | Does |
| --- | --- | --- |
| `client` | — | the client to publish in context |
| `suspense` | — | rendered *instead of* the children while the client is not ready |
| `renderEvenIfUnready` | `false` | render the children immediately, without waiting |

`ClientWithQueryProvider` takes those and two more — `queryClientConfig` to extend the QueryClient
configuration, and `queryClientProviderComponent` to substitute the provider component itself. Its
props are exported as `ClientWithQueryProviderProps`.

⚠️ **Do not pass `queryClientConfig` as an inline literal.** The `QueryClient` is memoized on it, so
a fresh object on every render builds a fresh client and throws the whole cache away with it. Hoist
it to a module constant, or memoize it.

### 🔗 Reading the client

```ts
const client = useClient();                        // the client itself
const state = useClientState();                    // { isReady, isLoaded } & auth state
const [ storage, setStorage ] = useClientStorage();
const refreshToken = useClientToken('refreshToken');
```

All four are backed by the same private bridge over the client's rxjs subjects: they read the
current value on mount and re-render on every emission, dropping the subscription on unmount.

`useClientState()` returns a **discriminated union on `hasAuth`**, so the narrowing is the point —
`userData` is `null` until it is not:

```ts
const state = useClientState();

if (state.hasAuth) {
  console.log(state.userData.displayName);   // userData is your AccountData here
}
```

`setStorage(key, value)` takes either a value or an updater — `setStorage('theme', c => c === 'dark'
? 'light' : 'dark')` — and returns the promise of the persist.

### 📡 `useClientQuery(key, requestConfig?, options?)`

The query key array, joined with `/`, **is** the endpoint:

```ts
useClientQuery([ 'projects', 5 ]);                                // GET <baseUrl>/projects/5
useClientQuery([ 'projects' ], { params: { search: 'acme' } });   // GET <baseUrl>/projects?search=acme
```

`requestConfig` is a `ClientRequestConfig` minus `url` — `params`, `data`, `headers`, `timeout` and
so on — and it takes part in the query key, so two calls differing only by their params are two
cache entries. `options` is forwarded to `useQuery`, minus what this hook owns
(`queryKey`, `queryFn`, `meta`).

Declare a `transformer` and the response is run through `class-transformer`'s `plainToInstance`,
memoized on the data:

```ts
const { data } = useClientQuery<Project[]>([ 'projects' ], { transformer: Project });
```

⚠️ The request is performed by the **default `queryFn`** installed on the QueryClient, so these
hooks need a QueryClient that carries it. `ClientWithQueryProvider` does that for you; if you build
your own, feed it `createQueryClientDefaultOptions(client)`.

### ✏️ `useClientMutation(key, method, requestConfig?, options?)`

Same endpoint-from-key idea, with the method stated explicitly. Every argument except the first can
also be a **function of the payload**, for when the endpoint or the verb depends on what is being
sent:

```ts
const save = useClientMutation<ProjectPayload, Project>(
  (project) => [ 'projects', project.id ],
  (project) => (project.id ? 'PATCH' : 'POST'),
  (project) => ({ data: project })
);

save.mutate({ id: 5, name: 'Acme' });
```

### ⚙️ `useQueryClientOptions()`

Returns `setDefaultOptions(overrides?)`, which merges your overrides over the defaults and hands
back the function that restores what was there before — for a screen that needs, say, a longer
`staleTime` only while it is mounted:

```ts
const { setDefaultOptions } = useQueryClientOptions();

React.useEffect(() => setDefaultOptions({ queries: { staleTime: 60_000 } }), [ setDefaultOptions ]);
```

### 🧮 What the defaults actually do

`createQueryClientDefaultOptions(client)` sets `refetchOnMount`, `refetchOnReconnect` and
`refetchOnWindowFocus`, installs the `queryFn` that routes through the client, and replaces
react-query's structural sharing with `defaultStructuralSharing`.

That last one is the interesting part: `replaceEqualDeep` walks the whole payload on every refetch,
which on a large list is the expensive part of a request that changed nothing. The replacement
compares hashes first and returns the *previous* object when they match, so an unchanged response
costs one hash instead of a full deep walk — and, keeping the old reference, re-renders nothing.
Arrays longer than 1 000 entries skip the hash and go straight to `replaceEqualDeep`, where walking
is cheaper than hashing.

## 🔀 Migrating to 3.x

| Was | Is now |
| --- | --- |
| `ClientWithQueryProviderProps` was internal | exported, like `ClientProviderProps` already was |

## 🤝 Compatibility

| Requirement | Range |
| --- | --- |
| `react` | `>=18.0.0 <20.0.0` |
| `@proedis/client` | `^2.5.0` |
| `@proedis/react` | `^1.6.0` |
| `@tanstack/react-query` | `^5.0.0` |
| `class-transformer` | `^0.5.1` |
| `reflect-metadata` | `^0.1.13 \|\| ^0.2.0` |
| `typescript` | `>=5.2.0` |
| Runtime | ES2022 — roughly Safari 16.4 / Chrome 94 / Node 16.11 |

The React range is verified by compiling the emitted declarations against `@types/react` 18 and 19
with `skipLibCheck` off, from outside the workspace.

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
