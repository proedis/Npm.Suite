import console from 'node:console';
import { relative, resolve } from 'node:path';
import { cwd } from 'node:process';

import chalk from 'chalk';

import { AbstractedScaffolder } from './lib';

import type { PlannedFile } from '../write-plan';


/* --------
 * Internal Types
 * -------- */
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
  // Source Description
  // ----
  protected get cacheKey(): string {
    return 'scaffold-enums';
  }


  protected get sourceName(): string {
    return 'Enums Definition';
  }


  protected describeSource(source: SharedObjects): string {
    const names = Object.keys(source);
    const values = names.reduce((count, name) => count + source[name].length, 0);

    return `Found ${names.length} enum${names.length === 1 ? '' : 's'}, ${values} value${values === 1 ? '' : 's'}.`;
  }


  // ----
  // Main Scaffold Implementation
  // ----
  protected async build(): Promise<void> {
    /** Download and validate the shared objects definition */
    const sharedObjects = await this.getSource<SharedObjects>(EnumScaffolder.assertSharedObjects);

    /** Build the folders path */
    const root = this.project.srcDirectory;
    const interfacesPath = resolve(root, 'interfaces');

    const typesPath = resolve(interfacesPath, 'shared-objects');
    const enumsPath = resolve(interfacesPath, 'enums');
    const constantsPath = resolve(root, 'constants');

    /** Start to process to write enums definition */
    console.info();
    console.info(`All paths will be resolved from root ${chalk.green(relative(cwd(), root))}:`);
    console.info(` - Saving Constants in ${chalk.cyan(`./${relative(root, constantsPath)}`)}`);
    console.info(` - Saving Enums in ${chalk.cyan(`./${relative(root, enumsPath)}`)}`);
    console.info(` - Saving Utilities in ${chalk.cyan(`./${relative(root, typesPath)}`)}`);

    /** Clean all directories and recreate */
    this.wipeDirectories([ typesPath, enumsPath, resolve(constantsPath, 'enums') ]);

    /** Render every file, adding it to the plan. Nothing is on disk until the plan commits */
    this.plan.add(
      /** Create all interfaces and types under interfaces folder */
      ...await this.generateEnumsInterfaces(enumsPath, sharedObjects),
      /** Generate main shared object utilities */
      ...await this.generateSharedObjectsTypes(typesPath, sharedObjects),
      /** Generate the constants files */
      ...await this.generateSharedObjectConstants(resolve(constantsPath, 'enums'), sharedObjects),
      /** Generate all utilities */
      ...await this.generateSharedObjectsUtilities(constantsPath, sharedObjects)
    );
  }


  // ----
  // Internal Scaffold Utilities
  // ----
  private async generateEnumsInterfaces(outputPath: string, sharedObjects: SharedObjects): Promise<PlannedFile[]> {
    /** Create an array of generated files to be linted at the end of the process */
    const generatedFiles: (PlannedFile | null)[] = [];

    /** Create the template compiler */
    const compiler = this.compiler.forPath('enums', 'interfaces', 'enums').defaults({
      noLint         : true,
      printDisclaimer: true
    });

    /** Generate all single enum type definition */
    generatedFiles.push(...await Promise.all(
      Object.keys(sharedObjects).map((enumName) => (
        compiler.plan(
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
    generatedFiles.push(await compiler.plan(
      '_composed.ts',
      outputPath,
      { model: { names: Object.keys(sharedObjects) } }
    ));

    /** Create the enums type index to export all types */
    generatedFiles.push(await compiler.plan(
      '_enum-type-index.ts',
      outputPath,
      {
        model : { names: Object.keys(sharedObjects) },
        rename: 'index.ts'
      }
    ));

    /** Return all generated files */
    return generatedFiles.filter((file): file is PlannedFile => file !== null);
  }


  private async generateSharedObjectsTypes(outputPath: string, sharedObjects: SharedObjects): Promise<PlannedFile[]> {
    /** Create the template compiler */
    const compiler = this.compiler.forPath('enums', 'interfaces', 'shared-objects').defaults({
      noLint         : true,
      printDisclaimer: true
    });

    /** Generate all files in directory */
    return compiler.planAll(outputPath, {
      model: { names: Object.keys(sharedObjects) }
    });
  }


  private async generateSharedObjectConstants(outputPath: string, sharedObjects: SharedObjects): Promise<PlannedFile[]> {
    /** Create an array of generated files to be linted at the end of the process */
    const generatedFiles: (PlannedFile | null)[] = [];

    /** Create the template compiler */
    const compiler = this.compiler.forPath('enums', 'constants', 'enums').defaults({
      noLint         : true,
      printDisclaimer: true
    });

    /** Generate single files for all enums */
    generatedFiles.push(...await Promise.all(
      Object.keys(sharedObjects).map((enumName) => (
        compiler.plan(
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
    generatedFiles.push(await compiler.plan(
      '_index.ts',
      outputPath,
      {
        model : { names: Object.keys(sharedObjects) },
        rename: 'index.ts'
      }
    ));

    /** Return the array of generated files */
    return generatedFiles.filter((file): file is PlannedFile => file !== null);
  }


  private async generateSharedObjectsUtilities(outputPath: string, sharedObjects: SharedObjects): Promise<PlannedFile[]> {
    /** Create an array of generated files to be linted at the end of the process */
    const generatedFiles: (PlannedFile | null)[] = [];

    /** Create the template compiler */
    const compiler = this.compiler.forPath('enums', 'constants').defaults({
      noLint    : true,
      noOverride: (fileName) => /\.(icons|colors)\.ts$/.test(fileName)
    });

    /**
     * Ask user if it must compile shared objects color and icons.
     *
     * The generated files no longer name a UI kit: color and icon tokens are typed through
     * '@proedis/modeler' EnumsColors and EnumsIcons, which resolve to whatever the
     * application declares on ModelerOverride, and to plain strings until it declares
     * anything. Mantine and FontAwesome used to be hard requirements here purely because
     * these two files imported their token types directly.
     */
    const mustContinue = await this.confirm(
      'Do you want to generate SharedObjects utilities like colors and icons? '
      + '@proedis/modeler is required to continue: without that package the utilities won\'t be usable.'
    );

    if (!mustContinue) {
      return generatedFiles.filter((file): file is PlannedFile => file !== null);
    }

    /** Compile all files in the folder */
    generatedFiles.push(
      ...await compiler.planAll(
        outputPath,
        {
          model: {
            /**
             * The zod helper is emitted only when zod is actually available to this project:
             * generating an import for a package that cannot be resolved produces a file that
             * does not compile, and this scaffolder installs nothing on its own. Availability
             * is not the same as being declared here — see 'canResolveDependency'.
             */
            hasZod       : this.project.canResolveDependency('zod'),
            sharedObjects: Object.keys(sharedObjects).map((sharedObjectName) => ({
              name  : sharedObjectName,
              values: sharedObjects[sharedObjectName].map((v) => v.name)
            }))
          }
        }
      )
    );

    /** Ask user if it must compile configuration for modeler */
    const generateConfigurationFile = await this.confirm(
      'Do you want to generate Modeler Configuration file? '
      + '@proedis/modeler is required to continue: without that package the utilities won\'t be usable.'
    );

    if (!generateConfigurationFile) {
      return generatedFiles.filter((file): file is PlannedFile => file !== null);
    }

    /** Create the compiler */
    const configurationCompiler = this.compiler.forPath('enums', 'configurations').defaults({
      noLint    : true,
      noOverride: true
    });

    generatedFiles.push(await configurationCompiler.plan('modeler.configuration.ts', this.project.srcDirectory));

    return generatedFiles.filter((file): file is PlannedFile => file !== null);
  }


  /**
   * Reject anything that is not a shared objects definition, before a single directory
   * gets erased on disk.
   *
   * @param source The parsed response body
   */
  private static assertSharedObjects(source: unknown): SharedObjects {
    /** Validating the enums definition response */
    if (typeof source !== 'object' || source == null || Array.isArray(source)) {
      throw new Error('Definition error: expected an object with type Record<string, EnumDefinition[]>');
    }

    const sharedObjects = source as SharedObjects;

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
        'Invalid SharedObjects response: '
        + 'expecting all values to be an object implementing { name: string, label: string, value: number }. '
        + `Found invalid elements in [${malformedKeys.join(', ')}]`
      );
    }

    /** Return downloaded data */
    return sharedObjects;
  }

}
