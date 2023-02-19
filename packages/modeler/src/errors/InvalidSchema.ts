import type { Instantiable } from '@proedis/types';


export default class InvalidSchema extends Error {

  constructor(schema: Instantiable<any>) {
    global.console.log('The requested object is not a valid schema', schema);
    super('An invalid object has been used to get the Schema Metadata');
  }

}
