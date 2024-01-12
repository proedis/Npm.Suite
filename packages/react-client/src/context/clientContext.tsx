import * as React from 'react';

import type { Client, ClientSubject } from '@proedis/client';

import { contextBuilder } from '@proedis/react';

import type {
  ClientTokens,
  ContextClient,
  UseClientStateReturn,
  UseClientStorageReturn,
  UseClientTokenReturn
} from './clientContext.types';


/* --------
 * Main Context Builder
 * -------- */
const {
  useClient: useClientBase,
  ClientContext
} = contextBuilder<ContextClient>('Client');

export const useClient: () => ContextClient = useClientBase;


/* --------
 * Hook Definitions
 * -------- */

/**
 * Unified Hook to easily return the value of a ClientSubject instance.
 * This hook will fire every once the value changes
 * @param subject
 */
function useClientSubject<T>(subject: ClientSubject<T>): T {
  /** Create the internal subject value observer */
  const [ value, setValue ] = React.useState(
    () => subject.value
  );

  /** Use the Effect to subscribe and unsubscribe to value change */
  React.useEffect(
    () => {
      /** Open the subscription to subject value */
      const subscription = subject.subscribe(setValue);

      /** Clear the subscription on effect clean up */
      return () => subscription.unsubscribe();
    },
    [ subject ]
  );

  /** Return the current value of the subject */
  return value;
}


export function useClientState(): UseClientStateReturn {
  const client = useClient();
  return useClientSubject(client.state);
}


export function useClientStorage(): UseClientStorageReturn {
  const client = useClient();
  const storage = useClientSubject(client.storage);
  const setStorageBind = React.useMemo(
    () => client.storage.set.bind(client.storage),
    [ client ]
  );
  return [ storage, setStorageBind ];
}


export function useClientToken(token: ClientTokens): UseClientTokenReturn {
  const client = useClient();
  return useClientSubject(client.getTokenHandshake(token));
}


/* --------
 * Client Provider
 * -------- */

export interface ClientProviderProps {
  /** The client to use within provider */
  client: Client<any, any, any>;

  /** Tell the provider to render children components even if the client is not ready */
  renderEvenIfUnready?: boolean;

  /** Suspense Element to render while the client is not ready to be used */
  suspense?: React.ReactElement;
}

export const ClientProvider: React.FunctionComponent<React.PropsWithChildren<ClientProviderProps>> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    client,
    children,
    renderEvenIfUnready,
    suspense
  } = props;


  // ----
  // Listen for isReady state change
  // ----
  const { isReady } = useClientSubject(client.state);


  // ----
  // Check if the client is Ready to be used and if children must be hide while client is initially loading
  // ----
  if (!renderEvenIfUnready && !isReady) {
    return (
      <React.Fragment>
        {suspense || <React.Fragment />}
      </React.Fragment>
    );
  }


  // ----
  // Component Render
  // ----
  return (
    <ClientContext.Provider value={client}>
      {children}
    </ClientContext.Provider>
  );

};

ClientProvider.displayName = 'ClientProvider';
