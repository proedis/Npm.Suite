import type { AnyObject } from '@proedis/types';

import type Entity from './Entity';

import type { EntityRelationships } from './interfaces';


export default class Entities<T extends AnyObject> extends Array<Entity<T>> {

  // ----
  // Private Properties
  // ----
  private readonly _relationships: EntityRelationships | undefined;


  // ----
  // Entities Constructor
  // ----
  constructor(values?: AnyObject[], relationships?: EntityRelationships) {
    super();

    /** Save local data */
    this._relationships = relationships;

    /** Build data */
    for (const value of (values || [])) {

    }
  }

}
