import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, relative, resolve, sep as pathSeparator } from 'node:path';

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
    const root = this.outputDirectory;

    /** Render every model, its barrel and the virtuals, adding them to the plan */
    const modelsPath = resolve(root, 'models', 'scaffold');
    const models = this.generateModels(modelsPath, openApiDocument);

    /** Planned first: whether anything installs virtuals is what the barrel needs to know */
    const virtuals = this.generateVirtuals(root, models);

    this.plan.add(
      ...models,
      this.generateBarrel(modelsPath, models, virtuals.length > 0),
      ...virtuals
    );

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


  private generateModels(modelsPath: string, openApiDocument: OpenApiDocument): PlannedFile[] {
    /** Declare the entire models folder as rebuilt from scratch */
    this.wipeDirectories([ modelsPath ]);

    /** Create the Model Repository with downloaded data, and render every model */
    const modelsRepository = new ModelsRepository(
      openApiDocument.components,
      modelsPath,
      ModelsScaffolder.collectReferencedTypes(openApiDocument)
    );

    return modelsRepository.build();
  }


  /**
   * Collect every schema an operation names in its contract, on either side.
   *
   * They are recognised by being referenced, not by their name: a convention on the suffix would
   * work today and miss the first type that is named differently. Both directions count — a type
   * is needed by whoever calls the endpoint whether it travels in the body or comes back as the
   * answer, and only some of them carry the attribute that used to be the only way in.
   *
   * @param document The OpenApi document
   */
  private static collectReferencedTypes(document: OpenApiDocument): Set<string> {
    const paths: Record<string, Record<string, any>> = document.paths as any;
    const schemas: Record<string, any> = (document.components?.schemas as any) ?? {};

    const contracts = Object.values(paths).flatMap((pathItem) => Object
      .values(pathItem)
      .flatMap((operation: any) => {
        const body = ModelsScaffolder.readSchemaReference(operation?.requestBody?.content?.['application/json']?.schema);

        /** The success response, whether it answers with the type or with a collection of it */
        const success = Object.entries(operation?.responses ?? {})
          .filter(([ code ]) => code.startsWith('2'))
          .flatMap(([ , response ]: [ string, any ]) => {
            const schema = response?.content?.['application/json']?.schema;

            return [
              ModelsScaffolder.readSchemaReference(schema),
              ModelsScaffolder.readSchemaReference(schema?.items)
            ];
          });

        return [ body, ...success ];
      })
      .filter((name): name is string => !!name));

    /**
     * Follow the references out of every body until nothing new turns up.
     *
     * Stopping at the named types is not enough: each reaches others through its properties, and a
     * model whose dependency was never generated makes the whole run fail while resolving it — so
     * the closure is the only set that renders.
     */
    const collected = new Set<string>(contracts);
    const pending = [ ...contracts ];

    while (pending.length) {
      const name = pending.pop() as string;

      ModelsScaffolder.readNestedReferences(schemas[name]).forEach((reference) => {
        if (!collected.has(reference)) {
          collected.add(reference);
          pending.push(reference);
        }
      });
    }

    return collected;
  }


  /** The name a schema reference points at, reading through the allOf Swashbuckle wraps it in */
  private static readSchemaReference(schema: any): string | null {
    if (!schema) {
      return null;
    }

    const reference = schema.$ref
      ?? (Array.isArray(schema.allOf) && schema.allOf.length === 1 ? schema.allOf[0]?.$ref : null);

    return typeof reference === 'string' ? reference.split('/').pop() ?? null : null;
  }


  /** Every reference reachable from a schema, at any depth */
  private static readNestedReferences(schema: any): string[] {
    const found: string[] = [];

    const walk = (node: any): void => {
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }

      if (typeof node !== 'object' || node === null) {
        return;
      }

      if (typeof node.$ref === 'string') {
        found.push(node.$ref.split('/').pop() as string);
      }

      Object.values(node).forEach(walk);
    };

    walk(schema);

    return found;
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
   * @param hasVirtuals Whether anything installs computed properties on them
   */
  private generateBarrel(folder: string, models: PlannedFile[], hasVirtuals: boolean): PlannedFile {
    const files = models
      .map((model) => `./${relative(folder, model.path).split(pathSeparator).join('/')}`)
      .sort((a, b) => a.localeCompare(b));

    const content: string[] = [
      TemplateCompiler.getDisclaimer(),
      '',
      /**
       * Installing the virtuals is a side effect, so it has to be imported to happen. It is imported
       * here, and first, because this is the file everything else goes through: left to whoever needs
       * a computed property, the type would promise it in places where no one had.
       */
      ...(hasVirtuals ? [ 'import \'../virtuals\';', '' ] : [])
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


  /**
   * Plan the barrel installing the virtuals, when there are any.
   *
   * A virtual is a property computed on this side that belongs to the model itself, declared by
   * merging an interface into it. Those files are written by hand and this command does not create
   * them: it finds them, and wires them up. They live beside the generated folder rather than inside
   * it, because that one is emptied on every run.
   *
   * Nothing is planned when the directory holds none, so a project not using virtuals carries no
   * trace of them. Adding the first file, and running again, is what brings the barrel and its
   * import into being.
   *
   * @param root The output root the models are written under
   * @param models The rendered models, which say what each class now carries
   */
  private generateVirtuals(root: string, models: PlannedFile[]): PlannedFile[] {
    const virtualsPath = resolve(root, 'models', 'virtuals');

    /** One file per model, named after it: what makes both the barrel and the check possible */
    const names = ModelsScaffolder.readVirtualModels(virtualsPath);

    if (!names.length) {
      return [];
    }

    /** A virtual whose name the payload now carries would never be reached: stop before writing */
    ModelsScaffolder.assertNoShadowedVirtuals(virtualsPath, names, models);

    return [ ModelsScaffolder.renderVirtualsBarrel(virtualsPath, names) ];
  }


  /**
   * Read which models already have a virtuals file, from the directory itself.
   *
   * Unlike the models barrel this one cannot be derived from what was rendered: these files are the
   * developer's, and the run that writes the barrel is not the run that created them.
   *
   * @param virtualsPath The virtuals directory
   */
  private static readVirtualModels(virtualsPath: string): string[] {
    if (!existsSync(virtualsPath)) {
      return [];
    }

    return readdirSync(virtualsPath)
      .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
      .map((file) => basename(file, '.ts'))
      .sort((left, right) => left.localeCompare(right));
  }


  /**
   * Refuse to generate a model that would shadow one of its own virtuals.
   *
   * The payload wins that collision at runtime, and silently: the value from the server becomes an
   * own property of the instance, which is found before the getter on the prototype. Declaring
   * virtuals `readonly` makes the compiler catch it too, but only the compiler of whoever builds
   * next, and only if the declaration says `readonly` in the first place.
   *
   * @param virtualsPath The virtuals directory
   * @param existing The models having a virtuals file
   * @param models The rendered models
   */
  private static assertNoShadowedVirtuals(virtualsPath: string, existing: string[], models: PlannedFile[]): void {
    const shadowed = existing.flatMap((name) => {
      const model = models.find((planned) => basename(planned.path, '.ts') === name);

      /** A virtuals file of a model the document no longer describes is not this check's problem */
      if (!model) {
        return [];
      }

      const declared = ModelsScaffolder.readDeclaredVirtuals(readFileSync(resolve(virtualsPath, `${name}.ts`), 'utf-8'));
      const generated = ModelsScaffolder.readModelMembers(model.content);

      return [ ...declared ]
        .filter((member) => generated.has(member))
        .map((member) => `${name}.${member}`);
    });

    if (shadowed.length) {
      throw new Error(
        `The document now describes ${shadowed.length === 1 ? 'a property' : 'properties'} declared as `
        + `${shadowed.length === 1 ? 'a virtual' : 'virtuals'}: ${shadowed.join(', ')}. `
        + 'The payload would shadow the getter, so the virtual would never be reached: remove it from '
        + 'the virtuals file, and read the value the server sends.'
      );
    }
  }


  /**
   * Read the property names a virtuals file declares, ignoring what is commented out.
   *
   * @param content The content of the virtuals file
   */
  private static readDeclaredVirtuals(content: string): Set<string> {
    /** Comments carry the template of the stub, which declares exactly what this looks for */
    const code = content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');

    const declared = new Set<string>();

    for (const body of ModelsScaffolder.readInterfaceBodies(code)) {
      for (const match of body.matchAll(/(?:^|;|\n)\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*[?!]?\s*:/g)) {
        declared.add(match[1] as string);
      }

      for (const match of body.matchAll(/\bget\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
        declared.add(match[1] as string);
      }
    }

    return declared;
  }


  /**
   * Take the body of every interface in the source, matching braces rather than stopping at the
   * first one: a member typed with an object literal closes a brace that is not the interface's.
   *
   * @param code The source to read
   */
  private static readInterfaceBodies(code: string): string[] {
    const bodies: string[] = [];

    for (const match of code.matchAll(/\binterface\s+[A-Za-z_$][\w$]*[^{]*\{/g)) {
      let depth = 1;
      let index = (match.index as number) + match[0].length;

      const start = index;

      while (index < code.length && depth > 0) {
        if (code[index] === '{') {
          depth += 1;
        }
        else if (code[index] === '}') {
          depth -= 1;
        }

        index += 1;
      }

      bodies.push(code.slice(start, index - 1));
    }

    return bodies;
  }


  /**
   * Read the property names a rendered model declares.
   *
   * @param content The rendered model
   */
  private static readModelMembers(content: string): Set<string> {
    const members = new Set<string>();

    for (const match of content.matchAll(/^\s*public\s+([A-Za-z_$][\w$]*)\s*[?!]?\s*[:=]/gm)) {
      members.add(match[1] as string);
    }

    return members;
  }


  /**
   * Render the barrel importing every virtuals file for its side effect.
   *
   * @param virtualsPath The virtuals directory
   * @param names The models having a virtuals file
   */
  private static renderVirtualsBarrel(virtualsPath: string, names: string[]): PlannedFile {
    /** Imported for the side effect of installing them, so there is nothing to export */
    const imports = names
      .slice()
      .sort((left, right) => left.localeCompare(right))
      .map((name) => `import './${name}';`);

    const content = [
      TemplateCompiler.getDisclaimer(),
      '',
      ...imports,
      ''
    ];

    return {
      content   : content.join('\n'),
      noOverride: false,
      path      : resolve(virtualsPath, 'index.ts')
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
