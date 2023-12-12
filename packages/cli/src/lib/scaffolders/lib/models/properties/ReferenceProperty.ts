import { AbstractedProperty } from './AbstractedProperty';

import type { PropertyDependency, ReferencePropertyType } from '../../../types/openapi';


export class ReferenceProperty extends AbstractedProperty<ReferencePropertyType> {

  get dependencies(): PropertyDependency[] {
    return [
      {
        name: 'Type',
        from: 'class-transformer'
      },
      {
        name: this.propertyType,
        from: undefined
      }
    ];
  }


  get decorators(): string[] {
    return [
      `@Type(() => ${this.propertyType})`
    ];
  }


  get propertyType(): string {
    if ('$ref' in this.schema) {
      return this.schema.$ref.split('/').pop() as string;
    }
    else {
      return this.schema['x-element-name'];
    }
  }

}
