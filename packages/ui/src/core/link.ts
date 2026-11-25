import type * as React from 'react';


/* --------
 * Types Definition
 * -------- */

/**
 * A destination that knows how to reach itself: an `href` for the anchor and a `go()` for a plain click.
 * The long form of a `LinkTarget`, for the one link that has to navigate in a way of its own.
 */
export interface LinkDestination {
  /** Where the anchor points: what a new tab opens and what the status bar shows */
  readonly href: string;

  /** What a plain click does, normally a client-side navigation */
  readonly go: () => void;
}

/**
 * A place a component can take the user to: an `href`, most of the time, or a `LinkDestination`.
 *
 * ```tsx
 * <Button to={'/signals/42'}>Open</Button>
 * <Button to={{ href: '/signals/42', go: () => openInPanel(42) }}>Open here</Button>
 * ```
 *
 * The package knows no router: every component that leads somewhere (a button rendered as a link, a menu
 * item, the name of a person, a cell) renders a real `<a href>`, which keeps what an anchor gives for free
 * (middle click, a new tab, the status bar, the history). A string is an ordinary anchor, a page load,
 * until a `LinkProvider` around the application hands it the router's `navigate`: then a plain click on
 * it navigates in the page.
 */
export type LinkTarget = string | LinkDestination;

/** The router's navigation, handed to `LinkProvider`: `(href) => router.navigate({ to: href })` */
export type LinkNavigate = (href: string) => void;


/* --------
 * Helpers
 * -------- */

/**
 * The `href` of a target, and what a plain click on it does: the destination's own `go`, the provider's
 * `navigate` for a string, or nothing, when the browser follows the anchor.
 */
export function resolveLink(target: LinkTarget, navigate?: LinkNavigate): { href: string; go?: () => void } {
  if (typeof target === 'string') {
    return { href: target, go: navigate ? () => navigate(target) : undefined };
  }

  return { href: target.href, go: target.go };
}

/** Whether a click is a plain primary one, the only kind a link takes over */
export function isPlainClick(event: React.MouseEvent<HTMLElement>): boolean {
  return !event.defaultPrevented
    && event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey;
}

/**
 * The two attributes an anchor needs to follow a `LinkTarget`.
 *
 * ```tsx
 * <a {...linkProps(target, navigate)}>Open</a>
 * ```
 *
 * Only a **plain** primary click is taken over: with Ctrl, Cmd, Shift or Alt held, with any other
 * button, or when something earlier already called `preventDefault`, the browser does what it always
 * does. That is the whole reason to render an anchor rather than a button with an `onClick`. A string
 * with no `navigate` is left to the browser entirely.
 */
export function linkProps(target: LinkTarget, navigate?: LinkNavigate): {
  href: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
} {
  const { href, go } = resolveLink(target, navigate);

  return {
    href,
    onClick: (event) => {
      if (!go || !isPlainClick(event)) {
        return;
      }

      event.preventDefault();
      go();
    }
  };
}
