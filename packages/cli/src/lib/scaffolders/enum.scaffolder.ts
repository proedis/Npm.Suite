import console from 'node:console';
import { relative, resolve } from 'node:path';
import { cwd } from 'node:process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';

import chalk from 'chalk';

import { AbstractedScaffolder } from './lib';

import { askForConfirmation, spinnerFeedbackFunction } from '../../ui';

import type { SavedFile } from '../template.compiler';


/* --------
 * Internal Types
 * -------- */
interface EnumScaffolderAnswers {
  /** The endpoint relative to the host to use to download shared objects definition */
  endpoint: string;

  /** The host to use to download shared objects definition */
  host: string;
}

interface SharedObjectDefinition {
  /** The enumerator system name */
  name: string;

  /** The SharedObject Label to Display */
  label: string;

  /** The enumerator system value */
  value: number;
}

type SharedObjects = Record<string, SharedObjectDefinition[]>;


/* --------
 * Main Scaffolder Definition
 * -------- */
export class EnumScaffolder extends AbstractedScaffolder {


  // ----
  // Main Scaffold Implementation
  // ----
  public async scaffold(): Promise<SavedFile[]> {
    /** Get scaffold configuration */
    const answers = await this.getAnswers();
    console.info();

    /** Download shared objects from remote server */
    const sharedObjects = await this.getSharedObjects(answers);

    /** Build the folders path */
    const root = this.project.srcDirectory;
    const interfacesPath = resolve(root, 'interfaces');

    const typesPath = resolve(interfacesPath, 'shared-objects');
    const enumsPath = resolve(interfacesPath, 'enums');
    const constantsPath = resolve(root, 'constants');

    /** Start to process to write enums definition */
    console.info();
    console.info(`All paths will be resolved from root ${chalk.green(relative(cwd(), root))}:`);
    console.info(` - Saving Constants in ${chalk.cyan('./' + relative(root, constantsPath))}`);
    console.info(` - Saving Enums in ${chalk.cyan('./' + relative(root, enumsPath))}`);
    console.info(` - Saving Utilities in ${chalk.cyan('./' + relative(root, typesPath))}`);
    console.info();

    /** Clean all directories and recreate */
    [ typesPath, enumsPath, resolve(constantsPath, 'enums') ].forEach((path) => {
      /** Remove if folder exists */
      if (existsSync(path)) {
        rmSync(path, { recursive: true });
      }
      /** Recreate the folder */
      mkdirSync(path, { recursive: true });
    });

    /** Create the array of generate files to be returned */
    const generatedFiles: SavedFile[] = [
      /** Create all interfaces and types under interfaces folder */
      ...await this.generateEnumsInterfaces(enumsPath, sharedObjects),
      /** Generate main shared object utilities */
      ...await this.generateSharedObjectsTypes(typesPath, sharedObjects),
      /** Generate the constants files */
      ...await this.generateSharedObjectConstants(resolve(constantsPath, 'enums'), sharedObjects),
      /** Generate all utilities */
      ...await this.generateSharedObjectsUtilities(constantsPath, sharedObjects)
    ];


    return Promise.resolve(generatedFiles);
  }


  // ----
  // Internal Scaffold Utilities
  // ----
  private async generateEnumsInterfaces(outputPath: string, sharedObjects: SharedObjects): Promise<SavedFile[]> {
    /** Create an array of generated files to be linted at the end of the process */
    const generatedFiles: SavedFile[] = [];

    /** Create the template compiler */
    const compiler = this.compiler.forPath('enums', 'interfaces', 'enums').defaults({
      noLint         : true,
      printDisclaimer: true
    });

    /** Generate all single enum type definition */
    generatedFiles.push(...await Promise.all(
      Object.keys(sharedObjects).map((enumName) => (
        compiler.save(
          '_enum-type-definition.ts',
          outputPath,
          {
            model : {
              name  : enumName,
              values: sharedObjects[enumName].map((e) => e.name)
            },
            rename: `${enumName}.ts`
          }
        )
      ))
    ));

    /** Create the composed shared object interface */
    generatedFiles.push(await compiler.save(
      '_composed.ts',
      outputPath,
      { model: { names: Object.keys(sharedObjects) } }
    ));

    /** Create the enums type index to export all types */
    generatedFiles.push(await compiler.save(
      '_enum-type-index.ts',
      outputPath,
      {
        model : { names: Object.keys(sharedObjects) },
        rename: 'index.ts'
      }
    ));

    /** Return all generated files */
    return generatedFiles;
  }


  private async generateSharedObjectsTypes(outputPath: string, sharedObjects: SharedObjects): Promise<SavedFile[]> {
    /** Create the template compiler */
    const compiler = this.compiler.forPath('enums', 'interfaces', 'shared-objects').defaults({
      noLint         : true,
      printDisclaimer: true
    });

    /** Generate all files in directory */
    return compiler.saveAll(outputPath, {
      model: { names: Object.keys(sharedObjects) }
    });
  }


