import type { AnyObject } from './objects';


/**
 * An instantiable type is typically a class object
 * with a constructor method that could be called to
 * generate a new Instance of the Class
 */
export type Instantiable<T extends AnyObject> = { new(...args: any[]): T };
