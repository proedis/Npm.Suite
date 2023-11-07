import console from 'node:console';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, sep as pathSeparator } from 'node:path';
import { cwd } from 'node:process';

import chalk from 'chalk';

import latestVersion from 'latest-version';
import packageJson from 'package-json';
import semver from 'semver';

import type { PackageJson } from 'type-fest';

import type { AbstractPackageManager, Dependency, DependencyType } from './package-managers';
import { PackageManagerFactory } from './package-managers';


/* --------
 * Project Controller
 * -------- */
export class Project {

  // ----
  // Private Utilities
  // ----

  /**
   * Starting from current working directory, search for an element named as requested.
   * If element doesn't exist, the function will walk backward to parent folder (recursive)
   * to find the requested directory.
   * If no directory could be found, it will be optionally created and returned.
   * @param name The name of the element to search to
   * @param type The type of the element to search to
   * @private
   */
  private static getFirstPathFor(name: string, type: 'file'): string | null;
  private static getFirstPathFor(name: string, type: 'directory', createIfMissing?: boolean): string | null;
  private static getFirstPathFor(name: string, type: 'directory' | 'file', createIfMissing?: boolean): string | null {
    /** Get current working directory path parts */
    const cwdPathParts = cwd().split(pathSeparator);

    /** Walk backward from current path to root to find a valid element */
    while (!!cwdPathParts.length) {
      /** Rebuild the path as single string */
      const rebuiltPath = cwdPathParts.join(pathSeparator);

      /** Check if the current directory is named 'name' and if it is, return it */
      if (type === 'directory' && cwdPathParts[cwdPathParts.length - 1] === name) {
        return rebuiltPath;
      }

      /** Check if the current directory contain an element named 'name' */
      const maybeChildPathName = resolve(rebuiltPath, name);
      if (existsSync(maybeChildPathName)) {
        const stats = statSync(maybeChildPathName);

        if ((type === 'file' && stats.isFile()) || (type === 'directory' && stats.isDirectory())) {
          return maybeChildPathName;
        }
      }

      /** Remove the last part of the path */
      cwdPathParts.pop();
    }

    /** If the directory has not been found, check first if it could be created */
    if (createIfMissing && type === 'directory') {
      const newDirectoryPath = resolve(cwd(), name);
      mkdirSync(newDirectoryPath, { recursive: true });
      return newDirectoryPath;
    }

    console.log(
      chalk.yellow(`Search for '${name}' element produced no results.`)
    );

    return null;
  }


  // ----
  // Folders and Directories
  // ----

  private _rootDirectory: string | undefined;

  public get rootDirectory(): string {
    if (this._rootDirectory) {
      return this._rootDirectory;
    }

    const srcPath = Project.getFirstPathFor('src', 'directory');

    this._rootDirectory = !!srcPath ? resolve(srcPath, '..') : cwd();

    return this._rootDirectory;
  }


  // ----
  // Package Json Fields
  // ----

  private _packageJson: PackageJson | undefined;

  public get packageJson(): PackageJson {
    /** If package json has already been loaded, return it */
    if (this._packageJson) {
      return this._packageJson;
    }

    /** Get the package json path */
    const packageJsonPath = Project.getFirstPathFor('package.json', 'file');

    if (!packageJsonPath) {
      throw new Error('Could not find a valid package.json in this project');
    }

    this._packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageJson;

    return this._packageJson;
  }


  public isDependencySatisfied(name: string, versionRange: string, type: DependencyType): boolean {
    /** Get the string representation of the version */
    const version = this.getDependencyVersion(name, type);
    /** Assert version is a valid string */
    if (!version) {
      return false;
    }
    /** Parse the version, getting the lower acceptable by the semver string */
    const parsedVersion = semver.minVersion(version);
    /** Assert the version has been parsed */
    if (!parsedVersion) {
      return false;
    }
    return semver.satisfies(parsedVersion, versionRange);
  }


  public getDependencyVersion(name: string, type: DependencyType): string | null {
    /** Get the right pool */
    const pool = type === 'production' ? this.packageJson.dependencies : this.packageJson.devDependencies;

    /** Assert the package exists in pool */
    if (!pool || !(name in pool) || !pool[name]) {
      return null;
    }

    /** Return cleaned version of the dependency */
    return semver.clean(pool[name] as string);
  }


  // ----
  // Package Manager Reference
  // ----

  private _manager: AbstractPackageManager | undefined;

  public get manager(): AbstractPackageManager {
    /** If manager has already been loaded, return it */
    if (this._manager) {
      return this._manager;
    }

    /** Else, find the corrected manager and return it */
    this._manager = PackageManagerFactory.find();

    return this._manager;
  }


  // ----
  // Dependency Installation
  // ----

  public async addDependencyChain(dependency: string, type: DependencyType): Promise<boolean> {
    try {
      /** Get package metadata from registry */
      const metadata = await packageJson(dependency, { fullMetadata: true });

      /** Extract useful data */
      const { version, peerDependencies } = metadata;

      /** Assert the version exists in returned metadata */
      if (typeof version !== 'string') {
        console.error(chalk.red('Invalid version found in metadata'));
        return false;
      }

      /** Create the dependencies array to install */
      const dependencies: Dependency[] = [];

      /** Check if the main dependencies is satisfied or not */
      if (!this.isDependencySatisfied(dependency, version, type)) {
        dependencies.push({
          name: dependency,
          version
        });
      }

      /** Add all peer dependencies to  */
      if (peerDependencies) {
        const promises = Object.keys(peerDependencies as PackageJson.Dependency).map((dep) => (
          new Promise<void>(async (resolveDependency, reject) => {
            /** Extract the requested version from metadata */
            const requestedVersion = (peerDependencies as PackageJson.Dependency)[dep];

            /** Assert the version exists */
            if (!requestedVersion) {
              console.error(chalk.red(`Could not extract requested version/range for ${dep} dependency`));
              return reject();
            }

            /** Check if the dependency is satisfied before install it */
            if (this.isDependencySatisfied(dep, requestedVersion, type)) {
              return resolveDependency();
            }

            /** Get the latest version of the dependency from the registry */
            try {
              const latestDependencyVersion = await latestVersion(dep, { version: requestedVersion });
              dependencies.push({ name: dep, version: latestDependencyVersion });
              return resolveDependency();
            }
            catch {
              console.error(chalk.red(`Error while resolving latest version for ${dep}, requested range ${requestedVersion}`));
              return reject();
            }
          })
        ));

        await Promise.all(promises);
      }

      /** If no dependencies have to be installed, skip */
      if (!dependencies) {
        return true;
      }

      return await this.manager.add(dependencies, type);
    }
    catch {
      console.error(
        chalk.red(
          `An error occurred while installing ${dependency} package chain`
        )
      );
      return false;
    }
  }

}
