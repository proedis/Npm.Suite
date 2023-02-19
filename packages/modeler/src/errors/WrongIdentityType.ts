import { Instantiable } from '@proedis/types';


export default class WrongIdentityType extends Error {

  constructor(property: string) {
    super(`Property '${property}' has a wrong type. Only strings or numbers are accepted`);
  }

}
