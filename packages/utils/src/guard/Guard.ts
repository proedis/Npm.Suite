import type { Instantiable } from '@proedis/types';

import GuardAndThrow from './Guard.AndThrow';


export default class Guard {

  public static andThrow<T extends Error>(
    error: Instantiable<T>,
    ...args: ConstructorParameters<Instantiable<T>>
  ): GuardAndThrow<T> {
    return new GuardAndThrow<T>(error, ...args);
  }

}
