import type { Client, ClientState, TokenSpecification } from '@proedis/client';


/* --------
 * Overridable Context Types
 * -------- */
export interface ContextClientOverride {

}

export type ContextClient = ContextClientOverride extends { client: infer C }
  ? C extends Client<any, any, any> ? C : Client<any, any, any>
  : Client<any, any, any>;

export type ClientUserData = ContextClient extends Client<infer UD, any, any> ? UD : unknown;

export type ClientStorageData = ContextClient extends Client<any, infer SD, any> ? SD : unknown;

export type ClientTokens = ContextClient extends Client<any, any, infer T> ? T : unknown;


/* --------
 * Hook Return Definition
 * -------- */
export type UseClientStateReturn = ClientState<ClientUserData>;

type ClientStorageUpdater<K extends keyof ClientStorageData> =
  | ClientStorageData[K]
  | ((current: ClientStorageData[K]) => ClientStorageData[K]);

export type UseClientStorageReturn = [
  ClientStorageData,
  <K extends keyof ClientStorageData>(key: K, value: ClientStorageUpdater<K>) => Promise<void>
];

export type UseClientTokenReturn = Partial<TokenSpecification>;
