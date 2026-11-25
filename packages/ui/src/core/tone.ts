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


/* --------
 * Constants Definition
 * -------- */

/** How a tone is painted: the surface carries it, a tenth of it, or nothing at all */
export type ToneFill = 'solid' | 'soft' | 'plain';


/**
 * What a tone looks like at each fill, in **one** place.
 *
 * Every component that offers `fill × tone` reads this table, which is the difference between a
 * `success` badge and a `success` icon box looking related and looking nearly the same. Two
 * hand-written 21-row tables is the shape of the problem this package exists to prevent.
 *
 * The classes are literal strings in a file the Tailwind scanner reads, so nothing here needs a
 * safelist entry — a component builds its variants **from** this table rather than interpolating
 * class names at runtime.
 *
 * The soft and plain rows read the `{tone}-soft` / `{tone}-soft-foreground` tokens of `theme.css`.
 * With nothing declared they resolve to what these rows used to write by hand (a tenth of the tone,
 * the tone as ink), so a product that has no soft palette sees no change; one that has it declares
 * fourteen variables and every badge, icon box and button follows.
 *
 * The one exception in the plain row is `destructive`, which writes with the tone itself: an error,
 * a destructive action and the border of an invalid field are one red, and the soft ink of the
 * destructive pair is darker, made to sit on its tinted fill, not on a white surface.
 *
 * ⚠️ Two of the seven tones are **surfaces**, not accents. `muted` and `secondary` are already the
 * quiet register, so the default of their `soft` is their own surface at half strength: a tenth of a
 * near-white is invisible. That exception lives in the token defaults now, not in this table.
 *
 * ⚠️ `muted` writes with the standard ink (`text-foreground`) on its solid and soft fills (Marco,
 * 2026-11-25): grey on grey read as a disabled control. It is the neutral tone of the package, the one a
 * secondary action takes; `primary` and `secondary` are the application's own. Its plain row keeps the
 * quiet ink, since a plain button has no surface to carry it and the standard ink would weigh it.
 */
export const TONE_CLASSES: Readonly<Record<ToneFill, Readonly<Record<Tone, string>>>> = {
  solid: {
    muted      : 'bg-muted text-foreground',
    secondary  : 'bg-secondary text-secondary-foreground',
    primary    : 'bg-primary text-primary-foreground',
    success    : 'bg-success text-success-foreground',
    warning    : 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    info       : 'bg-info text-info-foreground'
  },

  soft: {
    muted      : 'bg-muted-soft text-foreground',
    secondary  : 'bg-secondary-soft text-secondary-soft-foreground',
    primary    : 'bg-primary-soft text-primary-soft-foreground',
    success    : 'bg-success-soft text-success-soft-foreground',
    warning    : 'bg-warning-soft text-warning-soft-foreground',
    destructive: 'bg-destructive-soft text-destructive-soft-foreground',
    info       : 'bg-info-soft text-info-soft-foreground'
  },

  plain: {
    muted      : 'text-muted-soft-foreground',
    secondary  : 'text-secondary-soft-foreground',
    primary    : 'text-primary-soft-foreground',
    success    : 'text-success-soft-foreground',
    warning    : 'text-warning-soft-foreground',
    destructive: 'text-destructive',
    info       : 'text-info-soft-foreground'
  }
};


/** The tone vocabulary as a list, for a component that has to enumerate it */
export const TONES: readonly Tone[] = [
  'muted', 'secondary', 'primary', 'success', 'warning', 'destructive', 'info'
];


/** Every `fill × tone` pair, ready for a `cva` compound variant list */
export const TONE_COMPOUNDS: readonly { class: string; fill: ToneFill; tone: Tone }[] =
  (Object.keys(TONE_CLASSES) as ToneFill[]).flatMap((fill) => (
    TONES.map((tone) => ({ class: TONE_CLASSES[fill][tone], fill, tone }))
  ));
