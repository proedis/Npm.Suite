import js from '@eslint/js';
import globalsMap from 'globals';
import tseslint from 'typescript-eslint';

import airbnbRules from './airbnb/index.js';
import plugins from './plugins.js';


/* --------
 * Constants
 * -------- */

/**
 * The file patterns linted by default.
 *
 * A flat config entry carrying nothing but 'files' is not a no-op: it is what tells ESLint to pick
 * up anything other than plain '.js' when it walks a directory. Without it, 'eslint .' silently
 * ignores every '.ts' and '.tsx' file in the project.
 */
export const DEFAULT_FILES = [ '**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}' ];

/** Directories no project ever wants linted */
const IGNORED_DIRECTORIES = [
  'build',
  'dist',
  'out',
  'coverage',
  'node_modules',
  '.git',
  '.yarn',
  '.next',
  '.turbo',
  '.nx',
  '.cache'
];

export const DEFAULT_IGNORES = IGNORED_DIRECTORIES.flatMap((directory) => [
  `**/${directory}`,
  `**/${directory}/**`
]);


/* --------
 * Helpers
 * -------- */

/**
 * Resolve the 'globals' option of a preset into a globals object.
 *
 * Accepts the name of a set from the 'globals' package, an array of names to merge, or a raw object
 * for the cases neither covers.
 *
 * @param value The option value
 * @return {object} The resolved globals object
 */
function resolveGlobals(value) {
  if (!value) {
    return {};
  }

  if (Array.isArray(value)) {
    return Object.assign({}, ...value.map(resolveGlobals));
  }

  if (typeof value === 'string') {
    const resolved = globalsMap[value];

    if (!resolved) {
      throw new Error(
        `Unknown globals set '${value}'. Use one of the keys exported by the 'globals' package `
        + '(\'browser\', \'node\', \'worker\', …), an array of them, or a plain object'
      );
    }

    return resolved;
  }

  return value;
}


/* --------
 * Configuration Blocks
 * -------- */

/**
 * Global ignores.
 *
 * Kept as a config entry holding *only* 'ignores', which is what makes it global rather than scoped
 * to the files of a single entry.
 *
 * @param extra Additional patterns, appended to the defaults
 * @param useDefaults Whether the default patterns are included at all
 */
export const ignores = (extra = [], useDefaults = true) => ({
  name   : 'proedis/ignores',
  ignores: [ ...(useDefaults ? DEFAULT_IGNORES : []), ...extra ]
});


/** The file patterns to lint */
export const files = (patterns = DEFAULT_FILES) => ({
  name : 'proedis/files',
  files: patterns
});


/** The globals available to the linted code */
export const languageOptions = (value) => ({
  name           : 'proedis/language-options',
  languageOptions: {
    globals: resolveGlobals(value)
  }
});


/** ESLint's own recommended rules */
export const javascript = {
  name : 'proedis/javascript',
  rules: js.configs.recommended.rules
};


/**
 * The TypeScript layer: the typescript-eslint parser and plugin, its recommended rules, and the
 * Proedis adjustments on top.
 *
 * Type aware linting is deliberately **not** enabled. It needs a tsconfig per lint run and turns a
 * two second lint into a full typecheck, which the build already does, and does better.
 */
export const typescript = [ ...tseslint.configs.recommended ];


/**
 * The core rules TypeScript itself already enforces, turned off again.
 *
 * typescript-eslint ships exactly this list as 'eslintRecommended', and its own recommended set
 * already applies it — but the Airbnb layer that comes afterwards switches several of them back on,
 * and the last entry to match a file is the one that wins. Re-applying it after Airbnb is what keeps
 * 'no-undef' from reporting every DOM type used in a type position as an undefined variable.
 *
 * It stays scoped to TypeScript files, exactly as upstream declares it: a plain '.js' file has no
 * compiler behind it and still needs these rules.
 */
export const typescriptCoreOverrides = [ tseslint.configs.eslintRecommended ].flat();


