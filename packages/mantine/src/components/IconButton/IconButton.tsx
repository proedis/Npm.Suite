import React from 'react';

import { ActionIcon as MantineActionIcon, createStyles, useComponentDefaultProps } from '@mantine/core';
import type { MantineColor } from '@mantine/core';

import { useHover, useMergedRef } from '@mantine/hooks';

import { creatableComponent } from '@proedis/react';

import type { IconName } from '@fortawesome/fontawesome-common-types';

import Icon from '../Icon';
import WithTooltip from '../WithTooltip';

import type { IconButtonProps } from './IconButton.types';


/* --------
 * Style Definition
 * -------- */
const useStyles = createStyles((theme) => ({

  fab: {
    boxShadow: theme.shadows.sm,

    '&:hover': theme.fn.hover({
      boxShadow: theme.shadows.lg
    })
  }

}));


/* --------
 * Default Props
 * -------- */
const defaultProps: Partial<IconButtonProps> = {
  idleColor: 'cloud.2',
  size     : 'lg',
  variant  : 'filled'
};


/* --------
* Component Definition
* -------- */
const IconButtonBase = React.forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {

  // ----
  // Props Destruct
  // ----
  const {
    // @ts-ignore
    icon,
    tooltip,

    className,
    fab,
    idleColor,

    color      : userDefinedColor,
    radius     : userDefinedRadius,
    size       : userDefinedSize,
    staticColor: userDefinedStaticColor,

    onMouseEnter: userDefinedOnMouseEnter,
    onMouseLeave: userDefinedOnMouseLeave,

    ...restButtonProps
  } = useComponentDefaultProps('IconButton', defaultProps, props);


  // ----
  // Compute auto properties
  // ----
  const color = userDefinedColor ?? (fab ? 'primary' : undefined);
  const radius = fab ? 'xl' : userDefinedRadius;
  const size = fab ? 'xl' : userDefinedSize;
  const staticColor = userDefinedStaticColor ?? !!fab;


  // ----
  // Internal Hook
  // ----
  const { classes, cx, theme } = useStyles(
    undefined,
    { name: 'IconButton' }
  );

  const { hovered, ref: hoverRef } = useHover<HTMLButtonElement>();
  const mergedRef = useMergedRef(hoverRef, ref);


  // ----
  // Memoized Data
  // ----
  const computedElementColor: MantineColor | undefined = (() => {
    /** If variant is not 'filled', or staticColor strategy has been choosen return the color */
    if (restButtonProps.variant !== 'filled' || staticColor || color === idleColor) {
      return color;
    }

    /** If the element is not hovered, or color is not defined, return the idleColor */
    if (!hovered || !color) {
      return idleColor;
    }

    /** Return color changed if hovered */
    const colorInfo = theme.other.fn.getColorInfo(color);

    /** Must return a step lower shade, because hovering the item will increase the shade by 1 step */
    return `${colorInfo.colorName}.${Math.max(0, colorInfo.shade - 1)}` as MantineColor;
  })();


  // ----
  // Memoized Component
  // ----
  const iconElement = React.useMemo(
    () => Icon.create(icon, {
      autoGenerateKey: false,
      defaultProps   : {
        color: restButtonProps.variant === 'filled' && !staticColor && hovered
          ? 'cloud.0'
          : undefined,
        fz   : fab ? 'lg' : undefined
      }
    }),
    [ hovered, icon, restButtonProps.variant, staticColor, fab ]
  );


  // ----
  // Class Computing
  // ----
  const actionIconClasses = cx(className, fab && classes.fab);


  // ----
  // Component Render
  // ----
  return (
    <WithTooltip
      label={tooltip}
      content={(
        <MantineActionIcon
          {...restButtonProps}
          ref={mergedRef}
          color={computedElementColor}
          radius={radius}
          size={size}
          className={actionIconClasses}
        >
          {iconElement}
        </MantineActionIcon>
      )}
    />
  );

});


/* --------
* Creatable Component
* -------- */
const IconButton = creatableComponent(
  IconButtonBase,
  (icon: IconName) => ({ icon })
);


IconButton.displayName = 'IconButton';

export default IconButton;
