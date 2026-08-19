/**
 * Whether the code is currently running inside a browser.
 *
 * Evaluated once, when the module is first imported, by probing the three globals a real
 * document-hosted environment always provides at the same time. Use it to guard access to
 * `window` / `document` in code that is also going to run through server side rendering, or
 * inside a React Native bundle.
 *
 * **Heads up** 👀 this does not tell you whether the browser is a mobile one: code running in
 * Safari on iOS gets `true`, same as Chrome on a desktop.
 *
 * @example
 * const initialTheme = isBrowser
 *   ? window.matchMedia('(prefers-color-scheme: dark)').matches
 *   : false;
 */
export const isBrowser = typeof window !== 'undefined'
  && typeof navigator !== 'undefined'
  && typeof document !== 'undefined';