/**
 * The Proedis TypeScript adjustments.
 *
 * Applied *after* the Airbnb layer on purpose. Airbnb configures the core versions of
 * 'no-shadow', 'no-unused-vars', 'no-redeclare' and 'no-use-before-define', which have to be turned
 * off here rather than earlier: whichever entry comes last wins, so disabling them before Airbnb
 * re-enables them only produces two reports for every finding.
 */
export const typescriptOverrides = {
  name : 'proedis/typescript',
  rules: {
    /** Type-only imports are stated as such, so a bundler can drop them file by file */
    '@typescript-eslint/consistent-type-imports': [ 'error' ],

    /** Naming is a review matter here, not a lint matter */
    '@typescript-eslint/naming-convention': [ 'off' ],

    /** 'any' is a tool with legitimate uses, and the type surface is reviewed anyway */
    '@typescript-eslint/no-explicit-any': [ 'off' ],

    /** '{}' is how a declaration merging seam is declared, and the suite uses several */
    '@typescript-eslint/no-empty-object-type': [ 'off' ],

    /** A type and a constant sharing one name is a deliberate pattern in @proedis/types */
    '@typescript-eslint/no-redeclare': [ 'error', { builtinGlobals: false } ],

    /** A '_' argument is an explicit "required by the signature, unused by me" */
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars              : 'all',
        args              : 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern : '^_+$'
      }
    ],

    /** The TypeScript aware versions replace their core counterparts, disabled below */
    '@typescript-eslint/no-use-before-define': [ 'error' ],
    '@typescript-eslint/no-shadow'           : [ 'error' ],

    /** A '@ts-expect-error' carrying a reason is a documented decision, not a smell */
    '@typescript-eslint/ban-ts-comment': [ 'off' ],

    /**
     * The core counterparts of the four rules above. They do not understand type declarations: an
     * overload signature or an ambient type reads as a redeclaration, and a type used before its
     * declaration reads as a temporal dead zone violation.
     */
    'no-redeclare'        : [ 'off' ],
    'no-shadow'           : [ 'off' ],
    'no-unused-vars'      : [ 'off' ],
    'no-use-before-define': [ 'off' ]
  }
};


/**
 * The Airbnb rule decisions, vendored.
 *
 * See 'lib/airbnb' for what that means and why: the short version is that the config is frozen on a
 * peer range npm refuses to install next to a current ESLint, while its rule decisions are still
 * worth having.
 */
export const airbnb = {
  name : 'proedis/airbnb',
  rules: airbnbRules
};


/**
 * The Proedis house style.
 *
 * Every formatting rule here lives in the '@stylistic' namespace rather than in ESLint core. Core
 * deprecated all of them in 9 and removed them in 10, and the '@stylistic' ports additionally
 * understand TypeScript and JSX syntax — decorators in particular, which core 'indent' never has.
 */
