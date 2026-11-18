import * as React from 'react';


/* --------
 * Glyphs
 * -------- */

/*
 * The four marks the text controls need, drawn here: the package imports no icon library. Stroked in
 * the current colour on a 24 grid, sized by the control that holds them.
 */

interface GlyphProps {
  children: React.ReactNode;
}

function Glyph(props: GlyphProps): React.ReactNode {
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
    >
      {props.children}
    </svg>
  );
}


export function EyeGlyph(): React.ReactNode {
  return (
    <Glyph>
      <path d={'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z'} />
      <circle cx={12} cy={12} r={3} />
    </Glyph>
  );
}


export function EyeOffGlyph(): React.ReactNode {
  return (
    <Glyph>
      <path d={'M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.1'} />
      <path d={'M6.6 6.6C3.7 8.5 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6'} />
      <path d={'M9.9 9.9a3 3 0 0 0 4.2 4.2'} />
      <path d={'M2 2l20 20'} />
    </Glyph>
  );
}


export function SearchGlyph(): React.ReactNode {
  return (
    <Glyph>
      <circle cx={11} cy={11} r={7} />
      <path d={'M20 20l-3.5-3.5'} />
    </Glyph>
  );
}


export function ClearGlyph(): React.ReactNode {
  return (
    <Glyph>
      <path d={'M18 6L6 18'} />
      <path d={'M6 6l12 12'} />
    </Glyph>
  );
}
