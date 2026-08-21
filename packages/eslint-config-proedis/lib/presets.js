import * as configs from './blocks.js';
import defineConfig from './define-config.js';


/* --------
 * Internal Helpers
 * -------- */

/**
 * The layers every preset shares, in the order they have to appear.
 *
 * Order is the whole mechanism of a flat config: for any given file, the last entry that matches it
 * wins. So the recommended sets of ESLint, the import plugin and typescript-eslint come first, then
 * the Airbnb decisions on top of them, and the Proedis adjustments last.
 *
 * @param options The resolved preset options
 * @return {object[]} The shared layers
 */
const commonLayers = (options) => [
  configs.ignores(options.ignores, options.defaultIgnores),
  configs.files(options.files),
  configs.languageOptions(options.globals),

  /** The upstream recommended sets */
  configs.javascript,
  configs.imports,
  configs.typescript,

  /** The vendored Airbnb decisions, on top of them */
  configs.airbnb,

  /** …and the Proedis adjustments last, so they win over both */
  configs.typescriptCoreOverrides,
  configs.importOverrides,
  configs.style,
  configs.typescriptOverrides
];


/* --------
 * Presets
 * -------- */

/**
 * The Proedis config for a project without React: a Node tool, a CLI, a plain TypeScript library.
 *
 * The returned value is a plain flat config array, so it composes by appending: anything you place
 * after it overrides it for the files both match.
 *
 * @param {object} [options] Preset options
 * @param {string[]} [options.files] File patterns to lint, defaults to every JavaScript and
 *   TypeScript extension
 * @param {string[]} [options.ignores] Extra ignore patterns, appended to the defaults
 * @param {boolean} [options.defaultIgnores] Whether the default ignore patterns apply, default true
 * @param {string|string[]|object} [options.globals] Globals available to the code: a set name from
 *   the 'globals' package, a list of them, or a raw object. Defaults to `'node'`.
 * @return {object[]} The flat config array
 *
 * @example
 * import proedis from 'eslint-config-proedis';
 *
 * export default proedis.base();
 */
export function base(options = {}) {
  const resolved = {
    files         : options.files,
    ignores       : options.ignores ?? [],
    defaultIgnores: options.defaultIgnores ?? true,
    globals       : options.globals ?? 'node'
  };

  return defineConfig(commonLayers(resolved));
}


/**
 * The Proedis config for a React project, web or native.
 *
 * Everything {@link base} carries, plus the React and React Hooks layers — including the compiler
 * era hook rules introduced by version 7 of the hooks plugin, which are stricter than most people
 * expect the first time they run them — and the Tailwind layer, which fails an arbitrary value in a
 * class.
 *
 * @param {object} [options] Preset options
 * @param {string[]} [options.files] File patterns to lint, defaults to every JavaScript and
 *   TypeScript extension
 * @param {string[]} [options.ignores] Extra ignore patterns, appended to the defaults
 * @param {boolean} [options.defaultIgnores] Whether the default ignore patterns apply, default true
 * @param {string|string[]|object} [options.globals] Globals available to the code, defaults to
 *   `'browser'`
 * @param {string} [options.reactVersion] React version reported to the plugin, defaults to
 *   `'detect'`
 * @return {object[]} The flat config array
 *
 * @example
 * import proedis from 'eslint-config-proedis';
 *
 * export default proedis.defineConfig(
 *   proedis.react({ reactVersion: '19', ignores: [ 'src/generated/**' ] }),
 *   { rules: { 'no-console': [ 'off' ] } }
 * );
 */
export function react(options = {}) {
  const resolved = {
    files         : options.files,
    ignores       : options.ignores ?? [],
    defaultIgnores: options.defaultIgnores ?? true,
    globals       : options.globals ?? 'browser'
  };

  return defineConfig(
    commonLayers(resolved),
    configs.react(options.reactVersion ?? 'detect'),
    configs.reactOverrides,
    configs.reactHooks,
    configs.tailwind
  );
}
