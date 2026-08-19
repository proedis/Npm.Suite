/**
 * Airbnb 'es6' rules, vendored from eslint-config-airbnb-base@15.0.0.
 *
 * GENERATED FILE — do not edit by hand. Run 'yarn rules:sync' to rebuild it, and put any
 * deliberate deviation in the preset that consumes this set, so it stays visible as ours.
 */
export default {
  'arrow-body-style'                 : [ 'error', 'as-needed', { requireReturnForObjectLiteral: false } ],
  '@stylistic/arrow-parens'          : [ 'error', 'always' ],
  '@stylistic/arrow-spacing'         : [ 'error', { before: true, after: true } ],
  'constructor-super'                : 'error',
  '@stylistic/generator-star-spacing': [ 'error', { before: false, after: true } ],
  'no-class-assign'                  : 'error',
  '@stylistic/no-confusing-arrow'    : [ 'error', { allowParens: true } ],
  'no-const-assign'                  : 'error',
  'no-dupe-class-members'            : 'error',
  'no-duplicate-imports'             : 'off',
  'no-new-symbol'                    : 'error',
  'no-restricted-exports'            : [ 'error', { restrictedNamedExports: [ 'default', 'then' ] } ],
  'no-restricted-imports'            : [ 'off', { paths: [], patterns: [] } ],
  'no-this-before-super'             : 'error',
  'no-useless-computed-key'          : 'error',
  'no-useless-constructor'           : 'error',
  'no-useless-rename'                : [
                                         'error',
                                         { ignoreDestructuring: false, ignoreImport: false, ignoreExport: false }
                                       ],
  'no-var'                           : 'error',
  'object-shorthand'                 : [ 'error', 'always', { ignoreConstructors: false, avoidQuotes: true } ],
  'prefer-arrow-callback'            : [ 'error', { allowNamedFunctions: false, allowUnboundThis: true } ],
  'prefer-const'                     : [ 'error', { destructuring: 'any', ignoreReadBeforeAssign: true } ],
  'prefer-destructuring'             : [
                                         'error',
                                         {
                                           VariableDeclarator: { array: false, object: true },
                                           AssignmentExpression: { array: true, object: false }
                                         },
                                         { enforceForRenamedProperties: false }
                                       ],
  'prefer-numeric-literals'          : 'error',
  'prefer-reflect'                   : 'off',
  'prefer-rest-params'               : 'error',
  'prefer-spread'                    : 'error',
  'prefer-template'                  : 'error',
  'require-yield'                    : 'error',
  '@stylistic/rest-spread-spacing'   : [ 'error', 'never' ],
  'sort-imports'                     : [
                                         'off',
                                         {
                                           ignoreCase: false,
                                           ignoreDeclarationSort: false,
                                           ignoreMemberSort: false,
                                           memberSyntaxSortOrder: [ 'none', 'all', 'multiple', 'single' ]
                                         }
                                       ],
  'symbol-description'               : 'error',
  '@stylistic/template-curly-spacing': 'error',
  '@stylistic/yield-star-spacing'    : [ 'error', 'after' ]
};
