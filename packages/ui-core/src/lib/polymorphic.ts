import type * as React from 'react';

import type { BaseProps } from './base';


/* --------
 * Types Definition
 * -------- */

/**
 * The props of a primitive that renders as whatever element it is told to.
 *
 * ```ts
 * export interface StrictStackProps extends BaseProps { gap?: Responsive<SpacingValue>; … }
 *
 * export type StackProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictStackProps>;
 * ```
 *
 * Three pieces, and each one answers a defect of the shape this replaces:
 *
 * 1. **`Own`** — what the component itself understands. Declared apart from the element, because it
 *    is the only half that does not depend on `as`.
 * 2. **`{ as?: E }`** — the element, captured as a type parameter so the call site decides it.
 * 3. **`Omit<React.ComponentProps<E>, 'as' | keyof Own>`** — everything that element accepts, minus
 *    what the component has already claimed. The `Omit` is what makes a collision deterministic
 *    instead of an error: `Grid`'s own `fill` wins over the `fill` attribute of an `<svg>`.
 *
 * ## What it fixes
 *
 * Every primitive here used to declare `React.ComponentProps<'div'>` and an `as?: React.ElementType`
 * next to it, which is wrong in both directions at once: `<Stack as={'a'} href={'/x'} />` did **not
 * compile**, because `href` is not a `div` attribute, while `<Stack as={'span'} align={'center'}
 * onScroll={…} />` compiled fine even where the attribute means nothing. The type described an
 * element the component was not necessarily rendering.
 *
 * With this, `as={'a'}` brings `href`, `download` and `target` along, `as={'span'}` refuses them, and
 * the props of a custom component reached through `as={MyThing}` are that component's own.
 *
 * ## Two things to know before using it
 *
 * ⚠️ **The default type parameter is not decoration.** `<E extends React.ElementType = 'div'>` is what
 * keeps `StackProps` usable with no argument, so a consumer writing `StackProps` — or a wrapper
 * extending it — is unaffected by any of this. Drop the default and every one of those breaks.
 *
 * ⚠️ **The body of the component needs one cast**, right at the destructure:
 * `props as StackProps<'div'>`. Inside the function `E` is unresolved and every property access on
 * `Omit<ComponentProps<E>, …>` is deferred, while the body does not care about `E` at all: it reads
 * its own props and forwards the rest. The cast is contained to that one line and states exactly
 * that. It is not a hole in the typing — the call site is where `E` matters, and there it is checked.
 *
 * `Own` defaults to `BaseProps` and is constrained to `object` rather than to `BaseProps`, which is a
 * looser constraint than it looks like it should be. Every primitive here does extend `BaseProps`,
 * and constraining it would have enforced that — except for the one component where the shared props
 * are a contradiction: `VisuallyHidden` keeps its content in the accessibility tree, so a prop that
 * takes it out with `display: none` has no business being there. A constraint that forces a wrong API
 * on one component is worse than a rule written down, so the rule is written down: **a new primitive
 * extends `BaseProps` unless the shared props contradict what it is for.**
 *
 * `React.ComponentProps<E>` is used rather than `ComponentPropsWithRef` / `ComponentPropsWithoutRef`
 * on purpose: it is the alias the package already used, so the surface does not change with this
 * refactor, and the other two are exactly the aliases whose meaning moved between `@types/react` 18
 * and 19. The emitted declarations are compiled against both — see the verification section of
 * `CLAUDE.md`.
 */
export type PolymorphicProps<E extends React.ElementType, Own extends object = BaseProps> =
  Own
  & { as?: E }
  & Omit<React.ComponentProps<E>, 'as' | keyof Own>;
