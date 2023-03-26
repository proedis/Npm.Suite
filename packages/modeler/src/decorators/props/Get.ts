import { ModelMetadata } from '../../metadata';


/**
 * Replace the default getter function for the property.
 * The value received as the first parameter will be the source document value.
 * The return type of function must reflect the type defined on property
 * @param getter
 * @constructor
 */
export default function Get<TOut = any, TIn = TOut>(getter: (value: TIn) => TOut): PropertyDecorator {
  return function (target, propertyKey) {
    ModelMetadata.getForTarget(target)
      .upsertPropOptions(propertyKey, (metadata) => metadata.get = getter);
  };
}
