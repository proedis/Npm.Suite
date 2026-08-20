# CLAUDE.md — `@proedis/react-query`

## Why this package exists

It is the extraction of a pattern that had been copy-pasted across Proedis frontends for years —
`Orbit.Web/packages/ui-builders/src/query-suspense` is the ancestor, with 121 call sites — and every
copy diverged: a different UI kit, a different error type, a different place where the page title
lives. What never changed across those copies is the decision *which of five views to render*, and
that is the only thing this package owns.

The boundary is therefore: **everything that depends on how a state looks stays out.** No component
library, no styling, no copy. What comes in is a query; what goes out is one of five views the host
app supplied.

Two decisions shape the surface, both taken deliberately on 2026-08-20:

- **The HOC is the API.** In the ancestor's 121 call sites the `QuerySuspense` component is never
  used directly — not once. Every one of them goes through `querySuspenseComponent` +
  `suspendedComponent`, and any change that makes those two less ergonomic is a regression no matter
  how clean the component underneath looks.
- **The provider is optional.** This is the requirement the whole extraction started from: *«basterebbe
  aggiungere un Provider opzionale per customizzare determinate opzioni»*. A boundary with nothing
  above it works. A first draft made the provider mandatory and threw without it — that inverts the
  ask, and turns a package that works into one that must be configured before it does anything.
- **The `suspense` half presupposes `useClientQuery`.** It was briefly client-agnostic, taking a
  query hook per call site; Marco rejected that: handing over a hook *and* an arguments builder is
  noise when every consumer queries the same way. So the hook is imported, not injected, and the
  query is described by its arguments alone. That trade buys back a real property the agnostic
  version had lost — with `Parameters<typeof useClientQuery<TData>>` the **transformer is checked
  against the type the component renders**.

  Open consequence, not yet acted on: with that dependency, the `suspense` half arguably belongs
  *inside* `@proedis/react-client`, which already owns `useClientQuery`, leaving this package with
  the client-agnostic `invalidation` half. Moving it is a naming decision, not a rewrite.

## What does NOT go in here

- Any component that renders something visible. The views arrive through `QuerySuspenseProvider`.
- Any UI vocabulary. HTTP semantics reach the boundary only through the `classifyError` seam, which
  is what keeps "what a 404 means for this screen" out of the package.
- Anything client-specific in `invalidation`. That half works against a bare `QueryClient` and must
  stay that way — it is the piece a non-Proedis frontend could adopt.
- Mutations, forms, tables, selectors. This package is about *reading* a query and about *when the
  cache refreshes*, nothing else.
- A *designed* default view. The built-in `Loader` and `ErrorView` exist so the package works
  unconfigured, and they are one element each with no class, no copy and no dependency. The moment a
  default acquires styling, consumers start styling around it instead of replacing it.
- Shorthand resolution. The ancestor's `emptyContent` also accepted a props object
  (`{ icon, title, subtitle }`) resolved through `EmptyContent.create()`. Turning props into an
  element is a design-system concern: the slot here takes a node, and a consumer that wants the
  shorthand resolves it in its own adapter before passing it down.

## Structure

```
src/
  invalidation/   # gated cache invalidation — no React rendering, no client, only a QueryClient
  suspense/       # the query boundary — React and useClientQuery, still no UI
```

Both are published as subpath entry points (`proedisMetadata.exports`), so a consumer can take the
invalidation half without pulling the client. Adding a third module means adding it there **and** to
the rollup input, which the root config derives from the same field.

## Invariants

Things that look improvable and are not.

- **`resolveQueryView` is a plain function over `{ status, data, error }`, not over a
  `UseQueryResult`.** That is what makes the branch order testable on literals and reusable outside
  React. It is also the one file in `suspense/` that stays generic over the error type.
- **The names are the ancestor's names.** `Loader`, `NotFound`, `emptyContent`, `Wrapper`,
  `ContentWrapper`, `Header`, `Footer`, `pageTitle`, `resetOnUnmount`, `onDataChange` are what the
  team types from memory across 121 call sites. `ErrorView` is the only addition, because the
  ancestor hardcoded that one view instead of exposing it.
- **The query arguments are `readonly [ ...Parameters<typeof useClientQuery<TData>> ]`.** Readonly
  because a generated `getXQueryArgs()` returns `as const` and a cast at every call site would be
  absurd; bound to `TData` because that is what makes a wrong transformer a compile error.
- **Every view slot is a `SuspenseViewNode`: an element, a component, or any node.** Elements are
  rendered as they are and never cloned — the caller already built them. Demanding a component would
  force `emptyContent={<EmptyContent.EmptyThreadDefault />}` to become an arrow function at every
  call site.
