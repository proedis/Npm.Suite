import fs from 'node:fs';
import path from 'node:path';


/* --------
 * Types Definition
 * -------- */

export interface VersionCheck {
  /** The version the documentation was written from, per package */
  readonly documented: Readonly<Record<string, string>>;

  /** The version the project installs, per package, when it installs it */
  readonly installed: Readonly<Record<string, string>>;

  /** What a reader should know before trusting an answer, or nothing when the two agree */
  readonly notice?: string;
}


/* --------
 * Helpers
 * -------- */

/**
 * The version of a package the project installs, from the `node_modules` of the working directory or
 * of any folder above it: a workspace of a monorepo finds the one hoisted at the root. Read from the
 * file rather than through `require.resolve`, which the `exports` map of a package may refuse.
 */
function installedVersion(name: string, from: string): string | undefined {
  let directory = path.resolve(from);

  for (;;) {
    const manifest = path.join(directory, 'node_modules', name, 'package.json');

    if (fs.existsSync(manifest)) {
      try {
        return (JSON.parse(fs.readFileSync(manifest, 'utf8')) as { version?: string }).version;
      }
      catch {
        return undefined;
      }
    }

    const parent = path.dirname(directory);

    if (parent === directory) {
      return undefined;
    }

    directory = parent;
  }
}

/** `2.1.0` against `2.0.3`: the documentation is for a later minor, so it may describe what is not there */
function differs(documented: string, installed: string): boolean {
  const [ dMajor, dMinor ] = documented.split('.');
  const [ iMajor, iMinor ] = installed.split('.');

  return dMajor !== iMajor || dMinor !== iMinor;
}


/* --------
 * Check
 * -------- */

/**
 * The versions the documentation describes against the ones the project installs. The server runs
 * with the project as its working directory, which is how an MCP client launches it.
 */
export function checkVersions(documented: Readonly<Record<string, string>>, from: string = process.cwd()): VersionCheck {
  const installed: Record<string, string> = {};
  const mismatches: string[] = [];

  for (const [ name, version ] of Object.entries(documented)) {
    const found = installedVersion(name, from);

    if (!found) {
      continue;
    }

    installed[name] = found;

    if (differs(version, found)) {
      mismatches.push(`${name}: the documentation is for ${version}, the project installs ${found}`);
    }
  }

  return {
    documented,
    installed,
    notice: mismatches.length
      ? `${mismatches.join('; ')}. A prop, a component or a variable may be missing or different in the installed version: `
        + 'update @proedis/mcp to the release built with it, or trust the types of the installed package over this answer.'
      : undefined
  };
}
