import '@proedis/react-client';

import { authResponseExtractor, bearerTransporter, ClientBuilder, queryParamTransporter } from '@proedis/client';
import type { Client } from '@proedis/client';

import type { Environment } from '@proedis/types';

import type { IAuthenticationData, IAuthenticatedEntity } from './auth';


/* --------
 * Internal Types
 * -------- */
export interface ClientStorage {
  /** The tenant for the current client */
  tenantId: string | null;
}

export type AppClient = Client<IAuthenticatedEntity, ClientStorage, 'accessToken' | 'refreshToken'>;


/* --------
 * Defaults
 * -------- */
const initialStoredDate: ClientStorage = {
  tenantId: null
};


/* --------
 * Client Instance Builder
 * -------- */
export function createAppClient(appName: string, baseUrl: string | Partial<Record<Environment, string>>): AppClient {
  return new ClientBuilder(appName)

    /** Define the storage with default data */
    .withStoredData<ClientStorage>(initialStoredDate)

    /** Replace the UserData received from Authentication endpoints */
    .withUserData<IAuthenticatedEntity>((response) => (response as IAuthenticationData).entity)

    /** Define options to dialogate with API Server */
    .withServer({
      domain   : typeof baseUrl === 'string'
        ? { development: 'localhost', production: baseUrl }
        : { development: 'localhost', ...baseUrl },
      namespace: 'v1',
      port     : {
        development: 80,
        production : 80
      },
      secure   : true,
      timeout  : {
        development: 120_000,
        production : 30_000
      }
    })

    /** Define the RefreshToken */
    .withToken('refreshToken', {
      extractors  : [
        authResponseExtractor<IAuthenticationData>((authResponse) => (
          authResponse.refreshToken
        ))
      ],
      transporters: [
        queryParamTransporter('refresh_token', true)
      ]
    })

    /** Define the AccessToken */
    .withToken('accessToken', {
      extractors  : [
        authResponseExtractor<IAuthenticationData>((authResponse) => (
          authResponse.accessToken
        ))
      ],
      transporters: [
        bearerTransporter(true),
        queryParamTransporter('accessToken', false)
      ],
      grant       : (thisClient) => ({
        url      : '/auth/account/refresh',
        method   : 'GET',
        params   : thisClient.storage.get('tenantId') ? {
          tenant: thisClient.storage.get('tenantId')
        } : {},
        useTokens: {
          accessToken : false,
          refreshToken: 'query'
        }
      })
    })

    /** Define the Login API */
    .defineApi('login', (signinData) => () => ({
      method   : 'POST',
      url      : '/auth/account/signin',
      data     : signinData,
      useTokens: {
        accessToken: false
      }
    }))

    /** Define the Signup API */
    .defineApi('signup', (signupData) => ({
      method   : 'POST',
      url      : '/auth/account/signup',
      data     : signupData,
      useTokens: {
        accessToken: false
      }
    }))

    /** Define the API to load user data */
    .defineApi('getUserData', () => ({
      method: 'GET',
      url   : '/auth/account/who-am-i'
    }))

    /** Set defaults params for requests */
    .withDefaults({
      useTokens: {
        accessToken: true
      }
    })

    /** Build the client */
    .build();
}


/* --------
 * Declaration of Client Type
 * -------- */
declare module '@proedis/react-client' {
  export interface ContextClientOverride {
    client: AppClient;
  }
}

export default createAppClient('FollowDev', { development: 'follow.cantieridigitali.net' });
