const fs = require('node:fs');
const path = require('node:path');


/* --------
 * Peer dependencies resolution
 * -------- */

/**
 * Normalize the 'reflectPeerDependencies' metadata into a single internal shape.
 *
 * Two authoring forms are accepted.
 *
 * The legacy array form reflects the version pinned in a devDependencies pool, using a
 * 'root:' prefix to read the root package.json instead of the package's own one:
 *
 *   "reflectPeerDependencies": [ "root:react", "@proedis/client" ]
 *
 * The object form additionally allows the declared range to be stated explicitly, which
 * decouples the compatibility range published to consumers from the single version used
 * while developing. Reflecting the dev pin makes every published range as narrow as the
 * version that happens to be installed here, which is what produces unmet peer warnings
 * in consumer projects.
 *
 *   "reflectPeerDependencies": {
 *     "react":             { "from": "root", "range": ">=18.0.0 <20.0.0" },
 *     "class-transformer": { "from": "root" },
 *     "dayjs":             { "from": "root", "range": ">=1.11.0", "optional": true }
 *   }
 *
 * @param reflectPeerDependencies The raw metadata value
 * @return {{ name: string, from: 'root' | 'self', range: string | undefined, optional: boolean }[]}
 */
function normalizePeerDeclarations(reflectPeerDependencies) {
  /** Legacy array form: every entry reflects its pool, no explicit range */
  if (Array.isArray(reflectPeerDependencies)) {
    return reflectPeerDependencies.map((entry) => {
      const isFromRoot = entry.startsWith('root:');

      return {
        name    : isFromRoot ? entry.slice('root:'.length) : entry,
        from    : isFromRoot ? 'root' : 'self',
        range   : undefined,
        optional: false
      };
    });
  }

  /** Object form */
  return Object.entries(reflectPeerDependencies).map(([ name, declaration ]) => {
    /** A bare string value is shorthand for an explicit range */
    if (typeof declaration === 'string') {
      return { name, from: 'self', range: declaration, optional: false };
    }

    const from = declaration.from ?? 'self';

    if (from !== 'root' && from !== 'self') {
      throw new Error(`Invalid 'from' value '${from}' for peer dependency ${name}: expected 'root' or 'self'`);
    }

    return {
      name,
      from,
      range   : declaration.range,
      optional: declaration.optional === true
    };
  });
}


/**
 * Resolve the version range to publish for a single peer declaration.
 *
 * @param declaration A normalized peer declaration
 * @param pools {{ root: object, self: object }} The devDependencies pools to reflect from
 * @return {string} The range to write into peerDependencies
 */
function resolvePeerRange(declaration, pools) {
  /** An explicit range always wins and needs no pool lookup */
  if (declaration.range) {
    return declaration.range;
  }

  const pool = pools[declaration.from];
  const pinnedVersion = pool && pool[declaration.name];

  if (!pinnedVersion) {
    throw new Error(
      `Could not reflect dependency ${declaration.name} from ${declaration.from === 'root' ? 'root' : 'project'} `
      + 'package.json. Declare it in the matching devDependencies, or state an explicit '
      + '\'range\' in proedisMetadata.reflectPeerDependencies'
    );
  }

  /** Reflected pins are widened to a caret range when they carry no range operator */
  return /^[\^~><=]/.test(pinnedVersion) ? pinnedVersion : `^${pinnedVersion}`;
}


/* --------
 * Manifest Builder
 * -------- */

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
  if (proedisMetadata.reflectPeerDependencies) {
    const pools = { root: rootDevDependencies, self: devDependencies };
    const declarations = normalizePeerDeclarations(proedisMetadata.reflectPeerDependencies);

    /** Rebuild both peer fields from scratch, the metadata is the single source of truth */
    pkgData.peerDependencies = {};
    const peerDependenciesMeta = {};

    declarations.forEach((declaration) => {
      pkgData.peerDependencies[declaration.name] = resolvePeerRange(declaration, pools);

      if (declaration.optional) {
        peerDependenciesMeta[declaration.name] = { optional: true };
      }
    });

    if (Object.keys(peerDependenciesMeta).length) {
      pkgData.peerDependenciesMeta = peerDependenciesMeta;
    }
    else {
      delete pkgData.peerDependenciesMeta;
    }
  }

  /**
   * Check if main reference must be created or not.
   *
   * 'main'/'module'/'types' are kept alongside 'exports' on purpose: TypeScript's classic
   * 'node' moduleResolution (what @proedis/tsconfig still sets) ignores 'exports' entirely,
   * so removing them would break every consumer on the current preset.
   *
   * The 'exports' map is what lets modern bundlers and native Node ESM pick the right
   * artifact. Condition order is significant: 'types' must come first.
   */
  const mainReference = !proedisMetadata.noMain
    ? {
      main   : './cjs/index.js',
      module : './esm/index.js',
      types  : './types/index.d.ts',
      exports: {
        '.': {
          types  : './types/index.d.ts',
          import : './esm/index.js',
          require: './cjs/index.js'
        },
        './package.json': './package.json'
      }
    }
    : {};

  /** Let a package declare itself free of import side effects, so bundlers can tree-shake it */
  const sideEffects = typeof proedisMetadata.sideEffects === 'boolean'
    ? { sideEffects: proedisMetadata.sideEffects }
    : {};

  /** Build the new package.json file */
  const newPackageData = {
    ...pkgData,
    ...mainReference,
    ...sideEffects,
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

  /** Return created package.json data */
  return newPackageData;
};
