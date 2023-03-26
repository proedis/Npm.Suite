import { ModelMetadata } from '../../metadata';


/**
 * Identify a property as the Identity of an Entity
 * @constructor
 */
export default function Identity(): PropertyDecorator {
  return function (target, propertyKey) {
    ModelMetadata.getForTarget(target)
      .upsertPropOptions(propertyKey, (metadata) => metadata.isIdentity = true);
  };
}
