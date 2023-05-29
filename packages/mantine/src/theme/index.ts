import type * as React from 'react';

import type {
  ColorShade,
  MantineThemeOverride,
  StandardColorName,
  ThemeColorName
} from '@mantine/core';

import { isValidString } from '@proedis/utils';

import type { RecursivePartial } from '@proedis/types';

import tinycolor from 'tinycolor2';

import { createColors, getColorInfo, getHexColor } from './colors';
import type { CreateColorsOptions } from './colors';

import { getThemeComponentsStyle } from './components';


/* --------
 * Internal Types
 * -------- */
interface ThemeFontsConfiguration {
  /** Use a custom font as principal UI font */
  customFontName?: string;

  /** Use a custom font as principal UI font on 'monospace' style */
  customFontNameMonospace?: string;

  /** LineHeight to use */
  lineHeight?: React.CSSProperties['lineHeight'];

  /** Define the weight for fonts */
  weights?: Partial<Record<'light' | 'normal' | 'medium' | 'bold', number>>;
}

interface ThemeConfiguration {
  /** Adjust and change colors */
  colors?: RecursivePartial<CreateColorsOptions> & {
    /** Set the default black color */
    black?: ThemeColorName;
    /** Set the default color shade */
    defaultShade?: ColorShade;
    /** Set the Primary Color to use */
    primary?: StandardColorName;
    /** Set the default white color */
    white?: ThemeColorName;
  };

  /** Add Components Style */
  components?: MantineThemeOverride['components'];

  /** Adjust fonts style */
  font?: ThemeFontsConfiguration;
}


/* --------
 * Mantine Theme Building
 * -------- */
export function createTheme(
  configuration?: ThemeConfiguration,
  configure?: (configuration: MantineThemeOverride) => void
): MantineThemeOverride {

  // ----
  // Configuration Destruct
  // ----
  const {
    colors,
    components,
    font
  } = configuration || {};


  // ----
  // Create the ThemeColors object using requested configuration
  // ----
  const themeColors = createColors({
    appearance: {
      brand  : 'blue',
      cloud  : 'neutral',
      primary: colors?.primary || 'blue',
      success: 'green',
      warning: 'orange',
      danger : 'red'
    },
    override  : colors?.override || {}
  });


  // ----
  // Compute Text Color
  // ----
  const whiteColor = getHexColor(themeColors, colors?.white || 'white.0');
  const blackColor = getHexColor(themeColors, colors?.black || 'gray.8');


  // ----
  // Build Default Theme
  // ----
  const defaultTheme: MantineThemeOverride = {
    // Determines whether elements that do not have pointer cursor by default
    // (checkboxes, radio, native select) should have it.
    // This options has been set true by default
    cursorType: 'pointer',


    // ----
    // Colors Definition
    // ----
    colors      : themeColors,
    white       : whiteColor,
    black       : blackColor,
    primaryColor: colors?.primary || 'blue',
    primaryShade: colors?.defaultShade || 5,


    // ----
    // Font Definition
    // ----
    fontFamily         : [
      font?.customFontName,
      '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji'
    ].filter(isValidString).join(', '),
    fontFamilyMonospace: [
      font?.customFontNameMonospace,
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace'
    ].filter(isValidString).join(', '),
    lineHeight         : font?.lineHeight,


    // ----
    // Sizes Definition
    // ----
    fontSizes: {
      xxs: '0.5rem',
      xs : '0.75rem',
      sm : '0.875rem',
      md : '1rem',
      lg : '1.25rem',
      xl : '1.5rem',
      xxl: '1.75rem'
    },

    spacing: {
      xxs: '0.25rem',
      xs : '0.5rem',
      sm : '0.75rem',
      md : '1rem',
      lg : '1.25rem',
      xl : '1.5rem',
      xxl: '1.75rem'
    },

    radius: {
      xxs: '0.125rem',
      xs : '0.25rem',
      sm : '0.5rem',
      md : '0.75rem',
      lg : '1rem',
      xl : '2rem',
      xxl: '3rem'
    },


    // ----
    // Shadow Definition
    // ----
    shadows: {
      xs : '0 1px 2px 0 rgb(0 0 0 / 0.05);',
      sm : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);',
      md : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);',
      lg : '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);',
      xl : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);',
      xxl: '0 25px 50px -12px rgb(0 0 0 / 0.25);'
    },


    // ----
    // Others
    // ----
    other: {
      /** Create Helpers */
      fn: {
        getColorInfo: (name) => getColorInfo(name, colors?.defaultShade),
        getHexColor : (color) => getHexColor(themeColors, color, colors?.defaultShade),
        getTextColor: (color, options) => (
          isValidString(color)
            ? tinycolor.mostReadable(
              getHexColor(themeColors, color, colors?.defaultShade),
              [ whiteColor, blackColor ],
              { includeFallbackColors: false, ...options }
            ).toHex()
            : undefined
        ),
        getTinyColor: (color) => tinycolor(getHexColor(themeColors, color, colors?.defaultShade))
      },

      /** Save user defined / default font weight */
      fontWeight: {
        light : font?.weights?.light ?? 300,
        normal: font?.weights?.light ?? 400,
        medium: font?.weights?.light ?? 600,
        bold  : font?.weights?.light ?? 700
      }
    },


    // ----
    // Create Components
    // ----
    components: getThemeComponentsStyle(components || {})

  };


  // ----
  // Pass the Default Theme to Configure Action
  // ----
  if (typeof configure === 'function') {
    configure(defaultTheme);
  }


  // ----
  // Object Return
  // ----
  return defaultTheme;

}
