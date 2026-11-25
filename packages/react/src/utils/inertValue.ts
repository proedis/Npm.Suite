import * as React from 'react';


/**
 * The value of the `inert` attribute for the React running: a boolean on 19, an empty string on 18,
 * which drops a boolean with a warning and leaves the element live.
 *
 * ```tsx
 * <div inert={inertValue(wait.busy)}>…</div>
 * ```
 */
export function inertValue(value: boolean | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  return (Number.parseInt(React.version, 10) >= 19 ? true : '') as boolean;
}
