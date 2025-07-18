import { AbstractedProperty } from './AbstractedProperty';

import type { PropertyDependency, ObjectPropertyType } from '../../../types/openapi';


export class ObjectProperty extends AbstractedProperty<ObjectPropertyType> {

  get dependencies(): PropertyDependency[] {
    return [];
  }


  get decorators(): string[] {
    return [];
  }


  get propertyType(): string {
    return 'Record<string, any>';
  }

}
