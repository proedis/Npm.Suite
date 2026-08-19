/* eslint-disable @typescript-eslint/no-redeclare */
import type { AnyObject } from './objects';


/* --------
 * Class Shapes
 * -------- */

/**
 * An instantiable type: the class object itself, not one of its instances.
 *
 * Use it whenever an API receives a class to build later — a factory, a dependency container,
 * an error to be thrown by a guard. Pairing it with the built-in `ConstructorParameters` keeps
 * the argument list of the wrapper tied to the constructor it forwards to.
 *
 * @example
 * function create<T extends AnyObject>(
 *   ctor: Instantiable<T>,
 *   ...args: ConstructorParameters<Instantiable<T>>
 * ): T {
 *   return new ctor(...args);
 * }
 *
 * const error = create(RangeError, 'out of bounds');
 */
export type Instantiable<T extends AnyObject> = { new(...args: any[]): T };
export const Instantiable = Object;
