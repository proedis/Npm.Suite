/**
 * @proedis/ui/interactive/field
 *
 * `Field` and its parts, what dresses every form control, and `useFieldControl`, what a control reads
 * from it. Runs on `@base-ui/react`, an optional peer of this package.
 */

export * from './Field';

export { useFieldControl } from './fieldContext';

export type { FieldControlState } from './fieldContext';
