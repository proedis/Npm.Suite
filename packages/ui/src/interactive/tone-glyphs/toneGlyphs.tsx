import * as React from 'react';


/*
 * The four marks of a tone, drawn here for the same reason `Spinner` exists: the package carries no
 * icon library. The shapes are the ones the design systems agree on: a circle with an i, a circle
 * with a check, a triangle, and the octagon of every error (never a circle: the two would share an
 * outline and a luminance). They inherit the colour of where they sit.
 */


/* --------
 * Types Definition
 * -------- */

export type ToneGlyphTone = 'info' | 'success' | 'warning' | 'destructive';


/* --------
 * Constants Definition
 * -------- */

const PATHS: Readonly<Record<ToneGlyphTone, readonly string[]>> = {
  info       : [ 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 16v-4', 'M12 8h.01' ],
  success    : [ 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'm9 12 2 2 4-4' ],
  warning    : [ 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01' ],
  destructive: [ 'M8 2h8l6 6v8l-6 6H8l-6-6V8z', 'M12 7.5v5', 'M12 16.5h.01' ]
};


/* --------
 * Component Definition
 * -------- */

export function ToneGlyph(props: { tone: ToneGlyphTone; className?: string }): React.ReactNode {
  const { className, tone } = props;

  return (
    <svg
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={className}
    >
      {PATHS[tone].map((path) => <path key={path} d={path} />)}
    </svg>
  );
}
