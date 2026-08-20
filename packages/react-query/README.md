<div align="center">

# `@proedis/react-query`

**The two things every Proedis frontend ends up rewriting: a query boundary that does not know what
a spinner looks like, and invalidation that knows when to wait.** 🧩

[![npm](https://img.shields.io/npm/v/@proedis/react-query.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/react-query)
[![license](https://img.shields.io/npm/l/@proedis/react-query.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

Zero UI dependencies: no component library, no styling, no copy. The views are yours, the state
machine is ours. 🎛️

| | |
| --- | --- |
| **The HOC** | `querySuspenseComponent` — pairs a component with the query arguments that feed it. This is how you use the package |
| **Render helpers** | `suspendedComponent`, `useSuspendedContext` |
| **Configuration** | `QuerySuspenseProvider` — **optional**, replaces the built-in views with your own |
| **The engine** | `QuerySuspense`, and `resolveQueryView` — the branch order as a plain function |
| **Invalidation** | `useQueryInvalidation`, `InvalidationQueue` — deduped, batched, deferrable |
| **Gates** | `useInvalidationGate`, `useRefetchPause`, `refetchOnWindowFocusGate`, `PauseGate` |

Two entry points beyond the root, so a consumer can take one half without the other:
`@proedis/react-query/suspense` and `@proedis/react-query/invalidation`.

## 📦 Installation

```bash
yarn add @proedis/react-query
```

Every dependency is a **peer**, and each must resolve to a single instance: two copies of
`@tanstack/react-query` in one bundle means two caches, and a hook reading the one your provider did
not create.

| Peer | Range | Needed by |
| --- | --- | --- |
| `react` | `>=18.0.0 <20.0.0` | both entry points |
| `@tanstack/react-query` | `^5.0.0` | both entry points |
| `@proedis/react` | `^2.0.0` | both entry points |
| `@proedis/react-client` | `^4.0.0` | `suspense` only — the boundary queries through `useClientQuery` |
| `@proedis/client` | `^3.0.0` | `suspense` only — `RequestError` is the error type |

The `invalidation` entry point needs neither of the last two: it works against any `QueryClient`.

## 🚀 Quick start

Pair a component with the arguments its query is described by. That is all: no provider, no setup. A
screen never writes an `isPending` branch again.

```tsx
const ActivityDetailRender = suspendedComponent<ActivityCompleteDto, ActivityDetailProps>(
  (activity, props) => <ActivityPanel activity={activity} {...props} />
);

const ActivityDetail = querySuspenseComponent(
  ActivityDetailRender,
  props => getSingleActivityQueryArgs(props.id)   // written by `proedis scaffold hooks`
);

// <ActivityDetail id={activityId} />
```

Out of the box that renders an empty `role="status"` element while loading, the error's own message
inside a `role="alert"` when it fails, and a 404 as a missing entity. Which is enough to work, and
not enough to ship — so when you want your own, and only then, mount the provider once next to your
UI kit:

```tsx
import { QuerySuspenseProvider } from '@proedis/react-query';

const AppQuerySuspense: React.FunctionComponent<React.PropsWithChildren> = ({ children }) => (
  <QuerySuspenseProvider
    config={{
      Loader      : () => <Center><Loader /></Center>,
      ErrorView   : ({ error, reload }) => <ErrorAlert error={error} onRetry={reload} />,
      NotFound    : <EmptyContent icon={ICONS.SEARCH} title={'Nessun Risultato'} />,
      AsideWrapper: ({ children: aside }) => <Box className={classes.asideComponent}>{aside}</Box>,

      debugErrors  : import.meta.env.DEV,
      onTitleChange: setPageTitle,
      defaultTitles: { pending: 'Caricamento…', error: 'Errore' }
    }}
  >
    {children}
  </QuerySuspenseProvider>
);
```

Every key is optional and merges over the defaults, so replacing one view leaves the others alone.

## 📖 API

### `suspense`

#### `querySuspenseComponent(Component, queryArgs, options?)`

One form, and no hook to hand over: the query is described by the **arguments of `useClientQuery`**,
which is exactly what `proedis scaffold hooks` writes as `getXQueryArgs()` and what call sites have
always written by hand.

```tsx
const ActivityDetail = querySuspenseComponent(
  ActivityDetailRender,
  props => getSingleActivityQueryArgs(props.id),
  {
    pageTitle: { success: ({ data }) => data.name },

    resetOnUnmount: true
  }
);

const ActivityVehiclesList = querySuspenseComponent<ActivityVehicleBaseDto[], ActivityVehiclesProps>(
  ActivityVehiclesListContent,
  ({ activity }) => ([
    generateEndpointQueryKey('activity-vehicles'),
    { transformer: ActivityVehicleBaseDto, params: { parentId: activity.id } }
  ]),
  { emptyContent: <EmptyContent.EmptyListDefault /> }
);
```

The arguments are typed `readonly [ ...Parameters<typeof useClientQuery<TData>> ]`, and both halves
of that matter: **readonly**, so the `as const` tuple of a generated `getXQueryArgs()` fits without a
cast; **bound to the data type**, so a `transformer` that does not produce what the component renders
is a compile error.

`queryArgs` may be the arguments themselves or a builder over the props. Builders run **during
render**, so they may call hooks of their own — a route layout reading `useParams()` inside one is a
supported pattern, not an accident.

`resetOnUnmount` drops the query on unmount, using the key it queried — the first argument. Declare
`queryKey` when something wider should go: a generated `getXQueryKey()` called with no argument is
the prefix of the whole resource.

#### The five views

| Slot | Rendered when | When unset |
| --- | --- | --- |
| `Loader` | the query has no data yet | an empty `<span role="status" aria-busy>` |
| `ErrorView` | the query failed | `<div role="alert">` with the error's message |
| `NotFound` | `classifyError` returned `'notFound'` | falls back to `ErrorView` |
| `emptyContent` | the data is empty | the content renders anyway |
| — | otherwise | `Component` |

The two defaults are one element each, with no class, no copy and no dependency: enough for the
boundary to work unconfigured, and deliberately too plain to be mistaken for a design.
`DEFAULT_QUERY_SUSPENSE_CONFIG` and `classifyRequestError` are exported, so a provider can extend a
default instead of replacing it.

Every slot accepts an **element, a component, or any renderable node**, in the config and as a
per-instance override:

```tsx
emptyContent={<EmptyContent.EmptyThreadDefault />}          // an element, rendered as it is
emptyContent={({ reload }) => <Retry onClick={reload} />}   // a component, given the view props
```

A component form receives `{ error, reload, state }` — the whole query result, not only the error,
so a view can tell a first failure from a failed refetch.

Declaring `emptyContent` is the shorthand for *"this query returns a list"*: `isEmpty` defaults to
the built-in check — an array with no elements — as soon as it is present. Any other shape takes a
predicate: `isEmpty: data => !data.items.length`.

`classifyError` defaults to `statusCode === 404` → `'notFound'`, which the package can afford
because the error type is the client's. Override it for an endpoint that answers 403 for "you may
not see this one", or 200 with an empty envelope.

`debugErrors` replaces the `!import.meta.env.DEV` condition this pattern used to carry inline: a
"not found" view hides the response that produced it, and during development the response is the
interesting part. It is a config flag, not a bundler global, so it also works under Node.

#### The skeleton

`Wrapper`, `ContentWrapper`, `Header` and `Footer` are rendered in **every** state, and their
element identity stays stable across the five: the panel and its header do not remount when the
content swaps from loader to data, so nothing jumps and no scroll position is lost.

Each of them receives the caller's own props merged with `{ state, reload }`, which is what lets a
wrapper read the entity it is framing:

```tsx
{
  Wrapper: ({ children, activity, state }) => (
    <Panel header={activity.name} loading={state.isFetching}>{children}</Panel>
  )
}
```

`AsideWrapper`, in the config, wraps `Header`, `Footer` and the error view — the seam for the
spacing a design system puts around the parts that sit beside the content.

#### Page title

```ts
{ pageTitle: { success: ({ data }) => data.name, pending: 'Caricamento…' } }
```

Resolvers are declared in a module-scope options object, outside React, so they cannot call a hook
to translate themselves. Whatever they need arrives through `titleTools` in the config, typed by
declaration merging — the same pattern `@proedis/react-client` uses for `ContextClientOverride`:

```ts
declare module '@proedis/react-query' {
  interface QuerySuspenseTitleTools {
    t: TranslationFunction;
  }
}

// in the provider, which is inside React:
titleTools: { t }

// at the call site:
{ pageTitle: { success: ({ data, t }) => `${t('PAGE.ACTIVITY')} ${data.name}` } }
```

#### Reading the data further down

```tsx
const ActivityName: React.FunctionComponent = () => {
  const [ activity ] = useSuspendedContext<ActivityCompleteDto>();
  return <span>{activity.name}</span>;
};
```

#### The engine, and the pure part

`QuerySuspense` is the component the HOC renders; use it directly only when the query is already in
hand and has to stay there. `resolveQueryView(state, options)` is the branch order alone — a plain
function over `{ status, data, error }`, testable on object literals and reusable outside React.

### `invalidation`

| Export | What it does |
| --- | --- |
| `useQueryInvalidation(queries, options)` | A stable invalidator. `queries` is a list or a builder over the call context |
| `InvalidationQueue` | `enqueue` / `flush` / `isPaused` / `clear`, keyed per `QueryClient` |
| `useInvalidationGate(lock)` | Defers invalidation while `lock` is true, flushes when the last holder releases |
| `useRefetchPause(lock)` | Suppresses window-focus refetch for the queries already in cache on mount |
| `refetchOnWindowFocusGate(getQueryClient)` | The `QueryClient` option that makes the above effective |
| `PauseGate` | The counting lock underneath both gates |

```tsx
const invalidateUsers = useQueryInvalidation([ [ 'users' ], { queryKey: [ 'users', 'count' ], exact: true } ]);
const invalidateOne = useQueryInvalidation<UserDto>(user => ([ [ 'users', user.id ] ]));
```

A bare key is a **prefix** filter, which is why a generated `getXQueryKey()` called with no argument
is the right thing to invalidate a whole resource. Filters dedupe on key + `exact`, so the
same key coming from three mutations in one tick costs one invalidation, and the whole set runs
inside a single `notifyManager.batch` — one render pass, not one per key.

The gates exist for one screen: a modal open over a list. Without them every mutation inside it
refetches the list underneath, rows move while the user is still typing, and coming back from
another window reorders everything. `useInvalidationGate(open)` collapses those refetches into one,
fired when the modal is gone; `useRefetchPause(open)` freezes what was already on screen while
leaving the modal's own queries live.

## ⚠️ Requirements

One thing is inert without wiring, and it fails silently:

**`useRefetchPause` needs the client option.** Nothing in `@tanstack/react-query` consults the gates
on its own:

```ts
const queryClient: QueryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: refetchOnWindowFocusGate(() => queryClient) } }
});
```

State is keyed by `QueryClient` in a `WeakMap`, not held in module scope — two roots mounted side by
side never share a queue, and a test that builds a client per case leaks nothing.

## 🤝 Compatibility

| | |
| --- | --- |
| React | `>=18.0.0 <20.0.0` |
| `@tanstack/react-query` | `^5.0.0` |
| `@proedis/react` | `^2.0.0` |
| `@proedis/react-client` / `@proedis/client` | `^4.0.0` / `^3.0.0` — `suspense` only |
| TypeScript | `>=5.5` |
| Runtime | ES2022 — Safari 16.4 / Chrome 94 / Node 16.11 |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
