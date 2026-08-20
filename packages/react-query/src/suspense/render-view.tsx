import * as React from 'react';

import type { SuspenseViewNode, SuspenseViewProps } from './suspense.types';


/* --------
 * API
 * -------- */

/**
 * Render a view slot, whichever of its three forms was filled in.
 *
 * - a **component type** is instantiated with the view props, so it can offer a retry;
 * - an **element** is rendered as it is — it was already built by the caller, and re-cloning it to
 *   inject props would silently override what the caller wrote;
 * - anything else renderable (a string, a fragment, `null`) passes through.
 *
 * The distinction is made on `typeof node === 'function'` because a React element is an object
 * while a component is a function; `React.isValidElement` is checked first so a memo or forwardRef
 * element — an object with a function `type` — is never mistaken for a component.
 *
 * @param node - The slot content.
 * @param props - The view props handed to a component form.
 */
export function renderViewNode<TData, TError = unknown>(
  node: SuspenseViewNode<TData, TError> | undefined,
  props: SuspenseViewProps<TData, TError>
): React.ReactNode {
  if (node === null || node === undefined) {
    return null;
  }

  if (React.isValidElement(node)) {
    return node;
  }

  if (typeof node === 'function') {
    const View = node as React.ComponentType<SuspenseViewProps<TData, TError>>;

    return <View {...props} />;
  }

  return node as React.ReactNode;
}
