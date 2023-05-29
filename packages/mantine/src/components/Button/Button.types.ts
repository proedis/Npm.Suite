import type * as React from 'react';

import type { UIComponentProps } from '@proedis/react';

import type { PolymorphicComponentProps } from '@mantine/utils';
import type { ButtonProps as BaseButtonProps } from '@mantine/core';


import type { ShorthandIcon } from '../Icon';


export type ButtonProps = UIComponentProps<StrictButtonProps, PolymorphicComponentProps<'button', Omit<BaseButtonProps, 'leftIcon'>>>;


export interface StrictButtonProps {
  icon?: ShorthandIcon;

  rightIcon?: ShorthandIcon;

  tooltip?: React.ReactNode;

}
