import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';


export default function getExternalDependenciesFromPackage() {
  /** Build the Path to package.json from cwd */
  const pkgPath = resolve(process.cwd(), 'package.json');

  /** If the file doesn't exist, return an empty array */
  if (!existsSync(pkgPath)) {
    return [];
  }

  try {
    /** Try to parse the Json File */
    const parsedPkg = JSON.parse(readFileSync(pkgPath).toString());

    /**
     * Extract the peer dependency names declared through proedisMetadata.
     * The metadata accepts both the legacy array form ('root:react') and the object
     * form keyed by dependency name, so both have to be understood here as well:
     * anything missing from this list would be bundled into the output instead of
     * being left as an external import.
     */
    const reflectedPeers = parsedPkg.proedisMetadata?.reflectPeerDependencies;
    const reflectedPeerNames = Array.isArray(reflectedPeers)
      ? reflectedPeers.map((dep) => dep.replace(/^root:/, ''))
      : Object.keys(reflectedPeers || {});

    /** Get dependencies array */
    const dependencies = [
      ...Object.keys(parsedPkg.peerDependencies || {}),
      ...Object.keys(parsedPkg.dependencies || {}),
      ...reflectedPeerNames
    ];

    /** Return direct package and all specific import */
    return [
      ...dependencies,
      ...dependencies.map(dep => new RegExp(`^${dep}/.+$`))
    ];
  }
  catch (error) {

    global.console.log(error);

    throw new Error([
      'package.json has been found, but an error occurred while parsing it.\n'
      + `${(error).name}`
    ].join(' '));
  }
}
