import { AbstractedProperty } from './AbstractedProperty';

import type { PropertyDependency, TimeSpanPropertyType } from '../../../types/openapi';


/**
 * A .NET duration, which the API serialises as `[-][d.]hh:mm:ss[.fff]`.
 *
 * It used to be generated as a plain `string` with no decorator, so every duration reached the
 * application as text and the `TimeSpan` mapper `@proedis/modeler` exists for was never applied.
 */
export class TimeSpanProperty extends AbstractedProperty<TimeSpanPropertyType> {

  get dependencies(): PropertyDependency[] {
    return [
      {
        name: 'AsTimeSpan',
        from: '@proedis/modeler'
      },
      {
        name: 'TimeSpan',
        from: '@proedis/modeler'
      }
    ];
  }


  get decorators(): string[] {
    return [
      '@AsTimeSpan()'
    ];
  }


  get propertyType(): string {
    return 'TimeSpan';
  }

}
