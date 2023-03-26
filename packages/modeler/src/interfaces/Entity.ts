import type { AnyObject } from '@proedis/types';

import type Entities from '../Entities';
import type Entity from '../Entity';


/**
 * The EntityType represent a class instance built using
 * the @Model decorator.
 * The class instance will expose as accessor all properties
 * defined decorated with @Expose function,
 * in addition to default methods and properties
 */
export type EntityType<T extends AnyObject = AnyObject> = Entity<T> & T;


export interface EntityRelationships {
  /** An entity could be contained into an array of Entities */
  container?: Entities<any>;

  /** An entity could be a child of a parent entity */
  parent?: Entity<any>;
}