- **Declaring `emptyContent` flips `isEmpty` to the array check.** The ancestor's behaviour, and the
  reason a list needs one option instead of two. Without an empty view, `isEmpty` stays `false`: a
  consumer who has not thought about the empty state gets the content, never a blank screen.
- **The skeleton keeps the same element identity in every state.** Swapping wrappers between pending
  and success remounts the subtree and loses the scroll position — the exact flicker the component
  exists to prevent.
- **The skeleton and the aside slots receive the caller's props**, merged with `{ state, reload }`.
  Wrappers read the entity they frame; that is the most-used option in the ancestor.
- **`queryArgs` builders run during render and may call hooks.** `createSingleEntityLayout` calls
  `useParams()` inside one. Do not memoize the builder or move it out of render.
- **`QuerySuspenseTitleTools` is widened by declaration merging, not by a generic.** A title
  resolver lives in a module-scope options object and cannot call a hook, so whatever it needs — a
  translation function, usually — is put in the config by the provider, which is inside React. Same
  pattern as `ContextClientOverride` in `@proedis/react-client`.
- **The error type is defaulted, not hardcoded.** Everything in `suspense/` reads
  `TError = RequestError`, so no call site ever writes it, and a consumer with a different error
  type can still parameterise the engine.
- **`debugErrors` is a config flag, not a bundler global.** The ancestor read
  `!import.meta.env.DEV` inline, which tied the file to Vite and made the behaviour invisible from
  the call site.
- **Registry state is keyed by `QueryClient` in a `WeakMap`.** Module-level singletons were the
  original shape and they are wrong: two roots in one bundle share one queue, and one closing its
  gate defers the other's invalidations.
- **`PauseGate.release` returns "was that the last holder?"**, which is what makes nesting safe.
  Anything reading it as "did the release succeed" will flush the queue too early.
- **`toInvalidateQueryFilters` casts both branches explicitly.** Narrowing a `ReadonlyArray` out of
  that union — with `in` or with `Array.isArray` — depends on the consumer's compiler configuration;
  a package that compiles here and not there is worse than one assertion.
- **`useQuerySuspenseConfig` never throws and never returns a hole.** It merges the defaults under
  whatever the providers above declared, and its return type guarantees `Loader` and `ErrorView` are
  present, so nothing downstream handles their absence. A missing provider is the supported case.
- **Defaults carry no copy.** The error view shows the error's own message; the loader shows nothing
  at all. Any wording the package invented would be in the wrong language for somebody — which is
  half of what went wrong in the ancestor, where `'Nessun Risultato'` is hardcoded in library code.
- **`reload` never rejects.** A failed refetch is already visible in the query state; a rejection
  there becomes an unhandled promise in an `onClick`.

## Internal dependencies

Peers, all of them. `@proedis/react` for `useSyncedRef` / `useUnmountEffect`; `@proedis/react-client`
for `useClientQuery` and `@proedis/client` for `RequestError`, both only in `suspense/`. This package
sits **beside** `@proedis/react-client` and never below it — nothing in the suite imports it.

## Verification

No test runner in this repository. What was actually run when the package was written:

- `npx tsc -p tsconfig.json` and `npx eslint packages/react-query` — clean.
- A **usage file reproducing the real call-site shapes**, compiled against `src`: the generated
  `getXQueryKey` / `getXQueryArgs` / `useGetX` triple exactly as `proedis scaffold hooks` writes it,
  hand-written arguments with a `params` config, an arguments builder calling `useParams()`,
  `Wrapper` / `Header` / `Footer` reading the caller's props, `emptyContent` as an element,
  `pageTitle` with a merged `t`, and `useSuspendedContext`.
- A **negative file** asserting the types reject what they should: a transformer that does not
  produce what the component renders, arguments that are not a key plus a request config, a
  shorthand props object where a node is expected, and an unknown option. All four fail to compile.
- `resolveQueryView` exercised on eight literal cases (pending, 404 → `notFound`, 500 → `error`,
  404 + `debugErrors` → `error`, empty array with and without `emptyContent`, predicate, non-empty).
- The five views **rendered** through `renderToStaticMarkup`, on the engine, with a fabricated
  result, in **three configurations**: with no provider at all (the defaults carry every state, and
  a 404 routes through `classifyError` on its own), with a provider replacing a single view (the
  other defaults stay), and with a provider replacing everything plus the full skeleton. The engine and not the HOC, because under a static render
  `@tanstack/react-query` answers an errored query with the optimistic result of the refetch it
  would start, so a query holding an error and no data reads back as pending. Verified independently
  of this package before working around it.

Re-run at least the typecheck and the lint before touching this package. If the usage and negative
files are worth keeping, they belong in whatever test setup this repository eventually grows — they
are the contract with the 121 call sites, and they caught three real defects.
