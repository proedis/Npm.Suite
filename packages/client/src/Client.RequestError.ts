import { isObject } from '@proedis/utils';

import { AxiosError } from 'axios';
import type { Method as RequestMethod } from 'axios';


export default class RequestError {

  public statusCode: number = 500;

  public message: string = 'Server Error';

  public error: string = 'server-error';

  public method: RequestMethod = 'GET';

  public stack: string = 'Generic Request Error';

  public url: string = 'localhost';

  public response: any | null = null;

  public original: any | null = null;


  public static fromError(error: any): RequestError {
    /** If received error is already a RequestError return it */
    if (error && error instanceof RequestError) {
      return error;
    }

    /** Create the RequestError instance */
    const requestError = new RequestError();
    requestError.original = error;

    /** Assert the received error is a valid object */
    if (!isObject(error)) {
      return requestError;
    }

    /** Parse the error if is an AxiosError */
    if (error instanceof AxiosError) {
      const { response, config, stack } = error as AxiosError;

      if (response) {
        requestError.statusCode = response.status;
        requestError.error = (response.data as any)?.title ?? requestError.error;
        requestError.message = (response.data as any)?.detail ?? requestError.message;
        requestError.method = (config?.method?.toUpperCase() as RequestMethod) ?? requestError.method;
        requestError.response = response.data;
        requestError.stack = stack ?? requestError.stack;
        requestError.url = config?.url ?? requestError.url;

        return requestError;
      }
    }

    /** Parse an Error object */
    if (error instanceof Error) {
      requestError.error = error.name;
      requestError.message = error.message;
      requestError.stack = error.stack ?? requestError.stack;
      requestError.url = typeof window !== 'undefined'
        ? window?.location?.href ?? requestError.url
        : requestError.url;

      return requestError;
    }

    /** Fallback to original error */
    return requestError;
  }

}
