import console from 'node:console';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, sep as pathSeparator } from 'node:path';
import { cwd } from 'node:process';

import chalk from 'chalk';

import type { PackageJson } from 'type-fest';

import { PackageManagerFactory } from './package-managers';
import type { AbstractPackageManager } from './package-managers';


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
   * @param [createIfMissing] Create the directory in current work
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
  // Package Json Fields
  // ----

  private _packageJson: undefined | PackageJson;

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

}
