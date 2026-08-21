<div align="center">

# `@proedis/react`

**The framework-agnostic half of a Proedis React app: typed contexts, shorthand props, and the
twenty hooks you would otherwise rewrite.** ⚛️

[![npm](https://img.shields.io/npm/v/@proedis/react.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/react)
[![license](https://img.shields.io/npm/l/@proedis/react.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

No UI kit, no styling, no opinions about how anything looks. 🎨

| | |
| --- | --- |
| **Contexts** | `contextBuilder` — a context and its hook, with a real error instead of `undefined` |
| **Component props** | `UIComponentProps` / `UIVoidComponentProps`, the shared prop surface every component starts from |
| **Shorthands** | `ShorthandItem`, `createShorthandFactory`, `creatableComponent` — accept props *or* a node for the same slot |
| **Components** | `RenderWhen`, `compose` |
| **State hooks** | `useAutoControlledState`, `useObjectState`, `useSafeState`, `useInputValue`, `useDataManager`, `useDataSelector` |
| **Ref hooks** | `useSyncedRef`, `useForkRef` |
| **Effect hooks** | `useEnhancedEffect`, `useUnmountEffect`, `useDebouncedCallback` |
| **DOM hooks** | `useEvent`, `useClickOutside`, `useWindowSize`, `useElementType` |
| **Measurement** | `useAutoSizer` — the room an element has, kept up to date; `getAncestorsSpace` |

## 📦 Installation

```bash
yarn add @proedis/react
```

`react` is a peer, accepted from **18 up to 19** — a range verified by compiling the emitted
declarations against `@types/react` 18 and 19 with `skipLibCheck` off, not by hoping.

## 🚀 Quick start

```tsx
import { contextBuilder, RenderWhen, useSyncedRef } from '@proedis/react';

/** A context that fails loudly when consumed outside its provider */
const [ TicketContext, useTicketContext ] = contextBuilder<TicketContextValue>('Ticket');

function TicketPanel() {
  const { ticket } = useTicketContext();

  return (
    <RenderWhen
      condition={ticket.isOpen}
      isTrue={<TicketBody ticket={ticket} />}
      isFalse={<ClosedBanner />}
    />
  );
}
```

## 📖 API

### 🏗️ `contextBuilder(name, initialContext?)`

Returns a `[ Context, useContext ]` pair. The hook throws a named error when it runs outside its
provider, so a missing provider is a message that tells you which context is missing — instead of an
`undefined` that explodes three components later.

```tsx
const [ AuthContext, useAuthContext ] = contextBuilder<AuthContextValue>('Auth');

<AuthContext.Provider value={value}>…</AuthContext.Provider>

const { user } = useAuthContext();   // throws outside the provider, with the name in the message
```

### 🎛️ `UIComponentProps` and `UIVoidComponentProps`

The prop surface every Proedis component starts from — `className`, `style`, the element type
override, and children for the non-void one. Compose your own strict props on top:

```tsx
interface StrictButtonProps {
  color?: ButtonColor;
  loading?: boolean;
}

type ButtonProps = UIComponentProps<StrictButtonProps>;
```

The second parameter is there for a component wrapping another one's props:
`UIComponentProps<StrictProps, BaseProps>` keeps your strict props authoritative and inherits the rest.

### 🎁 Shorthands

A shorthand slot accepts **either** a ready node **or** the props to build one — which is what lets a
component expose `icon={'user'}` and `icon={<CustomIcon />}` through a single prop.

| Symbol | What it is |
| --- | --- |
| `ShorthandItem<Props>` | a node, or the props of the component filling the slot |
| `ShorthandCollection<Props>` | an array of them, each carrying a `key` |
| `ShorthandContent` | plain renderable content |
| `createShorthandFactory(Component, mapValueToProps, computeKey?)` | build the factory that turns a value into an element |
| `creatableComponent(Component, …)` | attach a `create` method to a component |
| `renderShorthandContent({ children, content })` | pick between `children` and a `content` prop, in that order |

### 🔀 `RenderWhen` and `compose`

`RenderWhen` takes a `condition` and then **one of two shapes**, and the type will not let you mix
them: either children with an optional boolean `isFalse` inversion, or an `isTrue` / `isFalse` pair of
nodes and no children at all.

```tsx
/** children form — render them when the condition holds */
<RenderWhen condition={isAdmin}>
  <AdminPanel />
</RenderWhen>

/** children form, inverted — 'isFalse' is a boolean here */
<RenderWhen condition={isAdmin} isFalse>
  <RequestAccess />
</RenderWhen>

/** ternary form — no children, both branches as nodes */
<RenderWhen condition={isAdmin} isTrue={<AdminPanel />} isFalse={<RequestAccess />} />
```

⚠️ `isFalse` means two different things across the two shapes: a boolean inversion with children, a
node without them. Passing children *and* a node is a compile error, which is the point.

`compose(...components)` nests a list of providers into one component, which turns a stack of eight
providers at the root of an app into a single element.

### 🪝 The hooks

| Hook | What it gives you |
| --- | --- |
| `useSyncedRef(value)` | a **stable** container whose `current` always reads the latest value — the way to let an effect or a handler see fresh data without being rebuilt |
| `useForkRef(...refs)` | one ref callback assigning to several refs, for a component that both exposes a ref and keeps one |
| `useEnhancedEffect` | `useLayoutEffect` in a browser, `useEffect` everywhere else, so SSR stays quiet |
| `useUnmountEffect(callback)` | run something once, on unmount, always the latest version of it |
| `useSafeState(initial)` | `useState` whose setter is a no-op after unmount |
| `useAutoControlledState(…)` | one state that works controlled *or* uncontrolled, the standard prop/defaultProp pattern |
| `useObjectState(values, options?)` | object state with per-key setters and an `onChange` notification |
| `useInputValue(initial?)` | value plus change handler for an uncontrolled-ish input |
| `useDebouncedCallback(fn, delay)` | a debounced callback that always calls the newest `fn` |
| `useDataManager()` | add / update / remove over a local collection |
| `useDataSelector(data, options?)` | a selection that is **always** backed by the current data |
| `useEvent(target, type, handler)` | a DOM listener attached once, calling the newest handler |
| `useClickOutside(target, callback)` | the outside-click primitive behind every dropdown |
| `useWindowSize(options?)` | viewport size, debounced |
| `useElementType(props, default)` | resolve the `as` prop into the element to render |
| `useAutoSizer(options?)` | the room an element has, in pixels, kept up to date — see below |

💡 Several of these are built on `useSyncedRef`, and that is the pattern worth internalising: keep the
*subscription* stable and let it read a moving value, instead of tearing it down whenever the value
changes.

⚠️ Read a `useSyncedRef` container from an effect, a handler or a cleanup — **not while rendering**. The
value is written during render, which is what makes it current for the commit it belongs to, and a
render that gets discarded leaves the container holding something that was never committed.

### 📐 `useAutoSizer(options?)`

The replacement for `height: calc(100vh - 320px)`.

A virtualized table, a map or a chart needs a pixel height; the height available depends on
everything rendered above it; and that number is not a constant — a filter bar wraps onto a second
line, a sidebar collapses, a notification appears, the font finally loads.

```tsx
const [ AutoSizer, { height } ] = useAutoSizer({ minHeight: 240 });

return (
  <AutoSizer>
    <VirtualizedTable height={height} rows={rows} />
  </AutoSizer>
);
```

Each axis answers with **the room left between the element and the far edge of the viewport**, minus
what the ancestors still need for their own padding, margin and border. That subtraction is the
point: without it a table filling "the rest of the screen" overflows its card by exactly the card's
padding, and the page grows a scrollbar nobody asked for.

| Option | Effect |
| --- | --- |
| `fixedHeight` / `fixedWidth` | pin an axis and skip its computation |
| `minHeight` / `maxHeight`, `minWidth` / `maxWidth` | clamp the result |
| `useOwnHeight` / `useOwnWidth` | measure the element itself instead of the room around it |
| `disabled` | stop measuring, keeping the last size — for a collapsed panel or a hidden tab |

Options are read through a ref, so changing them mid-life is safe and never re-subscribes anything.

**What it watches**: the element and its parent through a `ResizeObserver`, the viewport through a
resize listener, and its own visibility through an `IntersectionObserver` — so a tab that was hidden
when it mounted measures itself the moment it is shown, instead of reporting zero until the next
window resize. Measurements are coalesced into one animation frame, because a resize observer fires
several times per frame while a layout settles.

The returned component is a plain `div` that forwards its ref and every prop, and its **identity is
stable**: a component whose identity changes remounts its subtree, which for a virtualized table
means losing the scroll position on every resize.

`getAncestorsSpace(element)` is that subtraction on its own, for anything sizing an element it does
not own — a canvas, a third-party widget.

⚠️ Server-side it reports the `fixed*` values, or zero: there is nothing to measure until the effect
runs. Give the sized content a sensible `minHeight` if the first paint matters.

## 🔀 Migrating to 2.x

| Change | What to do |
| --- | --- |
| `useDataSelector` reconciles during render | Nothing, in most cases — and one render fewer per data change. The selection was previously corrected by an effect calling `setState`, so a render could show a selection the data no longer backed. |
| `onSelectedChange` fires once per real transition | Check any listener that counted calls. It used to fire from two places — synchronously inside the setter, and again from the reconciliation effect — so it also reported things that were not changes: selecting what was already selected, clearing an already empty selection (twice), and resolving `defaultSelected` against the data at mount. It now fires after the commit, once, and only when the resolved selection actually changed. The notification on unmount is unchanged. |
| No notification for the initial selection | If you relied on being told at mount what `defaultSelected` resolved to, read `selected` instead. The first value is not a transition, so nothing is reported — where before a `defaultSelected` that was not identity-equal to its item in the data produced a notification and an extra render. |
| A selection restores itself when its item comes back | Nothing to do, but know the shape: the hook stores what you *asked* for and resolves it against the current data on every render. An item that leaves the data and later returns — a filter applied and removed — becomes selected again, and that is reported. It used to store the resolved item and drop it for good. |
| `useForkRef` parameter type | Now a minimal structural `{ current: T \| null \| undefined }` rather than `React.MutableRefObject`. That is what keeps the same signature valid across `@types/react` 18 and 19; anything that was passing a real ref keeps working. |
| `RenderWhen` condition grouping | Its condition is now explicitly parenthesised. Same behaviour, but note the shape it always had: with the `isFalse` **inversion**, children render when the condition is false *even if there are no children* to render. |

## 🤝 Compatibility

| Requirement | Range |
| --- | --- |
| `react` | `>=18.0.0 <20.0.0` (peer) |
| `typescript` | `>=5.2.0` |
| Runtime | ES2022 — roughly Safari 16.4 / Chrome 94 |

Public signatures deliberately avoid `React.RefObject`, `React.MutableRefObject` and
`ReturnType<typeof React.useRef<T>>`: those aliases changed meaning between React 18 and 19, and are
the reason a hook can typecheck under one major and be rejected under the other. Minimal structural
shapes are used instead.

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
