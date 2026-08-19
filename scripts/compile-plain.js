const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

const createPackageJson = require('./utils/createPackageJson');


/* --------
 * Constants
 * -------- */
const BUILD_DIRECTORY = 'build';

/** Elements that must never be copied into the build directory */
const EXCLUDED_NAMES = [ BUILD_DIRECTORY, 'node_modules', 'package.json' ];


function compilePlain() {
  const packagePath = process.cwd();
  const buildPath = path.resolve(packagePath, BUILD_DIRECTORY);


  // ----
  // Clean the Build Directory
  // ----
  /** 'force' keeps this idempotent: without it a missing build directory throws ENOENT on a fresh clone */
  fs.rmSync(buildPath, { recursive: true, force: true });


  // ----
  // Create the Build Directory
  // ----
  fs.mkdirSync(buildPath, { recursive: true });


  // ----
  // Copy all files from source to destination
  // ----
  /**
   * Entries are copied one by one instead of copying the package root in a single call:
   * 'fs.cpSync' rejects a destination located inside the source directory up front
   * (ERR_FS_CP_EINVAL), before any filter is consulted.
   */
  const isCopyable = (basename) => !basename.startsWith('.')
    && !EXCLUDED_NAMES.includes(basename)
    && !basename.startsWith('tsconfig.');

  for (const entry of fs.readdirSync(packagePath)) {
    if (!isCopyable(entry)) {
      continue;
    }

    fs.cpSync(
      path.resolve(packagePath, entry),
      path.resolve(buildPath, entry),
      {
        recursive: true,
        filter   : (source) => isCopyable(path.basename(source))
      }
    );
  }


  // ----
  // Copy the Root License
  // ----
  /**
   * The license lives at the repository root, outside of every package, so the entry loop
   * above can never reach it. Publishing happens with '--contents build', which means a
   * package whose build directory has no LICENSE ships without one — exactly what the
   * rollup packages already avoid through their own 'producePackageFiles' copy step.
   */
  const licensePath = path.resolve(packagePath, '..', '..', 'LICENSE');

  if (fs.existsSync(licensePath)) {
    fs.cpSync(licensePath, path.resolve(buildPath, 'LICENSE'));
  }


  // ----
  // Create the Package Json File
  // ----
  createPackageJson(packagePath, buildPath);
}

compilePlain();
