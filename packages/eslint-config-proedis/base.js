module.exports = {

  extends: [
    'eslint-config-airbnb-typescript/base',
    './lib/shared.js'
  ].map(require.resolve)

};
