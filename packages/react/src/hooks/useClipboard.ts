'use client';

import * as React from 'react';


/* --------
 * Types Definition
 * -------- */

export interface ClipboardOptions {
  /** How long `copied` or `failed` lasts before going back to `idle`. Defaults to 1500ms */
  resetAfter?: number;
}

/** `copied` and `failed` last `resetAfter`, then the status is `idle` again */
export type ClipboardStatus = 'idle' | 'copied' | 'failed';

/** What to copy: the text, or a function that gives it, read only when the copy happens */
export type ClipboardValue = string | (() => string | Promise<string>);

export interface Clipboard {
  readonly status: ClipboardStatus;

  /** Copies, and tells whether it worked. Never throws: a refusal is `false` and the status `failed` */
  copy: (value: ClipboardValue) => Promise<boolean>;
}


/* --------
 * Helpers
 * -------- */

/**
 * Writes the text with the Clipboard API where the page may use it, a secure context, and with a
 * selected textarea and `execCommand('copy')` elsewhere: an intranet served over plain http has no
 * `navigator.clipboard` at all. The focus goes back where it was, without scrolling.
 */
async function writeText(text: string): Promise<void> {
  if (window.isSecureContext && typeof navigator.clipboard?.writeText === 'function') {
    await navigator.clipboard.writeText(text);
    return;
  }

  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const area = document.createElement('textarea');

  area.value = text;
  area.setAttribute('readonly', '');
  area.setAttribute('aria-hidden', 'true');
  area.style.position = 'fixed';
  area.style.inset = '0 auto auto 0';
  area.style.opacity = '0';
  area.style.pointerEvents = 'none';

  document.body.appendChild(area);
  area.select();

  try {
    /* Deprecated, and the only way left where the Clipboard API is not offered */
    if (!document.execCommand('copy')) {
      throw new Error('The browser refused to copy');
    }
  }
  finally {
    area.remove();
    active?.focus({ preventScroll: true });
  }
}


/* --------
 * Hook Definition
 * -------- */

/**
 * Copies a text to the clipboard and says how it went, for a button that turns into a tick for a moment.
 *
 * ```tsx
 * const clipboard = useClipboard();
 *
 * <button onClick={() => clipboard.copy(apiKey)}>
 *   {clipboard.status === 'copied' ? 'Copied' : 'Copy'}
 * </button>
 * ```
 *
 * The value may be a function, read at the moment of the copy, and it may be asynchronous: a link
 * created on demand. A second copy before the reset starts the time again.
 */
export function useClipboard(options: ClipboardOptions = {}): Clipboard {

  // ----
  // Options Deconstruct
  // ----
  const { resetAfter = 1500 } = options;


  // ----
  // Internal State
  // ----
  const [ status, setStatus ] = React.useState<ClipboardStatus>('idle');
  const timerRef = React.useRef<number | undefined>(undefined);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);


  // ----
  // Handlers
  // ----
  const settle = React.useCallback((next: ClipboardStatus) => {
    window.clearTimeout(timerRef.current);
    setStatus(next);
    timerRef.current = window.setTimeout(() => setStatus('idle'), resetAfter);
  }, [ resetAfter ]);

  const copy = React.useCallback(async (value: ClipboardValue): Promise<boolean> => {
    try {
      await writeText(typeof value === 'function' ? await value() : value);
      settle('copied');
      return true;
    }
    catch {
      settle('failed');
      return false;
    }
  }, [ settle ]);


  // ----
  // Hook Return
  // ----
  return { status, copy };

}
