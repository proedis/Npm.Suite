import * as React from 'react';

import { contextBuilder } from '@proedis/react';

import type { Client, ClientState, TokenSpecification } from '@proedis/client';
import type { Serializable } from '@proedis/types';


/* --------
 * Internal Types
 * -------- */
export interface ClientContextTools<UD extends Serializable, SD extends Serializable, T extends string> {

  ClientConsumer: React.Consumer<Client<UD, SD, T>>;

  ClientProvider: React.FunctionComponent<React.PropsWithChildren>;

  useClient: UseClientHook<UD, SD, T>;

  useClientState: UseClientStateHook<UD>;

  useClientStorage: UseClientStorageHook<SD>;

  useClientToken: UseClientTokenHook<T>;

}

export type UseClientHook<UD extends Serializable, SD extends Serializable, T extends string> =
  () => Client<UD, SD, T>;

export type UseClientStateHook<UD extends Serializable> = () => ClientState<UD>;

export type UseClientStorageHook<SD extends Serializable> = () => ([
  SD,
  (<K extends keyof SD>(key: K, value: SD[K]) => Promise<void>)
]);

export type UseClientTokenHook<T extends string> = (token: T) => Partial<TokenSpecification>;


/* --------
 * Context Builder Definition
 * -------- */
export function createClientContext<UD extends Serializable, SD extends Serializable, T extends string>(
  client: Client<UD, SD, T>
): ClientContextTools<UD, SD, T> {

  // ----
  // Create base Context
  // ----
  const {
    useClient,
    ClientProvider: ClientProviderBase,
    ClientConsumer
  } = contextBuilder('Client', client);


  // ----
  // Create the Provider
  // ----
  const ClientProvider: React.FunctionComponent<React.PropsWithChildren> = ({ children }) => (
    <ClientProviderBase value={client}>
      {children}
    </ClientProviderBase>
  );


  // ----
  // Return the useClientState hook
  // ----
  function useClientState(): ReturnType<UseClientStateHook<UD>> {
    /** Create the internal state */
    const [ currentState, setCurrentState ] = React.useState<ClientState<UD>>(() => client.state.value);

    /** Subscribe to client state change using effect */
    React.useEffect(
      () => {
        const subscription = client.state.subscribe(setCurrentState);

        return () => subscription.unsubscribe();
      },
      []
    );

    /** Return state */
    return currentState;
  }


  // ----
  // Return the useClientStore hook
  // ----
  function useClientStorage(): ReturnType<UseClientStorageHook<SD>> {
    /** Create the internal state */
    const [ currentStorage, setStorage ] = React.useState(() => client.storage.value);

    /** Subscribe to client storage change using effect */
    React.useEffect(
      () => {
        const subscription = client.storage.subscribe(setStorage);

        return () => subscription.unsubscribe();
      },
      []
    );

    /** Return the storage */
    return [ currentStorage, client.storage.set ];
  }


  // ----
  // Return the useClientToken hook
  // ----
  function useClientToken(token: T): ReturnType<UseClientTokenHook<T>> {
    /** Create the internal state */
    const [ tokenHandshake ] = React.useState(() => client.getTokenHandshake(token));
    const [ currentSpecification, setSpecification ] = React.useState<Partial<TokenSpecification>>(
      () => {
        try {
          return tokenHandshake.value;
        }
        catch {
          return {
            token    : undefined,
            expiresAt: undefined
          };
        }
      }
    );

    /** Subscribe to handshake change */
    React.useEffect(
      () => {
        const subscription = client.getTokenHandshake(token).subscribe(setSpecification);

        return () => subscription.unsubscribe();
      },
      [ token ]
    );

    /** Return the Token Specification */
    return currentSpecification;
  }


  // ----
  // Client context return
  // ----
  return {
    useClient,
    useClientState,
    useClientStorage,
    useClientToken,
    ClientConsumer,
    ClientProvider
  };

}
