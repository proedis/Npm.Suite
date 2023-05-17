import ClientBuilder from '../../builder';

import { isBrowser, isValidString } from '@proedis/utils';

import {
  bearerTransporter,
  headerTransporter,
  queryParamTransporter
} from '../../lib/TokenHandshake/mixin/transporters';

import { plainTokenExtractor, queryParamExtractor } from '../../lib/TokenHandshake/mixin/extractors';

import { transformAxiosResponseObject } from '../../utils';

import type { TokenSpecification } from '../../lib/TokenHandshake/TokenHandshake.types';

import type {
  GeaAccount,
  GeaExchangeResult
} from './interfaces';


/* --------
 * Gea Authorized Client Builder
 * -------- */
export default function GeaAuthenticatedClient(name: string) {
  return new ClientBuilder(name)
    /** Set the main Gea ApplicationId */
    .withToken('geaApplicationId', {
      extractors  : [ plainTokenExtractor('5978604A-4F9C-41C9-AA76-228A975BD7BB') ],
      transporters: [ headerTransporter('X-Gea-ApplicationId') ]
    })

    /** Set options to use and extract Gea Ticket */
    .withToken('ticket', {
      extractors  : [
        queryParamExtractor({
          token    : 'gea_ticket',
          expiresAt: 'gea_ticket_expires'
        })
      ],
      transporters: [ queryParamTransporter('ticket') ],
      persistency : 'session'
    })

    /** Set options to use, extract and grant Refresh Token */
    .withToken('refreshToken', {
      grant                     : {
        url          : '/auth/exchange',
        method       : 'GET',
        requestConfig: {
          baseURL          : 'https://api.gea.connect.ecoportale.net/v1',
          transformResponse: transformAxiosResponseObject<GeaExchangeResult, TokenSpecification>(
            (response) => response.refreshToken
          )
        },
        useTokens    : {
          ticket          : 'query',
          geaApplicationId: true,
          accessToken     : false
        } as any
      },
      invalidateAuthOnGrantError: true,
      transporters              : [ queryParamTransporter('token') ]
    })

    /** Set options to use, extract and grand Access Token */
    .withToken('accessToken', {
      grant       : {
        url          : '/auth/grant',
        method       : 'GET',
        requestConfig: {
          baseURL: 'https://api.gea.connect.ecoportale.net/v1'
        },
        useTokens    : {
          refreshToken    : true,
          geaApplicationId: true
        }
      },
      transporters: [ bearerTransporter() ]
    })

    /** Set user data type and define endpoint to retrieve */
    .withUserData<GeaAccount>()

    .defineApi('getUserData', () => ({
      url          : '/auth/user-data',
      method       : 'GET',
      requestConfig: {
        baseURL: 'https://api.gea.connect.ecoportale.net/v1'
      },
      useTokens    : {
        accessToken: true
      }
    }))

    .withDefaults({
      useTokens: {
        accessToken: true
      }
    })

    .withExtras({
      invalidateExistingAuth: () => {
        /** Invalidating Client Auth must be evaluated only if it is running in browser */
        if (!isBrowser) {
          return false;
        }

        /** The client must invalidate current auth if the gea_ticket query parameters is present */
        const urlSearchParams = !!window.location.search && new URLSearchParams(window.location.search);

        return urlSearchParams && urlSearchParams.has('gea_ticket') && isValidString(urlSearchParams.get('gea_ticket'));
      }
    });
}
