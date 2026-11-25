import * as React from 'react';

import type { ComboboxItem } from '@proedis/ui/forms/combobox';
import { CONTRACTS } from './contracts';


/*
 * What `useSearchQuery` of @proedis/react-query does in an application, written small so the examples
 * run without a server: the term is debounced, the request takes its time, the answer is the first
 * results with a flag when there are more. `slow` and `failing` let the reader meet every state.
 */


/* --------
 * Types Definition
 * -------- */

export interface ContractSearchOptions {
  /** The request takes 1.5s instead of 0.4s: past the 300ms after which "Searching…" shows */
  readonly slow?: boolean;

  /** Every request fails, until Retry is pressed with it off */
  readonly failing?: boolean;

  /** Results shown at most. Defaults to 8 */
  readonly limit?: number;
}

export interface ContractSearch {
  readonly items: readonly ComboboxItem[];
  readonly onInputValueChange: (text: string) => void;
  readonly searching: boolean;
  readonly resultsFor: string | undefined;
  readonly searchError: boolean;
  readonly hasMore: boolean;
  readonly onRetry: () => void;
  readonly onFlush: () => void;
}

interface Answer {
  readonly term: string;
  readonly items: readonly ComboboxItem[];
  readonly hasMore: boolean;
  readonly failed: boolean;
}


/* --------
 * Constants Definition
 * -------- */

const MIN_CHARS = 2;

const DEBOUNCE_MS = 250;


/* --------
 * Helpers
 * -------- */

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

/** The request: every record whose code, holder or address holds the term */
function request(term: string, options: ContractSearchOptions): Promise<Omit<Answer, 'term' | 'failed'>> {
  const wanted = normalize(term);
  const limit = options.limit ?? 8;

  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (options.failing) {
        reject(new Error('The server did not answer'));
        return;
      }

      const found = CONTRACTS.filter((item) => (
        normalize(`${item.code} ${item.label} ${item.description}`).includes(wanted)
      ));

      resolve({ items: found.slice(0, limit), hasMore: found.length > limit });
    }, options.slow ? 1500 : 400);
  });
}


/* --------
 * Hook
 * -------- */

export default function useContractSearch(options: ContractSearchOptions = {}): ContractSearch {
  const [ term, setTerm ] = React.useState('');
  const [ answer, setAnswer ] = React.useState<Answer | null>(null);
  const [ attempt, setAttempt ] = React.useState(0);

  /** Set by a flush: the next run skips the debounce */
  const flushRef = React.useRef(false);

  const { failing, limit, slow } = options;

  React.useEffect(() => {
    if (term.trim().length < MIN_CHARS) {
      return undefined;
    }

    let current = true;
    const wait = flushRef.current ? 0 : DEBOUNCE_MS;

    flushRef.current = false;

    const timer = window.setTimeout(() => {
      request(term, { failing, limit, slow }).then(
        (result) => current && setAnswer({ term, ...result, failed: false }),
        () => current && setAnswer({ term, items: [], hasMore: false, failed: true })
      );
    }, wait);

    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [ term, attempt, failing, limit, slow ]);

  const settled = answer !== null && answer.term === term;

  const onRetry = React.useCallback(() => {
    setAnswer(null);
    setAttempt((count) => count + 1);
  }, []);

  const onFlush = React.useCallback(() => {
    flushRef.current = true;
    setAttempt((count) => count + 1);
  }, []);

  return {
    items             : settled ? answer.items : [],
    onInputValueChange: setTerm,
    searching         : term.trim().length >= MIN_CHARS && !settled,
    resultsFor        : answer?.term,
    searchError       : settled && answer.failed,
    hasMore           : settled && answer.hasMore,
    onRetry,
    onFlush
  };
}
