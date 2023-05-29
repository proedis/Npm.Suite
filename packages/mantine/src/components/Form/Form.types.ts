import type * as React from 'react';

import type { UIComponentProps } from '@proedis/react';


export type FormProps =
  UIComponentProps<StrictFormProps, React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>>;

export interface StrictFormProps {
  /** Disable the form submit action */
  disabled?: boolean;
}
