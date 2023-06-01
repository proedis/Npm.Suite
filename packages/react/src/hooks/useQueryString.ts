import * as React from 'react';

import type { NavigateOptions, useSearchParams as UseSearchParamsType } from 'react-router-dom';

import * as qs from 'qs';
import type { IParseOptions, IStringifyOptions, ParsedQs } from 'qs';

import { peerRequire } from '@proedis/utils';

import type { AnyObject } from '@proedis/types';


/* --------
 * Peer Dependencies Import
 * -------- */
const reactRouterDom = peerRequire('react-router-dom');


/* --------
 * Internal Types
 * -------- */
interface UseQueryStringOptions {
  /** Options to use while parsing data */
  parsing?: Partial<IParseOptions>;

  /** Options to use while stringify data */
  stringify?: Partial<IStringifyOptions>;
}

type SetQueryString<Data extends ParsedQs> = (value: React.SetStateAction<Data>, options?: NavigateOptions) => void;

type UseQueryStringResult<Data extends ParsedQs> = [ Data, SetQueryString<Data> ];


/* --------
 * Internal Helpers
 * -------- */
function parseQueryString<Data extends ParsedQs>(str: string, options?: IParseOptions): Data {
  return qs.parse(str, {
    parseArrays: true,
    ...options
  }) as Data;
}


function stringifyQueryString<Data extends AnyObject>(data: Data, options?: IStringifyOptions): string {
  return qs.stringify(data, {
    arrayFormat: 'indices',
    skipNulls  : true,
    ...options
  });
}


/* --------
 * Hook Definition
 * -------- */


/**
 * Use this hook to get or change the current query string.
 * This hook strictly depends on the `react-router-dom` package and
 * could not be used if package is not installed.
 * Passed options will be referenced using useRef internal hook,
 * changing them won't affect parsing/stringify url search data before next render
 *
 * @param options
 */
export function useQueryString<Data extends ParsedQs>(options?: UseQueryStringOptions): UseQueryStringResult<Data> {

  // ----
  // Options deconstruct
  // ----
  const {
    parsing,
    stringify
  } = options || {};
  React.useState();

  // ----
  // Internal hooks
  // ----
  const useSearchParams = reactRouterDom.useSearchParams as typeof UseSearchParamsType;
  const [ urlSearchParams, setUrlSearchParams ] = useSearchParams(location.search);
  const parsingOptionsRef = React.useRef(parsing);
  const stringifyOptionRef = React.useRef(stringify);


  // ----
  // Memoized Data
  // ----
  const stringUrlSearchParams = urlSearchParams.toString();
  const queryStringData = React.useMemo(
    () => parseQueryString<Data>(stringUrlSearchParams, parsingOptionsRef.current),
    [ stringUrlSearchParams ]
  );


  // ----
  // Callbacks
  // ----
  const setQueryString = React.useCallback<SetQueryString<Data>>(
    (value, setOptions) => {
      /** Create the new data using provided action */
      const newData = typeof value === 'function' ? value(queryStringData) : value;
      /** Set the new SearchParams */
      setUrlSearchParams(stringifyQueryString(newData, stringifyOptionRef.current), setOptions);
    },
    [ queryStringData, setUrlSearchParams ]
  );


  // ----
  // Hook Return
  // ----
  return [ queryStringData, setQueryString ];

}
