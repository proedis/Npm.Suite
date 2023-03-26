import { ModelMetadata } from '../../metadata';


/**
 * Replace the default setter of the property.
 * The setting value will be passed as the first parameter of the
 * new setter function, and its type will be the same as defined
 * into entity properties.
 * The in type should be the same as the source object
 * @param setter
 * @constructor
 */
export default function Set<TOut = any, TIn = TOut>(setter: (value: TOut) => TIn): PropertyDecorator {
  return function (target, propertyKey) {
    ModelMetadata.getForTarget(target)
      .upsertPropOptions(propertyKey, (metadata) => metadata.set = setter);
  };
}
