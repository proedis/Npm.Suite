import type dayjs from 'dayjs';

import type { DateTime } from '../types';


export interface IEntityAuditable {
  createdBy: number;

  createdOn: DateTime;

  updatedBy: number;

  updatedOn: dayjs.Dayjs;
}
