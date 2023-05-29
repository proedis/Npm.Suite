import type * as React from 'react';

import type { DefaultProps } from '@mantine/core';

import type { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import type { IconName, IconPrefix } from '@fortawesome/fontawesome-common-types';

import type { IconStylesParams } from './Icon.styles';


/* --------
 * Icon Shorthand Prop Definition
 * -------- */
export type ShorthandIcon = IconName | IconProps;


/* --------
 * Icon Definitive Props Definition
 * -------- */
export interface IconProps extends StrictIconProps, DefaultProps<never, IconStylesParams>, React.AriaAttributes {

}


/* --------
 * Icon Strict Props
 * -------- */
export interface StrictIconProps extends IconStylesParams {
  /** ClassName to add to the component */
  className?: string;

  /** Set any other FontAwesome Icon Props */
  faProps?: FontAwesomeIconProps;

  /** Icon is restricted to Definition only */
  icon: IconName;

  /** Use a specific icon package */
  iconPrefix?: IconPrefix;

  /** Add a tooltip to icon */
  tooltip?: React.ReactNode;
}
