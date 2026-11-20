/* --------
 * Types Definition
 * -------- */

/**
 * One prop of a component, as the compiler reads it from the source of `@proedis/ui`. Produced at
 * build time by the props plugin, so the API tables cannot disagree with the types.
 */
export interface PropDoc {
  readonly name: string;

  /** The type as the source writes it: `ToneFill`, `Responsive<boolean>`, `React.ReactNode` */
  readonly type: string;

  /** The literal values behind the type, when it is a union of literals: what a reader can pass */
  readonly values?: readonly string[];

  /** From `@default`, or from the `Defaults to \`x\`` sentence of the JSDoc */
  readonly default?: string;

  readonly required: boolean;

  /** The JSDoc of the prop, markdown with inline code and bold only */
  readonly description: string;

  /** The interface or type that declares it, when it is not the documented one */
  readonly from?: string;

  /** One of the shared props of `BaseProps`, listed apart */
  readonly shared: boolean;
}
