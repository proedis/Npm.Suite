import console from 'node:console';

import { AbstractedProperty } from './properties/AbstractedProperty';

import { BooleanProperty } from './properties/BooleanProperty';
import { DateTimeProperty } from './properties/DateTimeProperty';
import { ReferenceProperty } from './properties/ReferenceProperty';
import { StringProperty } from './properties/StringProperty';
import { TimeSpanProperty } from './properties/TimeSpanProperty';
import { EnumProperty } from './properties/EnumProperty';
import { GuidProperty } from './properties/GuidProperty';
import { NumberProperty } from './properties/NumberProperty';

import type { PropertySchema } from '../../types/openapi';


export class PropertyFactory {

  public static create(name: string, schema: PropertySchema): AbstractedProperty<any> {
    /** Get the real underlying type of the property (in case of is an array) */
    const realType = AbstractedProperty.getUnderlyingType(schema);

    /** Switch the property type based on type definition */
    if (!realType.type) {
      return new ReferenceProperty(name, schema);
    }

    if (realType.type === 'boolean') {
      return new BooleanProperty(name, schema);
    }

    if (realType.type === 'string') {
      if ('format' in realType && realType.format === 'date-time') {
        return new DateTimeProperty(name, schema);
      }

      if ('format' in realType && realType.format === 'date-span') {
        return new TimeSpanProperty(name, schema);
      }

      if ('format' in realType && realType.format === 'uuid') {
        return new GuidProperty(name, schema);
      }

      if ('x-api-enum' in realType) {
        return new EnumProperty(name, schema);
      }

      return new StringProperty(name, schema);
    }

    if (realType.type === 'integer' || realType.type === 'number') {
      return new NumberProperty(name, schema);
    }

    console.error({ schema, realType });
    throw new Error();
  }

}
