import { ModelMetadata } from '../../metadata';


/**
 * Define the alias for a property.
 * Alias will be used to load property value from
 * the data source and to write the property value on
 * the destination object
 * @param alias
 * @constructor
 */
export default function Alias(alias: string): PropertyDecorator {
  return function (target, propertyKey) {
    ModelMetadata.getForTarget(target)
      .upsertPropOptions(propertyKey, (metadata) => metadata.alias = alias);
  };
}
