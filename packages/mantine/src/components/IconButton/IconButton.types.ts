import type * as React from 'react';

import type { PolymorphicComponentProps } from '@mantine/utils';
import type { ActionIconProps as BaseActionIconProps, MantineColor } from '@mantine/core';

import type { UIVoidComponentProps } from '@proedis/react';

import type { ShorthandIcon } from '../Icon';


export type IconButtonProps = UIVoidComponentProps<StrictIconButtonProps, PolymorphicComponentProps<'button', BaseActionIconProps>>;


export interface StrictIconButtonProps {
  /**
   * Setting an IconButton as 'fab' will automatically set
   * the default color to 'primary', the radius and the size to 'xl'
   * and the 'staticColor' behaviour to true
   */
  fab?: boolean;

  icon?: ShorthandIcon;

  idleColor?: MantineColor;

  staticColor?: boolean;

  tooltip?: React.ReactNode;

  trigger?: React.ReactNode;
}
