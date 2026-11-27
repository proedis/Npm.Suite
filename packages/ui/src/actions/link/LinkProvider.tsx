'use client';

import * as React from 'react';

import { optionalContextBuilder } from '@proedis/react';

import type { LinkNavigate } from '../../core/link';


/* --------
 * Types Definition
 * -------- */

export interface StrictLinkProviderProps {
  /** The router's navigation: a plain click on a link given as a string calls it instead of loading a page */
  navigate: LinkNavigate;

  children?: React.ReactNode;
}

/** A provider extends nothing: the two names are one type, kept so every component reads the same way */
export type LinkProviderProps = StrictLinkProviderProps;


/* --------
 * Context Definition
 * -------- */

const [ LinkContext, useLinkNavigate ] = optionalContextBuilder<LinkNavigate | undefined>('Link', undefined);

/** The `navigate` of the nearest `LinkProvider`, or `undefined` outside one */
export { useLinkNavigate };


/* --------
 * Component Definition
 * -------- */

/**
 * Hands the router's navigation to every link of the package, once, at the root of the application:
 * a `to` or a `target` written as a string then navigates in the page on a plain click, and keeps every
 * other behaviour of an anchor (a new tab, the status bar, a middle click).
 *
 * ```tsx
 * const router = useRouter();
 *
 * <LinkProvider navigate={(href) => router.navigate({ to: href })}>
 *   <App />
 * </LinkProvider>
 * ```
 *
 * Optional: without it a string is an ordinary anchor, and a page load. A target written as
 * `{ href, go }` ignores it, its own `go` wins.
 */
export function LinkProvider(props: LinkProviderProps): React.ReactNode {
  const { children, navigate } = props;

  return <LinkContext.Provider value={navigate}>{children}</LinkContext.Provider>;
}

LinkProvider.displayName = 'LinkProvider';
