'use client';

import * as React from 'react';

import { cn } from '../../core/cn';

import { Tooltip } from '../tooltip/Tooltip';

import { Button } from './Button';

import type { TooltipSide } from '../tooltip/Tooltip';

import type { ButtonLoadingProps, ButtonProps } from './Button';


/* --------
 * Types Definition
 * -------- */

export interface StrictIconButtonProps {
  /**
   * The name of the button, required: it is both the accessible name and the text of its tooltip.
   * One prop for the two, so they cannot disagree and neither can be forgotten.
   */
  label: string;

  /** The icon, as a node */
  icon: React.ReactNode;

  /** A second line in the tooltip, normally why the button is disabled */
  description?: React.ReactNode;

  /** Where the tooltip prefers to open. Defaults to `top` */
  tooltipSide?: TooltipSide;
}

/**
 * `loading` and `loadingLabel` are taken out and put back as the union of `Button`: an `Omit` over that
 * union flattens it, and `loading` without `loadingLabel` compiled again.
 */
export type IconButtonProps = StrictIconButtonProps & ButtonLoadingProps & Omit<
  ButtonProps,
  'children' | 'leading' | 'trailing' | 'block' | 'aria-label' | 'loading' | 'loadingLabel'
>;


/* --------
 * Component Definition
 * -------- */

/**
 * A button with an icon and no text, square at the height of its size.
 *
 * ```tsx
 * <IconButton label={'Sign out'} icon={<LogOut />} />
 * ```
 *
 * The rule it exists to guarantee: **an icon-only control always has a tooltip**, saying what its
 * accessible name says. The icon keeps the interface free of redundant text, and the tooltip is the
 * price that makes that acceptable.
 *
 * Quiet by default (`plain muted`), the register of a toolbar or a row. Disabled, it stays focusable
 * (`aria-disabled`), so the tooltip still says what it is and, through `description`, why it is off.
 * Loading, the spinner takes the place of the icon and the tooltip stays.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    description,
    fill = 'plain',
    focusableWhenDisabled = true,
    icon,
    label,
    tone = 'muted',
    tooltipSide,
    ...rest
  } = props;


  // ----
  // Component Render
  // ----
  return (
    <Tooltip content={label} description={description} side={tooltipSide}>
      <Button
        {...(rest as ButtonProps)}
        ref={ref}
        data-icon-only
        aria-label={label}
        fill={fill}
        tone={tone}
        focusableWhenDisabled={focusableWhenDisabled}
        className={cn('aspect-square min-w-0 px-0', className)}
      >
        {icon}
      </Button>
    </Tooltip>
  );

});

IconButton.displayName = 'IconButton';
