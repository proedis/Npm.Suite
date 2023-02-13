import type { AnyObject, Environment } from '@proedis/types';


/**
 * While using the Options instance, the first level of object's key
 * could be an object with an environment key that defines different configurations
 * depending on the environment used to run the app
 */
export type EnvironmentDependentOptions<Options extends AnyObject> = {
  [K in keyof Options]: Options[K] | Partial<Record<Environment, Options[K]>>
};


/* --------
 * Configuration key type checker
 * -------- */

export type TypeChecker = StrictTypeChecker | TypeCheckerFunction;


/**
 * To avoid the creation of a type checker function for primitive
 * values, a primitive string could be used to check the type via typeof
 */
export type StrictTypeChecker = 'string' | 'number' | 'boolean' | 'function' | 'array' | 'object';


/**
 * A function used to check if the type of variable
 * is correct or not
 */
export type TypeCheckerFunction = (value: any) => boolean;
