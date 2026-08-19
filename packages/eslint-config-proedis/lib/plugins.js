import stylistic from '@stylistic/eslint-plugin';
import pluginImport from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';


/**
 * Every plugin this config ships, keyed by the namespace its rules are configured under.
 *
 * Re-exported so that a project can reconfigure any rule of any of them — or add a config entry of
 * its own scoped to a subset of files — without installing a single one of them. They are real
 * dependencies of this package, so they are already on disk.
 *
 * @example
 * import proedis from 'eslint-config-proedis';
 *
 * export default proedis.defineConfig(
 *   proedis.react(),
 *   {
 *     files  : [ 'src/legacy/**' ],
 *     plugins: { '@stylistic': proedis.plugins['@stylistic'] },
 *     rules  : { '@stylistic/max-len': [ 'off' ] }
 *   }
 * );
 */
export default {
  '@stylistic'        : stylistic,
  '@typescript-eslint': tseslint.plugin,
  import            : pluginImport,
  react             : pluginReact,
  'react-hooks'       : pluginReactHooks
};
