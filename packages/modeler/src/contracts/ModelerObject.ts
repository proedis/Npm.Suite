import { instanceToPlain, instanceToInstance, plainToInstance } from 'class-transformer';
import type { ClassConstructor, ClassTransformOptions } from 'class-transformer';

import { isNil, getHash } from '@proedis/utils';

import type { IModelerObject } from '../interfaces';


/**
 * The EntityBase Model that must be used as an
 * extensions to all models built.
 * That's because it contains base method to transform
 * the instance into a plain object or into json
 */
export abstract class ModelerObject implements IModelerObject {

  /**
   * Checks if the given object is an instance of ModelerObject.
   *
   * @param {any} obj - The object to be checked.
   * @return {boolean} - Returns true if the object is an instance of ModelerObject, otherwise false.
   */
  public static isModelerObject(obj: any): obj is ModelerObject {
    return !isNil(obj) && obj instanceof ModelerObject;
  }


  /**
   * Compares two `ModelerObject` instances to determine if they represent the same object.
   *
   * @param {ModelerObject} left - The first `ModelerObject` to compare.
   * @param {ModelerObject} right - The second `ModelerObject` to compare.
   * @return {boolean} Returns `true` if the two objects are considered the same, otherwise `false`.
   */
  public static isSameModelerObject(left: ModelerObject, right: ModelerObject): boolean {
    // Check first by strict object comparison
    if (left === right) {
      return true;
    }

    // Check if the prototype of the modeler object is the same
    if (left.constructor !== right.constructor) {
      return false;
    }

    // Returns hash comparison between the two ModelerObjects
    return left.hash() === right.hash();
  }


  /**
   * Creates a new instance of a class using the provided source object.
   *
   * @template T - The type of the class to create an instance of.
   * @template V - The type of the source object.
   * @param {V} source - The source object to create the instance from.
   * @returns {T} - Returns a new instance of the class.
   */
  public static from<T, V extends object & { length?: never }>(this: ClassConstructor<T>, source: V): T;
  public static from<T, V extends Array<any>>(this: ClassConstructor<T>, source: V): T[];
  public static from<T, V>(this: ClassConstructor<T>, source: V | V[]): T | T[] {
    return plainToInstance(this as ClassConstructor<T>, source);
  }


  /**
   * Generates and returns a hash string for the current object.
   *
   * @return {string} A string representing the hash value of the object.
   */
  public hash(): string {
    return getHash(this);
  }


  /**
   * Determines whether the provided object is equal to the current instance.
   *
   * @param {any} other - The object to compare with the current instance.
   * @return {boolean} True if the provided object is the same as the current instance, false otherwise.
   */
  public equals(other: any): other is this {
    if (!ModelerObject.isModelerObject(other)) {
      return false;
    }

    return ModelerObject.isSameModelerObject(this, other);
  }


  /**
   * Creates a new instance of the current class object, which is a deep clone of the original object.
   *
   * @param options - Optional parameters for the cloning process.
   * @returns A new instance of the current class object, cloned from the original object.
   */
  public clone(options?: ClassTransformOptions): this {
    return instanceToInstance(this, options);
  }


  /**
   * Transform the ModelerObject instance (or the class that implements that) into a plain object
   *
   * @param {ClassTransformOptions} options - Options for transforming the object
   * @return {Record<string, any>} - The transformed plain object
   */
  public toObject(options?: ClassTransformOptions): Record<string, any> {
    return instanceToPlain(this, options);
  }


  /**
   * Transform the ModelerObject instance (or the class that implements that) into a JSON string
   *
   * @param {ClassTransformOptions} options - The options for class transformation
   * @return {string} - The transformed ModelerObject instance as a JSON string
   */
  public toJSON(options?: ClassTransformOptions): string {
    return JSON.stringify(this.toObject(options));
  }
}
