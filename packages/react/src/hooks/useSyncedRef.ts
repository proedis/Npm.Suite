import * as React from 'react';


/**
 * Keep the latest value passed to a component inside a stable, read only ref container.
 *
 * The container identity never changes, so it can sit in a dependency array without ever
 * invalidating it — which is the whole point: it lets an event handler, a debounce timer or a
 * cleanup function read the *current* value without the effect that owns them having to be torn
 * down and rebuilt on every render.
 *
 * The returned object is frozen and exposes `current` as a getter, so a consumer can read the value
 * but cannot write it.
 *
 * @param value The value to keep in sync
 * @returns A stable container whose `current` always reads the latest value
 *
 * @example
 * function useAutoSave(onSave: () => void, delay: number) {
 *   const latestOnSave = useSyncedRef(onSave);
 *
 *   React.useEffect(
 *     () => {
 *       // the interval is created once, and still calls the newest callback
 *       const id = setInterval(() => latestOnSave.current(), delay);
 *       return () => clearInterval(id);
 *     },
 *     [ delay, latestOnSave ]
 *   );
 * }
 *
 * @remarks
 * ⚠️ Read `current` from an effect, an event handler or a cleanup function — **not while rendering**.
 * The value is written during render, which is what makes it available to the very commit it belongs
 * to, and reading a ref during render is not something React guarantees anything about: a render that
 * gets discarded leaves the container holding a value that was never committed.
 *
 * That write is also why `react-hooks/refs` is switched off just below. Every alternative loses the
 * guarantee this hook exists to provide — writing in an effect makes `current` lag one commit behind,
 * which is precisely the bug the callers of this hook are avoiding. The exposure is bounded: the
 * container is only ever read after a commit, and every commit writes it again.
 */
export function useSyncedRef<T>(value: T): { readonly current: T } {
  const ref = React.useRef(value);

  // eslint-disable-next-line react-hooks/refs -- see the remark above: the render time write is the contract
  ref.current = value;

  return React.useMemo(
    () => Object.freeze({
      get current() {
        return ref.current;
      }
    }),
    []
  );
}
