import * as React from 'react';


/**
 * Group multiple ref object into a single ref that will
 * assign the referenced element to each single ref.
 *
 * @param refs
 */
export function useForkRef<T>(...refs: ReturnType<typeof React.useRef<T>>[]): React.Ref<T> {
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
