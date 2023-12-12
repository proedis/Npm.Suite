import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import type { Components } from '../../types/openapi';

import type { AbstractedModel } from './AbstractedModel';

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
  constructor(components: Components, private readonly root: string) {
    Object.entries(components.schemas)
      .forEach(([ , schema ]) => {
        /** If the schema is an enum, create the enum model */
        if ('x-api-enum' in schema && !schema['x-enum-described']) {
          this.models.push(new EnumModel(schema, this));
        }
        /** If is a DTO object model, place into models */
        if ('x-api-dto' in schema && !!schema['x-api-dto']) {
          this.models.push(new ObjectModel(schema, this));
        }
      });
  }


  public getFilePath(namespace: string): string {
    return resolve(this.root, ...namespace.split('.').map(toKebabCase));
  }


  public resolveDependency(name: string, from: string): string {
    const model: AbstractedModel<any> | undefined = this.models.find(m => m.name === name);

    if (!model) {
      throw new Error(`Could not resolve dependency ${name}`);
    }

    const relativePath = relative(from, model.filePath).replace(/\.ts$/i, '');

    return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  }


  write(): void {
    this.models.forEach((model) => {
      if (!existsSync(model.folder)) {
        mkdirSync(model.folder, { recursive: true });
      }

      writeFileSync(model.filePath, model.render(), 'utf-8');
    });
    // this.enums.forEach((m) => console.log(m.render()));
    // this.models.forEach((m) => console.log(m.render()));
  }

}
