import React from 'react';

import { Button as MantineButton } from '@mantine/core';

import { creatableComponent, renderShorthandContent } from '@proedis/react';

import Icon from '../Icon';
import WithTooltip from '../WithTooltip';

import type { ButtonProps } from './Button.types';


/* --------
 * Component Render Definition
 * -------- */
const ButtonRender = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    content,

    icon,
    rightIcon,

    tooltip,

    className,

    ...restButtonProps
  } = props;


  // ----
  // Memoized Component
  // ----
  const iconElement = React.useMemo(
    () => Icon.create(icon as any, { autoGenerateKey: false }),
    [ icon ]
  );

  const rightIconElement = React.useMemo(
    () => Icon.create(rightIcon as any, { autoGenerateKey: false }),
    [ rightIcon ]
  );


  // ----
  // Component Render
  // ----
  return (
    <WithTooltip
      label={tooltip}
      content={(
        <MantineButton
          {...restButtonProps}
          ref={ref}
          leftIcon={iconElement}
          rightIcon={rightIconElement}
        >
          {renderShorthandContent({ children, content })}
        </MantineButton>
      )}
    />
  );

});

const Button = creatableComponent(
  ButtonRender,
  (content: React.ReactNode) => ({ content })
);


Button.displayName = 'Button';

export default Button;
