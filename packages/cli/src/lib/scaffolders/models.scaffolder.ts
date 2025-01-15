import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { AugmentedMap } from '@proedis/utils';

import { AbstractedScaffolder } from './lib';
import { spinnerFeedbackFunction } from '../../ui';

import { ModelsRepository } from './lib/models/ModelsRepository';

import type { OpenApiDocument, RouteParameterSchema, PathMethodDescriptor } from './types/openapi';
import { type SavedFile, TemplateCompiler } from '../template.compiler';
import { globSync } from 'glob';


/* --------
 * Internal Types
 * -------- */
interface ModelsScaffolderAnswers {
  /** The endpoint at which the host will respond with OpenAPI Specification */
  endpoint: string;

  /** The host to use to download OpenAPI Specification */
  host: string;
}


/* --------
 * Main Scaffolder Definition
 * -------- */
export class ModelsScaffolder extends AbstractedScaffolder {

  public async scaffold(): Promise<SavedFile[]> {
    /** Get scaffold configuration */
    const answers = await this.getAnswers();

    /** Download the open api document from server */
    const openApiDocument = await this.getOpenApiDocument(answers);

    /** Get the root folder to use to write/update models */
    const root = this.project.srcDirectory;

    /** Create a new string array of saved files */
    const results: SavedFile[] = [];

    /** Generate all models from OpenApi Document */
    results.push(...this.generateModels(root, openApiDocument));
    results.push(this.generateNamespaces(root, openApiDocument));

    /** Return the array of written files */
    return results;
  }


