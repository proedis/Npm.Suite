import type { AnyObject } from '@proedis/types';

import PropMetadata from './PropMetadata';

import { DecoratorKeys } from '../constants';

import type { IPropMetadata, IPropOptions } from '../interfaces';


export default class ModelMetadata<T extends AnyObject = AnyObject> {


  // ----
  // Static Storage
  // ----
  private static _metadataStorage = new Map<string, ModelMetadata<any>>();


  // ----
  // Static Helpers
  // ----

  /**
   * Returns registered EntityMetadata instance for class constructor reference.
   * If no EntityMetadata instance exists for the requested class, a new one will
   * be created and added to metadata using Reflection
   * @param ctx
   */
  public static getForClass<T extends AnyObject = AnyObject>(ctx: Function): ModelMetadata<T> {
    /** Extract EntityMetadata from the requested target */
    let metadata = Reflect.getMetadata(DecoratorKeys.ModelMetadata, ctx);

    /** If no metadata exists for requested target, create a new one */
    if (!metadata) {
      /** Create a new instance of EntityMetadata */
      metadata = new ModelMetadata();

      /** Save metadata */
      Reflect.defineMetadata(DecoratorKeys.ModelMetadata, metadata, ctx);
    }

    /** Return the metadata */
    return metadata;
  }


  /**
   * When using PropertyDecorator function, or MethodDecorator function,
   * the EntityMetadata for decorator target could be returned (or instantiated)
   * using this method
   * @param target
   */
  public static getForTarget<T extends AnyObject = AnyObject>(target: Object): ModelMetadata<T> {
    return this.getForClass(target.constructor);
  }


  /**
   * When working with an instance of any class, this method could be used
   * to return (or instantiate) the relative EntityMetadata instance container
   * @param instance
   */
  public static getForInstance<T extends AnyObject = AnyObject>(instance: T): ModelMetadata<T> {
    return this.getForClass(Object.getPrototypeOf(instance).constructor);
  }


  // ----
  // Internal Properties
  // ----

  /**
   * Custom defined scheme name, setup using
   * the @EntityName decorator. When name has been set
   * the EntityMetadata will be stored in static map storage
   */
  private _name: string | undefined;


  /**
   * This is the map container of all props decorated
   * of the class and will contain the set of PropMetadata
   * that is describing the prop
   * @private
   */
  private _props: Map<keyof T, PropMetadata<T>> = new Map<keyof T, PropMetadata<T>>();

  private _temp: Map<string | symbol, IPropOptions<T>> = new Map<string | symbol, IPropOptions<T>>();


  // ----
  // Public Properties
  // ----

  /**
   * Set the name of the Entity and store the current
   * EntityMetadata instance into metadata static storage
   * @param newName
   */
  public set name(newName: string | undefined) {
    /** Check if a previous name has been used */
    if (this._name) {
      ModelMetadata._metadataStorage.delete(this._name);
    }

    /** If no new name has been defined, exit */
    if (!newName) {
      return;
    }

    /** Store current EntityMetadata instance */
    ModelMetadata._metadataStorage.set(newName, this);

    /** Set the name into private backing field */
    this._name = newName;
  }


  /**
   * Get the name of the Entity related to the
   * current instance of EntityMetadata
   */
  public get name(): string | undefined {
    return this._name;
  }


  /**
   * Return all configured and exposed properties
   */
  public get props(): PropMetadata<T>[] {
    return Array.from(this._props.values());
  }


  // ----
  // Exposed Methods
  // ----

  /**
   * Register a target prop, setting up the system checkers
   * and properties and add the PropMetadata object
   * to the internal Map instance
   * @param target
   * @param prop
   * @param descriptor
   */
  public registerProp(
    target: Object,
    prop: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ) {
    /** Get the property descriptor using _target class */
    const _descriptor = descriptor ?? Reflect.getOwnPropertyDescriptor(target, prop);
    const ctor = Reflect.getMetadata(DecoratorKeys.Type, target, prop);
    const returnType = Reflect.getMetadata(DecoratorKeys.ReturnType, target, prop);

    /** Assert the type of the property is defined */
    if (!ctor) {
      throw new Error(`Invalid property ${String(prop)} found for Target`);
    }

    /** Check if a temporary option has been stored for prop */
    let temporaryOptions: IPropOptions<T> = this._temp.get(prop) ?? {};

    /** Create the new metadata for requested prop */
    const metadata: IPropMetadata<T> = {
      descriptor: _descriptor,
      isArray   : ctor === Array,
      isMethod  : ctor === Function,
      isVirtual : typeof _descriptor?.get === 'function' && typeof _descriptor?.set === 'undefined',
      name      : prop as Exclude<keyof T, number>,
      returnType,
      type      : ctor,
      ...temporaryOptions
    };

    /** Setup some Assertion to check metadata and correctly defined decorators */
    if (metadata.isMethod && !metadata.returnType) {
      throw new SyntaxError(
        'Could not decorate a class method with \'void\' returns type. ' +
        `Check property '${String(prop)}' of ${target.constructor.name}`
      );
    }

    /** Remove temporary options for registered prop */
    this._temp.delete(prop);

    /** Save the new metadata into the map object */
    this._props.set(prop as keyof T, new PropMetadata<T>(metadata));
  }


  /**
   * Update the PropOptions for a registered prop.
   * To use this method, the prop must be correctly registered
   * using the @Prop decorator
   * @param prop
   * @param update
   */
  public upsertPropOptions(prop: string | symbol, update: (options: IPropOptions<T>) => void) {
    /** Get the prop metadata from map instance */
    const metadata = this._props.get(prop as keyof T);

    /** If metadata exists, the prop has already been registered */
    if (metadata) {
      /** Update the metadata object and return */
      metadata.editOptions(update);

      return;
    }

    /** Get partial options from the temporary map */
    const temporaryOptions = this._temp.get(prop) ?? {};

    /** Update the temporary options */
    update(temporaryOptions);

    /** Store into the temporary map */
    this._temp.set(prop, temporaryOptions);

    return;
  }


}
