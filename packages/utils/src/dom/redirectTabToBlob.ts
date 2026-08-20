import { isBrowser } from '../runtime';


/** How long the object URL survives before being revoked */
const REVOKE_DELAY_MS = 60_000;


/**
 * Point an already-open tab at a blob.
 *
 * The object URL is revoked on a timer rather than immediately, and that delay is load-bearing: the
 * tab is still *navigating* to the URL when this function returns, and revoking it right away
 * leaves the user looking at an empty tab. One minute is long enough for any document to load and
 * short enough not to leak.
 *
 * @param tab - The window returned by `openBlankTab`.
 * @param blob - The content to show.
 * @throws When called outside a browser.
 *
 * @example
 * const tab = openBlankTab();
 * redirectTabToBlob(tab, await renderPdf(data));
 */
export default function redirectTabToBlob(tab: Window, blob: Blob): void {
  if (!isBrowser) {
    throw new Error('[@proedis/utils] redirectTabToBlob() requires a browser environment');
  }

  const url = URL.createObjectURL(blob);

  tab.location.href = url;

  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
