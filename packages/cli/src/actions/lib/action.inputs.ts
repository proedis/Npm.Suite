import { AugmentedMap, isObject } from '@proedis/utils';

import type { AnyObject } from '@proedis/types';


/* --------
 * Main Class Declaration
 * -------- */
export class ActionInputs<Schema extends AnyObject> {

  /** Internal list of all options */
  private _options: AugmentedMap<keyof Schema, Schema[keyof Schema]>;


  /** Create a new ActionInputs with optional default data */
  constructor(defaults?: Partial<Schema>) {
    /** Create the options storage */
    this._options = new AugmentedMap<keyof Schema, Schema[keyof Schema]>();

    /** If any defaults exist, reflect value into storage */
    if (isObject(defaults)) {
      (Object.keys(defaults) as (keyof Schema)[]).forEach((key) => {
        if (!!defaults[key]) {
          this._options.set(key, defaults[key] as Schema[keyof Schema]);
        }
      });
    }
  }


  /**
   * Set an option value in the internal map storage
   * @param name The name of the option to set
   * @param value The value of the option to set
   */
  setOption<Name extends keyof Schema>(name: Name, value: Schema[Name]): this {
    this._options.set(name, value);
    return this;
  }


  /**
   * Return an option value, or undefined if the option
   * has not been set into internal storage
   * @param name The name of the option to get
   */
  getOption<Name extends keyof Schema>(name: Name): Schema[Name] | undefined {
    return this._options.get(name);
  }

}
