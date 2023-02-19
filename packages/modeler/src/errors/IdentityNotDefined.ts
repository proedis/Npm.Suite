import type { Instantiable } from '@proedis/types';


export default class IdentityNotDefined extends Error {

  constructor(schema: Instantiable<any>) {
    global.console.error('Identity not defined for schema', schema);
    super('The requested schema does not have a valid identity field');
  }

}
