import dayjs from 'dayjs';

import { AsDayJs } from '../decorators';

import type { IEntityAuditable } from '../interfaces';

import { EntityBase } from './EntityBase';

import { type DateTime } from '../types';


/**
 * The EntityAuditable Model extends the base methods of EntityBase
 * and will add some auditing properties (createdBy, createdOn, updatedBy, updatedOn)
 * with the needed decorators to work properly
 */
export abstract class EntityAuditable extends EntityBase implements IEntityAuditable {

  /**
   * The unique identifier of the user that
   * has created this Entity.
   * On new entity, created from client, this value
   * will always be zero.
   */
  public createdBy: number = 0;


  /**
   * The datetime of the moment at which the entity
   * has been created and saved on the server.
   * On new entity, created from client, this value
   * will reflect the datetime at which the instance
   * has been created
   */
  @AsDayJs()
  public createdOn: DateTime = dayjs();


  /**
   * The unique identifier of the user that
   * has updated this Entity.
   * On new entity, created from client, this value
   * will always be zero.
   */
  public updatedBy: number = 0;


  /**
   * The datetime of the moment at which the entity
   * has been updated and saved on the server.
   * On new entity, created from client, this value
   * will reflect the datetime at which the instance
   * has been created
   */
  @AsDayJs()
  public updatedOn: dayjs.Dayjs = dayjs();

}
