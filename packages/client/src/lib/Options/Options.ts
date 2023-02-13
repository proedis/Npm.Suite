import { AugmentedMap, isNil, isObject } from '@proedis/utils';
import type { AnyObject, Environment } from '@proedis/types';

import type { EnvironmentDependentOptions, TypeChecker, StrictTypeChecker, TypeCheckerFunction } from './Options.types';


export default class Options<T extends EnvironmentDependentOptions<AnyObject>> {

  private static defaultEnv: Environment = 'production';

  private static currentEnv: Environment = process.env.NODE_ENV as Environment ?? 'production';

  private static typeCheckers = new AugmentedMap<StrictTypeChecker, TypeCheckerFunction>();


  // ----
  // Type Checker function, used to assert a configuration value
  // is valid and could be safe returned to requester
  // ----
  private static createTypeChecker(assertion: TypeChecker): TypeCheckerFunction {
    return function isRightValueType(value) {
      /** If assertion is a predefined string, check with typeof shorthand */
      if (typeof assertion === 'string') {
        /** Safe check assertion is not 'array' */
        if (assertion === 'array') {
          return Array.isArray(value);
        }

        /** Check if object and does not contain any of the environment key */
        if (assertion === 'object') {
          return isObject(value)
            && !Object.keys(value).some((key) => (
              key.match(/^(development)|(production)|(test)|(staging)$/)
            ));
        }

        /** Return the result of typeof */
        return typeof value === assertion;
      }

      /** Else, call the Assertion Function */
      return assertion(value);
    };
  }


  // ----
  // Internal value cache
  // ----
  private readonly _valueCache = new AugmentedMap<keyof T, any>();


  // ----
  // Instantiate a new Options class
  // ----
  constructor(private readonly _options?: T) {
    /** If an initial options object has been provided, assert is a valid object */
    if (!isNil(_options) && !isObject(_options)) {
      throw new Error('Option object seems to be invalid. Only an object type could be used');
    }
  }


  // ----
  // Options key reader
  // ----
  private _getKey<K extends keyof T>(key: K, assertion: TypeChecker): T[K] | undefined {
    /** Check options the object exists before continue */
    if (!isObject(this._options)) {
      return undefined;
    }

    /** Create the function to use to assert the option type */
    const isRightType = typeof assertion === 'string'
      ? Options.typeCheckers.getOrAdd(assertion, () => Options.createTypeChecker(assertion))
      : Options.createTypeChecker(assertion);

    /** Get the option value at the requested key */
    const value = this._options[key];

    /** If the value is of the right type, return it */
    if (isRightType(value)) {
      return value;
    }

    /** Check if the value is not nil */
    if (value == null || (typeof value !== 'object')) {
      return undefined;
    }

    /** Check if current environment exists in value */
    if (Options.currentEnv in value && isRightType((value as EnvironmentDependentOptions<T>)[Options.currentEnv])) {
      return (value as EnvironmentDependentOptions<T>)[Options.currentEnv] as T[K];
    }

    /** Automatic fallback to production value, if exists */
    if (Options.defaultEnv in value && isRightType((value as EnvironmentDependentOptions<T>)[Options.defaultEnv])) {
      return (value as EnvironmentDependentOptions<T>)[Options.defaultEnv] as T[K];
    }

    /** Return the default value */
    return undefined;
  }


  // ----
  // Public methods
  // ----

  public exists(): boolean {
    return isObject(this._options);
  }


  public get<K extends keyof T>(
    key: K,
    assertion: TypeChecker
  ): Exclude<T[K], Partial<Record<Environment, T[K]>>> | undefined {
    return this._valueCache.getOrAdd(key, () => this._getKey(key, assertion));
  }


  public getOrDefault<K extends keyof T>(
    key: K,
    assertion: TypeChecker,
    fallback: T[K]
  ): Exclude<T[K], undefined | null | Partial<Record<Environment, T[K]>>> {
    return this._valueCache.getOrAdd(key, () => this._getKey(key, assertion)) ?? fallback;
  }

}
