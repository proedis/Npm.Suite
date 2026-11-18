import type * as React from 'react';


/* --------
 * Types Definition
 * -------- */

/**
 * A place a component can take the user to, as the application describes it.
 *
 * ```ts
 * const target: LinkTarget = { href: '/signals/42', go: () => router.push('/signals/42') };
 * ```
 *
 * The package knows no router and mounts no provider: every component that leads somewhere (a button
 * rendered as a link, a menu item, the name of a person) takes one of these and renders a real
 * `<a href>`. The `href` keeps everything an anchor gives for free (middle click, a new tab, the
 * status bar, the history); `go()` is what a plain click does instead of a full page load.
 *
 * A structural type on purpose: an application's own navigation object satisfies it as long as it
 * has the two members, with no import and no adapter.
 */
export interface LinkTarget {
  /** Where the anchor points: what a new tab opens and what the status bar shows */
  readonly href: string;

  /** What a plain click does, normally a client-side navigation */
  readonly go: () => void;
}


/* --------
 * Helpers
 * -------- */

/**
 * The two attributes an anchor needs to follow a `LinkTarget`.
 *
 * ```tsx
 * <a {...linkProps(target)}>Open</a>
 * ```
 *
 * Only a **plain** primary click is taken over: with Ctrl, Cmd, Shift or Alt held, with any other
 * button, or when something earlier already called `preventDefault`, the browser does what it always
 * does. That is the whole reason to render an anchor rather than a button with an `onClick`.
 */
export function linkProps(target: LinkTarget): {
  href: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
} {
  return {
    href   : target.href,
    onClick: (event) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
      ) {
        return;
      }

      event.preventDefault();
      target.go();
    }
  };
}