export const style = {
  name   : 'proedis/stylistic',
  plugins: { '@stylistic': plugins['@stylistic'] },
  rules  : {
    /** Spaces inside array brackets: [ 'a', 'b' ] */
    '@stylistic/array-bracket-spacing': [ 'error', 'always' ],

    /**
     * Operators lead the continuation line, as Airbnb has it — with one deliberate change: Airbnb
     * forbids a line break around '=' entirely, a rule written when '=' could only mean an
     * assignment. The @stylistic port also inspects TypeScript, where '=' is equally the separator
     * of a type alias, and a long generic alias has nowhere to go but the next line:
     *
     *   type InferAction<TCreator extends BaseActionCreator<any, any>> =
     *     TCreator extends BaseActionCreator<infer Payload, infer Type> ? … : never;
     *
     * The rule cannot tell a type alias from an assignment, so '=' is ignored rather than banned.
     */
    '@stylistic/operator-linebreak': [ 'error', 'before', { overrides: { '=': 'ignore' } } ],

    /** No dangling comma, anywhere */
    '@stylistic/comma-dangle': [ 'error', 'never' ],

    /** Stroustrup braces: the 'else' goes on its own line, below the closing brace */
    '@stylistic/brace-style': [ 'error', 'stroustrup', { allowSingleLine: false } ],

    /**
     * Off on purpose, and one of the few rules worth explaining: colons in object literals, class
     * fields and interfaces are aligned by hand across the whole suite, and no automatic rule can
     * express that.
     */
    '@stylistic/key-spacing': [ 'off' ],

    /** Two space indentation, with the nodes an automatic rule gets wrong left alone */
    '@stylistic/indent': [
      'error', 2, {
        SwitchCase            : 1,
        flatTernaryExpressions: false,
        ignoredNodes          : [
          'PropertyDefinition[decorators]',
          'TSUnionType',
          'FunctionExpression[params]:has(Identifier[decorators])'
        ]
      }
    ],

    /** 130 columns, with the things you cannot wrap exempted */
    '@stylistic/max-len': [
      'error',
      {
        code                  : 130,
        tabWidth              : 2,
        ignoreComments        : false,
        ignoreTrailingComments: true,
        ignoreUrls            : true,
        ignoreStrings         : true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals  : true
      }
    ],

    /** Up to two consecutive blank lines, used to separate sections inside a file */
    '@stylistic/no-multiple-empty-lines': [ 'error', { max: 2, maxEOF: 0 } ],

    /** Break an object literal consistently: all on one line, or one property per line */
    '@stylistic/object-curly-newline': [ 'error', { consistent: true } ],

    /** Blank lines at the start of a block are allowed: classes here open with one */
    '@stylistic/padded-blocks': [ 'off' ],

    /** Parentheses around a single arrow argument are a matter of taste */
    '@stylistic/arrow-parens': [ 'off' ],

    /** An arrow body is implicit when it can be */
    'arrow-body-style': [ 'error', 'as-needed' ],

    /** A 'case' that declares a 'const' inside a block is perfectly clear */
    'no-case-declarations': [ 'off' ],

    /** 'continue' is a guard clause for loops */
    'no-continue': [ 'off' ],

    /** Only 'console.error' survives a review */
    'no-console': [ 'warn', { allow: [ 'error' ] } ],

    /** An empty constructor is how a parameter property is declared */
    'no-empty-function': [ 'error', { allow: [ 'constructors' ] } ],

    /** More than one class per file is sometimes exactly right */
    'max-classes-per-file': [ 'off' ],

    /** A nested ternary is often the clearest way to express a three way choice */
    'no-nested-ternary': [ 'off' ],

    /** Mutating a property of an argument is allowed, reassigning the argument is not */
    'no-param-reassign': [ 'error', { props: false } ],

    /** '++' inside a 'for' statement is not a crime */
    'no-plusplus': [ 'off' ],

    /** The suite bans several syntax forms of its own, and Airbnb's list gets in the way */
    'no-restricted-syntax': [ 'off' ],

    /** A constructor that only declares parameter properties looks useless, and is not */
    'no-useless-constructor': [ 'off' ],

    /**
     * Off, because the underscore prefix *is* the Proedis convention for anything private: a class
     * member, a module scope constant, a local shadowing its own parameter. Every combination of
     * this rule's options still reports one of those three, so there is nothing left for it to say.
     */
    'no-underscore-dangle': [ 'off' ],

    /**
     * Off. It reports a method that does not touch 'this', which in a class based library is a
     * perfectly ordinary thing to write: a pure helper belongs to the class it serves whether or not
     * it reads state. The rule fires almost exclusively on library code, which is why an application
     * config can afford to leave it on.
     */
    'class-methods-use-this': [ 'off' ],

    /**
     * Off, because the compiler already does it, and does it better: the @proedis/tsconfig presets
     * enable 'noImplicitReturns', which is the same check with type information behind it.
     */
    'consistent-return': [ 'off' ],

    /**
     * Relaxed to the rule's own default: an assignment inside a condition is a mistake when it is
     * bare, and the canonical idiom when it is parenthesised — 'while ((match = regex.exec(s)))' and
     * 'while ((index = list.findIndex(…)) !== -1)' have no non-clumsy alternative.
     */
    'no-cond-assign': [ 'error', 'except-parens' ],

    /**
     * Relaxed so that the expected type can be held in a variable, which is what a generic runtime
     * assertion does: 'typeof value === expectedType'. The valuable half of the rule survives —
     * comparing against a string that is not a real 'typeof' result is still an error.
     */
    'valid-typeof': [ 'error', { requireStringLiterals: false } ],

    /**
     * Off. Awaiting inside a loop is usually the intent — a migration applied in order, a set of
     * shell commands that must not interleave — and the rule cannot tell that apart from an
     * accidental serialisation. Left on, it turns into a suppression comment on every correct use.
     */
    'no-await-in-loop': [ 'off' ]
  }
};


