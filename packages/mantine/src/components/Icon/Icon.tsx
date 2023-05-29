import * as React from 'react';

import { Box, useComponentDefaultProps } from '@mantine/core';

import { creatableComponent } from '@proedis/react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconName } from '@fortawesome/fontawesome-common-types';

import type { IconProps } from './Icon.types';

import useStyles from './Icon.styles';

import WithTooltip from '../WithTooltip';


/* --------
 * Component Render Definition
 * -------- */
const IconRender = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    // Strict Icon Props
    icon: userDefinedIconName,
    iconPrefix,
    className,
    tooltip,

    // Icon Style Params
    color,
    rounded,
    variant,

    // FontAwesome dedicated Props
    faProps,

    // Rest
    ...rest
  } = useComponentDefaultProps('Icon', {}, props);


  // ----
  // Internal Hooks
  // ----
  const { classes, cx } = useStyles(
    {
      color,
      rounded: !!rounded,
      variant: variant ?? 'default'
    },
    { name: 'Icon', variant }
  );


  // ----
  // Build the Icon to Render
  // ----
  const iconElement = (
    <Box component={'span'} className={cx(className, classes.root)} ref={ref} {...rest}>
      <FontAwesomeIcon
        {...faProps}
        icon={iconPrefix ? [ iconPrefix, userDefinedIconName ] : userDefinedIconName}
      />
    </Box>
  );


  // ----
  // Component Render
  // ----
  return (
    <WithTooltip
      content={iconElement}
      label={tooltip}
    />
  );

});

const Icon = creatableComponent(
  IconRender,
  (icon: IconName) => ({ icon })
);

Icon.displayName = 'Icon';

export default Icon;
