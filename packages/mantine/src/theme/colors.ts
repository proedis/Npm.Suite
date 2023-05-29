import { isValidString } from '@proedis/utils';

import type {
  AppearanceColorName,
  ColorDefinition,
  ColorShade,
  StandardColorName,
  StrictThemeColorName,
  ThemeColorName
} from '@mantine/core';


/* --------
 * Definition of Standard UI Colors
 * --
 * Those colors have been ported directly from Tailwind UI
 * -------- */
const STANDARD_COLORS: Record<StandardColorName, ColorDefinition> = {
  slate  : [
    '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B', '#475569', '#334155', '#1E293B', '#0F172A'
  ],
  gray   : [
    '#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827'
  ],
  zinc   : [
    '#FAFAFA', '#F4F4F5', '#E4E4E7', '#D4D4D8', '#A1A1AA', '#71717A', '#52525B', '#3F3F46', '#27272A', '#18181B'
  ],
  neutral: [
    '#FAFAFA', '#F5F5F5', '#E5E5E5', '#D4D4D4', '#A3A3A3', '#737373', '#525252', '#404040', '#262626', '#171717'
  ],
  stone  : [
    '#FAFAF9', '#F5F5F4', '#E7E5E4', '#D6D3D1', '#A8A29E', '#78716C', '#57534E', '#44403C', '#292524', '#1C1917'
  ],
  red    : [
    '#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'
  ],
  orange : [
    '#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C', '#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12'
  ],
  amber  : [
    '#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'
  ],
  yellow : [
    '#FEFCE8', '#FEF9C3', '#FEF08A', '#FDE047', '#FACC15', '#EAB308', '#CA8A04', '#A16207', '#854D0E', '#713F12'
  ],
  lime   : [
    '#F7FEE7', '#ECFCCB', '#D9F99D', '#BEF264', '#A3E635', '#84CC16', '#65A30D', '#4D7C0F', '#3F6212', '#365314'
  ],
  green  : [
    '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D', '#166534', '#14532D'
  ],
  emerald: [
    '#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857', '#065F46', '#064E3B'
  ],
  teal   : [
    '#F0FDFA', '#CCFBF1', '#99F6E4', '#5EEAD4', '#2DD4BF', '#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A'
  ],
  cyan   : [
    '#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9', '#22D3EE', '#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63'
  ],
  sky    : [
    '#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7', '#0369A1', '#075985', '#0C4A6E'
  ],
  blue   : [
    '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'
  ],
  indigo : [
    '#EEF2FF', '#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81'
  ],
  violet : [
    '#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'
  ],
  purple : [
    '#FAF5FF', '#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC', '#A855F7', '#9333EA', '#7E22CE', '#6B21A8', '#581C87'
  ],
  fuchsia: [
    '#FDF4FF', '#FAE8FF', '#F5D0FE', '#F0ABFC', '#E879F9', '#D946EF', '#C026D3', '#A21CAF', '#86198F', '#701A75'
  ],
  pink   : [
    '#FDF2F8', '#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843'
  ],
  rose   : [
    '#FFF1F2', '#FFE4E6', '#FECDD3', '#FDA4AF', '#FB7185', '#F43F5E', '#E11D48', '#BE123C', '#9F1239', '#881337'
  ],
  white  : [
    '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'
  ]
};


/* --------
 * Internal Types
 * -------- */
export interface CreateColorsOptions {
  /** Define the Appearance Color map */
  appearance: Record<AppearanceColorName, StandardColorName>;

  /** Override color definition before create the complete map */
  override: Partial<Record<StandardColorName, StandardColorName | ColorDefinition>>;
}


/* --------
 * Utility Export
 * -------- */

/**
 * Merge all options and create the standard default colors that will be
 * used in the User Interface.
 * @param options
 */
export function createColors(options: CreateColorsOptions): Record<StrictThemeColorName, ColorDefinition> {

  // ----
  // Options Destruct
  // ----
  const {
    appearance,
    override
  } = options;


  // ----
  // Create the Standard Object, using value from 'override'
  // ----
  const standardColors: Record<StandardColorName, ColorDefinition> = {
    ...STANDARD_COLORS,
    ...(Object.keys(override) as StandardColorName[]).reduce((overriddenColors, colorName) => {
      /** Get value from the override object */
      const value = override[colorName];
      /** If the value is an array, and the length is exactly 10 items, use as is */
      if (Array.isArray(value) && value.length === 10) {
        overriddenColors[colorName] = value;
      }
      /** If the value is a string, and exists in standard color, extract it */
      else if (typeof value === 'string' && value in STANDARD_COLORS) {
        overriddenColors[colorName] = STANDARD_COLORS[value];
      }
      /** Else, throw an error */
      else {
        throw new Error(
          `Invalid color override value for ${colorName}. ` +
          `Only an Array of 10 elements could be provided, or ${Object.keys(STANDARD_COLORS).join(', ')}. ` +
          `Received '${value}'`
        );
      }
      /** Return the new object */
      return overriddenColors;
    }, {} as Partial<Record<StandardColorName, ColorDefinition>>)
  };


  // ----
  // Create the Appearance Color Object
  // ----
  const appearanceColors: Record<AppearanceColorName, ColorDefinition> = (
    (Object.keys(appearance) as AppearanceColorName[]).reduce((appearanceColor, colorName) => {
      /** Get the value from the appearance object */
      const value = appearance[colorName];
      /** If the value is an array, and the length is exactly 10 items, use as is */
      if (isValidString(value) && value in standardColors) {
        appearanceColor[colorName] = standardColors[value];
      }
      /** Else, throw an error */
      else {
        throw new Error(
          `Invalid appearance color value for ${colorName}. ` +
          `Only an Array of 10 elements could be provided, or ${Object.keys(standardColors).join(', ')}. ` +
          `Received '${value}'`
        );
      }
      return appearanceColor;
    }, {} as Partial<Record<AppearanceColorName, ColorDefinition>>) as Record<AppearanceColorName, ColorDefinition>
  );


  // ----
  // Create and return Complete Color Object
  // ----
  return { ...standardColors, ...appearanceColors };

}


/**
 * Split a color string into real color name and its shade
 * @param color
 * @param defaultShade
 */
export function getColorInfo(
  color: ThemeColorName,
  defaultShade: number = 5
): { colorName: StrictThemeColorName, shade: ColorShade } {
  /** Split the requested color to divide the color name and the requested shade */
  const [ colorName, _requestedShade ] = color.split('.');

  /** Get the shade and clamp value */
  let colorShade = !!_requestedShade ? parseInt(_requestedShade, 10) : defaultShade;
  colorShade = Math.min(Math.max(colorShade, 0), 10);

  /** Return color info */
  return {
    colorName: colorName as StrictThemeColorName,
    shade    : colorShade as ColorShade
  };
}


/**
 * From a starting colors pool, get the hex color string of a requested color.
 * The requested color could be strict color name of a color with the shade defined.
 * If no shade has been defined, return the default shade
 * @param pool The pool of colors from which requested color will be extracted
 * @param color The requested color, like 'primary' or 'blue.3'
 * @param defaultShade The default shade to use if not defined
 */
export function getHexColor(
  pool: Record<StrictThemeColorName, ColorDefinition>,
  color: ThemeColorName,
  defaultShade: number = 5
): string {
  /** Get color info */
  const { colorName, shade } = getColorInfo(color, defaultShade);

  /** Return the hex color from the pool */
  return pool[colorName][shade];
}
