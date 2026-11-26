---
paths:
  - "packages/react/**"
---

# `@proedis/react`

Moved verbatim from the root `CLAUDE.md`.

### `useSyncedRef` is the backbone of the React hooks

Seven hooks in `@proedis/react` are built on it, and Orbit uses it directly in 13 places. It writes its
ref **during render**, which is what makes the value current for the commit it belongs to — and which
is why `react-hooks/refs` is suppressed inline, in that file, with the reasoning. Every alternative
loses the guarantee the hook exists for: writing in an effect makes `current` lag one commit behind,
which is the exact bug its callers are avoiding. Read it from an effect, a handler or a cleanup, never
while rendering.

Public signatures must avoid `React.RefObject`, `React.MutableRefObject` and
`ReturnType<typeof React.useRef<T>>`: those changed meaning between `@types/react` 18 and 19. Use
minimal structural shapes — `useForkRef` takes `{ current: T | null | undefined }` for that reason. The
18/19 matrix is verified by compiling the **emitted declarations** against both, with `skipLibCheck`
off, from outside the workspace; re-run it after touching any public React signature.

