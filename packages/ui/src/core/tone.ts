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
 * ⚠️ Two of the seven tones are **surfaces**, not accents. `muted` and `secondary` are already the
 * quiet register, so their `soft` is their own surface at half strength: a tenth of a near-white is
 * invisible. That exception is the reason this is a table and not a formula.
 */
export const TONE_CLASSES: Readonly<Record<ToneFill, Readonly<Record<Tone, string>>>> = {
  solid: {
    muted      : 'bg-muted text-muted-foreground',
    secondary  : 'bg-secondary text-secondary-foreground',
    primary    : 'bg-primary text-primary-foreground',
    success    : 'bg-success text-success-foreground',
    warning    : 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    info       : 'bg-info text-info-foreground'
  },

  soft: {
    muted      : 'bg-muted/50 text-muted-foreground',
    secondary  : 'bg-secondary/50 text-secondary-foreground',
    primary    : 'bg-primary/10 text-primary',
    success    : 'bg-success/10 text-success',
    warning    : 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    info       : 'bg-info/10 text-info'
  },

  plain: {
    muted      : 'text-muted-foreground',
    secondary  : 'text-secondary-foreground',
    primary    : 'text-primary',
    success    : 'text-success',
    warning    : 'text-warning',
    destructive: 'text-destructive',
    info       : 'text-info'
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
