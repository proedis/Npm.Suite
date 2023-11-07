import console from 'node:console';

import chalk from 'chalk';
import ora from 'ora';

import packageJson from 'package-json';

import type { AbstractRunner } from '../runners/abstract.runner';
import type { PackageManagerCommands } from './package-manager.commands';


export abstract class AbstractPackageManager {

  constructor(
    protected readonly runner: AbstractRunner
  ) {
  }


  // ----
  // Project Dependencies Add
  // ----
  public async addProduction(dependencies: string[]) {
    const deps = dependencies.join(' ');
    const command = `${this.cli.add} ${this.cli.saveFlag} ${deps}`;
    await this.run(command, `Installing ${deps}`);
  }


  public async addDevelopment(dependencies: string[]) {
    const deps = dependencies.join(' ');
    const command = `${this.cli.add} ${this.cli.saveDevFlag} ${deps}`;
    await this.run(command, `Installing ${deps}`);
  }


  public async addChain(dependency: string, version?: string) {
    /** Search for the package on registry */
    const pack = await packageJson(dependency);
    console.log(pack);
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
  public async deleteProduction(dependencies: string[]) {
    const deps = dependencies.join(' ');
    const command = `${this.cli.remove} ${this.cli.saveFlag} ${deps}`;
    await this.run(command, `Removing ${deps}`);
  }


  public async deleteDevelopment(dependencies: string[]) {
    const deps = dependencies.join(' ');
    const command = `${this.cli.remove} ${this.cli.saveDevFlag} ${deps}`;
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
  private async run(command: string, message: string) {
    /** Create and start the Spinner to provide User Feedback */
    const spinner = ora({
      spinner: {
        interval: 120,
        frames  : [ '▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸' ]
      },
      text   : message
    });
    spinner.start();

    /** Try to execute the command using default runner */
    try {
      await this.runner.run(command, true);
      spinner.succeed();
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
    }
  }


  public abstract get name(): string;


  public abstract get cli(): PackageManagerCommands;

}
