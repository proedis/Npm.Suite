<div align="center">

# `@proedis/types`

**The handful of type primitives every Proedis package agrees on, so `Nullable<T>` means the same
thing in all of them.** 🧬

[![npm](https://img.shields.io/npm/v/@proedis/types.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/types)
[![license](https://img.shields.io/npm/l/@proedis/types.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

Eleven types. No runtime logic, no dependencies, nothing to configure. 🪶

- **Absence** — `Nullable`, `Nillable`
- **Value shapes** — `Primitive`, `Awaitable`
- **Object shapes** — `AnyObject`, `ValueOf`, `DeepPartial`
- **Object navigation** — `ObjectPath`, `ValueAtPath`, the pair that makes `getValueAt('a.b.c')`
  type safe
- **Classes** — `Instantiable`
- **Environment** — `Environment`

## 📦 Installation

```bash
yarn add @proedis/types
```

It belongs in `dependencies`, not `devDependencies`: if any of your published `.d.ts` files
mentions one of these types, your consumers have to be able to resolve it too.

## 🚀 Quick start

```ts
import type { DeepPartial, Nullable, ObjectPath, ValueAtPath } from '@proedis/types';

interface User {
  id: string;
  profile: { displayName: string; avatar: Nullable<string> };
}

/** A typed accessor: the return type follows the path the caller asked for */
declare function read<T extends AnyObject, P extends ObjectPath<T>>(source: T, path: P): ValueAtPath<T, P>;

const name = read(user, 'profile.displayName'); // string
const oops = read(user, 'profile.nickname');    // ❌ compile error, no such path

/** A partial override of a deeply nested settings object */
const overrides: DeepPartial<User> = { profile: { avatar: null } };
```

## 📖 API

### Absence

| Type | Resolves to | Use it when |
| --- | --- | --- |
| `Nullable<T>` | `T \| null` | `null` is a meaningful, expected outcome |
| `Nillable<T>` | `T \| null \| undefined` | the two flavours of absence are interchangeable — which is most of the time |

### Value shapes

| Type | Resolves to | Use it when |
| --- | --- | --- |
| `Primitive` | `string \| number \| bigint \| boolean \| symbol \| null \| undefined` | you need the terminal branch of a recursive type |
| `Awaitable<T>` | `T \| Promise<T>` | you always `await` a user supplied callback, and want to let it stay synchronous |

### Object shapes

#### `AnyObject`

```ts
type AnyObject = { [key: string]: any };
```

The deliberate escape hatch used as a generic constraint across the suite
(`<T extends AnyObject>`), where the meaning is *"some object, whichever one you pass"*.

⚠️ It is **not** the type for a variable you are about to read from. That is
`Record<string, unknown>`, and it will make the compiler ask you the questions `AnyObject` lets you
skip.

#### `ValueOf<T>`

```ts
const Role = { admin: 'admin', guest: 'guest' } as const;

type Role = ValueOf<typeof Role>; // 'admin' | 'guest'
```

The companion of `keyof`, and the idiomatic way to turn a `const` object used as an enum into the
type of its members.

#### `DeepPartial<T>`

Recursively marks every property optional. Arrays are walked through their element type, while
primitives, `Date`, `RegExp` and functions are handed back untouched — mapping over the members of
a `Date` produces an object that satisfies nothing.

```ts
type Settings = { server: { port: number }; createdAt: Date; tags: string[] };

type Overrides = DeepPartial<Settings>;
// { server?: { port?: number }; createdAt?: Date; tags?: string[] }
```

### Object navigation

#### `ObjectPath<T>`

Every dot notation path that can be walked inside an object, as a string literal union. Array and
tuple indexes are included, so a path can cross a collection — and because the result is a literal
union, your editor autocompletes the valid paths while you type.

```ts
type Paths = ObjectPath<{ server: { port: number }; tags: string[] }>;
// 'server' | 'server.port' | 'tags' | `tags.${number}`
```

#### `ValueAtPath<T, P>`

The type of the value found at a given path. Pair it with `ObjectPath<T>` to type an accessor whose
return type follows its argument, the way `getValueAt` and `setValueAt` in
[`@proedis/utils`](https://www.npmjs.com/package/@proedis/utils) do.

### Classes

#### `Instantiable<T>`

The class object itself, not one of its instances. For any API that receives a class to build
later — a factory, a container, an error a guard will throw:

```ts
function create<T extends AnyObject>(
  ctor: Instantiable<T>,
  ...args: ConstructorParameters<Instantiable<T>>
): T {
  return new ctor(...args);
}

const error = create(RangeError, 'out of bounds');
```

### Environment

#### `Environment`

```ts
type Environment = 'development' | 'production' | 'test' | 'staging';
```

The values `process.env.NODE_ENV` is expected to carry. Configuration objects across the suite
accept `Partial<Record<Environment, T>>` wherever a setting may differ per environment.

## 🧠 Why every type has a constant next to it

Look at the source and you will find this shape repeated:

```ts
export type Nullable<T> = T | null;
export const Nullable = Object;
```

The constant is not something you should ever use. It exists so that a plain value import stays
safe at runtime:

```ts
import { Nullable } from '@proedis/types'; // no `type` keyword
```

Under `isolatedModules` — which is to say under esbuild, SWC, Babel and every bundler that strips
types one file at a time — that statement survives compilation and would resolve a binding that was
never emitted. TypeScript merges the type and the constant into a single name, so nothing about the
type side changes.

💡 Write `import type { … }` anyway. It states the intent, and the import disappears completely.

## 🔀 Migrating to 2.x

| Change | What to do |
| --- | --- |
| `RecursivePartial<T>` → `DeepPartial<T>` | Rename. The old name still works as a `@deprecated` alias forwarding to the new one, and will be removed in the next major. |
| `DeepPartial` no longer recurses into `Date`, `RegExp` and functions | Nothing, unless you were relying on `RecursivePartial<Date>` producing an object of optional methods — which never typechecked against a real `Date`. |
| The package now ships compiled JavaScript instead of raw `.ts` | Nothing for a normal import. It stops assuming your bundler is willing to transpile TypeScript found inside `node_modules`, and adds a proper `exports` map. |
| New: `Primitive`, `Awaitable`, `ValueOf` | Nothing — purely additive. |

## 🤝 Compatibility

| Requirement | Range |
| --- | --- |
| `typescript` | `>=5.2.0` |
| Runtime | anything — the emitted JavaScript is a handful of constant assignments |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
