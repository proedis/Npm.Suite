import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { join, relative, resolve } from 'node:path';
import process from 'node:process';


/* --------
 * Constants
 * -------- */
const PACKAGES_DIRECTORY = 'packages';
const BUILD_DIRECTORY = 'build';

const BUILTINS = new Set(builtinModules);

/**
 * Module specifier patterns.
 *
 * The statement forms are anchored to the start of a line: an unanchored 'from' also
 * matches prose inside comments and, worse, the CLI's scaffolder templates, which build
 * import statements as template literals ("import { X } from '${source}'").
 * Comments are stripped before matching, so only real code is inspected.
 */
const STATEMENT_PATTERNS = [
  /** import ... from 'x' / export ... from 'x' */
  /^\s*(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]/gm,
  /** side effect import 'x' */
  /^\s*import\s*['"]([^'"]+)['"]/gm
];

/** import('x').Type — extremely common inside emitted declarations, never line anchored */
const TYPE_IMPORT_PATTERN = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;

/** require('x') and require.resolve('x'), only used for hand written shipped JS */
const REQUIRE_PATTERN = /\brequire(?:\.resolve)?\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Strip block and line comments so prose cannot be mistaken for an import */
const stripComments = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');


/* --------
 * Helpers
 * -------- */

/** Collect every file under a directory matching one of the given extensions */
function collectFiles(directory, extensions, accumulator = []) {
  if (!existsSync(directory)) {
    return accumulator;
  }

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      collectFiles(entryPath, extensions, accumulator);
    }
    else if (extensions.some((extension) => entry.name.endsWith(extension))) {
      accumulator.push(entryPath);
    }
  }

  return accumulator;
}


/** Reduce a module specifier to the package name that must be declared to resolve it */
function toPackageName(specifier) {
  /** Relative and absolute specifiers resolve inside the package itself */
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    return null;
  }

  /** Explicit node: builtins never need declaring */
  if (specifier.startsWith('node:')) {
    return null;
  }

  const segments = specifier.split('/');
  const name = specifier.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0];

  return BUILTINS.has(name) ? null : name;
}


/** Every path an entry point field can point at, flattened out of the exports map */
function collectEntryPoints(manifest) {
  const entryPoints = [ manifest.main, manifest.module, manifest.types ].filter(Boolean);

  const walkExports = (value) => {
    if (typeof value === 'string') {
      entryPoints.push(value);
    }
    else if (value && typeof value === 'object') {
      Object.values(value).forEach(walkExports);
    }
  };

  walkExports(manifest.exports);

  return [ ...new Set(entryPoints) ];
}


/* --------
 * Verification
 * -------- */

/**
 * Verify a single built package.
 *
 * @param packageName Directory name under packages/
 * @return {string[]} The problems found, empty when the artifact is sound
 */
