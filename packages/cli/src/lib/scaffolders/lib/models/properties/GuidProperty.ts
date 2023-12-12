import { AbstractedProperty } from './AbstractedProperty';

import type { PropertyDependency, GuidPropertyType } from '../../../types/openapi';


export class GuidProperty extends AbstractedProperty<GuidPropertyType> {

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
