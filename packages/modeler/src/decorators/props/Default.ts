import type { AnyObject } from '@proedis/types';

import { ModelMetadata } from '../../metadata';


/**
 * Define the default value for a property.
 * This value will be used if the source property is nil (undefined or null)
 * @param createDefault
 * @constructor
 */
export default function Default<TOut = any, T extends AnyObject = AnyObject>(
  createDefault: TOut | ((entity: T) => TOut)
): PropertyDecorator {
  return function (target, propertyKey) {
    ModelMetadata.getForTarget(target)
      .upsertPropOptions(propertyKey, (metadata) => metadata.default = createDefault);
  };
}
