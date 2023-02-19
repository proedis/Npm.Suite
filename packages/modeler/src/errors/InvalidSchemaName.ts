import type { Instantiable } from '@proedis/types';


export default class InvalidSchemaName extends Error {

  constructor(schema: Instantiable<any>) {
    global.console.error('Invalid schema name for the object', schema);
    super('Could not find a defined schema name. Look at console to figure out the schema.');
  }

}
