/* --------
 * Types Definition
 * -------- */

/** What a variable of the theme is about, which is also the order the tables list them in */
export type ThemeVariableGroup = 'Default' | 'Spacing' | 'Size' | 'Typography' | 'Shape' | 'Colour' | 'Layer';


/**
 * One variable of the theme a component reads, worked out by the theme plugin from the classes its
 * modules write and the two stylesheets of the package.
 */
export interface ThemeVariable {
  readonly variable: string;

  readonly group: ThemeVariableGroup;

  /** The classes or uses it was found through, at most four */
  readonly via: readonly string[];

  /** The value with no theme of its own, in light mode; a fallback when the stylesheet declares none */
  readonly default?: string;

  /** The value under `.dark`, when it differs */
  readonly dark?: string;

  /** For `virtual:ui-theme/all` only: the pages of the components that read it */
  readonly pages?: readonly string[];
}


/** The answer of `virtual:ui-theme/<route>` */
export interface ThemeDoc {
  readonly route: string;
  readonly variables: readonly ThemeVariable[];
}
