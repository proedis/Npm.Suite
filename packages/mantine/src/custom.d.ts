import '@mantine/core';

import type tinycolor from 'tinycolor2';
import type { Tuple } from '@mantine/core';


declare module '@mantine/core' {

  /** Color usable as shorthand for UI feedback and Style */
  export type AppearanceColorName =
    | 'brand'
    | 'cloud'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger';


  /** Color name, ported from Tailwind */
  export type StandardColorName =
    | 'slate'
    | 'gray'
    | 'zinc'
    | 'neutral'
    | 'stone'
    | 'red'
    | 'orange'
    | 'amber'
    | 'yellow'
    | 'lime'
    | 'green'
    | 'emerald'
    | 'teal'
    | 'cyan'
    | 'sky'
    | 'blue'
    | 'indigo'
    | 'violet'
    | 'purple'
    | 'fuchsia'
    | 'pink'
    | 'rose'
    | 'white';


  /**
   * Each color ha 10 variations: from lightest to darkest.
   * The shade will let the user choose the right variation of a color
   */
  export type ColorShade = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;


  /**
   * Each color defined into the theme object will have
   * multiple shade.
   * To define each single shade, an array of string must be used
   */
  export type ColorDefinition = Tuple<string, 10>;


  /**
   * Strict theme color is a type that allows only the definition
   * of a theme color without specifying the shade
   */
  export type StrictThemeColorName = AppearanceColorName | StandardColorName;


  /**
   * A theme color could be a strict color definition (like 'primary'),
   * or a string defining the color and the shade to use (like 'primary.3')
   */
  export type ThemeColorName = StrictThemeColorName | `${StrictThemeColorName}.${ColorShade}`;


  /** The complete object used to define each color shade */
  export type ThemeColors = Record<ThemeColorName, Tuple<string, 10>>;


  /** Override the Default Colors of Mantine to be usable with TypeScript */
  export interface MantineThemeColorsOverride {
    colors: ThemeColors;
  }


  /** User Defined 'other' props */
  export type UserDefinedThemeOther = {};


  /** Set of properties and function that will be attached to the 'theme' object */
  export interface MantineThemeOther extends UserDefinedThemeOther {
    /** Extra functions */
    fn: {
      /** Split color string into name and shade */
      getColorInfo: (name: ThemeColorName) => { colorName: StrictThemeColorName, shade: ColorShade };
      /** Get hex string for a color */
      getHexColor: (name: ThemeColorName) => string;
      /** Get the perfect fit text color for a given color */
      getTextColor: (baseColor?: ThemeColorName, options?: tinycolor.WCAG2Options) => string | undefined;
      /** Get the Hex of a Color using its name */
      getTinyColor: (name: ThemeColorName) => tinycolor.Instance;
    },

    /** Reusable font weight */
    fontWeight: Record<'light' | 'normal' | 'medium' | 'bold', number>;
  }

}
