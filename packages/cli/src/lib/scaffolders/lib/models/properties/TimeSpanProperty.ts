import { AbstractedProperty } from './AbstractedProperty';

import type { PropertyDependency, TimeSpanPropertyType } from '../../../types/openapi';


export class TimeSpanProperty extends AbstractedProperty<TimeSpanPropertyType> {

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
