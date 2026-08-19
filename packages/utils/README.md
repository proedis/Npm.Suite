<div align="center">

# `@proedis/utils`

**The small functions you would otherwise rewrite in every project, written once and typed
properly.** 🧰

[![npm](https://img.shields.io/npm/v/@proedis/utils.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/utils)
[![license](https://img.shields.io/npm/l/@proedis/utils.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

| Module | Entry point | What lives there |
| --- | --- | --- |
| **array** | `@proedis/utils/array` | `sorter` — a chainable, multi-criteria sorter — and `areArraysStrictEqual` |
| **object** | `@proedis/utils/object` | `getValueAt` / `setValueAt` typed path access, `mergeObjects`, `deepClone`, `deepFreeze`, `isObject`, `isPlainObject`, `AugmentedMap` — zero runtime dependencies beyond `get-value`, `set-value` and `ts-deepmerge` |
| **promise** | `@proedis/utils/promise` | `will` — errors as values — and `Deferred` |
| **guard** | `@proedis/utils/guard` | `Guard`, a fluent way to assert an invariant and throw a specific error |
| **hash** | `@proedis/utils/hash` | `getHash`, `hasEqualHash` |
| **string** | `@proedis/utils/string` | `toKebabCase`, `isValidString`, `isValidGuid` |
| **runtime** | `@proedis/utils/runtime` | `isBrowser` |
| *(root)* | `@proedis/utils` | everything above, plus `isNil` |

Every module is importable on its own, and the package is marked side-effect free, so a bundler
drops whatever you did not use. 🌳

## 📦 Installation

```bash
yarn add @proedis/utils dayjs
```

`dayjs` is a **required** peer, not an optional one: the sorter compares Day.js values natively, and
it has to see *your* copy of the library for `dayjs.isDayjs` to recognise them.

## 🚀 Quick start

```ts
import { Guard, sorter, will } from '@proedis/utils';

/** Sort by several criteria, on typed paths, without touching the source array */
const ordered = sorter(invoices)
  .orderBy('customer.name')
  .thenByDescending('issuedAt')
  .sort();

/** Get the error as a value instead of wrapping half the function in a try block */
const [ error, user ] = await will(client.get<User>('users/me'));

if (error) {
  notify.failure(error.message);
  return;
}

user.displayName; // 👈 narrowed to User, no assertion needed

/** Assert an invariant inline, and keep the narrowing */
const token = Guard.andThrow(ReferenceError, 'no access token').ifNil(storage.get('token'));
```

## 📖 API

### 🔤 `sorter(data)` — chainable sorting

Declare the criteria, then run it. Each step only gets a say when every step before it produced a
tie, so the chain behaves like one composite sort rather than three independent ones.

```ts
sorter(users)
  .orderByDescending('isActive')   // typed dot notation path…
  .thenBy((user) => user.roles.length)   // …or an accessor function
  .sort({ placeNil: 'before', compareStringCase: 'sensitive' });
```

| Method | What it does |
| --- | --- |
| `orderBy(comparer)` / `orderByDescending(comparer)` | the first criterion |
| `thenBy(comparer)` / `thenByDescending(comparer)` | a tie breaker, chainable as many times as you like |
| `sort(options?)` | runs the chain and returns a **new** array |

`SortOptions`:

| Option | Default | Meaning |
| --- | --- | --- |
| `compareStringCase` | `'insensitive'` | whether string comparison takes case into account |
| `placeFalse` | `'after'` | where `false` values go relative to `true` ones |
| `placeNil` | `'after'` | where `null` / `undefined` go relative to everything else |

Strings are compared **naturally**, so `item2` sorts before `item10`. `Date` and Day.js values are
understood out of the box, and any class can join in by implementing `ISortable`:

```ts
class Money implements ISortable<number> {
  constructor(public readonly amount: number, public readonly currency: string) {}

  public getSortableValue(): number {
    return this.amount;
  }
}

sorter(invoices).orderByDescending('total').sort(); // total is a Money, and it just works
```

⚠️ Mixing types inside one criterion throws: sorting a column that holds both numbers and strings is
a data problem, and failing loudly beats an arbitrary order.

### 🗂️ Typed path access

```ts
const settings = { server: { host: 'localhost', port: 8080 }, tags: [ 'a', 'b' ] };

getValueAt(settings, 'server.port'); // 8080, typed as number
getValueAt(settings, 'tags.1');      // 'b'
getValueAt(settings, 'server.nope'); // ❌ compile error, not a valid path

setValueAt(settings, 'server.port', 443);
setValueAt(settings, 'server.port', (current) => current + 1);       // updater form
setValueAt(settings, 'server.port', 9000, { immutable: true });      // works on a deep clone
```

The path is autocompleted and compile checked against the object, and the value type follows the
path — both directions. `setValueAt` creates missing intermediate objects along the way, and
**mutates the source unless you pass `{ immutable: true }`**.

### 🤝 The rest of `object`

| Function | Notes |
| --- | --- |
| `mergeObjects(...objects)` | Recursive merge, left to right. Nested objects are merged key by key; **arrays are replaced**, the rightmost one winning. |
| `deepClone(value)` | A real deep copy: `Map` / `Set` **contents** included, class instances rebuilt **on their own prototype**, property descriptors preserved, cycles and shared references handled. The copy is always **writable**, even when the source was frozen — a clone exists to be modified. Functions, promises and weak collections are shared, none of them having a meaningful copy. |
| `deepFreeze(value)` | Freeze a value and everything reachable from it, **in place**. Real protection on objects and arrays — a write, an addition or a `push` all throw. ⚠️ Not on exotic objects: a frozen `Date` still moves under `setTime`, a frozen `Map` still accepts `set`. Pair it with `deepClone` when the source must stay mutable. |
| `isObject(value)` | Non nil, non array object. A `Date` passes: it *is* an object. |
| `isPlainObject(value)` | Object literal or null-prototype object only. The one to use before iterating own keys. |
| `AugmentedMap` | A `Map` with `getOrAdd(key, factory)`, where the factory runs **only** on a miss. |

### ⏳ `promise`

#### `will(promise)`

Returns `[ null, data ]` on success and `[ error, null ]` on failure, as a **discriminated** tuple:
checking one position narrows the other, so no non-null assertion is left behind. A plain value is
accepted too, for callers handing over something that only *might* be asynchronous.

```ts
const [ error, page ] = await will(loadPage());
```

💡 The error defaults to `Error`. A rejection can technically carry anything, so `unknown` would be
the pedantic default — but TypeScript cannot discriminate a tuple on a position that is not disjoint
from `null`, and `unknown` throws the narrowing away. Say so explicitly when it matters:
`will<Page, ApiProblemDetails>(loadPage())`.

#### `Deferred<T>`

A promise whose `resolve` and `reject` are handed to you, for when the thing that settles a promise
is not the thing that created it. Exposes `promise`, `resolve`, `reject`, `isPending`,
`isFulfilled`, `isRejected` — and throws on a second settle, because a double settle means two code
paths both believed they owned the outcome.

### 🛡️ `guard`

```ts
const token = Guard.andThrow(ReferenceError, `token '${name}' is not stored`).ifNil(tokens.get(name));
```

The error class and its arguments are stated once, up front, and the error is only constructed if an
assertion actually fails — so the stack trace points at the failing check. Every assertion returns
the value it validated, which lets a guard sit inline in the assignment that needed it.

| Assertion | Throws when |
| --- | --- |
| `if(condition)` | the condition is `true` |
| `ifNot(condition)` | the condition is `false` |
| `ifNil(value)` | the value is `null` / `undefined` — returns it narrowed |
| `ifNotNil(value)` | the value is present |
| `ifNullOrEmpty(value)` | nil, or an empty string / array / `Map` / `Set` / plain object. `0`, `false` and a `Date` all pass. |
| `ifIn(value, collection)` | the value **is** in the collection (deny list) |
| `ifNotIn(value, collection)` | the value is **not** in the collection (allow list) |

### 🔑 `hash`

`getHash(value)` returns a SHA-1 fingerprint, and `hasEqualHash(a, b)` compares two values through
it — short circuiting on nil values and on primitives. Both are **order sensitive**: two objects with
the same entries in a different key order hash differently.

⚠️ SHA-1 here is a fast fingerprint for change detection, never a security primitive.

### 🧵 `string`, `runtime` and `isNil`

| Function | Notes |
| --- | --- |
| `toKebabCase(value)` | `'parseURLFromString'` → `'parse-url-from-string'`. Acronyms stay together. |
| `isValidString(value)` | a string with at least one character — `''` does not count |
| `isValidGuid(value)` | the canonical 8-4-4-12 form, case insensitive. Braced and urn forms are rejected. |
| `isBrowser` | evaluated once on import, by probing `window`, `navigator` and `document` together |
| `isNil(value)` | `null` or `undefined`, as a type guard |

## 🔀 Migrating to 2.x

Bug fixes first, because two of them changed behaviour that you may have been working around:

| Fixed | Before | Now |
| --- | --- | --- |
| `sorter(...).sort()` | sorted the **source array in place** and returned that same reference — a silent mutation of whatever you passed in, React state included | sorts a copy, source untouched |
| `isValidGuid` | never exported, and its regular expression carried the `g` flag: the same valid value alternated between `true` and `false` on consecutive calls | exported, and stable |
| `Guard.ifIn` / `ifNotIn` | asserted the **opposite** of their names — `ifNotIn` accepted a value absent from the list | `ifIn` is a deny list, `ifNotIn` is an allow list |
| `Guard.ifNullOrEmpty` | threw for any non-string, non-object value: `0`, `false` and every `Date` were reported as "empty" | only strings, arrays, `Map`s, `Set`s and plain objects can be empty |

Then the renames and signature changes:

| Change | What to do |
| --- | --- |
| `will()` returns a discriminated tuple | Check the error — or the data — before using the other side. Where you previously wrote `const [ , data ] = await will(…)` and used `data` straight away, the compiler now asks you to handle the failure. |
| `will()`'s error defaults to `Error` | Pass the type when a rejection carries something else: `will<T, MyError>(…)`. |
| `areArrayStrictEquals` → `areArraysStrictEqual` | Rename. The old name still works as a `@deprecated` alias, removed in the next major. |
| `getValueAt` returns `undefined` for an unresolvable path | It used to coerce that case to `null`. Only reachable when the object does not really match its declared type, or an optional property is unset. |
| `deepClone` is a real deep copy now | Nothing, unless you *relied* on a class instance being shared between source and copy. It used to hand class instances over by reference at any depth, clone a `Map` container without its contents, and overflow the stack on a circular structure. `clone-deep` is gone as a dependency. |
| `deepClone` normalizes writability | The copy's properties are always writable and configurable, where they used to inherit the source's descriptors. Cloning a frozen object produced a copy that silently refused assignment — which defeats the point of cloning it. Enumerability is still preserved, because that describes the shape. |
| New: `deepFreeze` | Nothing — purely additive. |
| `mergeObjects` replaces arrays instead of concatenating them | Check any merge where both sides carry a list. The old behaviour doubled up on anything list shaped — an axios `transformResponse` merged with a default one ran both transforms. |
| `toKebabCase('')` returns `''` | Nothing, unless you tested the result for `undefined`. An empty input used to fall through the match and return `undefined` rather than a string, so the declared `string` return was a lie for exactly one input. |
| `@proedis/utils/generics` → `@proedis/utils/hash` | Only affects deep imports. `getHash` and `hasEqualHash` moved; `isNil` now lives at the root. |
| `@proedis/utils/constants` → `@proedis/utils/runtime` | Only affects deep imports. |
| New: subpath entry points, `isPlainObject`, exported `ISortable` / `SortOptions` / `GuardAndThrow` / `WillResult` | Nothing — purely additive. |

## 🤝 Compatibility

| Requirement | Range |
| --- | --- |
| `dayjs` | `>=1.11.0` (required peer) |
| `typescript` | `>=5.2.0` |
| Runtime | ES2022 — roughly Safari 16.4 / Chrome 94 / Node 16.11 |

Resolution is verified from outside the workspace against `moduleResolution` `node`, `bundler` and
`nodenext`, through both `require()` and native `import`.

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
