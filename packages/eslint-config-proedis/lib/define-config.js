/**
 * Flatten a list of config entries into the single flat array ESLint expects.
 *
 * A flat config *is* an array, which is what makes it composable: later entries override earlier
 * ones for the files they both match. This helper exists so that arrays, single objects and
 * conditionals can be mixed freely, without the caller having to remember where a spread is needed.
 *
 * Nested arrays are flattened all the way down, and anything falsy is dropped — which is what makes
 * a conditional entry read the way you would write it.
 *
 * @param {...any} entries Config objects, arrays of them, or falsy values to skip
 * @return {object[]} The flattened config array
 *
 * @example
 * import proedis from 'eslint-config-proedis';
 *
 * export default proedis.defineConfig(
 *   proedis.react({ ignores: [ 'src/generated/**' ] }),
 *   process.env.CI && { rules: { 'no-console': [ 'error' ] } },
 *   { rules: { 'no-param-reassign': [ 'off' ] } }
 * );
 */
export default function defineConfig(...entries) {
  return entries.flat(Number.POSITIVE_INFINITY).filter(Boolean);
}
