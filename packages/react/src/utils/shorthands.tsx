import * as React from 'react';
import clsx from 'clsx';

import kind_of from 'kind-of';

import type { AnyObject } from '@proedis/types';
import { isNil } from '@proedis/utils';


/* --------
 * Exporting Types
 * -------- */

/**
 * A shorthand item.
 * This type could be used in type declaration
 * to set a prop as an item shorthand generator
 */
export type ShorthandItem<Props extends {}> = React.ReactNode | Props;
export type ShorthandCollection<Props extends {}> = ShorthandItem<Props & { key: React.Key }>[];


/** A React Component with the create shorthand function */
export type CreatableComponent<Props extends {}> =
  & React.FunctionComponent<Props>
  & { create: CreateComponent<Props> };


/* --------
 * Internal Types
 * -------- */

/** Any type of component that could be shorthanded */
type ShorthandedComponent<Props extends {}> = React.ElementType | React.ComponentType<Props>;


/** Function used to compute component Key providing props */
type KeyComputer<Props extends {}> = (props: Props) => React.Key;


/** The function that could be used to create the Component */
type CreateComponent<Props extends {}> = (
  value: UseShorthandValue<Props>,
  options: UseShorthandOptions<Props>
) => React.ReactElement<Props> | null;


/** The value that could be provided to 'create' shorthand method to render the Component */
type UseShorthandValue<Props extends {}> = React.ReactNode | Props;


/** Set of options that could be used while using the 'create' shorthand method */
interface UseShorthandOptions<Props extends {}> {
  /** Choose if method should auto generate the component key in iteration */
  autoGenerateKey: boolean;

  /** Manually compute the component key while creating the Node */
  childKey?: KeyComputer<Props>;

  /** Set default props to use */
  defaultProps?: Partial<Props>;

  /** Override the props of the component */
  overrideProps?: Partial<Props> | ((props: Props) => Partial<Props>);
}


/**
 * Function used to map any type of received shorthand value
 * to real shorthanded component props
 */
type ShorthandFactoryPropsMapper<Props extends {}, V extends UseShorthandValue<Props>> = (value: V) => Props;


/**
 * Set of props that could exist on the component that is being using
 * while creating the 'create' shorthand method
 */
interface PartialComponentProps extends AnyObject {
  /** Main component content */
  children?: React.ReactNode | null;

  /** User defined className */
  className?: string;

  /** Component key */
  key?: React.Key;

  /** Style to merge */
  style?: React.CSSProperties;
}


/* --------
 * Utilities
 * -------- */

/**
 * Starting from the provided Component, render the element
 * mapping the props using the Shorthand value argument
 *
 * @param Component The component to Render
 * @param mapValueToProps Function used to map the value to Component Props
 * @param computeComponentKey Optional function to use to compute the component key
 * @param value The value to use while rendering the component
 * @param options Component render options
 */
