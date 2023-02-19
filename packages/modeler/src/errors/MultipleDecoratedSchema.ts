import type { Instantiable } from '@proedis/types';


export default class MultipleDecoratedSchema extends Error {

  constructor(schema: Instantiable<any>) {
    global.console.error('Multiple decorated schema found', schema);
    super(
      'Found a schema that contains multiple @Schema() decorator applied. Check the console to figure out which schema is');
  }

}
