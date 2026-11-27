---
paths:
  - "packages/*/package.json"
  - "packages/react*/src/**"
---

# Peer dependencies and the React range

Moved verbatim from the root `CLAUDE.md`.

### Peer compatibility policy

Published peer ranges are deliberately wider than the versions pinned here: `react`
`>=18.0.0 <20.0.0`, `reflect-metadata` `^0.1.13 || ^0.2.0`, `class-transformer` `^0.5.1`,
`@tanstack/react-query` `^5.0.0`, `rxjs` `^7.0.0`, `dayjs` `>=1.11.0`, `zod` `^4.0.0`,
`react-hook-form` `^7.55.0`, `@hookform/resolvers` `>=5.1.0 <8.0.0`,
`tailwindcss` `^4.1.5`, `eslint` `>=9.0.0 <10.0.0`, `@react-native-async-storage/async-storage`
`>=1.18.0 <4.0.0`, `typescript` `>=5.2.0`.

`tailwindcss` is the one range set by measurement rather than widened: only `@proedis/ui` declares it,
and its stylesheet was compiled with each candidate floor. 4.0 does not compile it (`@source inline`
arrived in 4.1); 4.1.0 to 4.1.4 compile it but miss `h-lh`, the box that centres the error mark on
the first line of its message; from 4.1.5 the classes generated are the same set as the latest 4.x.
`1.0.0` and `1.0.1` of the package were published with `^4.0.0`, a range that never worked.

⚠️ `@proedis/ui` is the exception on React: it declares `>=19.0.0 <20.0.0`. It is compiled by the React
Compiler against `react/compiler-runtime`, and on 19 `ref` is a prop, which its polymorphic primitives
rely on to forward one without `forwardRef`. The other React packages keep the 18 floor.

⚠️ `react-dom` is **not** a peer of anything here and must not be added as one: no package in the
suite imports it. The React range above covers `react` alone.

The **in-suite** peers are the exception to the width, because they are reflected from the installed
version rather than stated: `@proedis/client`, `@proedis/react`, `@proedis/react-client` are
published as a caret over whatever this repository had at build time. That is why a README stating
one of those ranges goes stale at the next cascade, and why they are worth re-reading from the built
manifest rather than from memory.

The React range is not a guess — it is verified by compiling the **emitted `.d.ts`** of `react`,
`client` and `react-client` against `@types/react` 18 and 19 with `skipLibCheck: false`, from a
directory outside the workspace holding only the declared dependencies. Two hooks needed fixing
to hold it: `useForkRef` and `useClickOutside` both typed their parameters through React aliases
whose meaning changed between the two majors (`useRef<T>(null)` yields `RefObject<T>` in 18 and
`RefObject<T | null>` in 19). Both now use minimal structural shapes. **Re-run that check before
widening or narrowing the React range, and prefer structural ref shapes over `React.RefObject` /
`React.MutableRefObject` / `ReturnType<typeof React.useRef<T>>` in any new public signature.**

`dayjs` is a **required** peer of `utils`, not optional: `ArraySorterStep` imports it at module
top level and `utils/index` always pulls that module in. A peer is also the semantically correct
field — `dayjs.isDayjs` must see the consumer's own dayjs copy.

