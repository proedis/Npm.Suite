import deepmerge from 'deepmerge';

import type {
  ActionIconStylesParams, ButtonStylesParams
} from '@mantine/core';

import type { CSSObject, MantineTheme, ContextStylesParams } from '@mantine/styles';
import type { MantineThemeComponents } from '@mantine/styles/lib/theme/types/MantineTheme';


/* --------
 * Internal Types
 * -------- */
type ComponentDefaultProps = Record<string, any> | ((theme: MantineTheme) => Record<string, any>);

type ComponentStyle<Params = any> =
  | Record<string, CSSObject>
  | ((theme: MantineTheme, params: Params, context: ContextStylesParams) => Record<string, CSSObject>);

interface ThemeComponent<Params = any> {
  defaultProps?: ComponentDefaultProps;

  styles?: ComponentStyle<Params>;
}


/* --------
 * Helpers
 * -------- */
function mergeStyle<Params>(
  userDefined: ThemeComponent<Params> | undefined,
  defaultDefined: ComponentStyle<Params> | undefined
): ComponentStyle<Params> {
  return (theme, params, context) => {
    /** Create user defined style */
    const userDefinedStyle = typeof userDefined?.styles === 'function'
      ? userDefined.styles(theme, params, context)
      : (userDefined?.styles || {});
    /** Create the default defined style */
    const defaultDefinedStyle = typeof defaultDefined === 'function'
      ? defaultDefined(theme, params, context)
      : (defaultDefined || {});
    /** Return a deep merge between default and user defined */
    return deepmerge<Record<string, CSSObject>>(defaultDefinedStyle, userDefinedStyle);
  };
}

function getDefaultProps(component: ThemeComponent | undefined, theme: MantineTheme): Record<string, any> {
  return typeof component?.defaultProps === 'function'
    ? component.defaultProps(theme)
    : (component?.defaultProps || {});
}


/* --------
 * Utility Export
 * -------- */
export function getThemeComponentsStyle(userDefined: MantineThemeComponents): MantineThemeComponents {
  return {

    // ----
    // ActionIcon Style
    // ----
    ActionIcon: {
      ...userDefined.ActionIcon,
      styles: mergeStyle<ActionIconStylesParams>(userDefined.ActionIcon, (theme, params, context) => ({
        root: {
          color: context.variant === 'filled'
            ? theme.other.fn.getTextColor(params.color || getDefaultProps(userDefined.ActionIcon, theme).color)
            : undefined
        }
      }))
    },


    // ----
    // Button Style
    // ----
    Button: {
      ...userDefined.Button,
      styles: mergeStyle<ButtonStylesParams>(userDefined.Button, (theme, params, context) => ({
        root: {
          color: context.variant === 'filled'
            ? theme.other.fn.getTextColor(params.color || getDefaultProps(userDefined.ActionIcon, theme).color)
            : undefined
        }
      }))
    }

  };
}