  private async getOpenApiDocument(answers: ModelsScaffolderAnswers): Promise<OpenApiDocument> {
    /** Download the OpenApi Document from the Server */
    const openApiDocument = await spinnerFeedbackFunction<OpenApiDocument>(
      'Downloading OpenApi Specification',
      async (resolveOpenApi, reject) => (
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
            resolveOpenApi(await response.json() as OpenApiDocument)
          ))
          .catch((error) => {
            reject(error?.message || 'Error while downloading OpenApi Specification');
          })
      )
    );

    /** Assert is a valid object */
    if (typeof openApiDocument !== 'object' || openApiDocument == null || Array.isArray(openApiDocument)) {
      throw new Error('Definition error: expected an object');
    }

    /** Assert the version of the OpenApi Document is valid */
    if (openApiDocument.openapi !== '3.0.1') {
      throw new Error(`Expecting OpenApi document Version 3.0.1, found ${openApiDocument.openapi}`);
    }

    /** Return the document */
    return openApiDocument;
  }


  private generateModels(root: string, openApiDocument: OpenApiDocument): string[] {
    const modelsPath = resolve(root, 'models', 'scaffold');

    /** Clear the entire models folder */
    if (existsSync(modelsPath)) {
      rmSync(modelsPath, { recursive: true, force: true });
    }

    /** Create the Model Repository with downloaded data */
    const modelsRepository = new ModelsRepository(openApiDocument.components, this.compiler, modelsPath);
    modelsRepository.write();

    return this.generateBarrel(modelsPath);
  }


  private generateBarrel(folder: string): string[] {
    /** Get all typescript files in the folder */
    const files = globSync('**/*.ts', {
      cwd: folder
    }).sort((a, b) => a.localeCompare(b)).map(f => `./${f}`);

    const content: string[] = [
      TemplateCompiler.getDisclaimer(),
      ''
    ];

    files.map((file) => file.replace(/\.ts/i, '')).forEach((file) => {
      content.push(
        `export * from '${file}';`,
        ''
      );
    });

    const barrelFile = resolve(folder, 'index.ts');

    writeFileSync(barrelFile, content.join('\n'), 'utf-8');

    return [ ...files, barrelFile ].map(file => resolve(folder, file));
  }


  private generateNamespaces(root: string, openApiDocument: OpenApiDocument): SavedFile {
    /** Create the path to the file to write */
    const namespaceFile = resolve(root, 'namespaces', 'index.ts');

    /** Get the OpenApi Entries, with Path and relative Object */
    const entries = Object.entries(openApiDocument.paths);

    /** Ensure at least one path entry exists before continue */
    if (!entries.length) {
      return null;
    }

    /** Initialize the file content to write */
    const fileContent: string[] = [ TemplateCompiler.getDisclaimer() ];
    const fileSections: string[][] = [];

    /** Fill all sections according to entries */
    fileSections.push(ModelsScaffolder.generatePathContent(entries));
    fileSections.push(ModelsScaffolder.generatePathMethods(entries));
    fileSections.push(ModelsScaffolder.generatePathRouteParams(entries));
    fileSections.push(ModelsScaffolder.generatePathParams(entries));

    /** Create the full file content, joining all sections */
    fileSections.forEach((section) => {
      fileContent.push('');
      fileContent.push(...section);
    });

    /** Add utilities types */
    fileContent.push('');
    fileContent.push('export interface WithNamespace {');
    fileContent.push('  namespace: Path;');
    fileContent.push('}');
    fileContent.push('');

    fileContent.push('export type Namespaced<T> = T & WithNamespace;');
    fileContent.push('');

    /** Write the file content to out location */
    return this.compiler.writeFile(namespaceFile, fileContent.join('\n'), true, false);
  }


  /**
   * Generates a list of strings representing TypeScript type definitions for paths.
   *
   * @param {Array} entries - An array of tuples where each tuple consists of a string representing the path
   * and an object of type Record<string, PathMethodDescriptor>.
   * @return {string[]} An array of strings containing TypeScript type definition for the paths.
   */
  private static generatePathContent(entries: [ string, Record<string, PathMethodDescriptor> ][]): string[] {
    const content: string[] = [
      'export type Path ='
    ];

    entries.forEach(([ path ]) => {
      content.push(
        `  | '${ModelsScaffolder.getRoutePathName(path)}'`
      );
    });

    content[content.length - 1] += ';';

    content.push('');

    return content;
  }


  /**
   * Generates an array of strings representing TypeScript type declarations
   * for path methods based on the provided entries.
   *
   * @param entries An array of tuples where each tuple contains a string representing a path
   *                and an object mapping method names to their descriptors.
   * @return An array of strings that together form the TypeScript type declarations.
   */
  private static generatePathMethods(entries: [ string, Record<string, PathMethodDescriptor> ][]): string[] {
    const content: string[] = [
      'export type PathMethods = {'
    ];

    entries.forEach(([ path, methodsDescriptor ]) => {
      content.push(
        `  '${ModelsScaffolder.getRoutePathName(path)}': ${Object.keys(methodsDescriptor)
          .map(method => `'${method.toUpperCase()}'`)
          .join(' | ')},`
      );
    });

    content.push('};', '');

    return content;
  }


  /**
   * Generates an array of strings defining a TypeScript type for path route parameters.
   *
   * @param entries - An array of tuples, where each tuple contains a path (string) and a record of path method descriptors.
   * @return An array of strings representing a TypeScript type definition for path route parameters.
   */
  private static generatePathRouteParams(entries: [ string, Record<string, PathMethodDescriptor> ][]): string[] {
    const content: string[] = [
      'export type PathRouteParams = {'
    ];

    entries.forEach(([ path ]) => {
      const routeParams = ModelsScaffolder.getRouteParam(path);

      if (!routeParams.length) {
        return;
      }

      content.push(
        `  '${ModelsScaffolder.getRoutePathName(path)}': {`,
        `    ${routeParams.map(param => `'${param}': string | number`).join(',\n    ')}`,
        `  },`
      );
    });

    content.push('};', '');

    return content;
  }


  /**
   * Generates an array of TypeScript string definitions for path query parameters
   * based on the provided endpoints and their respective method descriptors.
   *
   * @param entries An array of tuples where each tuple consists of a string path and a record
   * of HTTP methods mapped to their respective path method descriptors.
   * @return An array of strings representing TypeScript type definitions for query parameters
   * associated with specific paths and HTTP methods.
   */
  private static generatePathParams(entries: [ string, Record<string, PathMethodDescriptor> ][]): string[] {
    const content: string[] = [
      'export type PathQueryParams = {'
    ];

    entries.forEach(([ path, methodsDescriptor ]) => {
      let hasParams = false;
      const pathParamContent: string[] = [
        `  '${ModelsScaffolder.getRoutePathName(path)}': {`
      ];

      Object.entries(methodsDescriptor).forEach(([ method, descriptor ]) => {
        const queryParams = (descriptor.parameters || []).filter(param => param.in === 'query');

        if (!queryParams.length) {
          return;
        }

        hasParams = true;

        pathParamContent.push(`    '${method.toUpperCase()}': {`);

        queryParams.forEach((param) => {
          const isValidWithoutQuote = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(param.name);
          const paramKey = `${!isValidWithoutQuote ? `'${param.name}'` : param.name}${param.required ? '' : '?'}`;
          const constraint = ModelsScaffolder.getRouteParamConstraint(param);

          pathParamContent.push(`      ${paramKey}: ${constraint},`);
        });

        pathParamContent.push(`    },`);
      });

      if (!hasParams) {
        return;
      }

      pathParamContent.push('  },');
      content.push(...pathParamContent);
    });

    content.push('};', '');

    return content;
  }


  private static getRoutePathName(route: string): string {
    return route.replace(/(^\/v1\/)|(^\/)/, '');
  }


  private static getRouteParam(route: string): string[] {
    const regex = /{([^}]+)}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(route)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }


  private static getRouteParamConstraint(param: RouteParameterSchema): string {
    switch (param.schema.type) {
      case 'string':
        return 'string';

      case 'integer':
      case 'number':
        return 'number';

      case 'boolean':
        return 'boolean';
    }
  }


  private async getAnswers(): Promise<ModelsScaffolderAnswers> {
    return this.project.getPromptWithCachedDefaults<ModelsScaffolderAnswers>(
      'scaffold-models',
      [
        {
          type   : 'input',
          name   : 'host',
          message: 'The host to use to download OpenAPI Specification'
        },
        {
          type   : 'input',
          name   : 'endpoint',
          message: 'The endpoint at which the host will respond with OpenAPI Specification'
        }
      ]
    );
  }

}
