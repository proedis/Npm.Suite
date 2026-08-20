import { isBrowser } from '../runtime';


/**
 * Hand a blob to the browser as a file download.
 *
 * Creates a temporary object URL, clicks a detached anchor, and revokes the URL immediately after —
 * which is safe here, and only here: the download has already been handed to the browser by the
 * time `click()` returns. (Revoking too early is a real hazard when the URL is *navigated* to
 * instead: see `redirectTabToBlob`.)
 *
 * @param blob - The content to download.
 * @param filename - The name the file is saved under, extension included.
 * @throws When called outside a browser, where there is nothing to download to.
 *
 * @example
 * const report = await client.request<Blob>({ url: '/reports/1', responseType: 'blob' });
 * downloadBlob(report, 'report-2026-08.xlsx');
 */
export default function downloadBlob(blob: Blob, filename: string): void {
  if (!isBrowser) {
    throw new Error('[@proedis/utils] downloadBlob() requires a browser environment');
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
