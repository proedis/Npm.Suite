import * as React from 'react';

import { renderShorthandContent } from '@proedis/react';

import FieldsGroup from '../FieldsGroup';

import type { FormProps } from './Form.types';


/* --------
 * Component Definition
 * -------- */
const Form = React.forwardRef<HTMLFormElement, FormProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    children,
    content,

    disabled,

    onSubmit: userDefinedOnSubmitHandler,

    ...restFormProps
  } = props;


  // ----
  // Handlers
  // ----
  const handleFormSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      /** If form action doesn't exist, disable default behaviour */
      if (typeof props.action !== 'string') {
        event.preventDefault();
      }

      /** If the form has been disabled, avoid calling the userDefinedOnSubmitHandler */
      if (disabled) {
        return;
      }

      /** Check user defined handler exists */
      if (typeof userDefinedOnSubmitHandler === 'function') {
        userDefinedOnSubmitHandler(event);
      }
    },
    [ props.action, disabled, userDefinedOnSubmitHandler ]
  );


  // ----
  // Component Render
  // ----
  return (
    <form {...restFormProps} ref={ref} onSubmit={handleFormSubmit}>
      <FieldsGroup className={className}>
        {renderShorthandContent({ children, content })}
      </FieldsGroup>
    </form>
  );

});

Form.displayName = 'Form';

export default Form;
