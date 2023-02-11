module.exports = {

  extends: [
    'airbnb-typescript',
    'plugin:react-hooks/recommended',
    './lib/shared.js'
  ],

  plugins: [
    'react',
    'react-hooks'
  ],

  rules: {
    // JSX a11n
    'jsx-a11y/anchor-is-valid'                       : [ 'off' ],
    'jsx-a11y/no-noninteractive-element-interactions': [ 'off' ],
    'jsx-a11y/no-static-element-interactions'        : [ 'off' ],
    'jsx-a11y/click-events-have-key-events'          : [ 'off' ],

    // Strict React file Rules
    'react/destructuring-assignment'   : [ 'off' ],
    'react/jsx-boolean-value'          : [ 'off' ],
    'react/jsx-curly-brace-presence'   : [ 'error', { props: 'always', children: 'never' } ],
    'react/jsx-fragments'              : [ 'error', 'element' ],
    'react/jsx-key'                    : [ 'error', { checkKeyMustBeforeSpread: true } ],
    'react/jsx-one-expression-per-line': [ 'off' ],
    'react/jsx-props-no-spreading'     : [ 'off' ],
    'react/no-array-index-key'         : [ 'off' ],
    'react/no-unused-prop-types'       : [ 'off' ],
    'react/prop-types'                 : [ 'off' ],
    'react/require-default-props'      : [ 'off' ],
    'react/state-in-constructor'       : [ 'error', 'never' ],
    'react/static-property-placement'  : [ 'off' ]
  }

};
