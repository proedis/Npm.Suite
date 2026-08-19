<div align="center">

# `@proedis/client`

**The authenticated HTTP client every Proedis application talks to its API through: tokens that grant
and refresh themselves, state you can subscribe to, and zero HTTP dependencies.** 🔐

[![npm](https://img.shields.io/npm/v/@proedis/client.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/client)
[![license](https://img.shields.io/npm/l/@proedis/client.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

| | |
| --- | --- |
| **Requests** | `request`, `safeRequest`, `request$` over a `fetch` transport — no axios, no HTTP dependency at all |
| **Tokens** | one *handshake* per token, each with its own storage, lifetime, grant request and way of riding on a request |
| **Auth lifecycle** | `login`, `signup`, `logout`, `getUserData`, `forceReload`, `flushAuth` — declared as endpoints, not hardcoded |
| **Observable state** | `client.state` and `client.storage` are rxjs subjects, persisted and namespaced |
| **Uploads** | files as `Blob`, base64 or a React Native uri, with the multipart body built for you |
| **Platform agnostic** | storage is injected, so the same client runs in a browser, in React Native and in Node |
| **Generic in three parameters** | `Client<UserData, StoredData, Tokens>`, widened as you build it |

## 📦 Installation

```bash
yarn add @proedis/client rxjs class-transformer reflect-metadata
```

All four peers are required. `reflect-metadata` has to be imported once, before any model is defined:

```ts
import 'reflect-metadata';
```

The runtime needs `fetch`, `AbortController` and `FormData` — every browser since 2017, Node 18+, and
React Native 0.63+.

## 🚀 Quick start

A client is never written as a literal. `ClientBuilder` is a fluent builder whose methods **widen the
generics as you call them**, so the type grows with the configuration:

```ts
import { ClientBuilder, bearerTransporter, authResponseExtractor } from '@proedis/client';

interface UserData {
  id: string;
  displayName: string;
}

const client = new ClientBuilder('MyApp')
  /** Where the API lives */
  .withServer({ domain: 'api.proedis.net', namespace: 'v1', secure: true, timeout: 30_000 })

  /** What a logged-in user looks like, and how to find it in an auth response */
  .withUserData<UserData>((response) => response.user)

  /** A token: where it comes from, how long it lives, how it rides on a request */
  .withToken('accessToken', {
    extractors  : [ authResponseExtractor((response) => response.token) ],
    grant       : { url: '/auth/refresh', method: 'POST' },
    transporters: [ bearerTransporter() ]
  })

  /** The endpoints the client itself needs */
  .defineApi('login', (data) => ({ url: '/auth/login', method: 'POST', data }))
  .defineApi('getUserData', () => ({ url: '/auth/me', useTokens: { accessToken: true } }))

  .build();

/** …and then, anywhere in the application */
await client.login({ username, password });

const projects = await client.request<Project[]>({
  url      : '/projects',
  params   : { page: 1, size: 20 },
  useTokens: { accessToken: true }
});
```

The token is granted on first use, stored, reused, and re-granted when it expires — without a single
line of code at the call site. 🎩

## 📖 API

### 🏗️ `ClientBuilder`

Every method returns the builder, and the ones marked ⤳ change the resulting type.

| Method | What it does |
| --- | --- |
| `withServer(options)` | ⚠️ **required** — the server the client talks to, see [ServerData](#serverdata) |
| ⤳ `withUserData<T>(extractor?)` | declare the user data type, and how to read it out of an auth response |
| ⤳ `withFetchedUserData<T>()` | same, except the user data is fetched through the `getUserData` endpoint instead of extracted |
| ⤳ `withStoredData<T>(initialData)` | declare the shape and initial value of `client.storage` |
| ⤳ `withToken(name, configuration)` | add a token, see [Token handshakes](#-token-handshakes) |
| ⤳ `withoutToken(name)` | remove a token previously declared |
| `defineApi(name, definition)` | declare one of the four built-in endpoints, see [Built-in endpoints](#built-in-endpoints) |
| `withDefaults(configure)` | request options merged into every request |
| `withTransportDefault(configure)` | transport options applied to every request |
| `useProvider(name, provider)` | replace an internal provider — `storage` is the only one |
| `setLogging(levelOrOptions)` | a bare log level, or the full [logger options](#logging) |
| `withExtras(extras)` | see [Extras](#extras) |
| `build()` | the client. **Throws** when no server was set |

`configure` arguments accept either a value or a function receiving the current one, so a shared base
builder can be extended per application:

```ts
baseBuilder.withDefaults((current) => ({ ...current, requestConfig: { headers: { 'X-App': 'web' } } }));
```

💡 A client can also be constructed directly — `new Client(appName, settings)` — which is what the
builder does. Reach for it when the configuration is already an object, in a test for instance.

### ⚙️ `ClientSettings`

| Option | Required | What it is |
| --- | --- | --- |
| `initialStorage` | ✅ | the initial value of `client.storage` |
| `requests` | ✅ | `{ server, defaults?, transportConfig? }` |
| `tokens` | | a [handshake configuration](#-token-handshakes) per token name |
| `api` | | the four [built-in endpoints](#built-in-endpoints) |
| `userDataExtractor` | | how to obtain user data: a function, a per-action map, or `'fetch'` |
| `providers` | | `{ storage }` — defaults to browser storage |
| `logger` | | see [Logging](#logging) |
| `extras` | | see [Extras](#extras) |

#### ServerData

Every field may be a plain value **or** a per-environment map, see
[Environment dependent options](#-environment-dependent-options).

| Field | Default | |
| --- | --- | --- |
| `domain` | ✅ required | the host, without protocol |
| `namespace` | | a path prefix appended to the host |
| `port` | `80` | omitted from the url when it is `80` |
| `secure` | `true` | `https` when true |
| `timeout` | `30_000` | milliseconds before a request is aborted |

The resulting base url is readable as `client.baseUrl`.

#### Built-in endpoints

Nothing is hardcoded: the four endpoints the client needs are **declared**, and calling one that was
never declared throws.

| Endpoint | Signature | Called by |
| --- | --- | --- |
| `login` | `(data) => ClientRequest` | `client.login(data)` |
| `signup` | `(data) => ClientRequest` | `client.signup(data)` |
| `logout` | `() => ClientRequest` | `client.logout()` |
| `getUserData` | `() => ClientRequest` | `client.getUserData()`, and the initialization when user data is fetched |

#### Extras

```ts
extras: {
  /** Invalidate a stored authentication before the client initializes with it */
  invalidateExistingAuth: (client) => storedAppVersion !== currentAppVersion
}
```

#### Logging

```ts
logger: { enabled: true, minLogLevel: 'warn' }
```

Levels, in order: `debug`, `log`, `info`, `warn`, `error`, `none`. Output is prefixed and coloured per
module — CSS in a browser, ANSI on a TTY, `NO_COLOR` respected.

### 📨 Making requests

```ts
/** Throws a RequestError on failure */
const project = await client.request<Project>({ url: '/projects/7' });

/** Returns a discriminated tuple instead of throwing: checking one side narrows the other */
const [ error, project ] = await client.safeRequest<Project>({ url: '/projects/7' });

if (error) {
  return;
}

project.name;   // 👈 narrowed to Project here, no assertion needed

/** An Observable, aborting the request when unsubscribed */
const subscription = client.request$<Project>({ url: '/projects/7' }).subscribe(onNext);
```

A request is either a configuration object, or a **function receiving the client** — which is how a
request reads state, a stored value or another token while being compiled:

```ts
client.request((c) => ({ url: `/tenants/${c.storage.get('tenantId')}/projects` }));
```

#### Request configuration

| Field | What it does |
| --- | --- |
| `url` | the path, resolved against the base url. Leading and trailing slashes are stripped |
| `method` | `GET` by default, either case accepted |
| `params` | the query string, see [Query serialization](#-query-serialization) |
| `data` | the body. A plain object goes out as JSON, a `FormData` as multipart |
| `files` | files to upload, see [Uploads](#-uploads) |
| `formData` | force a multipart body even without files |
| `useTokens` | which tokens ride on this request, see [Token handshakes](#-token-handshakes) |
| `transformer` | a `class-transformer` class the response is instantiated into |
| `requestConfig` | transport level options, see below |

#### `requestConfig` — transport options

| Field | What it does |
| --- | --- |
| `headers` | merged over the client defaults. A `null` value **removes** a default header |
| `baseUrl` | send this one request to a different host entirely |
| `timeout` | override the server timeout for this call |
| `signal` | an external abort signal |
| `validateStatus` | which statuses resolve instead of throwing. `null` accepts everything |
| `transformResponse` | replace the default JSON parsing, see below |
| `params`, `credentials`, `cache`, `mode`, `redirect`, `referrer`, `referrerPolicy`, `integrity`, `keepalive` | passed to `fetch` |

`transformResponse` receives the body as **text** and returns whatever the caller should see, replacing
the default JSON parsing. Several transformers run in order. `transformResponseObject` builds one for
the common case, an endpoint answering with a wrapper you do not care about:

```ts
import { transformResponseObject } from '@proedis/client';

requestConfig: {
  transformResponse: transformResponseObject<ExchangeResult, TokenSpecification>(
    (response) => response.refreshToken
  )
}
```

### 🔡 Query serialization

`params` is serialized in the format the previous axios based transport produced, **byte for byte**,
because a server binding `ids[]=1&ids[]=2` differently from `ids[0]=1&ids[1]=2` fails silently and only
in production:

```ts
{ page: 1, q: 'a b' }                  // page=1&q=a+b
{ ids: [ 1, 2 ] }                      // ids%5B%5D=1&ids%5B%5D=2
{ filter: { name: 'marco' } }          // filter%5Bname%5D=marco
{ rows: [ { id: 1 }, { id: 2 } ] }     // rows%5B0%5D%5Bid%5D=1&rows%5B1%5D%5Bid%5D=2
{ from: new Date(0) }                  // from=1970-01-01T00:00:00.000Z
{ a: null, b: undefined, c: 0 }        // c=0
```

The rules, all of them measured against real requests: nil values are dropped at any depth while `0`
and `''` are kept, a `Date` becomes its ISO string, an array of scalars **at the top level** uses the
empty-bracket form and every other array uses indices, and objects nest by key.

### 📎 Uploads

Pass files, one or many per field, and the multipart body is assembled for you:

```ts
await client.request({
  url   : '/documents',
  method: 'POST',
  data  : { title: 'Contract' },
  files : {
    document: someBlob,
    scans   : [ anotherBlob, oneMoreBlob ]
  }
});
```

Anything else in `data` is flattened into the same body, and `formData: true` forces a multipart request
even when there are no files.

⚠️ **Three file shapes are accepted, and they are not equally portable.** This is worth knowing before
one of them fails on a platform you did not test:

| Shape | Works on | Why |
| --- | --- | --- |
| a `Blob` (or a `File`) | **everywhere** | what `FormData` takes natively |
| `{ base64, type, name }` | **everywhere** with a global `atob`: every browser, Node 16+, React Native 0.74+ | decoded into a `Blob` before being appended |
| `{ uri, type, name }` | **React Native only** | React Native's `FormData` accepts a descriptor object, where a spec compliant one throws |

So the only genuinely platform bound shape is the uri descriptor, which is React Native's own extension.
A `Blob` or a base64 descriptor travels anywhere.

⚠️ Never set `Content-Type` yourself on a multipart request. A multipart body carries a boundary only
the platform can generate, so the header has to be left for it to fill in — the client removes it if
you set it.

### 🔑 Token handshakes

A *handshake* owns one token: where it comes from, how long it is valid, where it is stored, and how it
rides on a request. Declare one per token, then say `useTokens: { accessToken: true }` on the requests
that need it — everything else happens on its own.

| Option | Default | What it does |
| --- | --- | --- |
| `extractors` | | where a token can be **read from**, see below |
| `grant` | | a request performed to obtain a token when no valid one is stored |
| `transporters` | | how the token **rides** on a request, see below |
| `persistency` | `'local'` | `local`, `session` or `page` |
| `validityThreshold` | `0` | milliseconds before real expiry at which a token is already considered expired — the margin that keeps a token from expiring *during* the request that carries it |
| `checkValidity` | | replace the built-in validity check entirely |
| `transformGrantResponse` | | reshape a grant response before it is validated and stored |
| `invalidateAuthOnGrantError` | `true` | a failed grant flushes the whole client authentication, rather than only this token |
| `isManuallyControlled` | `false` | never clear this token automatically — for one you set yourself with `client.setToken` |

#### Extractors — where a token comes from

| Extractor | Reads the token from |
| --- | --- |
| `authResponseExtractor(extract)` | the response of `login` / `signup`. Pass a function, or a per-action map |
| `grantResponseExtractor(fromGrantOf, extract)` | the grant response of **another** token — how a refresh token and an access token arrive together |
| `queryParamExtractor(extract, hideWhenExtracted?)` | the query string of the current url, for a token handed over by a redirect. Removes it from the address bar afterwards |
| `plainTokenExtractor(token)` | a literal string, for a static API key |

#### Transporters — how it rides

| Transporter | Sends it as |
| --- | --- |
| `bearerTransporter(isDefault?)` | `Authorization: Bearer <token>` |
| `headerTransporter(name, isDefault?)` | a header of your choosing |
| `queryParamTransporter(name, isDefault?)` | a query parameter |

`useTokens` picks one: `true` uses the default transporter (or the first declared), a string picks by
type, `false` explicitly sends nothing.

```ts
useTokens: { accessToken: true, apiKey: 'query', refreshToken: false }
```

#### What happens on a request that needs a token

1. A valid stored token is used as it is.
2. Otherwise the extractors are tried, in order.
3. Otherwise the `grant` request runs — and its response is offered to every **other** handshake too,
   which is how one call can deliver several tokens.
4. If none of that produces a valid token, the handshake fails and — unless
   `invalidateAuthOnGrantError` is off — the whole authentication is flushed.

Concurrent requests are collapsed: while a token is being retrieved, every other caller waits on the
same operation. Five parallel requests needing the same expired token produce **one** grant.

### 🧭 The `Client` instance

#### Requests

| Member | |
| --- | --- |
| `request<R>(config, signal?)` | performs the request, throws `RequestError` |
| `safeRequest<R>(config, signal?)` | returns a discriminated `[ error, response ]` tuple: exactly one side is ever filled, so checking either narrows the other |
| `request$<R>(config)` | an `Observable`, aborting the request on unsubscribe |
| `compileRequest<R>(config)` | resolve a request function and merge the defaults, without sending |
| `createUrl(config)` | the full url a request would be sent to |
| `baseUrl` | the base url. **Throws** if none was configured |
| `useHeader(name, value)` | set a default header for every request, `null` removes it |

#### Authentication

| Member | |
| --- | --- |
| `login(data)` | calls the `login` endpoint, extracts tokens and user data, reloads the state |
| `signup(data)` | the same through the `signup` endpoint |
| `logout()` | calls the `logout` endpoint, then flushes the authentication |
| `getUserData()` | calls the `getUserData` endpoint |
| `flushAuth()` | clears every token and the user data, without calling the server |
| `forceReload()` | discards the state and runs the whole initialization again |

#### Tokens

| Member | |
| --- | --- |
| `getToken(name)` | a valid token specification, granting one if needed |
| `setToken(name, specification)` | store a token explicitly |
| `getTokenHandshake(name)` | the handshake itself, for `clear()`, `isValid()` and the rest |

#### State and storage

`client.state` and `client.storage` are both observable, persisted stores:

```ts
client.state.value;                    // read synchronously
client.state.subscribe(onNext);        // a Subscription to unsubscribe
client.state.asObservable();           // an rxjs Observable
await client.storage.set('theme', 'dark');
await client.storage.transact((data) => ({ ...data, seen: data.seen + 1 }));
await client.storage.isInitialized();  // resolves once the first read completed
```

| `ClientState` field | |
| --- | --- |
| `isReady` | the client finished initializing |
| `isLoaded` | the first initialization attempt completed, successfully or not |
| `hasAuth` | whether user data is present — narrows `userData` when true |
| `userData` | the user data, or `null` |

⚠️ Treat an emitted value as **read only**. The value a subscriber receives is the one the store keeps,
so mutating it changes client state without persisting anything. Use `set` or `transact`.

#### Lifecycle

`dispose()` releases the client: every handshake, both stores, and every subscription taken out on them.
Reach for it wherever a client stops being the current one rather than the process ending — a hot
reload replacing it, a tenant switch, a test tearing down its fixture:

```ts
useEffect(() => {
  const client = buildClient();

  return () => client.dispose();
}, []);
```

#### Static helpers

| Member | |
| --- | --- |
| `Client.sanitizeUrl(url)` | strip leading and trailing slashes, and encode |
| `Client.areDataEquals(a, b)` | the hash comparison the stores use to decide whether to emit |
| `Client.toFormData(object, formData?, parentKey?)` | flatten an object into a `FormData` |
| `Client.blobFromBase64(base64, contentType, sliceSize?)` | a `Blob` from base64, accepting a data uri and deducing the content type from it |

### 💾 Storage providers

Storage is injected, which is what makes the client platform agnostic. Three persistency levels —
`local`, `session`, `page` — each keyed `<AppName>::AppClient::Storage::<namespace>`.

| Provider | |
| --- | --- |
| `BrowserStorageProvider()` | the default: `localStorage`, `sessionStorage` and an in-page store |
| `TemporaryStorage` | in memory, for tests and for Node |
| `Store2SStorage` | the adapter the browser provider is built from |

`@proedis/react-native-client` ships an `AsyncStorage` backed provider. Any object satisfying
`StorageApi` — `name`, `get`, `set` — will do:

```ts
.useProvider('storage', { local: myStore, session: myStore, page: myStore })
```

### ❗ Errors

Every failure surfaces as a `RequestError`:

| Field | |
| --- | --- |
| `statusCode` | the HTTP status, `500` when there was no response |
| `error` | the ProblemDetails `title`, or the failure kind |
| `message` | the ProblemDetails `detail` |
| `method`, `url` | the request that failed |
| `response` | the parsed error payload |
| `stack`, `original` | the underlying error |

Underneath it, `TransportError` describes the transport failure and is exported for the cases where the
distinction matters — its `kind` is `status`, `abort`, `network` or `parse`. A timeout and a caller
abort both arrive as `abort`, told apart by the message.

### 🌍 Environment dependent options

Any first-level key of a settings object may be a plain value **or** a per-environment map, resolved
against `process.env.NODE_ENV`:

```ts
.withServer({
  domain : { development: 'localhost', production: 'api.proedis.net' },
  port   : { development: 5001, production: 443 },
  secure : { development: false, production: true }
})
```

### 🎁 Variants

`GeaAuthenticatedClient` is a pre-wired builder for the Gea identity provider, and doubles as the
reference for a non-trivial setup: four tokens, a ticket arriving by query parameter, a refresh token
exchanged on a different host, and an access token granted from the refresh one.

## 🧠 How initialization actually works

The constructor returns immediately and the client initializes in the background — which is why
`state.isLoaded` exists. On the first initialization the client tries to load user data (through the
`getUserData` endpoint, or through whatever `userDataExtractor` says), and whether that succeeds decides
`hasAuth`. Requests issued before it finishes are not queued: they run, and the token handshakes make
sure each one carries a valid token.

`extras.invalidateExistingAuth` runs *before* that, which is where you drop a stored authentication your
new application version cannot use.

## 🔀 Migrating to 3.x

The whole HTTP layer changed underneath, while the surface stayed as close as it could.

| Change | What to do |
| --- | --- |
| **axios is gone**, the transport is `fetch` | Nothing, for a normal request. The runtime now needs `fetch`, `AbortController` and `FormData` — every browser since 2017, Node 18+, React Native 0.63+. |
| `requestConfig` is `RequestInitConfig` | Headers, params, timeout and signal are unchanged. An axios-only option — `responseType`, `paramsSerializer`, `adapter`, an interceptor — has no equivalent, and was used nowhere. |
| `baseURL` inside `requestConfig` → `baseUrl` | Rename. |
| `axiosConfig` in settings → `transportConfig` | Rename. |
| `ClientBuilder.withAxiosDefault` → `withTransportDefault` | Rename. |
| `transformAxiosResponseObject` → `transformResponseObject` | Rename. The old name still works as a `@deprecated` alias, and the contract is unchanged. |
| `Content-Type` on multipart requests | Stop setting it. It used to be set to `multipart/form-data`, which worked only because axios rewrote the header; the boundary can only come from the platform. |
| `logdown` is gone | Nothing. Log output keeps its prefix and colour; `logger` options are unchanged. |

And the bug fixes, three of which changed behaviour you may have worked around:

| Fixed | Before |
| --- | --- |
| A token retrieval could hang **forever** | A throwing `transformGrantResponse` or `checkValidity`, or a failure while sharing a grant response with sibling handshakes, left the pending operation unsettled. From then on every request needing that token waited on a promise that would never settle — silently, until a reload. |
| Concurrent callers got `undefined` as an error | The caller that started a retrieval received a `RequestError`; everybody waiting alongside it received nothing at all. |
| `Logger.configure` did nothing after the first logger existed | Each logger snapshotted the defaults in its constructor, so configuring from a second client's settings was ignored. |
| No way to release a client | There is `dispose()` now. A client replaced by a hot reload or a tenant switch used to leave its subjects alive together with every subscriber. |
| A caller could corrupt client state by accident | The store shared nested objects with whatever was passed to `set`, so mutating your own object afterwards wrote into client state, bypassing `set` and `transact` — nothing persisted, nothing emitted. |
| `safeRequest` declared a response that was not there | It was typed `[ RequestError \| null, Response ]` and returned `null as Response` on failure, so a caller reading the response without checking the error held a null the compiler swore was a value. It is a discriminated tuple now. |
| `Client.blobFromBase64` was browser only | It reached for `window.atob` behind an `isBrowser` guard, which made the whole base64 upload path browser only for no reason beyond the property lookup. It probes for a global `atob` instead, so base64 files work in Node and React Native too. |

## 🤝 Compatibility

| Requirement | Range |
| --- | --- |
| `rxjs` | `^7.0.0` (peer) |
| `class-transformer` | `^0.5.1` (peer) |
| `reflect-metadata` | `^0.1.13 \|\| ^0.2.0` (peer) |
| `typescript` | `>=5.2.0` |
| Runtime | `fetch`, `AbortController`, `FormData` — browsers since 2017, Node 18+, React Native 0.63+ |

Runtime dependencies: `store2` for browser storage, plus `@proedis/types` and `@proedis/utils`. No HTTP
library.

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
