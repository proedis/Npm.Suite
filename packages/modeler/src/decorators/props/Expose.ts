import { ModelMetadata } from '../../metadata';


/**
 * Register a prop for an Entity
 * @constructor
 */
export default function Expose(): PropertyDecorator {
  return function (target, propertyKey) {
    ModelMetadata.getForTarget(target).registerProp(target, propertyKey);
  };
}
