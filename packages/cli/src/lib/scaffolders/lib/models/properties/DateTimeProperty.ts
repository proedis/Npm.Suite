import { AbstractedProperty } from './AbstractedProperty';

import type { DateTimePropertyType, PropertyDependency } from '../../../types/openapi';


export class DateTimeProperty extends AbstractedProperty<DateTimePropertyType> {

  get dependencies(): PropertyDependency[] {
    return [
      {
        name: 'AsDayJs',
        from: '@proedis/modeler'
      },
      {
        name: 'DateTime',
        from: '@proedis/modeler'
      }
    ];
  }


  get decorators(): string[] {
    return [
      '@AsDayJs()'
    ];
  }


  get propertyType(): string {
    return 'DateTime';
  }

}
