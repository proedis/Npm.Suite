/*
 * What the layout primitives report about themselves, and when. Private to the section: not in the
 * barrel of `layout`.
 */


/* --------
 * Helpers
 * -------- */

/**
 * The `data-*` a layout primitive reports, written only when it renders as itself.
 *
 * A component built on a primitive names its part with a `data-slot` of its own (`button`,
 * `alert-body`), and from then on the element is that part: its surface is the component's slots and
 * variants. The primitive's `data-mode`, `data-inline` or `data-wrap` used to ride along on every such
 * part, an internal detail of how it is laid out that read like a contract, and that a stylesheet
 * could start relying on. A component that has an attribute of the same name with its own meaning
 * (the `data-mode` of DatePicker and Drawer) passes it, and it reaches the DOM through its props.
 */
export function layoutAttributes<T extends object>(props: object, attributes: T): T | Record<string, never> {
  return typeof (props as Record<string, unknown>)['data-slot'] === 'string' ? {} : attributes;
}