  private async generateSharedObjectConstants(outputPath: string, sharedObjects: SharedObjects): Promise<SavedFile[]> {
    /** Create an array of generated files to be linted at the end of the process */
    const generatedFiles: SavedFile[] = [];

    /** Create the template compiler */
    const compiler = this.compiler.forPath('enums', 'constants', 'enums').defaults({
      noLint         : true,
      printDisclaimer: true
    });

    /** Generate single files for all enums */
    generatedFiles.push(...await Promise.all(
      Object.keys(sharedObjects).map((enumName) => (
        compiler.save(
          '_enum-constant.ts',
          outputPath,
          {
            model : {
              name  : enumName,
              values: sharedObjects[enumName]
            },
            rename: `${enumName}.ts`
          }
        )
      ))
    ));

    /** Create the enums type index to export all types */
    generatedFiles.push(await compiler.save(
      '_index.ts',
      outputPath,
      {
        model : { names: Object.keys(sharedObjects) },
        rename: 'index.ts'
      }
    ));

    /** Return the array of generated files */
    return generatedFiles;
  }


  private async generateSharedObjectsUtilities(outputPath: string, sharedObjects: SharedObjects): Promise<SavedFile[]> {
    /** Create an array of generated files to be linted at the end of the process */
    const generatedFiles: SavedFile[] = [];

    /** Create the template compiler */
    const compiler = this.compiler.forPath('enums', 'constants').defaults({
      noLint    : true,
      noOverride: (fileName, path) => /\.(icons|colors)\.ts$/.test(fileName)
    });

    /** Ask user if it must compile shared objects color and icons */
    const mustContinue = await askForConfirmation(
      'Do you want to generate SharedObjects utilities like colors and icons? ' +
      'Mantine and FontAwesome are required to continue: without those packages utilities won\'t be usable.'
    );

    if (!mustContinue) {
      return generatedFiles;
    }

    /** Compile all files in the folder */
    generatedFiles.push(
      ...await compiler.saveAll(
        outputPath,
        {
          model: {
            sharedObjects: Object.keys(sharedObjects).map((sharedObjectName) => ({
              name  : sharedObjectName,
              values: sharedObjects[sharedObjectName].map((v) => v.name)
            }))
          }
        }
      )
    );

    /** Ask user if it must compile configuration for modeler */
    const generateConfigurationFile = await askForConfirmation(
      'Do you want to generate Modeler Configuration file? ' +
      '@proedis/modeler is required to continue: without those packages utilities won\'t be usable.'
    );

    if (!generateConfigurationFile) {
      return generatedFiles;
    }

    /** Create the compiler */
    const configurationCompiler = this.compiler.forPath('enums', 'configurations').defaults({
      noLint    : true,
      noOverride: true
    });

    generatedFiles.push(await configurationCompiler.save('modeler.configuration.ts', this.project.srcDirectory));

    return generatedFiles;
  }


  private async getSharedObjects(answers: EnumScaffolderAnswers): Promise<SharedObjects> {
    const sharedObjects = await spinnerFeedbackFunction<SharedObjects>(
      'Downloading Enums Definition...',
      async (resolveSharedObject, reject) => (
        import('node-fetch')
          .then((fetch) => fetch.default(
            `${answers.host}/${answers.endpoint.replace(/^\//, '')}`,
            {
              headers: {
                Origin: 'http://localhost'
              }
            }
          ))
          .then(async (response) => (
            resolveSharedObject(await response.json() as SharedObjects)
          ))
          .catch((error) => {
            reject(error?.message || 'Error while downloading Enums Definition');
          })
      )
    );

    /** Validating the enums definition response */
    if (typeof sharedObjects !== 'object' || sharedObjects == null || Array.isArray(sharedObjects)) {
      throw new Error('Definition error: expected an object with type Record<string, EnumDefinition[]>');
    }

    /** Assert all shared objects response are an array */
    const keysNotArray = Object.keys(sharedObjects).filter((k) => !Array.isArray(sharedObjects[k]));
    if (keysNotArray.length) {
      throw new Error(
        `Definition error: expecting all keys as Array but found invalid value for keys [${keysNotArray.join(', ')}]`
      );
    }

    /** Ensure all objects of all keys contains required values */
    const malformedKeys = Object.keys(sharedObjects)
      .filter((k) => sharedObjects[k].some(s => (
        typeof s.name !== 'string' || typeof s.value !== 'number' || typeof s.label !== 'string'
      )));
    if (malformedKeys.length) {
      throw new Error(
        'Invalid SharedObjects response: ' +
        'expecting all values to be an object implementing { name: string, label: string, value: number }. ' +
        `Found invalid elements in [${malformedKeys.join(', ')}]`
      );
    }

    /** Return downloaded data */
    return sharedObjects;
  }


  private async getAnswers(): Promise<EnumScaffolderAnswers> {
    /** Get answers to configure enums scaffold */
    return this.project.getPromptWithCachedDefaults<EnumScaffolderAnswers>(
      'scaffold-enums',
      [
        {
          name    : 'host',
          type    : 'input',
          message : 'Set the host to download data',
          validate: (input) => !!input
        },
        {
          name    : 'endpoint',
          type    : 'input',
          message : 'Set the endpoint to download data',
          validate: (input) => !!input
        }
      ]
    );
  }

}
