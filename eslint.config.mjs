import proedis from 'eslint-config-proedis';


/**
 * The suite lints itself with the config it publishes.
 *
 * The React preset is used for every package, not only the React ones: its extra rules only ever
 * fire on JSX, and running a single configuration over the whole repository is worth more than the
 * handful of rules it adds where there is no JSX to check.
 */
export default proedis.defineConfig(
  proedis.react({
    /** Library code has to be safe in both environments, so both sets of globals are declared */
    globals: [ 'browser', 'node' ],

    /** Pinned rather than detected: the root pin is what every package is built against */
    reactVersion: '19',

    ignores: [
      /** Generated from eslint-config-airbnb-base, rebuilt with 'yarn rules:sync' */
      '**/lib/airbnb/**'
    ]
  }),

  /** The build tooling is CommonJS, and the repository root has no 'type' field to say so */
  proedis.configs.commonjs([ 'scripts/**/*.js' ]),

  {
    /**
     * The generator resolves an Airbnb rule file per iteration, which is a dynamic require by
     * definition — there is no static specifier that could enumerate eight files.
     */
    name : 'suite/rules-generator',
    files: [ 'scripts/sync-airbnb-rules.mjs' ],
    rules: {
      'import/no-dynamic-require': [ 'off' ]
    }
  }
);
