import { ModelMetadata } from '../../metadata';

import Entity from '../../Entity';


/* --------
 * Decorator
 * -------- */

/**
 * Set the name of an Entity. This function will also register
 * the EntityMetadata instance of the Entity into the global storage
 * @param name
 * @constructor
 */
export default function Model(name: string): ClassDecorator {
  return function (ctor) {
    /** Assert the decorated class is extending the Entity class */
    if (!(ctor.prototype instanceof Entity)) {
      throw new Error('Could not decorate a class with @Model if it is not extending Entity base class');
    }

    /** Get the Metadata defined for Class */
    const metadata = ModelMetadata.getForClass(ctor);

    /** Store the Model Name */
    metadata.name = name;

    /** Loop all properties defined to build right Accessor */
    for (const prop of metadata.props) {
      /** Define the new property */
      Object.defineProperty(ctor.prototype, prop.name, {
        /** Set the property as immutable */
        configurable: false,
        /** Set the property as enumerable */
        enumerable: true,
        /** Define the getter */
        get(this: Entity<any>): any {
          /** Extract the value of the property */
          return prop.getValue(this);
        }
      });

    }
  };
}