function verifyPackage(packageName) {
  const packagePath = resolve(PACKAGES_DIRECTORY, packageName);
  const buildPath = join(packagePath, BUILD_DIRECTORY);
  const manifestPath = join(buildPath, 'package.json');
  const problems = [];

  /** A package without a build directory was never built: that is a failure, not a skip */
  if (!existsSync(manifestPath)) {
    return [ `no built manifest at ${manifestPath} — run the build first` ];
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  /** Names a consumer's package manager will actually install */
  const declared = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {})
  ]);

  // ----
  // 1. Every declared entry point must exist on disk
  // ----
  collectEntryPoints(manifest).forEach((entryPoint) => {
    if (!existsSync(join(buildPath, entryPoint))) {
      problems.push(`entry point '${entryPoint}' is declared but missing from the build`);
    }
  });

  // ----
  // 1b. Every declared binary must exist, and must carry a hashbang to be executable
  // ----
  Object.entries(manifest.bin ?? {}).forEach(([ binName, binPath ]) => {
    const resolvedBin = join(buildPath, binPath);

    if (!existsSync(resolvedBin)) {
      problems.push(`bin '${binName}' points at '${binPath}', missing from the build`);
      return;
    }

    if (!readFileSync(resolvedBin, 'utf-8').startsWith('#!')) {
      problems.push(`bin '${binName}' has no hashbang: it would not be executable once linked`);
    }
  });

  // ----
  // 1c. Every declared source asset must have reached each built output directory
  // ----
  /**
   * Assets are copied by a build step, not emitted by rollup, so nothing else notices when
   * that step stops running. A package manager that does not execute post scripts — Yarn
   * Berry, for one — would drop the copy silently: the CLI would publish without its .ejs
   * templates and fail at runtime with every other check still green.
   *
   * 'proedisMetadata' is stripped from the published manifest, so the declaration is read
   * from the package source instead.
   */
  const sourceManifest = JSON.parse(readFileSync(join(packagePath, 'package.json'), 'utf-8'));
  const assetExtensions = sourceManifest.proedisMetadata?.assets ?? [];

  if (assetExtensions.length) {
    const sourceDirectory = join(packagePath, 'src');

    const expectedAssets = collectFiles(sourceDirectory, assetExtensions)
      .map((file) => relative(sourceDirectory, file));

    const outputDirectories = [ 'cjs', 'esm' ].filter((directory) => existsSync(join(buildPath, directory)));

    if (!outputDirectories.length) {
      problems.push(`${expectedAssets.length} declared asset(s) but no output directory to hold them`);
    }

    outputDirectories.forEach((directory) => {
      const missing = expectedAssets.filter((asset) => !existsSync(join(buildPath, directory, asset)));

      if (missing.length) {
        problems.push(
          `${missing.length} of ${expectedAssets.length} declared asset(s) never reached ${directory}/ `
          + `— first missing: ${missing[0]}`
        );
      }
    });
  }

  // ----
  // 2. Dual-format output must declare its module type per directory
  // ----
  [ [ 'esm', 'module' ], [ 'cjs', 'commonjs' ] ].forEach(([ directory, expectedType ]) => {
    const directoryPath = join(buildPath, directory);

    if (!existsSync(directoryPath) || !statSync(directoryPath).isDirectory()) {
      return;
    }

    const markerPath = join(directoryPath, 'package.json');

    if (!existsSync(markerPath)) {
      problems.push(`${directory}/ has no package.json declaring "type": "${expectedType}"`);
      return;
    }

    const actualType = JSON.parse(readFileSync(markerPath, 'utf-8')).type;

    if (actualType !== expectedType) {
      problems.push(`${directory}/package.json declares "type": "${actualType}", expected "${expectedType}"`);
    }
  });

  // ----
  // 3. Nothing the emitted files import may be undeclared
  // ----
  /**
   * This is the check a green build cannot make. 'createPackageJson' strips
   * devDependencies from the published manifest, but the emitted .d.ts keeps every type
   * import: a type-only dependency left in devDependencies resolves to nothing on the
   * consumer side, which is a hard TS2307 without skipLibCheck and a silently degraded
   * type with it.
   *
   * The emitted .js is deliberately not scanned. Rollup's 'external' list is built from
   * dependencies + peerDependencies + reflectPeerDependencies, so anything undeclared is
   * bundled into the output rather than left as an import — an undeclared runtime import
   * cannot survive there. Hand written JS shipped by the plain-copy packages has no such
   * guarantee, so it is scanned, 'require' included.
   */
  const isRollupBuild = existsSync(join(buildPath, 'cjs')) || existsSync(join(buildPath, 'esm'));

  const scanned = isRollupBuild
    ? collectFiles(join(buildPath, 'types'), [ '.d.ts' ]).map((file) => ({ file, allowRequire: false }))
    : collectFiles(buildPath, [ '.ts', '.js', '.mjs', '.cjs' ]).map((file) => ({ file, allowRequire: true }));

  const undeclared = new Map();

  scanned.forEach(({ file, allowRequire }) => {
    const contents = stripComments(readFileSync(file, 'utf-8'));

    const patterns = [
      ...STATEMENT_PATTERNS,
      TYPE_IMPORT_PATTERN,
      ...(allowRequire ? [ REQUIRE_PATTERN ] : [])
    ];

    patterns.forEach((pattern) => {
      for (const [ , specifier ] of contents.matchAll(pattern)) {
        const name = toPackageName(specifier);

        if (!name || name === manifest.name || declared.has(name)) {
          continue;
        }

        if (!undeclared.has(name)) {
          undeclared.set(name, file);
        }
      }
    });
  });

  undeclared.forEach((file, name) => {
    problems.push(
      `'${name}' is imported by the published output but declared in neither `
      + `dependencies nor peerDependencies (first seen in ${file.replace(`${packagePath}/`, '')})`
    );
  });

  return problems;
}


/* --------
 * Entry Point
 * -------- */
const packageNames = readdirSync(PACKAGES_DIRECTORY)
  .filter((entry) => statSync(join(PACKAGES_DIRECTORY, entry)).isDirectory())
  .filter((entry) => existsSync(join(PACKAGES_DIRECTORY, entry, 'package.json')));

let failed = false;

packageNames.forEach((packageName) => {
  const problems = verifyPackage(packageName);

  if (!problems.length) {
    process.stdout.write(`  ok    ${packageName}\n`);
    return;
  }

  failed = true;
  process.stdout.write(`  FAIL  ${packageName}\n`);
  problems.forEach((problem) => process.stdout.write(`          ${problem}\n`));
});

if (failed) {
  process.stdout.write('\nPublishable artifact verification failed.\n');
  process.exit(1);
}

process.stdout.write(`\n${packageNames.length} artifacts verified.\n`);