/**
 * The import layer.
 *
 * Module resolution is switched off across the board. Resolving TypeScript paths needs a resolver, a
 * tsconfig and a good deal of lint time to report what the compiler already reports — while the
 * rules that need no resolution keep working regardless.
 */
export const imports = [ plugins.import.flatConfigs.recommended ];


/**
 * The Proedis import adjustments, applied after the Airbnb layer for the same ordering reason as
 * {@link typescriptOverrides}.
 *
 * Module resolution is switched off across the board. Resolving TypeScript paths needs a resolver, a
 * tsconfig and a good deal of lint time to report what the compiler already reports — while the
 * rules that need no resolution keep working regardless.
 */
export const importOverrides = {
  name : 'proedis/imports',
  rules: {
    /** Resolution is the compiler's job, not the linter's */
    'import/no-unresolved': [ 'off' ],
    'import/extensions'   : [ 'off' ],

    /** Two import statements from one module is how a type import sits beside a value import */
    'import/no-duplicates': [ 'off' ],

    /** A monorepo resolves its dependencies through the workspace root */
    'import/no-extraneous-dependencies': [ 'off' ],

    /** A module exporting one thing does not have to export it as default */
    'import/prefer-default-export': [ 'off' ],

    /**
     * Off because it cannot do its job here: with no resolver it reports nothing at all, and with
     * one it flags a type-only cycle — two modules referring to each other's types, which erases at
     * compile time and is a perfectly sound shape.
     */
    'import/no-cycle': [ 'off' ],

    /**
     * Both off, and this one is worth explaining because it bites on this very package: they warn
     * whenever a default import shares a name with one of the module's named exports, or whenever a
     * property is read off such a default. Which is exactly the shape of a namespace style config
     * object — 'proedis.react()' where 'react' is also a named export — and of half the utility
     * libraries in existence, 'clsx' included. The warning is a caution, not a finding, and it fires
     * far more often on correct code than on the mistake it is looking for.
     */
    'import/no-named-as-default'       : [ 'off' ],
    'import/no-named-as-default-member': [ 'off' ]
  }
};


/**
 * The adjustments a CommonJS file needs.
 *
 * Nothing in the presets can detect one: a '.js' file is CommonJS or ESM depending on the nearest
 * package.json 'type' field, which a linter reading one file at a time cannot see. So this block is
 * offered instead, to be scoped by the project onto the paths it knows are CommonJS — build scripts,
 * config files, a package that ships 'require' style code.
 *
 * @param patterns The files to apply it to
 *
 * @example
 * proedis.defineConfig(
 *   proedis.base(),
 *   proedis.configs.commonjs([ 'scripts/**\/*.js' ])
 * );
 */
export const commonjs = (patterns) => ({
  name : 'proedis/commonjs',
  files: patterns,

  languageOptions: {
    sourceType: 'commonjs'
  },

  rules: {
    /** 'require' is not a style choice in a CommonJS file, it is the only option */
    '@typescript-eslint/no-require-imports': [ 'off' ],
    'global-require'                       : [ 'off' ],
    'import/no-dynamic-require'            : [ 'off' ],

    /** A CommonJS module has no static export shape to check */
    'import/no-import-module-exports': [ 'off' ]
  }
});


/**
 * The React layer.
 *
 * @param version The React version to report to the plugin, 'detect' to read it off the installed
 *   package
 */
export const react = (version = 'detect') => [
  {
    ...plugins.react.configs.flat.recommended,
    name    : 'proedis/react-recommended',
    settings: {
      react: { version }
    }
  }
];


