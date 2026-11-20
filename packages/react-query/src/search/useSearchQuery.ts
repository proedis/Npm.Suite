'use client';

import * as React from 'react';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { QueryKey } from '@tanstack/react-query';


/* --------
 * Types Definition
 * -------- */

export interface SearchQueryFnArgs {
  /** The term, trimmed and settled after the debounce */
  readonly term: string;

  /** How many items to ask for: one more than the page, to know whether there are more */
  readonly limit: number;

  /** Aborted when the term moves on: the answer to an old term never reaches the screen */
  readonly signal: AbortSignal;
}

export interface UseSearchQueryOptions<TItem> {
  /** What the user typed, as typed: the hook trims and debounces it */
  term: string;

  /** The key of a term's results. The term and the limit have to be part of it */
  queryKey: (term: string, limit: number) => QueryKey;

  /** The request. It receives `limit + 1` and the signal to pass to the transport */
  queryFn: (args: SearchQueryFnArgs) => Promise<readonly TItem[]>;

  /** Items shown at most. Defaults to 50 */
  limit?: number;

  /** Under this many characters nothing is requested. Defaults to 2 */
  minChars?: number;

  /** The wait after the last keystroke. Defaults to 250ms */
  debounceMs?: number;

  /** Off, nothing is requested whatever the term. Defaults to `true` */
  enabled?: boolean;
}

export type SearchQueryStatus = 'idle' | 'pending' | 'success' | 'error';

export interface SearchQueryResult<TItem> {
  /** The results on screen, at most `limit`. Kept while the next term is on its way */
  readonly items: readonly TItem[];

  /** More results exist than the ones shown: the list says "type more" */
  readonly hasMore: boolean;

  /**
   * `idle` under `minChars` (nothing requested), `pending` while the term settles or travels,
   * `success` or `error` for the term in `settledTerm`.
   */
  readonly status: SearchQueryStatus;

  /** The term the items belong to. A list that picks on Enter compares the typed term with this */
  readonly settledTerm: string;

  /** The term is debouncing or its request is in flight */
  readonly isPending: boolean;

  readonly error: unknown;

  /** Asks again for the current term, after an error */
  readonly retry: () => void;

  /**
   * Ends the debounce now. A barcode scanner types the whole code and sends Enter before the wait is
   * over: the list flushes, then waits for `settledTerm` to match before picking.
   */
  readonly flush: () => void;
}


/* --------
 * Helpers
 * -------- */

/** The HTTP status an error carries, under any of the names the transports use */
function statusOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const candidate = error as { status?: unknown; statusCode?: unknown; response?: { status?: unknown } };
  const status = candidate.statusCode ?? candidate.status ?? candidate.response?.status;

  return typeof status === 'number' ? status : undefined;
}


/** Once on a server error or the network, never on a 4xx: asking again would get the same answer */
function retryOnce(failureCount: number, error: unknown): boolean {
  const status = statusOf(error);

  return failureCount < 1 && !(status !== undefined && status >= 400 && status < 500);
}


/* --------
 * Hook Definition
 * -------- */

/**
 * The results of a search typed into a field: a combobox, the search of a selector.
 *
 * ```ts
 * const search = useSearchQuery({
 *   term,
 *   queryKey: (term, limit) => [ 'estate-contracts', 'search', term, limit ],
 *   queryFn : ({ term, limit, signal }) => client.request<EstateContract[]>(
 *     { url: 'estate-contracts', params: { term, limit } },
 *     signal
 *   )
 * });
 * ```
 *
 * What every search needs and gets wrong one at a time:
 *
 * - **debounce** on the trimmed term, so a word typed is one request and not five;
 * - **last answer wins**: the term is in the key and the previous request is aborted through the
 *   signal, so a slow answer to an old term never replaces the new one;
 * - **`limit + 1`**: one more item than shown, so the list knows whether to say "type more";
 * - **nothing under `minChars`**, and no request at all for it;
 * - the **previous items stay** while the next term travels: the list does not empty at every key;
 * - **retry** once on a server error or the network, never on a 4xx.
 *
 * No spinner delay here: when to show one is the component's business.
 */
export function useSearchQuery<TItem>(options: UseSearchQueryOptions<TItem>): SearchQueryResult<TItem> {

  // ----
  // Options Deconstruct
  // ----
  const {
    debounceMs = 250,
    enabled = true,
    limit = 50,
    minChars = 2,
    queryFn,
    queryKey,
    term
  } = options;


  // ----
  // Internal State
  // ----
  const trimmed = term.trim();

  const [ debounced, setDebounced ] = React.useState(trimmed);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    if (trimmed === debounced) {
      return undefined;
    }

    const timer = window.setTimeout(() => setDebounced(trimmed), debounceMs);

    return () => window.clearTimeout(timer);
  }, [ trimmed, debounced, debounceMs ]);


  // ----
  // Internal Hooks
  // ----
  const active = enabled && debounced.length >= minChars;

  /* The term travels with its items, so the items kept on screen still say which term they answer */
  const query = useQuery({
    queryKey: queryKey(debounced, limit),
    queryFn : async ({ signal }) => ({
      term : debounced,
      items: await queryFn({ term: debounced, limit: limit + 1, signal })
    }),
    enabled        : active,
    placeholderData: keepPreviousData,
    retry          : retryOnce
  });


  // ----
  // Hook Return
  // ----
  const typingAboveMin = enabled && trimmed.length >= minChars;
  const isPending = typingAboveMin && (trimmed !== debounced || query.isFetching);
  const data = typingAboveMin ? query.data?.items ?? [] : [];

  let status: SearchQueryStatus = 'success';

  if (!typingAboveMin) {
    status = 'idle';
  }
  else if (isPending) {
    status = 'pending';
  }
  else if (query.isError) {
    status = 'error';
  }

  return {
    items      : data.slice(0, limit),
    hasMore    : data.length > limit,
    status,
    settledTerm: typingAboveMin ? query.data?.term ?? '' : '',
    isPending,
    error      : query.error,
    retry      : () => {
      query.refetch().catch(() => undefined);
    },
    flush: () => setDebounced(trimmed)
  };

}
