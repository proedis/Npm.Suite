import type { Instantiable } from '@proedis/types';

import type { InstantiableType } from '../constants';


/**
 * On recursive schema, a forwarded instantiable type could
 * be defined. This type will be instantiated and loaded lazy
 */
export type TForwarded = {
  type: InstantiableType.Forwarded,
  constructor: () => Instantiable<any>
};
