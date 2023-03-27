import type { AxiosResponseTransformer } from 'axios';

import type { AnyObject } from '@proedis/types';


export default function transformAxiosResponseObject<T extends AnyObject, R extends AnyObject = T>(
  transformer: (data: T) => R
): AxiosResponseTransformer {
  return function axiosResponseTransformer(data, headers, status) {
    /** Apply the transformer only if status code is ok */
    if (status !== 200) {
      return undefined;
    }

    /** Try to parse the received data, transforming into a valid object */
    try {
      const parsedData = JSON.parse(data) as T;
      return transformer(parsedData);
    }
    catch {
      return undefined;
    }
  };
}
