import { isBrowser } from '../runtime';


/**
 * Open a blank tab, synchronously, so a popup blocker lets it through.
 *
 * ⚠️ **Call this before any `await`.** A browser only allows `window.open` while it can still
 * attribute the call to the user's click; the first `await` ends that window, and every later
 * `window.open` is blocked — silently, on some browsers. So the sequence for "generate a document,
 * then show it" is: open the tab first, generate, then point the tab at the result with
 * `redirectTabToBlob`.
 *
 * `noopener` is deliberately **not** set: the returned reference is the whole point.
 *
 * @throws When called outside a browser, or when the popup was blocked anyway.
 *
 * @example
 * const tab = openBlankTab();          // before the await, always
 * const pdf = await renderPdf(data);
 * redirectTabToBlob(tab, pdf);
 */
export default function openBlankTab(): Window {
  if (!isBrowser) {
    throw new Error('[@proedis/utils] openBlankTab() requires a browser environment');
  }

  const tab = window.open('', '_blank');

  if (!tab) {
    throw new Error('[@proedis/utils] openBlankTab() was blocked — it must be called before any await');
  }

  return tab;
}
