import * as React from 'react';

import { Box } from '@mantine/core';

import { will } from '@proedis/utils';
import { useUnmountEffect } from '@proedis/react';

import type { QueryObserverSuccessResult } from '@tanstack/react-query';

import type { RequestError } from '@proedis/client';

import { useClientQueryHooks } from '@proedis/react-client';
import type { ClientQueryHooks } from '@proedis/react-client';

import EmptyContent from '../../components/EmptyContent';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

import type {
  QuerySuspenseProps,
  SuspendedComponentOptions,
  SuspendedComponent,
  SuccessSuspendedContext,
  SuspendedWrapper,
  SuspendedComponentOutProps,
  SuspendedWrapperProps,
  SuspendedSkeleton
} from './query-suspense.types';


/* --------
 * Context Definition
 * -------- */
const SuspendedContext = React.createContext<SuccessSuspendedContext<any> | undefined>(undefined);

function useSuspendedContext<R>(): [ R, SuccessSuspendedContext<R> ] {
  /** Get the current context value */
  const ctx = React.useContext<SuccessSuspendedContext<R> | undefined>(SuspendedContext);

  /** Assert the context is defined */
  if (!ctx) {
    throw new Error('useSuspendedContext() must be used only in a valid suspended component (or in a child)');
  }

  /** Assert the context is valid */
  if (!ctx.state.isSuccess) {
    throw new Error('useSuspendedContext() must be used only in a valid and success suspended component (or in a child)');
  }

  /** Return the result */
  return [ ctx.state.data, ctx ];
}


/* --------
 * Utilities
 * -------- */
const createSafeWrapper = (
  Wrapper: SuspendedWrapper<any, any> | undefined
): SuspendedWrapper<any, any> => ({ children, ...wrapperProps }) => {
  /** If wrapper has not been defined, or is a plain ReactFragment, return without props */
  if (!Wrapper || Wrapper === React.Fragment) {
    return (
      <React.Fragment>
        {children}
      </React.Fragment>
    );
  }

  /** Return the defined wrapper appending */
  return (
    <Wrapper {...wrapperProps}>
      {children}
    </Wrapper>
  );
};


/* --------
 * Internal Components
 * -------- */
const QuerySuspenseSkeleton: React.FunctionComponent<SuspendedWrapperProps<any> & SuspendedSkeleton<any>> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,

    ContentWrapper: UserDefinedContentWrapper,
    Wrapper       : UserDefinedWrapper,

    Footer,
    Header,

    ...wrapperProps
  } = props;


  // ----
  // Memoized Element
  // ----
  const Wrapper = React.useMemo(
    () => createSafeWrapper(UserDefinedWrapper),
    [ UserDefinedWrapper ]
  );

  const ContentWrapper = React.useMemo(
    () => createSafeWrapper(UserDefinedContentWrapper),
    [ UserDefinedContentWrapper ]
  );


  // ----
  // Component Render
  // ----
  return (
    <Wrapper {...wrapperProps}>
      {Header && (
        <Header {...wrapperProps} />
      )}
      <ContentWrapper {...wrapperProps}>
        {children}
      </ContentWrapper>
      {Footer && (
        <Footer {...wrapperProps} />
      )}
    </Wrapper>
  );
};

QuerySuspenseSkeleton.displayName = 'QuerySuspenseSkeleton';


/* --------
 * Component Definition
 * -------- */
