/**
 * @proedis/ui/forms/field
 *
 * `Field`, what dresses every form control with its label, its messages and its status, and
 * `useFieldControl`, what a control reads from it. Runs on `@base-ui/react`, an optional peer of this package.
 */

export * from './Field';

export { useFieldControl } from './fieldContext';

export type { FieldControlState, FieldStatus } from './fieldContext';
