import { relative, resolve, sep as pathSeparator } from 'node:path';

import { AbstractedScaffolder } from './lib';

import { ModelsRepository } from './lib/models/ModelsRepository';

import type { OpenApiDocument, RouteParameterSchema, PathMethodDescriptor } from './types/openapi';
import { TemplateCompiler } from '../template.compiler';
import type { PlannedFile } from '../write-plan';


/* --------
 * Main Scaffolder Definition
 * -------- */
export class ModelsScaffolder extends AbstractedScaffolder {

  // ----
  // Source Description
  // ----
  protected get cacheKey(): string {
    return 'scaffold-models';
  }


  protected get sourceName(): string {
    return 'OpenAPI Specification';
  }


  protected describeSource(source: OpenApiDocument): string {
    const schemas = Object.keys(source.components?.schemas ?? {});
    const paths = Object.keys(source.paths ?? {});

    /** Only the schemas carrying the Proedis extensions ever become a file */
    const models = schemas.filter((name) => {
      const schema = (source.components.schemas as Record<string, any>)[name];
      return ('x-api-response-dto' in schema && !!schema['x-api-response-dto'])
        || ('x-api-enum' in schema && !schema['x-enum-described']);
    });

    return `Found ${models.length} model${models.length === 1 ? '' : 's'} out of ${schemas.length} schema`
      + `${schemas.length === 1 ? '' : 's'}, and ${paths.length} path${paths.length === 1 ? '' : 's'}.`;
  }


  protected async build(): Promise<void> {
    /** Download and validate the OpenApi document */
    const openApiDocument = await this.getSource<OpenApiDocument>(ModelsScaffolder.assertOpenApiDocument);

    /** Get the root folder to use to write/update models */
    const root = this.project.srcDirectory;

    /** Render every model and the namespaces, adding them to the plan */
    this.plan.add(...this.generateModels(root, openApiDocument));

    const namespaces = this.generateNamespaces(root, openApiDocument);

    if (namespaces) {
      this.plan.add(namespaces);
    }
  }


  /**
   * Reject anything that is not an OpenApi document, before the models directory is erased.
   *
   * @param source The parsed response body
   */
  private static assertOpenApiDocument(source: unknown): OpenApiDocument {
    /** Assert is a valid object */
    if (typeof source !== 'object' || source == null || Array.isArray(source)) {
      throw new Error('Definition error: expected an object');
    }

    const document = source as OpenApiDocument;

    /** Both halves are read unconditionally further down: a document without them is not one */
    if (typeof document.components?.schemas !== 'object' || document.components.schemas == null) {
      throw new Error('Definition error: the document declares no \'components.schemas\'');
    }

    if (typeof document.paths !== 'object' || document.paths == null) {
      throw new Error('Definition error: the document declares no \'paths\'');
    }

    return document;
  }


  private generateModels(root: string, openApiDocument: OpenApiDocument): PlannedFile[] {
    const modelsPath = resolve(root, 'models', 'scaffold');

    /** Declare the entire models folder as rebuilt from scratch */
    this.wipeDirectories([ modelsPath ]);

    /** Create the Model Repository with downloaded data, and render every model */
    const modelsRepository = new ModelsRepository(openApiDocument.components, modelsPath);
    const models = modelsRepository.build();

    return [ ...models, this.generateBarrel(modelsPath, models) ];
  }


  /**
   * Build the barrel re-exporting every generated model.
   *
   * It is derived from the rendered files rather than from a glob over the output directory:
   * nothing has been written yet when this runs, and reading the directory would in any case
   * describe the previous run rather than this one.
   *
   * @param folder The directory the models belong in
   * @param models The rendered models
   */
  private generateBarrel(folder: string, models: PlannedFile[]): PlannedFile {
    const files = models
      .map((model) => `./${relative(folder, model.path).split(pathSeparator).join('/')}`)
      .sort((a, b) => a.localeCompare(b));

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

    return {
      content   : content.join('\n'),
      noOverride: false,
      path      : resolve(folder, 'index.ts')
    };
  }


  private generateNamespaces(root: string, openApiDocument: OpenApiDocument): PlannedFile | null {
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

    /**
     * Hand the file to the plan.
     *
     * Whether it counts as created or updated is decided at commit time by comparing it with
     * what is on disk: it used to be forced to 'modified', so a namespace file created for the
     * first time was still announced as a modification.
     */
    return TemplateCompiler.toPlannedFile(namespaceFile, fileContent.join('\n'));
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
        '  },'
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

        pathParamContent.push('    },');
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


  /**
   * The TypeScript type a query parameter accepts.
   *
   * Every branch has to return something: the switch used to fall through for anything outside
   * the three primitives, and the resulting `undefined` was interpolated straight into the
   * generated file as the literal text `undefined`. Arrays are the case that actually reached
   * it — a repeated query parameter is ordinary in an OpenAPI document.
   *
   * @param param The parameter descriptor
   */
  private static getRouteParamConstraint(param: RouteParameterSchema): string {
    switch (param.schema.type) {
      case 'string':
        return 'string';

      case 'integer':
      case 'number':
        return 'number';

      case 'boolean':
        return 'boolean';

      case 'array':
        return `${ModelsScaffolder.getRouteParamConstraint({
          ...param,
          schema: param.schema.items
        })}[]`;

      default:
        /** Everything travels the query string as text, so this is a fallback and not a guess */
        return 'string';
    }
  }


}
