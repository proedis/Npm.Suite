import proedis from 'eslint-config-proedis';


/* --------
 * @proedis/ui
 * -------- */

const UI = 'packages/ui/src';

/** The sections of @proedis/ui, in the order they may depend on each other: each imports only from earlier ones */
const UI_SECTIONS = [ 'core', 'layout', 'primitives', 'internal', 'actions', 'display', 'feedback', 'forms', 'overlays', 'data' ];

/**
 * The sections where layout comes from the layout primitives only. A section joins the list in the
 * commit that moves its hand-written containers onto Stack, Cluster and Grid, and from then on stays
 * locked. `layout` itself never joins: it is where those classes are written, once.
 */
const UI_LAYOUT_LOCKED = [ 'primitives', 'internal', 'actions', 'display', 'feedback' ];

/** A display class (`flex`, `inline-flex`, `grid`, `inline-grid`), with or without variants */
const DISPLAY = String.raw`(?:^|\s)(?:[^\s:]+:)*(?:inline-)?(?:flex|grid)(?:\s|$)`;
const DISPLAY_ALONE = String.raw`^(?:[^\s:]+:)*(?:inline-)?(?:flex|grid)$`;
const GAP = String.raw`(?:^|\s)(?:[^\s:]+:)*gap-(?:[xy]-)?\S`;

const LAYOUT_MESSAGE = 'Layout written by hand. Use Stack, Cluster or Grid from layout, with their props (direction, '
  + 'gap, align, justify, wrap, inline, columns). An exception needs an eslint-disable comment saying why the primitives '
  + 'cannot express it.';


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
  },

  {
    /**
     * The sections of @proedis/ui depend one way: a section imports from the ones before it and never
     * from the ones after. The resolver is told about TypeScript, or the rule resolves nothing and
     * passes in silence.
     */
    name    : 'suite/ui-sections',
    files   : [ `${UI}/**/*.{ts,tsx}` ],
    settings: {
      'import/resolver': { node: { extensions: [ '.ts', '.tsx', '.js', '.mjs' ] } }
    },
    rules: {
      'import/no-restricted-paths': [ 'error', {
        zones: [
          ...UI_SECTIONS.slice(0, -1).map((section, index) => ({
            target : `./${UI}/${section}`,
            from   : UI_SECTIONS.slice(index + 1).map((later) => `./${UI}/${later}`),
            message: `'${section}' may import only from the sections before it: ${UI_SECTIONS.slice(0, index).join(', ') || 'none'}.`
          })),
          {
            target : `./${UI}/hooks`,
            from   : UI_SECTIONS.slice(1).map((section) => `./${UI}/${section}`),
            message: 'The hooks of @proedis/ui may import only from core.'
          }
        ]
      } ]
    }
  },

  ...(UI_LAYOUT_LOCKED.length ? [ {
    /**
     * In a locked section a container is a layout primitive, never a class string that rebuilds one.
     * The selectors of the shared Tailwind block come first because this rule replaces it for these
     * files rather than adding to it.
     */
    name : 'suite/ui-layout',
    files: UI_LAYOUT_LOCKED.map((section) => `${UI}/${section}/**/*.{ts,tsx}`),
    rules: {
      'no-restricted-syntax': [
        ...proedis.configs.tailwind.rules['no-restricted-syntax'],
        { message: LAYOUT_MESSAGE, selector: `Literal[value=/${DISPLAY}/][value=/\\s/]` },
        { message: LAYOUT_MESSAGE, selector: `JSXAttribute[name.name='className'] Literal[value=/${DISPLAY_ALONE}/]` },
        { message: LAYOUT_MESSAGE, selector: `CallExpression[callee.name='cn'] > Literal[value=/${DISPLAY_ALONE}/]` },
        { message: LAYOUT_MESSAGE, selector: `TemplateElement[value.raw=/${DISPLAY}/]` },
        { message: LAYOUT_MESSAGE, selector: `Literal[value=/${GAP}/]` },
        { message: LAYOUT_MESSAGE, selector: `TemplateElement[value.raw=/${GAP}/]` }
      ]
    }
  } ] : [])
);
