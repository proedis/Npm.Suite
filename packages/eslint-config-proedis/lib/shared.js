module.exports = {

  parser: '@typescript-eslint/parser',

  plugins: [
    'import',
    '@typescript-eslint/eslint-plugin'
  ],

  rules: {
    // Base Rules
    'array-bracket-spacing'            : [ 'error', 'always' ],
    'arrow-body-style'                 : [ 'off' ],
    'arrow-parens'                     : [ 'off' ],
    'consistent-return'                : [ 'off' ],
    'key-spacing'                      : [ 'off' ],
    'import/no-cycle'                  : [ 'off' ],
    'import/no-extraneous-dependencies': [ 'off' ],
    'import/prefer-default-export'     : [ 'off' ],
    'max-len'                          : [ 'error', { code: 130, ignoreUrls: true, ignoreStrings: true } ],
    'no-case-declarations'             : [ 'off' ],
    'no-console'                       : [ 'warn', { allow: [ 'error' ] } ],
    'no-multiple-empty-lines'          : [ 'error', { max: 2, maxEOF: 0 } ],
    'no-nested-ternary'                : [ 'off' ],
    'no-param-reassign'                : [ 'error', { props: false } ],
    'no-useless-escape'                : [ 'off' ],
    'no-underscore-dangle'             : [ 'off' ],
    'object-curly-newline'             : [ 'error', { consistent: true } ],
    'padded-blocks'                    : [ 'off' ],
    'prefer-promise-reject-errors'     : [ 'off' ],

    // Strict Typescript file Rules
    '@typescript-eslint/brace-style'            : [ 'error', 'stroustrup' ],
    '@typescript-eslint/comma-dangle'           : [ 'off' ],
    '@typescript-eslint/consistent-type-imports': [ 'error' ],
    '@typescript-eslint/indent'                 : [ 'error', 2 ],
    '@typescript-eslint/naming-convention'      : [ 'off' ],
    '@typescript-eslint/no-redeclare'           : [ 'error', { builtinGlobals: false } ],
    '@typescript-eslint/no-throw-literal'       : [ 'off' ],
    '@typescript-eslint/no-unused-vars'         : [ 'warn' ],
    '@typescript-eslint/space-before-blocks'    : [ 'off' ]
  }

};
