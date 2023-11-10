import console from 'node:console';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import chalk from 'chalk';
import ora from 'ora';
import semver from 'semver';

import getLatestVersion from 'latest-version';
import getPackageJson from 'package-json';
import type { AbbreviatedVersion } from 'package-json';

import type { PackageJson } from 'type-fest';

import { DependenciesCollection } from './dependencies.collection';

import type { AbstractRunner } from '../runners/abstract.runner';
import type { PackageManagerCommands } from './package-manager.commands';

import { askForConfirmation, spinnerFeedbackFunction } from '../../ui';


/* --------
 * Internal Types
 * -------- */
export interface Dependency {
  name: string;

  modifier?: '^' | '~';

  version?: string;
}

export type DependencyType = 'production' | 'development';


/* --------
 * Package Manager Abstraction
 * -------- */
export abstract class AbstractPackageManager {

  constructor(
    protected readonly runner: AbstractRunner,
    protected readonly packageJson: PackageJson
  ) {
  }


  // ----
  // Internal Cache
  // ----
  private readonly _packageMetadataCache = new Map<string, AbbreviatedVersion>();

  private readonly _requiredPeerDependenciesCache = new Map<string, Dependency[]>();


  // ----
  // Internal Utilities
  // ----
  public getRawFullCommand(command: string): string {
    return this.runner.rawFullCommand(command);
  }


  /**
   * Build the dependencies add command to pass to cli tool
   * @param dependencies
   * @param type
   */
  public getDependenciesAddCommand(dependencies: Dependency[], type: DependencyType): string {
    return [
      this.cli.add,
      type === 'development' ? this.cli.saveDevFlag : this.cli.saveFlag,
      ...dependencies.map((dep) => (
        dep.version ? `${dep.name}@${dep.modifier || ''}${dep.version}` : dep.name
      ))
    ].filter(Boolean).join(' ');
  }


  // ----
  // Project Dependencies
  // ----

  /**
   * Return the current installed version of a dependency, looking for that in production
   * and in development dependencies
   * @param name
   */
  public getInstalledDependencyVersion(name: string): string | null {
    /** Get the pool of dependencies to use to look for dependency name */
    const pool = { ...this.packageJson.dependencies, ...this.packageJson.devDependencies };

    /** Assert the package exists in current pool */
    if (!pool || !(name in pool) || !pool[name]) {
      return null;
    }

    /** Resolve the path of the requested dependency */
    const modulePath = require.resolve(join(name, 'package.json'));

    try {
      /** Return the package version field */
      return (JSON.parse(readFileSync(modulePath, 'utf-8')) as PackageJson).version || null;
    }
    catch {
      console.info(
        chalk.red(`Error reading installed version for dependency ${name}`)
      );

      return null;
    }
  }


  /**
   * Check if an installed dependency satisfy the requested version range or not
   * @param dependency
   */
  public isDependencySatisfied(dependency: Dependency): boolean {
    /** Get the version of installed dependency if exists */
    const installedVersion = this.getInstalledDependencyVersion(dependency.name);

    /** If dependency is not installed yet, return false */
    if (!installedVersion) {
      return false;
    }

    /** Parse the found version using semver specification. */
    const parsedVersion = semver.parse(installedVersion);

    /** Assert the version has been correctly parsed */
    if (!parsedVersion) {
      return false;
    }

    /** If no version exists, assume it is satisfied */
    if (!dependency.version) {
      return true;
    }

    /** Return if the installed version satisfy the requested range */
    return semver.satisfies(parsedVersion, dependency.version);
  }


