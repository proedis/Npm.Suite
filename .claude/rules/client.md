---
paths:
  - "packages/client/**"
  - "packages/react-client/**"
  - "packages/react-native-client/**"
---

# `@proedis/client`, `@proedis/react-client`, `@proedis/react-native-client`

Moved verbatim from the root `CLAUDE.md`.

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

### `@proedis/react-client`

`clientContext.tsx` bridges rxjs to React through a single private `useClientSubject` hook, exposed
as `useClientState` / `useClientStorage` / `useClientToken`. `clientWithQueryContext.tsx` adds the
react-query layer, where **the query key array *is* the endpoint**: `useClientQuery(['projects', 5])`
performs a request to `<baseUrl>/projects/5`. It also applies `class-transformer`'s `plainToInstance`
when a transformer is declared on the request config.

