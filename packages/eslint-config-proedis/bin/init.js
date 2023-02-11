#! /usr/bin/env node

const fs = require('fs');
const path = require('path');

global.console.log('Initializing files to use EsLint Proedis Configuration');
global.console.log(
  'Make sure to install @proedis/tsconfig package, ' +
  'or feel free to edit tsconfig.eslint.json file ' +
  'after the initialization process'
);


// ----
// Create the .eslintrc.js file
// ----
global.console.log('  - Copying .eslintrc.js configuration file');
fs.copyFileSync(
  path.resolve(__dirname, '..', 'templates', 'eslintrc.template.js'),
  path.resolve(process.cwd(), '.eslintrc.js')
);


// ----
// Create the tsconfig file
// ----
global.console.log('  - Copying tsconfig.eslint.json configuration file');
fs.copyFileSync(
  path.resolve(__dirname, '..', 'templates', 'tsconfig.eslint.template.json'),
  path.resolve(process.cwd(), 'tsconfig.eslint.json')
);
