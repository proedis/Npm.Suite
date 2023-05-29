import type * as React from 'react';

import type { PolymorphicComponentProps } from '@mantine/utils';
import type { AvatarProps as BaseAvatarProps } from '@mantine/core';

import type { UIComponentProps } from '@proedis/react';

import type { ShorthandIcon } from '../Icon';


export type AvatarProps = UIComponentProps<StrictAvatarProps, PolymorphicComponentProps<'div', BaseAvatarProps>>;

export interface StrictAvatarProps {
  /** Render an icon as Avatar Content */
  icon?: ShorthandIcon;

  /** Add a tooltip to the Avatar Component */
  tooltip?: React.ReactNode;
}
