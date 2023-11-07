import console from 'node:console';
import { resolve } from 'node:path';

import chalk from 'chalk';

import { AbstractAction } from './lib';
import type { ActionInputs } from './lib';

import { Project, TemplateCompiler } from '../lib';


/* --------
 * Internal Types
 * -------- */
export interface InitActionInput {
  /** The module to initialize */
  module: 'eslint' | 'tsconfig';
}


/* --------
 * Action Definition
 * -------- */
export class InitAction extends AbstractAction<InitActionInput> {


  // ----
  // Public Handlers
  // ----
  public async handle(inputs: ActionInputs<InitActionInput>): Promise<void> {
    /** Initialize the Project */
    const project = new Project();

    /** Use switch case to use the right initializer */
    switch (inputs.getOption('module')) {
      case 'eslint':
        return this.initializeEsLint(inputs, project);

      case 'tsconfig':
        return this.initializeTsConfig(inputs, project);

      default:
        throw new Error(`Invalid Initializer found ${inputs.getOption('module')}`);
    }
  }


  // ----
  // TSConfig Initialization
  // ----
  private async initializeTsConfig(inputs: ActionInputs<InitActionInput>, project: Project): Promise<void> {
    const completed = await project.addDependencyChain('@proedis/tsconfig', 'development');

    if (!completed) {
      console.error(chalk.red('Could not continue initializing tsconfig without installing necessary packages.'));
      return;
    }

    const templateCompiler = new TemplateCompiler(resolve(__dirname, 'templates', 'init', 'tsconfig'));

    await templateCompiler.save(
      resolve(project.rootDirectory, 'tsconfig.json'),
      'tsconfig.template.ejs',
      {
        type: 'json'
      }
    );

    return Promise.resolve();
  }


  // ----
  // ESLint Initialization
  // ----
  private async initializeEsLint(inputs: ActionInputs<InitActionInput>, project: Project): Promise<void> {
    const completed = await project.addDependencyChain('eslint-config-proedis', 'development');

    if (!completed) {
      console.error(chalk.red('Could not continue initializing eslint without installing necessary packages.'));
      return;
    }

    const templateCompiler = new TemplateCompiler(resolve(__dirname, 'templates', 'init', 'eslint'));

    await templateCompiler.save(
      resolve(project.rootDirectory, '.eslintrc.js'),
      'eslintrc.template.ejs',
      {
        type: 'babel'
      }
    );

    await templateCompiler.save(
      resolve(project.rootDirectory, 'tsconfig.eslint.json'),
      'tsconfig.eslint.template.ejs',
      {
        type: 'json'
      }
    );

    return Promise.resolve();
  }

}
