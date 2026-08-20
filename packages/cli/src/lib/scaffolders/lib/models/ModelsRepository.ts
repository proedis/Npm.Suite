import { relative, resolve } from 'node:path';

import type { Components } from '../../types/openapi';

import type { AbstractedModel } from './AbstractedModel';
import { TemplateCompiler } from '../../../template.compiler';
import type { PlannedFile } from '../../../write-plan';

import { EnumModel } from './EnumModel';
import { ObjectModel } from './ObjectModel';

import { toKebabCase } from '../../../../utils';


export class ModelsRepository {

  /**
   * Internal collection of Models
   * @private
   */
  private readonly models: AbstractedModel<any>[] = [];


  /**
   * Create the Model Repository using components
   * @param components
   * @param root
   */
  /**
   * Create the Model Repository using components
   * @param components
   * @param root
   * @param requestTypes The schemas an operation accepts as a body, which carry no attribute of
   *   their own: a client calling that endpoint needs them just as much as it needs the responses
   */
  constructor(
    components: Components,
    private readonly root: string,
    requestTypes: ReadonlySet<string> = new Set()
  ) {
    Object.entries(components.schemas)
      .forEach(([ name, schema ]) => {
        /** If the schema is an enum, create the enum model */
        if ('x-api-enum' in schema && !schema['x-enum-described']) {
          this.models.push(new EnumModel(name, schema, this));
          return;
        }
        /** If is a DTO object model, place into models */
        if ('x-api-response-dto' in schema && !!schema['x-api-response-dto']) {
          this.models.push(new ObjectModel(name, schema, this));
          return;
        }
        /** A body the API accepts is a model too, described by the same extensions minus the claim */
        if (requestTypes.has(name) && schema.type === 'object' && 'x-element-namespace' in schema) {
          this.models.push(new ObjectModel(name, schema, this));
        }
      });
  }


  public getFilePath(namespace: string): string {
    return resolve(this.root, ...namespace.split('.').map(toKebabCase));
  }


  public resolveDependency(name: string, from: string): string {
    const model: AbstractedModel<any> | undefined = this.models.find(m => m.name === name);

    if (!model) {
      throw new Error(`Could not resolve dependency ${name} from ${from}`);
    }

    const relativePath = relative(from, model.filePath).replace(/\.ts$/i, '');

    return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  }


  /**
   * Render every model.
   *
   * Rendering is where this can fail — an unresolvable reference, a property type nothing maps —
   * so it happens before anything is written: the whole set is produced first, and only a
   * complete one ever reaches the disk.
   */
  build(): PlannedFile[] {
    return this.models
      .map((model) => TemplateCompiler.toPlannedFile(model.filePath, model.render()))
      .filter((file): file is PlannedFile => file !== null);
  }

}
