import type { AnyObject } from '@proedis/types';


/* --------
 * Constants
 * -------- */

/**
 * The four substitutions that separate this encoder from a bare `encodeURIComponent`.
 *
 * They are not a style choice: they are what axios emitted, measured character by character across the
 * printable range, and reproducing them exactly is what keeps a query string byte-identical after the
 * transport swap. Anything a server signs, logs or matches on the raw query string therefore keeps
 * seeing what it saw before.
 *
 * Note that brackets stay percent-encoded (`%5B` / `%5D`), which is also what went over the wire.
 */
const ENCODED_CHARACTER_OVERRIDES: [ RegExp, string ][] = [
  [ /%24/g, '$' ],
  [ /%2C/gi, ',' ],
  [ /%3A/gi, ':' ],
  [ /%20/g, '+' ]
];


/* --------
 * Internal Helpers
 * -------- */

/**
 * Percent-encode one key or one value.
 *
 * @param value The string to encode
 */
function encodeComponent(value: string): string {
  return ENCODED_CHARACTER_OVERRIDES.reduce(
    (encoded, [ pattern, replacement ]) => encoded.replace(pattern, replacement),
    encodeURIComponent(value)
  );
}


/**
 * Whether a value ends up as a single scalar in the query string.
 *
 * A `Date` counts as one — it serializes to its ISO string — which matters for the bracket decision
 * below, where an array of dates is treated exactly like an array of numbers.
 *
 * @param value The value to classify
 */
function isScalar(value: unknown): boolean {
  return value === null
    || typeof value !== 'object'
    || value instanceof Date;
}


/** Render a scalar the way the wire expects it */
function renderScalar(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value);
}


/* --------
 * Serializer
 * -------- */

/**
 * Serialize a params object into a query string, matching axios byte for byte.
 *
 * The rules are not invented here — every one of them was measured against a real request, because a
 * server that parses `ids[]=1&ids[]=2` differently from `ids[0]=1&ids[1]=2` fails silently and only in
 * production:
 *
 * - `null` and `undefined` are dropped at any depth, inside arrays included, while `0` and `''` are kept
 * - a `Date` becomes its ISO string
 * - an array of scalars at the top level uses the empty-bracket form, `ids[]=1&ids[]=2`
 * - any other array uses indices — one holding an object or another array, or any array nested below the
 *   top level, even when all of its own items are scalars
 * - an object nests by key, `filter[name]=marco`, all the way down
 * - an empty array or object contributes nothing at all
 *
 * @param params The params object to serialize
 * @returns The query string **without** a leading `?`, empty when nothing was serializable
 *
 * @example
 * serializeParams({ page: 1, tags: [ 'a', 'b' ] });        // 'page=1&tags%5B%5D=a&tags%5B%5D=b'
 * serializeParams({ filter: { name: 'marco' } });          // 'filter%5Bname%5D=marco'
 * serializeParams({ from: new Date(0) });                  // 'from=1970-01-01T00:00:00.000Z'
 * serializeParams({ a: null, b: 0 });                      // 'b=0'
 */
export default function serializeParams(params: AnyObject): string {
  const pairs: string[] = [];

  /**
   * Walk one entry, appending every pair it produces.
   *
   * @param key The key built so far, brackets included
   * @param value The value sitting at that key
   * @param isTopLevel Whether the key is still a bare name, which is the only place the empty-bracket
   *   array form is used
   */
  const walk = (key: string, value: unknown, isTopLevel: boolean): void => {
    /** Nil values are dropped outright, at any depth */
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      /** An array of scalars at the top level is the only case using the empty-bracket form */
      const useEmptyBrackets = isTopLevel && value.every((item) => item === null || item === undefined || isScalar(item));

      value.forEach((item, index) => {
        walk(`${key}[${useEmptyBrackets ? '' : index}]`, item, false);
      });

      return;
    }

    if (isScalar(value)) {
      pairs.push(`${encodeComponent(key)}=${encodeComponent(renderScalar(value))}`);
      return;
    }

    /** Anything else is a keyed object: nest by key and keep walking */
    Object.entries(value as AnyObject).forEach(([ property, entry ]) => {
      walk(`${key}[${property}]`, entry, false);
    });
  };

  Object.entries(params).forEach(([ key, value ]) => {
    walk(key, value, true);
  });

  return pairs.join('&');
}