  /**
   * From a package name, try to load the latest version metadata
   * @param dependency
   * @param silent
   */
  public getPackageMetadata(dependency: Dependency, silent?: boolean): Promise<AbbreviatedVersion> {
    return spinnerFeedbackFunction<AbbreviatedVersion>(
      `Search for ${dependency.name} package metadata`,
      async (resolve, reject) => {
        /** Check if a metadata already exists into cache */
        const cachedMetadata = this._packageMetadataCache.get(`${dependency.name}@${dependency.version || ''}`);
        if (cachedMetadata) {
          return resolve(
            cachedMetadata,
            `Resolved ${dependency.name}@${cachedMetadata.version} package metadata from cache.`
          );
        }

        /** Get the package version to search, or fallback to latest version */
        const requestedVersion = dependency.version ?? await getLatestVersion(dependency.name);

        try {
          /** Search into npm registry for package metadata */
          const metadata = await getPackageJson(dependency.name, {
            version: requestedVersion
          }) as unknown as AbbreviatedVersion;

          /** Save the metadata into cache */
          this._packageMetadataCache.set(`${dependency.name}@${requestedVersion}`, metadata);

          /** Resolve the metadata package */
          return resolve(metadata, `Found ${dependency.name}@${metadata.version} package metadata`);
        }
        catch (error: any) {
          /** getPackageJson error catcher */
          if (error && error instanceof getPackageJson.PackageNotFoundError) {
            return reject(`Package ${dependency.name} could not be found`);
          }
          if (error && error instanceof getPackageJson.VersionNotFoundError) {
            return reject(`Version ${requestedVersion} could not be found for package ${dependency.name}`);
          }
          return reject(`Invalid metadata found for package ${dependency.name}`);
        }
      },
      silent
    );
  }


  /**
   * Get all peerDependencies for a specific package.
   * This method will exclude by default all optional dependencies
   * and will keep only required dependencies
   * @param dependency
   */
  public async getRequiredPeerDependencies(dependency: Dependency): Promise<Dependency[]> {
    /** Check if required peerDependencies have been cached */
    const cachedPeerDependencies = this._requiredPeerDependenciesCache.get(`${dependency.name}@${dependency.version || 'latest'}`);
    if (cachedPeerDependencies) {
      return cachedPeerDependencies;
    }

    /** Get the peerDependencies object and peerDependenciesMeta information from metadata */
    const {
      peerDependencies    : packagePeerDependencies,
      peerDependenciesMeta: packagePeerDependenciesMeta
    } = await this.getPackageMetadata(dependency, true);

    /** If no peerDependencies exists could resolve an empty array */
    if (!packagePeerDependencies || !Object.keys(packagePeerDependencies).length) {
      return [];
    }

    /** Initialize the array to be returned */
    const peerDependencies: Dependency[] = [];

    /** Build a new promises chain to resolve all peerDependencies at the same time */
    try {
      await Promise.all(
        Object.keys(packagePeerDependencies).map((peerDependencyName) => (
          new Promise<void>(async (resolve) => {
            /** Before resolving exact version of the peerDependency, check if this is optional or not */
            if ((packagePeerDependenciesMeta as any)?.[peerDependencyName]?.optional) {
              return resolve();
            }

            /** Extract the required version from peerDependencies */
            const requiredVersion = packagePeerDependencies[peerDependencyName];

            /** If peerDependency is already satisfied, abort */
            if (this.isDependencySatisfied({ name: peerDependencyName, version: requiredVersion })) {
              return resolve();
            }

            /** Get the latest version for the peerDependency */
            const peerDependencyVersion = await getLatestVersion(peerDependencyName, {
              version: packagePeerDependencies[peerDependencyName]
            });

            /** Add to peerDependencies collection and resolve */
            peerDependencies.push({
              name   : peerDependencyName,
              version: peerDependencyVersion
            });

            return resolve();
          })
        ))
      );

      this._requiredPeerDependenciesCache.set(`${dependency.name}@${dependency.version || 'latest'}`, peerDependencies);

      return peerDependencies;
    }
    catch (error) {
      console.info(
        chalk.red(
          `An error occur while resolving peerDependencies for package ${dependency.name}@${dependency.version || 'latest'}`
        )
      );
      throw error ?? new Error('Unhandled Error');
    }
  }


