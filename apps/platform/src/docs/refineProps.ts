import type { PropDoc } from './propDoc';


/* --------
 * Types Definition
 * -------- */

/** What a page adds to a generated row: what the compiler cannot read from the source */
export type PropRefinement = Partial<Pick<PropDoc, 'default' | 'description' | 'type'>>;


/* --------
 * Helpers
 * -------- */

/**
 * The type of a `cva` variant as the compiler spells it, `"sm" | "md" | null | undefined`, written
 * the way a reader passes it: `'sm' | 'md'`, and `boolean` for a boolean variant.
 */
function readableType(type: string): string {
  const cleaned = type
    .replace(/\s*\|\s*null\b/g, '')
    .replace(/\s*\|\s*undefined\b/g, '')
    .replace(/"([^"]*)"/g, '\'$1\'');

  return cleaned === 'false | true' || cleaned === 'true | false' ? 'boolean' : cleaned;
}

/**
 * The generated props of a type, with what the page knows and the compiler does not.
 *
 * A variant declared through `cva` has no type node and no JSDoc of its own, and its default lives
 * in `defaultVariants`, which is a value: the table would show no default and the compiler's spelling
 * of the type. The page states both, from the component's `DEFAULT_VARIANTS`.
 */
export function refineProps(
  props: readonly PropDoc[],
  refinements: Readonly<Record<string, PropRefinement>> = {}
): PropDoc[] {
  return props.map((prop) => {
    const type = readableType(prop.type);
    const values = prop.values && prop.values.join(' | ') !== type ? prop.values : undefined;

    return { ...prop, type, values, ...refinements[prop.name] };
  });
}
