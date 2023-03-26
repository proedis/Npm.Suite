import { ModelMetadata } from '../../metadata';


/**
 * Protect a property from any type of change
 * @constructor
 */
export default function Protect(): PropertyDecorator {
  return function (target, propertyKey) {
    ModelMetadata.getForTarget(target)
      .upsertPropOptions(propertyKey, (metadata) => metadata.protect = true);
  };
}
