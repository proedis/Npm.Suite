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
   * @param name
   * @param schema
   * @param repository
   */
  constructor(name: string, schema: ObjectSchema, repository: ModelsRepository) {
    super(name, schema, repository);

    this.properties = Object.entries(this.schema.properties || {})
      .map(([ propertyName, propertySchema ]) => (
        PropertyFactory.create(name, propertyName, propertySchema)
      ));
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
      ...(this.extends.length ? this.extends.map(e => ({ name: e, from: undefined })) : [
        {
          name: 'ModelerObject',
          from: '@proedis/modeler'
        }
      ]),
      ...this.properties.reduce<PropertyDependency[]>((acc, property) => [ ...acc, ...property.dependencies ], []),
      ...(this.properties.some(p => p.isNullable) ? [ { name: 'Nullable', from: '@proedis/types' } ] : [])
    ].filter(d => d.name !== this.name);
  }


  protected write(): string {
    const content: string[] = [];

    /**
     * TypeScript has single inheritance, so a schema whose 'allOf' carries more than one '$ref'
     * cannot become a class. This used to be joined with a comma and written out anyway, which
     * produced a file that does not compile — a failure the user met at build time, far from
     * its cause. Raising it here happens during the render phase, so nothing is written at all.
     */
    if (this.extends.length > 1) {
      throw new Error(
        `Cannot generate the ${this.name} model: its 'allOf' declares multiple base schemas `
        + `(${this.extends.join(', ')}), and a TypeScript class can only extend one`
      );
    }

    const baseClass = this.extends[0] ?? 'ModelerObject';

    content.push(`export class ${this.name} extends ${baseClass} {`);
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
