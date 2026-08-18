import * as React from 'react';


/**
 * Group multiple ref object into a single ref that will
 * assign the referenced element to each single ref.
 *
 * The parameters are typed as plain mutable ref containers instead of
 * 'ReturnType<typeof React.useRef<T>>': that construct resolves differently between
 * @types/react 18 and 19, and made T infer as 'HTMLElement | null', producing a return
 * type that React 18 rejects as a JSX 'ref' prop. The return type is narrowed to
 * RefCallback, which is what the implementation actually produces and is accepted as a
 * ref by both major versions.
 *
 * @param refs
 */
export function useForkRef<T>(...refs: React.MutableRefObject<T | null | undefined>[]): React.RefCallback<T> {
  return React.useCallback(
    (refValue: T | null) => {
      refs.forEach((ref) => ref.current = refValue ?? undefined);
    },
    // react-hooks/exhaustive-deps will warn the next line because
    // the array will always change at each call of the hook.
    // In this case, could disable the warning because the ref hook used
    // as arguments won't change, because ref objects are immutable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ ...refs ]
  );
}
