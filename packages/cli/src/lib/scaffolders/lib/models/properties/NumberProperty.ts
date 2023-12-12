import { AbstractedProperty } from './AbstractedProperty';

import type { PropertyDependency, NumberPropertyType } from '../../../types/openapi';


export class NumberProperty extends AbstractedProperty<NumberPropertyType> {

  get dependencies(): PropertyDependency[] {
    return [];
  }


  get decorators(): string[] {
    return [];
  }


  get propertyType(): string {
    return 'number';
  }

}
