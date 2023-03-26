import type { AnyObject } from '@proedis/types';

import type { EntityRelationships } from './interfaces';


export default class Entity<T extends AnyObject = AnyObject> {

  // ----
  // Private Properties
  // ----
  public readonly _source: AnyObject;

  private readonly _relationships: EntityRelationships | undefined;


  // ----
  // Entity Constructor
  // ----
  constructor(source?: AnyObject, relationships?: EntityRelationships) {
    /** Save local data */
    this._source = source || {};
    this._relationships = relationships;
  }

}
