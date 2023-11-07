import console from 'node:console';

import chalk from 'chalk';
import * as inquirer from 'inquirer';
import ora from 'ora';

import type { AbstractRunner } from '../runners/abstract.runner';
import type { PackageManagerCommands } from './package-manager.commands';


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
    protected readonly runner: AbstractRunner
  ) {
  }


  // ----
  // Project Dependencies Add
  // ----
  public async add(dependencies: (string | Dependency)[], type: DependencyType): Promise<boolean> {
    /** Normalize dependency list to be a valid Dependency array */
    const normalizedDependencies = dependencies.map<Dependency>((dep) => (
      typeof dep === 'string' ? { name: dep } : dep
    ));

    console.info();
    console.info(`Some dependencies will be installed for ${type === 'production' ? 'Production' : 'Development'}`);
    for (const dep of normalizedDependencies) {
      console.info([
        '  ',
        chalk.blue(dep.name),
        chalk.blueBright([ '@', dep.modifier, dep.version || 'latest' ].filter(Boolean).join(''))
      ].join(''));
    }
    console.info();

    const prompt = inquirer.createPromptModule();
    const answers = await prompt<{ confirmed: boolean }>([
      {
        type   : 'confirm',
        name   : 'confirmed',
        message: 'Do you want to continue?'
      }
    ]);

    if (!answers.confirmed) {
      return false;
    }

    /** Create the command to continue */
    const command = [
      this.cli.add,
      type === 'development' ? this.cli.saveDevFlag : this.cli.saveFlag,
      ...normalizedDependencies.map((dep) => (
        dep.version ? `${dep.name}@${dep.modifier || ''}${dep.version}` : dep.name
      ))
    ].filter(Boolean).join(' ');

    return this.run(command, 'Installing Dependencies');
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
      await this.runner.run(command, true);
      spinner.succeed();
      return true;
    }
    catch {
      spinner.fail();
      console.error(
        chalk.red(
          `Packages installation failed!\nIn case you don't see any errors above,
          consider manually running the failed command ${chalk.bold(this.runner.rawFullCommand(command))}
          to see more details on why it errored out.`
        )
      );
      return false;
    }
  }


  public abstract get name(): string;


  public abstract get cli(): PackageManagerCommands;

}