const QuerySuspense: React.FunctionComponent<QuerySuspenseProps<any, any>> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    NotFound,

    Component,
    innerProps,

    emptyContent,
    loader,

    query,

    ...skeletonProps
  } = props;


  // ----
  // Utilities
  // ----
  const { refetch: originalRefetch } = query;

  const handleReloadQuery = React.useCallback(
    async () => {
      await will(originalRefetch());
    },
    [ originalRefetch ]
  );


  // ----
  // Build Aside Component Props
  // ----
  const asideComponentProps = {
    ...innerProps,
    reload: handleReloadQuery,
    state : query
  };


  // ----
  // Render the Loading State
  // ----
  if (query.status === 'loading') {
    return (
      <QuerySuspenseSkeleton {...asideComponentProps} {...skeletonProps}>
        {Loader.create(loader, { autoGenerateKey: false }) || (
          <Box p={'md'} ta={'center'}>
            <Loader color={'cloud.3'} size={'xl'} variant={'dots'} />
          </Box>
        )}
      </QuerySuspenseSkeleton>
    );
  }


  // ----
  // Error Status
  // ----
  if (query.status === 'error') {
    /** Show specific error for response 404 */
    if (query.error.statusCode === 404 && process.env.NODE_ENV === 'production') {
      return (
        <QuerySuspenseSkeleton {...asideComponentProps} {...skeletonProps}>
          {!!NotFound && (
            <NotFound state={query} reload={handleReloadQuery} />
          )}
          {!NotFound && (
            <EmptyContent
              icon={'search'}
              header={'Nessun Risultato'}
              content={'La richiesta effettuata non ha prodotto alcun risultato'}
            />
          )}
        </QuerySuspenseSkeleton>
      );
    }
    /** Show specific alert for request error */
    return (
      <QuerySuspenseSkeleton {...asideComponentProps} {...skeletonProps}>
        <Message requestError={query.error} />
      </QuerySuspenseSkeleton>
    );
  }


  // ----
  // Main Component Render
  // ----

  /** Show empty content for the array list */
  if (emptyContent && Array.isArray(query.data) && !query.data.length) {
    return (
      <QuerySuspenseSkeleton {...asideComponentProps} {...skeletonProps}>
        {EmptyContent.create(emptyContent, { autoGenerateKey: false })}
      </QuerySuspenseSkeleton>
    );
  }

  /** Render the component with success data */
  return (
    <SuspendedContext.Provider value={{ reload: handleReloadQuery, state: query }}>
      <QuerySuspenseSkeleton {...asideComponentProps} {...skeletonProps}>
        <Component
          {...innerProps}
          reload={handleReloadQuery}
          state={query}
        />
      </QuerySuspenseSkeleton>
    </SuspendedContext.Provider>
  );

};

QuerySuspense.displayName = 'QuerySuspense';


/* --------
 * HOC Definition
 * -------- */
type PlainOrBuilder<TOut, P extends {}> = TOut | ((props: P) => TOut);

function querySuspenseComponent<R, P extends {} = {}>(
  Component: SuspendedComponent<R, P>,
  queryArgsBuilder: PlainOrBuilder<Parameters<ClientQueryHooks<any>['useClientQuery']>, SuspendedComponentOutProps<R, P>>,
  optionsBuilder?: PlainOrBuilder<SuspendedComponentOptions<R, P>, SuspendedComponentOutProps<R, P>>
): React.FunctionComponent<SuspendedComponentOutProps<R, P>> {
  return function SuspendedHoc(props) {

    // ----
    // Split props
    // ----
    const {
      resetOnUnmount,
      ...componentProps
    } = props;

    // ----
    // Build Options
    // ----
    const options = typeof optionsBuilder === 'function' ? optionsBuilder(props) : optionsBuilder;


    // ----
    // Query Data
    // ----
    const { useClientQuery } = useClientQueryHooks();
    const queryArguments = typeof queryArgsBuilder === 'function' ? queryArgsBuilder(props) : queryArgsBuilder;
    const queryResult = useClientQuery(...queryArguments);


    // ----
    // Lifecycle Events
    // ----
    useUnmountEffect(() => {
      if (resetOnUnmount) {
        queryResult.remove();
      }
    });


    // ----
    // Component Render
    // ----
    return (
      <QuerySuspense
        {...options}
        Component={Component}
        query={queryResult}
        innerProps={componentProps}
      />
    );
  };
}


/* --------
 * Helpers
 * -------- */
function suspendedComponent<R, P extends {} = {}>(
  render: (
    data: R,
    props: SuspendedComponentOutProps<R, P>,
    query: { reload: () => Promise<void>, state: QueryObserverSuccessResult<R, RequestError> }
  ) => React.ReactElement
): SuspendedComponent<R, P> {
  return function Suspended(props) {
    // ----
    // Props Deconstruct
    // ----
    const { state, reload, ...rest } = props;

    // ----
    // Return Wrapped Component
    // ----
    return render(state.data, rest, { reload, state });
  };
}


/* --------
 * Library Export
 * -------- */
export { QuerySuspense, useSuspendedContext, suspendedComponent, querySuspenseComponent };
