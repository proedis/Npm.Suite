import type { ObjectSchema, PropertyDependency } from '../../types/openapi';

import { type ModelsRepository } from './ModelsRepository';

import { AbstractedModel } from './AbstractedModel';

import { PropertyFactory } from './PropertyFactory';
import { type AbstractedProperty } from './properties/AbstractedProperty';


export class ObjectModel extends AbstractedModel<ObjectSchema> {

  /**
   * List of all Object's properties
   * @private
   */
  private readonly properties: AbstractedProperty<any>[];


  /**
   * Generate e new Object Model to write Classes
   * @param schema
   * @param repository
   */
  constructor(schema: ObjectSchema, repository: ModelsRepository) {
    super(schema, repository);

    this.properties = Object.entries(this.schema.properties).map(([ propertyName, propertySchema ]) => {
      return PropertyFactory.create(propertyName, propertySchema);
    });
  }


  /**
   * The list of external classes this model will extend
   */
  public get extends(): string[] {
    if (Array.isArray(this.schema.allOf) && this.schema.allOf.length) {
      return this.schema.allOf.map((ref) => ref.$ref.split('/').pop() as string);
    }

    return [];
  }


  /**
   * The list of all dependencies required by the Model
   */
  public get dependencies(): PropertyDependency[] {
    return [
      ...this.extends.map(e => ({ name: e, from: undefined })),
      ...this.properties.reduce<PropertyDependency[]>((acc, property) => [ ...acc, ...property.dependencies ], []),
      ...(this.properties.some(p => p.isNullable) ? [ { name: 'Nullable', from: '@proedis/types' } ] : [])
    ];
  }


  protected write(): string {
    const content: string[] = [];

    content.push(`export class ${this.name} ${this.extends.length ? `extends ${this.extends.join(', ')} ` : ''}{`);
    this.properties.forEach((property) => {
      content.push('');
      content.push(property.renderProperty(2));
    });

    content.push('');
    content.push('}');
    content.push('');

    return content.join('\n');
  }

}
