const fs = require('node:fs');
const path = require('node:path');


module.exports = function createPackageJson(packagePath, buildPath) {
  /** Assume the package is located in default folder, build the root */
  const rootPath = path.resolve(packagePath, '..', '..');
  const relativePath = path.relative(rootPath, packagePath).replace(/^\.\//, '');

  /** Get and Parse the package.json file */
  const {
    // Strip unnecessary data from package Json
    gitHead,
    scripts,
    devDependencies,
    workspaces,
    proedisMetadata = {},

    // Keep all other data
    ...pkgData
  } = JSON.parse(fs.readFileSync(path.resolve(packagePath, 'package.json'), 'utf-8'));

  /** Get and parse the root package.json to reflect peer dependencies from root */
  const {
    devDependencies: rootDevDependencies,
    ...rootPkgData
  } = JSON.parse(fs.readFileSync(path.resolve(rootPath, 'package.json'), 'utf-8'));

  /** Check if peerDependencies must be reflected from devDependencies */
  if (Array.isArray(proedisMetadata.reflectPeerDependencies)) {
    /** Clear all peerDependencies */
    pkgData.peerDependencies = {};
    /** Loop all dependencies that need to be reflected */
    proedisMetadata.reflectPeerDependencies.forEach((_dependencyName) => {
      /** Check if it must be reflected from root dependency */
      const isFromRoot = _dependencyName.startsWith('root:');
      const dependencyName = isFromRoot
        ? _dependencyName.split(':')[1]
        : _dependencyName;
      const pool = isFromRoot ? rootDevDependencies : devDependencies;

      if (pool && pool[dependencyName]) {
        pkgData.peerDependencies[dependencyName] = pool[dependencyName];
      }
      else {
        throw new Error(
          `Could not reflect dependency ${dependencyName} from ${isFromRoot ? 'root' : 'project'} package.json`
        );
      }
    });
  }

  /** Check if main reference must be created or not */
  const mainReference = !proedisMetadata.noMain
    ? {
      main  : './cjs/index.js',
      module: './esm/index.js',
      types : './types/index.d.ts'
    }
    : {};

  /** Build the new package.json file */
  const newPackageData = {
    ...pkgData,
    ...mainReference,
    license      : rootPkgData.license,
    private      : false,
    author       : rootPkgData.author,
    homepage     : rootPkgData.homepage,
    repository   : {
      ...rootPkgData.repository,
      directory: relativePath
    },
    bugs         : rootPkgData.bugs,
    publishConfig: rootPkgData.publishConfig
  };

  /** Write the new json file */
  const targetPath = path.resolve(buildPath, 'package.json');
  const fileContent = JSON.stringify(newPackageData, null, 2);
  fs.writeFileSync(targetPath, fileContent, 'utf-8');

  global.console.log(`Created package.json in ${targetPath}`);

  /** Return created package.json data */
  return newPackageData;
};
