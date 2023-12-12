import { resolve } from 'node:path';

import type { SchemaXData, PropertyDependency } from '../../types/openapi';

import type { ModelsRepository } from './ModelsRepository';

import { TemplateCompiler } from '../../../template.compiler';


/* --------
 * Internal Types
 * -------- */
type ResolvedDependencies = Record<'external' | 'outer' | 'inner', Map<string, Set<string>>>;


/* --------
 * Class Definition
 * -------- */
export abstract class AbstractedModel<Schema extends SchemaXData> {

  constructor(
    protected readonly schema: Schema,
    protected readonly repository: ModelsRepository
  ) {
  }


  // ----
  // Public Getters
  // ----
  public get name(): string {
    return this.schema['x-element-name'];
  }


  public get fileName(): string {
    return `${this.name}.ts`;
  }


  public get folder(): string {
    return this.repository.getFilePath(this.schema['x-element-namespace']);
  }


  public get filePath(): string {
    return resolve(this.folder, this.fileName);
  }


  // ----
  // Abstracted Methods
  // ----
  public abstract get dependencies(): PropertyDependency[];


  protected abstract write(): string;


  // ----
  // Private Properties
  // ----

  private resolveDependencies(): ResolvedDependencies {
    const result: ResolvedDependencies = {
      external: new Map<string, Set<string>>(),
      inner   : new Map<string, Set<string>>(),
      outer   : new Map<string, Set<string>>()
    };

    this.dependencies.forEach((dependency) => {
      /** Resolve the dependency source */
      const source = dependency.from || this.repository.resolveDependency(dependency.name, this.folder);

      /** Get the right container */
      const container = source.startsWith('..') ? result.outer
        : source.startsWith('./') ? result.inner
          : result.external;

      /** Get or create the new set of dependency */
      const set = container.get(source) || new Set<string>();
      set.add(dependency.name);

      /** Update the container set sorting data alphabetically */
      container.set(source, new Set(Array.from(set).sort((a, b) => a.localeCompare(b))));
    });

    return result;
  }


  private addDependenciesToContent(content: string[], dependencies: Map<string, Set<string>>) {
    if (!dependencies.size) {
      return;
    }

    Array.from(dependencies.keys()).sort((a, b) => a.localeCompare(b)).forEach((source) => {
      content.push(`import { ${Array.from(dependencies.get(source)!).join(', ')} } from '${source}';`);
    });

    if (content[0] !== '/* eslint-disable @typescript-eslint/consistent-type-imports */') {
      content.unshift('/* eslint-disable @typescript-eslint/consistent-type-imports */');
    }

    content.push('');
  }


  // ----
  // Render Methods
  // ----

  public render(): string {
    /** Prepare the file content */
    const fileContent: string[] = [];

    /** Resolve all model dependencies */
    const dependencies = this.resolveDependencies();

    /** Add dependencies on top of content */
    this.addDependenciesToContent(fileContent, dependencies.external);
    this.addDependenciesToContent(fileContent, dependencies.outer);
    this.addDependenciesToContent(fileContent, dependencies.inner);

    /** Add the Disclaimer */
    fileContent.unshift(TemplateCompiler.getDisclaimer(), '');

    fileContent.push(this.write());

    return fileContent.join('\n');
  }

}
