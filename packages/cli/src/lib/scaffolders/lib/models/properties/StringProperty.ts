import { AbstractedProperty } from './AbstractedProperty';

import type { StringPropertyType, PropertyDependency } from '../../../types/openapi';


export class StringProperty extends AbstractedProperty<StringPropertyType> {

  get dependencies(): PropertyDependency[] {
    return [];
  }


  get decorators(): string[] {
    return [];
  }


  get propertyType(): string {
    return 'string';
  }

}
