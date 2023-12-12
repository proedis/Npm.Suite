import { AbstractedProperty } from './AbstractedProperty';

import type { BooleanPropertyType, PropertyDependency } from '../../../types/openapi';


export class BooleanProperty extends AbstractedProperty<BooleanPropertyType> {

  get dependencies(): PropertyDependency[] {
    return [];
  }


  get decorators(): string[] {
    return [];
  }


  get propertyType(): string {
    return 'boolean';
  }

}
