/* --------
 * Types Definition
 * -------- */

/**
 * The sizes of a control: every component a user types into, picks from or presses.
 *
 * One union for all of them, and it carries a rule rather than a list of names: **two controls of the
 * same size have the same height**, whatever they are. A `TextInput`, a `Select`, a `Button`, an
 * `IconButton`, a `Toggle` and a `SegmentedControl` at `md`, side by side in a row, line up on both
 * edges. The height of each size is one variable of the stylesheet (`--spacing-control-md`), read by
 * every one of them through the same class, so a theme that retunes it moves them all together, and
 * under a finger they grow together.
 *
 * Inside the package the height of a control is written in one place only, `CONTROL_HEIGHT`; the lint
 * of the repository rejects an `h-control-*` written anywhere else.
 */
export type ControlSize = 'sm' | 'md' | 'lg';