/** The Proedis React adjustments */
export const reactOverrides = {
  name : 'proedis/react',
  rules: {
    /**
     * Off: the @proedis/tsconfig React preset sets 'jsx: react-jsx', the automatic runtime, where
     * nothing has to be imported to return JSX. Leaving this on asks for an import the compiler
     * does not want.
     */
    'react/react-in-jsx-scope': [ 'off' ],

    /** A named function assigned to a const already has a name */
    'react/display-name': [ 'off' ],

    /** Passing children as a prop is legitimate, and sometimes the only option */
    'react/no-children-prop': [ 'off' ],

    /** Props are typed by TypeScript */
    'react/prop-types'           : [ 'off' ],
    'react/require-default-props': [ 'off' ],

    /** Spreading props is how a wrapper forwards what it does not know about */
    'react/jsx-props-no-spreading': [ 'off' ],

    /** Destructuring props is a preference, not a rule */
    'react/destructuring-assignment': [ 'off' ],

    /** A curly brace around a string prop is explicit, and stays consistent */
    'react/jsx-curly-brace-presence': [ 'error', { props: 'always', children: 'never' } ],

    /** '<React.Fragment>' over '<>': it can carry a key, and it greps */
    'react/jsx-fragments': [ 'error', 'element' ],

    /** A key must come before a spread, or the spread can silently overwrite it */
    'react/jsx-key': [ 'error', { checkKeyMustBeforeSpread: true } ],

    /** The array index is a legitimate key for a list that never reorders */
    'react/no-array-index-key': [ 'off' ]
  }
};


/**
 * The React Hooks layer, including the compiler era rules that version 7 of the plugin introduced.
 *
 * The plugin is registered by hand and only its rules are taken: its own flat preset ships a
 * 'plugins' field in a shape ESLint cannot merge with anything else.
 */
export const reactHooks = {
  name   : 'proedis/react-hooks',
  plugins: { 'react-hooks': plugins['react-hooks'] },
  rules  : {
    ...plugins['react-hooks'].configs.recommended.rules,

    /**
     * Off because it fires on a pattern the suite uses on purpose: a component declared at the
     * module scope of another component's file, which is stable across renders.
     */
    'react-hooks/static-components': [ 'off' ],

    /** Custom hooks taking a dependency array behave like the built-in ones */
    'react-hooks/exhaustive-deps': [
      'warn',
      { additionalHooks: '(useEnhancedEffect)' }
    ]
  }
};


/**
 * The Tailwind layer, and it carries exactly one decision: an arbitrary value in a class is a
 * defect, not a shortcut.
 *
 * `size-[18px]`, `text-[13px]`, `max-w-[96rem]` are lengths invented at the call site. They have no
 * name, so no theme can reach them, no consumer can retune them and nothing tells you the interface
 * has stopped being made of tokens — it degrades silently, one class at a time. The escalation is
 * always the same: an existing token, a step of an existing scale, a **new declared token** in the
 * design system, and only once all three are established as impossible, an arbitrary value.
 *
 * Arbitrary **variants** are a different construct and stay allowed: `[&_svg]:size-4`,
 * `data-[state=open]:bg-muted`, `has-[input:focus]:ring`, `min-[600px]:flex` are selectors, not
 * invented design values. That is what the negative lookahead separates — a variant is followed by
 * `:`, a value is not. Measured against both sets rather than assumed.
 *
 * Not part of {@link base}: a project with no JSX has no class attribute for this to fire on.
 */

/** The offending shape: `-[…]` NOT followed by a colon, i.e. a value rather than a variant */
const ARBITRARY_VALUE = '-\\[[^\\]]*\\](?![:\\]])';

const ARBITRARY_VALUE_MESSAGE = 'Arbitrary value in a Tailwind class. Use a token, a step of an '
  + 'existing scale, or declare a new token in the design system. An arbitrary value is the last '
  + 'resort, and only once the other three are established as impossible.';

export const tailwind = {
  name : 'proedis/tailwind',
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        message : ARBITRARY_VALUE_MESSAGE,
        selector: `Literal[value=/${ARBITRARY_VALUE}/]`
      },
      {
        message : ARBITRARY_VALUE_MESSAGE,
        selector: `TemplateElement[value.raw=/${ARBITRARY_VALUE}/]`
      }
    ]
  }
};
