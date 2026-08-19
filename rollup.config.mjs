import { resolve as resolvePath } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

import { defineConfig } from 'rollup';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import hashbang from 'rollup-plugin-hashbang';


import getExternalDependenciesFromPackage from './scripts/utils/getExternalDependenciesFromPackage.mjs';

import createTypes from './scripts/rollup-plugins/createTypes.mjs';

import producePackageFiles from './scripts/rollup-plugins/producePackageFiles.mjs';


// ----
// Constants Definition
// ----
const SOURCE_DIRECTORY = 'src';

const OUTPUT_DIRECTORY = 'build';

const SUPPORTED_BUILD_FORMATS = [ 'cjs', 'esm' ];

/**
 * Output formats are per package, declared through 'proedisMetadata.buildFormats'.
 * Both formats are built by default; a package consumed only through its 'bin', like the
 * CLI, has nothing pointing at the ESM output and would just ship it as dead weight.
 */
const PACKAGE_JSON_PATH = resolvePath(process.cwd(), 'package.json');

const PACKAGE_METADATA = existsSync(PACKAGE_JSON_PATH)
  ? JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf-8')).proedisMetadata ?? {}
  : {};

const BUILD_FORMATS = PACKAGE_METADATA.buildFormats ?? SUPPORTED_BUILD_FORMATS;

const UNSUPPORTED_FORMATS = BUILD_FORMATS.filter((format) => !SUPPORTED_BUILD_FORMATS.includes(format));

if (UNSUPPORTED_FORMATS.length) {
  throw new Error(
    `Invalid proedisMetadata.buildFormats value(s) '${UNSUPPORTED_FORMATS.join('\', \'')}': `
    + `only '${SUPPORTED_BUILD_FORMATS.join('\', \'')}' are supported`
  );
}

/**
 * Additional entry points declared through 'proedisMetadata.exports', one directory name per
 * published subpath.
 *
 * They have to be listed as rollup inputs, not merely referenced from the manifest: with
 * 'preserveModules' rollup keeps the module graph intact but still elides a module that holds
 * nothing but re-exports, and every one of these barrels is exactly that. The subpath would then
 * point at a file that was never written — caught by 'release:verify', but only after the fact.
 */
const SUBPATH_ENTRIES = PACKAGE_METADATA.exports ?? [];

const TSCONFIG_DECLARATION_FILENAME = 'tsconfig.declaration.json';
const TSCONFIG_DECLARATION_PATH = resolvePath(process.cwd(), TSCONFIG_DECLARATION_FILENAME);

const HAS_TYPES_SETTINGS = existsSync(TSCONFIG_DECLARATION_PATH);


/**
 * Each package declares 'rootDir' and 'outDir' explicitly inside its own
 * tsconfig.declaration.json, so there is nothing to patch here at build time.
 * The previous implementation rewrote that file on every run, mutating a
 * git-tracked source file as a side effect of building.
 */


// ----
// Rollup Configurations
// ----
const buildConfiguration = defineConfig({

  // Set the file input, the package barrel plus every published subpath barrel
  input: [
    `${SOURCE_DIRECTORY}/index.ts`,
    ...SUBPATH_ENTRIES.map((subpath) => `${SOURCE_DIRECTORY}/${subpath}/index.ts`)
  ],

  // Automatically extract external dependencies using package json
  external: getExternalDependenciesFromPackage(),

  // Set the files output style
  output: BUILD_FORMATS.map((format) => ({
    format,
    exports        : 'auto',
    dir            : `${OUTPUT_DIRECTORY}/${format}`,
    preserveModules: true,
    sourcemap      : true
  })),

  // Strip useless warnings
  onwarn: (warning, defaultHandler) => {
    if (
      warning.code === 'MODULE_LEVEL_DIRECTIVE'
      && warning.message.includes('"use client"')
    ) {
      return;
    }

    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }

    defaultHandler(warning);
  },

  // Import rollup plugins
  plugins: [
    // Clean output directory
    del({
      targets: `${OUTPUT_DIRECTORY}/*`
    }),
    // Resolve node dependencies
    nodeResolve({
      preferBuiltins: true
    }),
    // Preserve the Hashbang
    hashbang.default(),
    // Compile using typescript.
    // 'noEmitOnError' is what promotes TS diagnostics from rollup warnings to build
    // failures: without it a type error only prints a warning and rollup still exits 0,
    // producing a fully publishable artifact out of code that does not compile.
    typescript({
      /**
       * Promotes TS diagnostics from rollup warnings to build failures: without it a type
       * error only prints a warning and rollup still exits 0, producing a fully
       * publishable artifact out of code that does not compile.
       */
      noEmitOnError: true,
      /**
       * The base preset enables 'allowJs' for application consumers, but no package source
       * contains JavaScript. Keeping it on makes @rollup/plugin-typescript >= 12 redirect
       * emit to a temporary outDir under the system temp folder, which then fails its own
       * 'outDir must be inside Rollup dir' validation.
       */
      allowJs      : false
    }),
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
