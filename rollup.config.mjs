import { fileURLToPath } from 'url';
import { resolve as resolvePath, dirname, relative as getRelativePath } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { defineConfig } from 'rollup';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';

import glob from 'fast-glob';

import getExternalDependenciesFromPackage from './scripts/utils/getExternalDependenciesFromPackage.mjs';
import createTypes from './scripts/rollup-plugins/createTypes.mjs';
import producePackageFiles from './scripts/rollup-plugins/producePackageFiles.mjs';


// ----
// Constants Definition
// ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_DIRECTORY = 'src';

const OUTPUT_DIRECTORY = 'build';
const OUTPUT_TYPES_DIRECTORY = `${OUTPUT_DIRECTORY}/types`;

const BUILD_FORMATS = [ 'cjs', 'esm' ];

const TSCONFIG_DECLARATION_FILENAME = 'tsconfig.declaration.json';
const TSCONFIG_DECLARATION_PATH = resolvePath(process.cwd(), TSCONFIG_DECLARATION_FILENAME);

const HAS_TYPES_SETTINGS = existsSync(TSCONFIG_DECLARATION_PATH);


// ----
// Reference tsconfig.declaration.json finder
// ----
const tsDeclarationConfigFiles = glob
  // Get all the absolute path to packages internal tsconfig.declaration.json files
  .sync(resolvePath(__dirname, 'packages', '*', TSCONFIG_DECLARATION_FILENAME))
  // Transform all the absolute paths into a relative path
  .map((absolutePath) => getRelativePath(process.cwd(), absolutePath))
  // Remove the reference to package tsconfig.declaration.json file
  .filter((relativePath) => relativePath !== TSCONFIG_DECLARATION_FILENAME);


// ----
// tsconfig.declaration.json file updater
// ----
if (HAS_TYPES_SETTINGS) {
  /** Load the json file */
  const fileContent = JSON.parse(readFileSync(TSCONFIG_DECLARATION_PATH, 'utf-8'));

  /** Check output dir on compiler options */
  fileContent.compilerOptions = {
    rootDir: SOURCE_DIRECTORY,
    ...fileContent.compilerOptions,
    outDir: OUTPUT_TYPES_DIRECTORY
  };

  fileContent.references = tsDeclarationConfigFiles.map((tsConfigFile) => ({ path: tsConfigFile }));

  writeFileSync(TSCONFIG_DECLARATION_PATH, JSON.stringify(fileContent, null, 2), { encoding: 'utf-8' });
}


// ----
// Rollup Configurations
// ----
const buildConfiguration = defineConfig({

  // Set the file input
  input: `${SOURCE_DIRECTORY}/index.ts`,

  // Automatically extract external dependencies using package json
  external: getExternalDependenciesFromPackage(),

  // Set the files output style
  output: BUILD_FORMATS.map((format) => ({
    format,
    exports        : 'auto',
    dir            : `${OUTPUT_DIRECTORY}/${format}`,
    preserveModules: true
  })),

  // Import rollup plugins
  plugins: [
    // Clean output directory
    del({
      targets: `${OUTPUT_DIRECTORY}/*`
    }),
    // Resolve node dependencies
    nodeResolve(),
    // Compile using typescript
    typescript(),
    // Enable the JSON Plugin
    json(),
    // Enable CommonJS output
    commonjs(),
    // Build the types
    HAS_TYPES_SETTINGS && createTypes({ tsconfig: TSCONFIG_DECLARATION_FILENAME }),
    // Setup directory for publish
    producePackageFiles(SOURCE_DIRECTORY, OUTPUT_DIRECTORY)
  ].filter(Boolean)

});


// ----
// Configuration Export
// ----
export default [ buildConfiguration ];
