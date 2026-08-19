<div align="center">

# `@proedis/react-native-client`

**One import, and `@proedis/client` persists on React Native instead of reaching for a `localStorage`
that isn't there.** 📱

[![npm](https://img.shields.io/npm/v/@proedis/react-native-client.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/react-native-client)
[![license](https://img.shields.io/npm/l/@proedis/react-native-client.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

A storage provider, and the class behind it. That is the whole package. 🪶

| Export | Is |
| --- | --- |
| `ReactNativeStorageProvider()` | the `StorageProvider` to hand to `@proedis/client` |
| `NativeAsyncStorage` | the `StorageApi` implementation on top of AsyncStorage, exported for when you want to compose your own provider |

`@proedis/client` keeps its persistence behind a `StorageProvider` precisely so the platform can be
swapped: on the web it is `localStorage` and `sessionStorage`, here it is AsyncStorage. Nothing else
about the client changes.

## 📦 Installation

```bash
yarn add @proedis/react-native-client
```

**`@react-native-async-storage/async-storage` is a required peer**, not an optional one: the whole
package is a thin adapter over it, and it has to be *your* copy — a second instance of a native
module is a different store, not a shared one. `@proedis/client` is a peer for the same reason.

## 🚀 Quick start

```ts
import { ClientBuilder } from '@proedis/client';
import { ReactNativeStorageProvider } from '@proedis/react-native-client';

export const client = new ClientBuilder('MyApp')
  .useProvider('storage', ReactNativeStorageProvider())
  .withServer({ domain: 'api.example.com', namespace: 'v1', secure: true })
  .build();
```

Without that one line the client falls back to `BrowserStorageProvider()`, which reaches for a
`localStorage` React Native does not have.

From here the client behaves exactly as it does on the web: tokens survive a restart, `client.state`
and `client.storage` stay observable, and everything in `@proedis/react-client` keeps working.

## 📖 API

### 📦 `ReactNativeStorageProvider()`

Returns a fresh provider mapping each persistency to a backend:

| Persistency | Backed by | Survives an app restart |
| --- | --- | --- |
| `local` | `NativeAsyncStorage` → AsyncStorage | ✅ |
| `session` | in-memory | ❌ |
| `page` | in-memory | ❌ |

⚠️ **`session` is not persistent here.** The web has a `sessionStorage` that outlives a reload;
React Native has no equivalent, so a token declared with `persistency: 'session'` lives for as long
as the JS runtime does and is gone after a restart. If a token has to survive one, declare it
`local`.

### 🗄️ `NativeAsyncStorage`

Implements `StorageApi` — `name`, `get`, `set` — over AsyncStorage, with two behaviours worth
knowing:

- **Keys are namespaced with `@`.** `getKey` prefixes anything that does not already start with one,
  which is the AsyncStorage convention. A key you wrote yourself as `@MyApp::…` is left alone.
- **Values round-trip through JSON**, and a value that fails to parse resolves to the `alternative`
  rather than throwing — a store holding something unreadable degrades to "empty", it does not take
  the app down with it.

`set(key, data, overwrite?)` skips writing when a value is already there and `overwrite` is falsy,
and **removes** the key when `data` is nullish.

The class also unwraps a `default` export from the AsyncStorage module when it finds one, because
some bundler and transpiler combinations hand it over that way.

## 🔀 Migrating to 2.x

| Was | Is now |
| --- | --- |
| `react` was declared a peer dependency | dropped — this package never imported React, and a storage adapter has no reason to require it. Your React Native app has React anyway |

## 🤝 Compatibility

| Requirement | Range |
| --- | --- |
| `@proedis/client` | `^2.5.0` |
| `@react-native-async-storage/async-storage` | `>=1.18.0 <4.0.0` |
| `typescript` | `>=5.2.0` |
| Runtime | ES2022 — any Hermes or JSC build shipping with a supported React Native |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