  /**
   * Starting from a dependency name build the entire tree, looking for
   * all required peer dependencies and return them
   * @param dependency
   */
  public async resolveDependencyTree(dependency: Dependency): Promise<Dependency[]> {
    /** Get the package metadata */
    const { version } = await this.getPackageMetadata(dependency);
    const packagePeerDependencies = await this.getRequiredPeerDependencies(dependency);

    /** Create the array of dependencies that need to be installed */
    const dependencies = new DependenciesCollection();
    const peerDependencies = new DependenciesCollection();

    /** If the main package is not satisfied, directly put into dependencies to install collection */
    if (!this.isDependencySatisfied(dependency)) {
      dependencies.push({
        name: dependency.name,
        version
      });
    }

    /** Loop each peerDependencies and place them into peerDependencies to be checked and resolved */
    packagePeerDependencies.forEach((peerDependency) => {
      peerDependencies.push(peerDependency);
    });

    /** Loop each peerDependencies to resolve inner dependencies */
    while (peerDependencies.length > 0) {
      /** Extract the peer dependency to check */
      const peerDependency = peerDependencies.shift() as Dependency;

      const spinner = ora(
        [
          'Resolving peerDependencies tree for package ',
          chalk.cyanBright.bold(peerDependency.name),
          chalk.cyan(`@${peerDependency.version || 'latest'}`),
          '...'
        ].join('')
      ).start();

      try {
        /** Update the peerDependency version according to latest version for requested range */
        peerDependency.version = await getLatestVersion(peerDependency.name, {
          version: peerDependency.version
        });

        /** If the peerDependency is not satisfied by current package.json file, add to dependencies collection */
        if (!this.isDependencySatisfied(peerDependency)) {
          dependencies.push(peerDependency);
        }

        /** Load the metadata for the peerDependency */
        const nestedPeerDependencies = await this.getRequiredPeerDependencies(peerDependency);

        /** If the peerDependency contains constraints to other peer dependencies, add to the collection */
        nestedPeerDependencies.forEach((nestedPeerDependency) => {
          peerDependencies.push(nestedPeerDependency);
        });

        spinner.succeed();
      }
      catch (error) {
        spinner.fail(`Error while resolving dependencies tree for ${peerDependency.name}`);
        throw error ?? new Error('Unhandled Error');
      }
    }

    /** Return the list of dependencies */
    return dependencies;
  }


  // ----
  // Project Dependencies Add
  // ----

  /**
   * Add the list of dependencies to the current project
   * @param dependencies
   * @param type
   */
  public async add(dependencies: (string | Dependency)[], type: DependencyType): Promise<boolean> {
    /** Normalize dependency list to be a valid Dependency array */
    const normalizedDependencies = dependencies.map<Dependency>((dep) => (
      typeof dep === 'string' ? { name: dep } : dep
    ))
      .sort((a, b) => a.name.localeCompare(b.name));

    console.info();
    console.info(`Some dependencies will be installed for ${type === 'production' ? 'Production' : 'Development'}`);
    for (const dep of normalizedDependencies) {
      console.info([
        '  ',
        chalk.greenBright.bold(dep.name),
        chalk.green([ '@', dep.modifier, dep.version || 'latest' ].filter(Boolean).join(''))
      ].join(''));
    }
    console.info();

    const isContinueRequested = await askForConfirmation('Do you want to continue?');

    if (!isContinueRequested) {
      return false;
    }

    return this.run(this.getDependenciesAddCommand(normalizedDependencies, type), 'Installing Dependencies');
  }


  // ----
  // Project Dependencies Updating
  // ----
  public async update(dependencies: string[]) {
    const deps = dependencies.join(' ');
    const command = `${this.cli.update} ${deps}`;
    await this.run(command, `Updating ${deps}`);
  }


  // ----
  // Project Dependencies Deleting
  // ----
  public async delete(dependencies: string[], type: DependencyType) {
    const deps = dependencies.join(' ');
    const command = [
      this.cli.remove,
      type === 'development' ? this.cli.saveDevFlag : this.cli.saveFlag,
      deps
    ].filter(Boolean).join(' ');
    await this.run(command, `Removing ${deps}`);
  }


  // ----
  // Public Utilities Methods
  // ----
  public async version(): Promise<string> {
    return this.runner.run('--version', true);
  }


  // ----
  // Main Run Command
  // ----
  private async run(command: string, message: string): Promise<boolean> {
    /** Create and start the Spinner to provide User Feedback */
    const spinner = ora(message).start();

    /** Try to execute the command using default runner */
    try {
      await this.runner.run(command, true, spinner);
      spinner.succeed();
      return true;
    }
    catch {
      spinner.fail();
      console.error(
        chalk.red(
          'Packages installation failed!\n' +
          'In case you don\'t see any errors above, consider manually running the failed command ' +
          `${chalk.bold(this.runner.rawFullCommand(command))} ` +
          'to see more details on why it errored out.'
        )
      );
      return false;
    }
  }


  public abstract get name(): string;


  public abstract get cli(): PackageManagerCommands;

}
