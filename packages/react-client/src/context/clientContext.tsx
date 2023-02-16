import * as React from 'react';

import { contextBuilder } from '@proedis/react';

import type { Client, ClientState } from '@proedis/client';
import type { Serializable } from '@proedis/types';


/* --------
 * Internal Types
 * -------- */
export interface ClientContextTools<UD extends Serializable, SD extends Serializable, T extends string> {

  ClientConsumer: React.Consumer<Client<UD, SD, T>>;

  ClientProvider: React.FunctionComponent<React.PropsWithChildren>;

  useClient: UseClientHook<UD, SD, T>;

  useClientState: UseClientStateHook<UD>;

}

export type UseClientHook<UD extends Serializable, SD extends Serializable, T extends string> =
  () => Client<UD, SD, T>;

export type UseClientStateHook<UD extends Serializable> = () => ClientState<UD>;


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
  function useClientState(): ClientState<UD> {
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
  // Client context return
  // ----
  return {
    useClient,
    useClientState,
    ClientConsumer,
    ClientProvider
  };

}
