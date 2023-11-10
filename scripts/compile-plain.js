const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

const cpy = require('cpy');

const createPackageJson = require('./utils/createPackageJson');

async function compilePlain() {
  const buildDirectory = 'build';

  const packagePath = process.cwd();
  const buildPath = path.resolve(packagePath, buildDirectory);


  // ----
  // Clean the Build Directory
  // ----
  fs.rmSync(buildPath, { recursive: true });


  // ----
  // Create the Build Directory
  // ----
  fs.mkdirSync(buildPath, { recursive: true });


  // ----
  // Copy all files from source to destination
  // ----
  await cpy(
    [ './**/*.*', '!build', '!node_modules', '!package.json', '!tsconfig.*' ],
    buildDirectory,
    {
      cwd    : packagePath,
      parents: true
    }
  );


  // ----
  // Create the Package Json File
  // ----
  createPackageJson(packagePath, buildPath);
}

compilePlain().then(() => process.exit());
