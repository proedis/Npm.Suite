import console from 'node:console';

import chalk from 'chalk';
import * as inquirer from 'inquirer';

import { AbstractAction } from './lib';
import type { ActionInputs } from './lib';

import type { Dependency, DependencyType } from '../lib';
import { askForConfirmation } from '../ui';


/* --------
 * Internal Types
 * -------- */
export interface InitActionInput {
  /** The module to initialize */
  module: 'eslint' | 'tsconfig' | 'mantine' | 'client';

  /** Skip dependency check and install */
  skipInstall?: boolean;

  /** Auto confirm initial prompt */
  yes?: boolean;
}

interface ModuleConfigurationOptions {
  /** Command inputs */
  inputs: ActionInputs<InitActionInput>;

  /** The main package to add */
  mainPackage: string;

  /** The model to use to compile template */
  model?: any;

  /** The root path for template, default to project root */
  templateRoot?: string;

  /** The type of the package */
  type: DependencyType;
}


/* --------
 * Model Answers
 * -------- */
interface ClientPromptAnswers {
  /** The application name to use */
  applicationName: string;

  /** Initialize the client with Gea */
  asGeaClient: boolean;

  /** The id of the GeaApplication to use */
  geaApplicationId?: string;

  /** Enable the usage of class-transformer */
  useClassTransformer: boolean;

  /** Initialize the client with react */
  withReact: boolean;
}


/* --------
 * Action Definition
 * -------- */
export class InitAction extends AbstractAction<InitActionInput> {


  constructor() {
    super('init');
  }


  // ----
  // Public Handlers
  // ----
  public async handle(inputs: ActionInputs<InitActionInput>): Promise<void> {
    /** Use switch case to use the right initializer */
    switch (inputs.getOption('module')) {
      case 'eslint':
        return this.addModulesAndConfigurations({
          inputs,
          mainPackage: 'eslint-config-proedis',
          type       : 'development'
        });

      case 'tsconfig':
        return this.addModulesAndConfigurations({
          inputs,
          mainPackage: '@proedis/tsconfig',
          type       : 'development'
        });

      case 'mantine':
        return this.addModulesAndConfigurations({
          inputs,
          mainPackage: '@proedis/mantine',
          type       : 'production'
        });

      case 'client':
        const model = await this.getClientModel();
        return this.addModulesAndConfigurations({
          inputs,
          mainPackage : model.withReact ? '@proedis/react-client' : '@proedis/client',
          model,
          templateRoot: this.project.srcDirectory,
          type        : 'production'
        });

      default:
        throw new Error(`Invalid Initializer found ${inputs.getOption('module')}`);
    }
  }


  // ----
  // Package Initialization
  // ----
  private async addModulesAndConfigurations(options: ModuleConfigurationOptions) {

    const {
      inputs,
      mainPackage,
      model,
      templateRoot,
      type
    } = options;

    const {
      module: name,
      skipInstall,
      yes: autoConfirm
    } = inputs.getAll();

    console.info();
    if (skipInstall) {
      console.info(`This command will prepare all files to use ${mainPackage} package.`);
      console.info('Package and dependencies need to be installed manually after configuration finish.');
    }
    else {
      console.info(
        `This command will install main package ${mainPackage} and all related peerDependencies and configuration files.`
      );
    }

    const start = autoConfirm || await askForConfirmation('Do you want to continue?');
    console.info();

    if (!start) {
      return;
    }

    /** Create and initialize the tools for the module */
    const compiler = this.compiler.forPath(name);

    /** Initialize the array of dependencies that must be installed manually */
    const dependenciesToInstall: Dependency[] = [];

    /** Check if dependencies must be installed automatically */
    if (!skipInstall) {
      /** Install dependencies using current project */
      const areDependenciesInstalled = await this.project.addDependencyChain(mainPackage, type);

      if (!areDependenciesInstalled) {
        console.error(
          `${chalk.red.bold(`Initialization failed: ${name}`)}:\n` +
          chalk.red('Packages installation process exit with an error')
        );
        return;
      }
    }
    else {
      const manager = await this.project.manager();
      dependenciesToInstall.push(...(await manager.resolveDependencyTree({ name: mainPackage })));
    }

    /** Use the compiler to save all templates */
    await compiler.saveAll(templateRoot || this.project.rootDirectory, {
      model
    });

    /** Check if dependencies to install manually has been found */
    if (dependenciesToInstall.length) {
      const manager = await this.project.manager();
      console.info();
      console.info('Some dependencies need to be manually installed. Please run this command:');
      console.info(
        chalk.green(manager.getRawFullCommand(manager.getDependenciesAddCommand(dependenciesToInstall, type)))
      );
      console.info();
    }
  }


  // ----
  // Models Builder
  // ----
  private async getClientModel(): Promise<ClientPromptAnswers> {
    const prompt = inquirer.createPromptModule();
    return prompt<ClientPromptAnswers>([
      {
        type    : 'input',
        message : 'Insert the Application Name',
        name    : 'applicationName',
        default : this.project.packageJson.name,
        validate: (input) => !!input
      },
      {
        type   : 'confirm',
        message: 'Are you planning to use \'class-transformer\' to transform client response?',
        name   : 'useClassTransformer'
      },
      {
        type   : 'confirm',
        message: 'Initialize the client with React?',
        name   : 'withReact'
      },
      {
        type   : 'confirm',
        message: 'Initialize the client as GeaAuthenticatedClient?',
        name   : 'asGeaClient'
      },
      {
        type    : 'input',
        message : 'Insert the GeaApplicationId',
        name    : 'geaApplicationId',
        when    : (curr) => !!curr.asGeaClient,
        validate: (input) => !!input
      }
    ]);
  }

}
