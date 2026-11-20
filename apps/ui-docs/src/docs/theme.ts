import * as React from 'react';


/* --------
 * Types Definition
 * -------- */

export type ThemeChoice = 'light' | 'dark' | 'system';


/* --------
 * Constants Definition
 * -------- */

/** The same key the script in `index.html` reads before the first paint */
const STORAGE_KEY = 'ui-docs:theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';


/* --------
 * Store
 * -------- */

const listeners = new Set<() => void>();

function readChoice(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  }
  catch {
    return 'system';
  }
}

let choice: ThemeChoice = typeof window === 'undefined' ? 'system' : readChoice();

/** The `dark` class on the root, which is what the `dark` variant of the package reads */
function apply(): void {
  const dark = choice === 'dark' || (choice === 'system' && window.matchMedia(DARK_QUERY).matches);
  document.documentElement.classList.toggle('dark', dark);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function setChoice(next: ThemeChoice): void {
  choice = next;

  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  }
  catch {
    /* A private window refuses the storage: the choice lasts until the page reloads */
  }

  apply();
  listeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  window.matchMedia(DARK_QUERY).addEventListener('change', () => {
    if (choice === 'system') {
      apply();
    }
  });
}


/* --------
 * Hook
 * -------- */

/** The theme the reader chose, and the setter that applies it at once */
export function useTheme(): [ ThemeChoice, (next: ThemeChoice) => void ] {
  const current = React.useSyncExternalStore(subscribe, () => choice, () => 'system' as ThemeChoice);
  return [ current, setChoice ];
}
