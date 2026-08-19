/**
 * eslint-config-proedis
 *
 * The shared ESLint flat configuration of the Proedis suite.
 *
 * Two presets, {@link base} and {@link react}, each returning a plain flat config array — which is
 * what makes them composable: a flat config is an array, and for any file the last entry that
 * matches it wins. Appending your own entry is therefore all it takes to override anything.
 *
 * Every plugin the presets rely on is a real dependency of this package, so installing it is enough:
 * there is no list of peer plugins to keep in sync on the project side.
 *
 * @example
 * // eslint.config.mjs
 * import proedis from 'eslint-config-proedis';
 *
 * export default proedis.react();
 *
 * @example
 * // …with project specific adjustments
 * import proedis from 'eslint-config-proedis';
 * import tanstack from '@tanstack/eslint-plugin-query';
 *
 * export default proedis.defineConfig(
 *   proedis.react({ reactVersion: '19', ignores: [ 'src/generated/**' ] }),
 *
 *   // a rule of the shared config, relaxed
 *   { rules: { 'no-console': [ 'off' ] } },
 *
 *   // a plugin of your own, installed by the project
 *   { plugins: { '@tanstack/query': tanstack }, rules: { '@tanstack/query/exhaustive-deps': 'error' } },
 *
 *   // a rule loosened for one directory only
 *   { files: [ 'src/legacy/**' ], rules: { '@stylistic/max-len': [ 'off' ] } }
 * );
 *
 * @example
 * // …or composed from the individual blocks, skipping the presets entirely
 * import proedis from 'eslint-config-proedis';
 *
 * export default proedis.defineConfig(
 *   proedis.configs.ignores(),
 *   proedis.configs.files(),
 *   proedis.configs.javascript,
 *   proedis.configs.typescript,
 *   proedis.configs.stylistic
 * );
 */
import globals from 'globals';

import * as configs from './lib/blocks.js';
import defineConfig from './lib/define-config.js';
import plugins from './lib/plugins.js';
import { base, react } from './lib/presets.js';


export { base, react, configs, defineConfig, plugins, globals };

export default { base, react, configs, defineConfig, plugins, globals };
