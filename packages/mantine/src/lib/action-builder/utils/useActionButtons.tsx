import * as React from 'react';

import type { ShorthandItem } from '@proedis/react';

import Button, { ButtonGroup } from '../../../components/Button';
import type { ButtonProps } from '../../../components/Button';


/* --------
 * Internal Types
 * -------- */
interface UseActionButtonsOptions<P extends {}> {
  /** The builder argument */
  builderProps: P;

  /** The default defined button shorthand */
  defaultDefinedBuilder: ShorthandItem<ButtonProps> | ((props: P) => ShorthandItem<ButtonProps>);

  /** Default Props to pass to button */
  defaultProps?: Partial<ButtonProps>;

  /** The button key */
  key: React.Key;

  /** The click function to fire */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Force the disabled state */
  overrideProps?: Partial<ButtonProps>;

  /** The user defined button shorthand */
  userDefined: ShorthandItem<ButtonProps>;
}


/* --------
 * External Utilities
 * -------- */
const couldRenderActionButton = (
  userDefinedButton: ShorthandItem<ButtonProps>,
  defaultDefinedButton: ShorthandItem<ButtonProps>
) => {
  /** If the user defined button is explicit set to null/false, hide the button */
  if (userDefinedButton === null || userDefinedButton === false) {
    return false;
  }

  /** If no button has been defined, omit rendering by returning false */
  if (!userDefinedButton && !defaultDefinedButton) {
    return false;
  }

  /** Standard value is true */
  return true;
};


function buildButtonElement<P extends {}>(options: UseActionButtonsOptions<P>): React.ReactElement<ButtonProps> | null {
  // ----
  // Deconstruct Options
  // ----
  const {
    builderProps,
    defaultDefinedBuilder,
    defaultProps,
    overrideProps,
    onClick,
    userDefined
  } = options;


  // ----
  // Build the default defined button
  // ----
  const defaultDefined = (() => {
    /** Avoid when user defined button is explicitly disabled */
    if (userDefined === null || userDefined === false) {
      return null;
    }

    /** If the builder is a function, call with props */
    if (typeof defaultDefinedBuilder === 'function') {
      return defaultDefinedBuilder(builderProps);
    }

    /** Return the default defined button */
    return defaultDefinedBuilder;
  })();


  // ----
  // Check if the Button should be rendered or not
  // ----
  if (!couldRenderActionButton(userDefined, defaultDefined)) {
    return null;
  }


  // ----
  // Return the Button built using Shorthand Factory
  // ----
  return (
    Button.create(userDefined ?? defaultDefined, {
      autoGenerateKey: true,
      defaultProps,
      overrideProps  : (originalProps) => ({
        ...overrideProps,
        onClick: (event) => {
          /** Call the user defined onClick handler */
          if (typeof onClick === 'function') {
            onClick(event);
          }

          /** If an original onClick has been defined, call it */
          if (typeof originalProps.onClick === 'function') {
            originalProps.onClick(event);
          }
        }
      })
    })
  );
}


/* --------
 * Hook Definition
 * -------- */
export default function useActionButtons(
  ...buttons: [ UseActionButtonsOptions<any>, ...UseActionButtonsOptions<any>[] ]
): React.ReactElement | null {

  // ----
  // Build all buttons in an array
  // ----
  const buttonElements = buttons.map(buildButtonElement)
    .filter(e => e != null) as React.ReactElement[];


  // ----
  // If no buttons exists, return an empty component
  // ----
  if (!buttonElements.length) {
    return null;
  }


  // ----
  // Render the Buttons inside a Flex Container
  // ----
  return (
    <ButtonGroup pt={'md'} justify={'flex-end'}>
      {buttonElements.map(element => (
        <React.Fragment key={element.key}>
          {element}
        </React.Fragment>
      ))}
    </ButtonGroup>
  );

}
