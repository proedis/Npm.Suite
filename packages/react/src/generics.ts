import type * as React from 'react';

import type { ShorthandContent } from './utils';


/* --------
 * Core UI Component Props
 * --
 * Define extensible type alias to easy defined component props for all UI component.
 * -------- */

/**
 * Any Component, which allow user to pass inner content.
 * @example
 * [file (Component).types.ts]
 *
 * export type (Component)Props = UIComponentProps<Strict(Component)Props, [OtherProps]>;
 *
 * export interface Strict(Component)Props {
 *   // Wonderful Props Here
 * }
 */
export type UIComponentProps<StrictProps extends {}, BaseProps extends {} = {}> =
  & StrictProps
  & Omit<CoreUIComponentProps, keyof StrictProps>
  & Omit<BaseProps, keyof StrictProps | keyof CoreUIComponentProps>;


/**
 * Any Component, without inner content.
 * @example
 * [file (Component).types.ts]
 *
 * export type (Component)Props = UIVoidComponentProps<Strict(Component)Props, [OtherProps]>;
 *
 * export interface Strict(Component)Props {
 *   // Wonderful Props Here
 * }
 */
export type UIVoidComponentProps<StrictProps extends {}, BaseProps extends {} = {}> =
  & StrictProps
  & Omit<CoreUIVoidComponentProps, keyof StrictProps>
  & Omit<BaseProps, keyof StrictProps | keyof CoreUIVoidComponentProps>;


/* --------
 * Base Component Props
 * --
 * Define easy to use starting props for any type of UI component
 * -------- */

/**
 * Any Component that will allow content inside will
 * expose original children property and an extra
 * content property usable as shorthand
 */
export interface CoreUIComponentProps extends CoreUIVoidComponentProps {
  /** User defined children, children always override shorthand content property value */
  children?: React.ReactNode;

  /** Shorthand content prop, if children are defined, content prop is omitted */
  content?: ShorthandContent;
}


/**
 * The base VoidComponent is starting with only base className string property
 */
export interface CoreUIVoidComponentProps {
  /** User defined className */
  className?: string;
}
