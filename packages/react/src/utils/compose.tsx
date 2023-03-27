import * as React from 'react';


/* --------
 * Internal Types
 * -------- */
type ComposingComponentProps<Props extends {} = {}> = Props & { children: React.ReactNode };

type ComposingComponent<Props extends ComposingComponentProps = ComposingComponentProps> =
  | string
  | [ string, Props ]
  | React.ComponentType<Props>
  | [ React.ComponentType<Props>, Props ];


/**
 * Return a single FunctionComponent, composed by nesting all components provided as arguments
 * from the first one (root component) to the last one (last inner component).
 * It is useful to avoid hell-nesting components declaration.
 *
 * @example
 *  const Providers = compose(FirstProvider, SecondProvider, 'div', LastProvider);
 *
 *  // Later
 *  <Providers>
 *    <MyApp />
 *  </Providers>
 *
 *  // Will Become
 *  <FirstProvider>
 *    <SecondProvider>
 *      <div>
 *        <LastProvider>
 *          <MyApp />
 *        </LastProvider>
 *      </div>
 *    </SecondProvider>
 *  </FirstProvider>
 *
 * @param components
 */
export function compose(...components: ComposingComponent[]): React.FunctionComponent<React.PropsWithChildren> {

  const ComposedComponent: React.FunctionComponent<React.PropsWithChildren> = (props) => (
    <React.Fragment>
      {components.reduceRight((children, Provider) => {
        /** Array has style of [ Component, props ] */
        if (Array.isArray(Provider)) {
          /** Split component and Props */
          const [ Component, componentProps ] = Provider;
          /** Return Component and inner children */
          return (
            <Component {...componentProps}>
              {children}
            </Component>
          );
        }

        /** Render provider without props */
        return (
          <Provider>
            {children}
          </Provider>
        );
      }, props.children)}
    </React.Fragment>
  );

  ComposedComponent.displayName = 'ComposedComponent';

  return ComposedComponent;

}