function createComponentShorthand<Props extends PartialComponentProps, V extends UseShorthandValue<Props>>(
  Component: ShorthandedComponent<Props>,
  mapValueToProps: ShorthandFactoryPropsMapper<Props, V>,
  computeComponentKey: KeyComputer<Props> | undefined,
  value: UseShorthandValue<Props>,
  options: UseShorthandOptions<Props>
): React.ReactElement<Props> | null {

  /**
   * If provided value is nil, or boolean
   * avoid to render the component
   */
  if (isNil(value) || typeof value === 'boolean') {
    return null;
  }


  // ----
  // Computing value type and assert is valid
  // ----

  const valueIsString = typeof value === 'string';
  const valueIsNumber = typeof value === 'number' && !Number.isNaN(value);
  const valueIsReactElement = React.isValidElement(value);
  const valueIsPropObject = kind_of(value) === 'object';
  const valueIsPrimitiveValue = valueIsString || valueIsNumber || kind_of(value) === 'array';

  /** Check the validity of provided value, logging the error only in production */
  if (!valueIsReactElement && !valueIsPrimitiveValue && !valueIsPropObject) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        [
          'Shorthand value must be a string|number|array|object|ReactElement|function.',
          'Use null|undefined|boolean for none.',
          `Received ${kind_of(value)}`
        ].join(' ')
      );
    }
    return null;
  }


  // ----
  // Component Props Building
  // ----

  /** Extract default props from options */
  const { defaultProps } = options;

  /** Get the user defined props, if the component is a valid React element */
  const userProps: Props = (valueIsReactElement && (value as React.ReactElement<Props>).props)
    || (valueIsPropObject && (value as Props))
    || (valueIsPrimitiveValue && mapValueToProps(value as V))
    || {} as Props;

  /** Extract the override props from options */
  let { overrideProps } = options;

  /** Compute override props function */
  if (typeof overrideProps === 'function') {
    overrideProps = (overrideProps as ((props: Props) => Props))({
      ...defaultProps,
      ...userProps
    });
  }

  /** Merge final props to a single props object */
  const props: Props = {
    ...defaultProps,
    ...userProps,
    ...overrideProps
  };

  /** Merge className from props */
  if (defaultProps?.className || overrideProps?.className || userProps.className) {
    const mergedClassNames = clsx(
      defaultProps?.className,
      userProps?.className,
      overrideProps?.className
    );

    props.className = Array.from(new Set(mergedClassNames.split(' ')).values()).join(' ');
  }

  /** Merge the style */
  if (defaultProps?.style || overrideProps?.style || userProps.style) {
    props.style = {
      ...defaultProps?.style,
      ...userProps.style,
      ...overrideProps?.style
    };
  }


  // ----
  // Component Key Computing
  // ----
  if (props.key == null) {
    /** Get options to generate the key */
    const { autoGenerateKey, childKey } = options;

    if (typeof computeComponentKey === 'function') {
      props.key = computeComponentKey(props);
    }
    else if (typeof childKey === 'function') {
      props.key = childKey(props);
    }
    else if (autoGenerateKey && (valueIsString || valueIsNumber)) {
      props.key = (value as React.Key);
    }
  }


  // ----
  // Component Render
  // ----

  /** If provided value is a valid React Element, wrap using Component */
  if (valueIsReactElement) {
    return React.cloneElement(value as React.ReactElement, props);
  }

  /** If the value is a primitive value, or a plain props object, use base Component */
  if (valueIsPrimitiveValue || valueIsPropObject) {
    return (
      <Component {...props} />
    );
  }

  /** Fallback to null */
  return null;

}


/* --------
 * Factory Methods
 * -------- */

/**
 * Create a shorthand function that could be used to easily render component.
 *
 * @param Component The component to use
 * @param mapValueToProps A function to use to map value to component Props
 * @param computeComponentKey A custom function to compute the component key
 */
export function createShorthandFactory<Props extends {}, V extends UseShorthandValue<Props>>(
  Component: ShorthandedComponent<Props>,
  mapValueToProps: ShorthandFactoryPropsMapper<Props, V>,
  computeComponentKey?: KeyComputer<Props>
): CreateComponent<Props> {
  return function createComponent(value: UseShorthandValue<Props>, options: UseShorthandOptions<Props>) {
    return createComponentShorthand(Component, mapValueToProps, computeComponentKey, value, options);
  };
}


/**
 * Automatically add the 'create' shorthand method to the provided component
 * and return it strongly typed as CreatableComponent
 *
 * @param Component The component to use
 * @param mapValueToProps A function to use to map value to component Props
 * @param computeComponentKey A custom function to compute the component key
 */
export function creatableComponent<Props extends {}, V extends UseShorthandValue<Props>>(
  Component: React.FunctionComponent<Props>,
  mapValueToProps: ShorthandFactoryPropsMapper<Props, V>,
  computeComponentKey?: KeyComputer<Props>
): CreatableComponent<Props> {

  /** Attach create method to the provided Component function */
  (Component as CreatableComponent<Props>).create =
    createShorthandFactory<Props, V>(Component, mapValueToProps, computeComponentKey);

  /** Return the Component */
  return Component as CreatableComponent<Props>;

}
