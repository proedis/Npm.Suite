/**
 * @name isBrowser
 * @const
 * Check if code is running into a Browser or not.<br />
 * <b>Heads up</b> this function won't tell you if the code is running
 * on a mobile phone browser, but if is Browser or not:
 * a code running on iOS Safari Browser will return `true`
 */
export const isBrowser =
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  typeof document !== 'undefined';
