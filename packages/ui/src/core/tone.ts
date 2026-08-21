/* --------
 * Types Definition
 * -------- */

/**
 * The semantic tones of the interface, named once.
 *
 * This is a vocabulary, not a palette: each name maps to a token pair declared in `theme.css`
 * (`--primary` / `--primary-foreground` and so on), and every component that offers a tone offers
 * **these** seven. It lives in `core` because it is a type with no JSX behind it, and it lives at all
 * because the alternative is measurable: in one frontend the same tone is called `danger` by its
 * Surface, `error` by its IconBox, and `destructive` by the token all three read.
 *
 * The names follow the tokens, deliberately. `destructive` rather than `danger` or `error`, `muted`
 * rather than `neutral` or `default`: when a component's prop and the CSS variable behind it share a
 * name, nobody has to hold a translation table in their head.
 *
 * ⚠️ Two of the seven are **surfaces**, not accents. `muted` and `secondary` are already the quiet
 * register, so a component that tints its tone (a tenth of the colour behind the colour) has to treat
 * them as an exception — a tenth of a near-white is invisible. `IconBox` shows the shape of that
 * exception; anything else offering a tinted fill owes the same two rows.
 */
export type Tone = 'muted' | 'secondary' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
