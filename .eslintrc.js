module.exports = {

  root: true,

  extends: [ 'proedis' ],

  parserOptions: {
    ecmaVersion: 7,
    project    : [ './tsconfig.eslint.json' ]
  },

  rules: {
    'react-hooks/exhaustive-deps': [
      'warn', {
        'additionalHooks': '(useEnhancedEffect)'
      }
    ]
  }

};
