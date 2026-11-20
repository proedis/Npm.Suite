import * as React from 'react';


/* --------
 * Internal Types
 * -------- */

/**
 * The minimal shape of a mutable ref container.
 *
 * Deliberately structural rather than `React.MutableRefObject` or
 * `ReturnType<typeof React.useRef<T>>`: those resolve differently between @types/react 18 and 19, and
 * the latter made `T` infer as `HTMLElement | null`, producing a return type React 18 rejects as a JSX
 * `ref` prop.
 */
interface MutableRefLike<T> {
  current: T | null | undefined;
}

/**
 * What a forked ref may be handed: a container, a callback, or nothing at all, which is what a
 * forwarded ref is when the parent passed none. A callback ref is what `render` props and most
 * libraries hand down, so a fork that only wrote `current` lost them silently.
 */
type ForkableRef<T> = MutableRefLike<T> | ((instance: T | null) => void) | null | undefined;


/* --------
 * Hook Definition
 * -------- */

/**
 * Merge several refs into the single ref callback a JSX element can accept.
 *
 * The returned callback assigns the element to every ref it was given, which is how a component both
 * exposes a ref to its parent and keeps one for itself.
 *
 * Its identity is **stable** as long as the same ref containers are passed, which matters beyond
 * tidiness: React calls a ref callback with `null` and then with the node again every time the
 * callback's identity changes.
 *
 * @param refs The refs to assign to
 * @returns A ref callback, stable across renders that pass the same refs
 *
 * @example
 * const Input = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
 *   const innerRef = React.useRef<HTMLInputElement>(null);
 *   const handleRef = useForkRef(innerRef, ref);
 *
 *   return <input {...props} ref={handleRef} />;
 * });
 */
export function useForkRef<T>(...refs: ForkableRef<T>[]): React.RefCallback<T> {
  return React.useCallback(
    (refValue: T | null) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(refValue);
        }
        else if (ref) {
          ref.current = refValue;
        }
      });
    },
    /**
     * The rest parameter is a new array on every render, so the refs are spread into the dependency
     * list one by one: ref containers are stable, so the callback survives every render that passes
     * the same ones.
     *
     * Both hook rules object to this, and neither has a better answer here. 'exhaustive-deps' wants the
     * array itself, which changes identity every render and would rebuild the callback each time.
     * 'use-memo' wants a literal, which cannot express a variadic list. Routing the refs through a
     * synced container satisfies both — and then the React Compiler refuses the memoization outright,
     * because it cannot prove a closure reading 'ref.current' is stable. This is the shape the compiler
     * is meant to replace: with it enabled, drop the useCallback entirely and let it do the work.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
    [ ...refs ]
  );
}
