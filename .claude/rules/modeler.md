---
paths:
  - "packages/modeler/**"
---

# `@proedis/modeler`

Moved verbatim from the root `CLAUDE.md`.

### The mappers carry .NET semantics, and they are load-bearing

`TimeSpan` renders and parses the .NET duration format `[-][d.]hh:mm:ss[.fff]` — the days component is
separated by a **dot**. It used to be emitted with a colon, which meant any duration of a day or more
produced a string `TimeSpan.parse` refused, and since `AsTimeSpan` serializes through `toString` such a
value could not survive a round trip through an API. Any change to that format has to keep
`parse(x.toString())` equal to `x` for a value with days, negative included.

`toJSON` on `ModelerObject`, `Flags`, `Enum` and `TimeSpan` is the hook `JSON.stringify` invokes, so it
takes **no arguments** and returns a value, never a JSON string. All four used to return strings, which
made `JSON.stringify` encode them a second time: a model nested in a payload came out as
`{"user":"{\"id\":7}"}`. The explicit string form lives on `toJsonString`.

`DateTime` is exported as both a type and a value — the type is a Day.js instance, the value is the
`dayjs` factory. The value half exists because 224 files in Orbit import the name through a plain value
import alongside the decorators; it used to be `export const DateTime = Dayjs`, and `dayjs` does not
expose `Dayjs` at runtime, so the published constant was `undefined`.

