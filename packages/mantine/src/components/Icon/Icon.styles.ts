import { createStyles } from '@mantine/core';
import type { MantineColor, MantineTheme, CSSObject } from '@mantine/core';


/* --------
 * Variants Definition
 * -------- */
export type IconVariant = 'default' | 'filled' | 'light';


/* --------
 * Styles Params
 * -------- */
export interface IconStylesParams {
  /** Change the Color of the Icon */
  color?: MantineColor;

  /** When rendered as filled or light, set max border radius */
  rounded?: boolean;

  /** Change the icon variant style */
  variant?: IconVariant;
}


/* --------
 * Utilities
 * -------- */
function getVariantStyle(
  theme: MantineTheme,
  { color, rounded, variant }: IconStylesParams
): CSSObject {
  /** If default variant has been choosen return as plain icon */
  if (variant === 'filled' || variant === 'light') {
    /** AutoSet default color if not present */
    const iconColor = color === undefined ? 'primary' : color;
    /** Get the color */
    const colors = theme.fn.variant({ variant, color: iconColor });

    /** Return the style */
    return {
      display       : 'inline-flex',
      justifyContent: 'center',
      alignItems    : 'center',
      width         : '2.25em',
      height        : '2.25em',
      borderRadius  : rounded ? '500rem' : '.25em',
      ...colors,
      color: variant === 'filled' ? theme.other.fn.getTextColor(iconColor) : colors.color
    };
  }

  /** Return default variant style */
  return {
    display  : 'inline-block',
    textAlign: 'center',
    width    : '1.5em',
    color    : color ? theme.fn.themeColor(color) : 'inherit'
  };
}


/* --------
 * Styles Definition
 * -------- */
export default createStyles((theme, params: IconStylesParams) => {

  const variantStyle = getVariantStyle(theme, params);

  return {

    root: {
      position: 'relative',

      textDecoration     : 'inherit',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      backfaceVisibility : 'hidden',

      lineHeight: 'inherit',
      fontSize  : 'inherit',

      ...variantStyle
    }

  };

});
