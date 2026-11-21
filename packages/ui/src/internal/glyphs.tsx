import * as React from 'react';

import { cn } from '../core/cn';

import { Stack } from '../layout/Stack';


/*
 * Every mark more than one component draws, in one place: the package carries no icon library, for
 * the same reason `Spinner` exists. Stroked in the current colour, so each one takes the colour of
 * where it sits, and sized by the component that holds it. A mark one component alone draws stays
 * with that component.
 */


/* --------
 * Types Definition
 * -------- */

export type ToneGlyphTone = 'info' | 'success' | 'warning' | 'destructive';

interface StrokeProps {
  children: React.ReactNode;
}

interface MarkProps {
  className?: string;
}


/* --------
 * Constants Definition
 * -------- */

/**
 * The four marks of a tone, as the design systems agree on them: a circle with an i, a circle with
 * a check, a triangle, and a circle with an exclamation mark for every error. Info and error share
 * the outline and differ by the mark inside and by the colour, which is never the only cue: a toast
 * and an alert say their tone in words too
 */
const TONE_PATHS: Readonly<Record<ToneGlyphTone, readonly string[]>> = {
  info       : [ 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 16v-4', 'M12 8h.01' ],
  success    : [ 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'm9 12 2 2 4-4' ],
  warning    : [ 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01' ],
  destructive: [ 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 8v4', 'M12 16h.01' ]
};


/* --------
 * Glyphs
 * -------- */

/** A 24 grid, a stroke of 2: the drawing every mark of a control shares */
function Stroke(props: StrokeProps): React.ReactNode {
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


/** The eye of a password shown */
export function EyeGlyph(): React.ReactNode {
  return (
    <Stroke>
      <path d={'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z'} />
      <circle cx={12} cy={12} r={3} />
    </Stroke>
  );
}


/** The eye of a password hidden */
export function EyeOffGlyph(): React.ReactNode {
  return (
    <Stroke>
      <path d={'M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.1'} />
      <path d={'M6.6 6.6C3.7 8.5 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6'} />
      <path d={'M9.9 9.9a3 3 0 0 0 4.2 4.2'} />
      <path d={'M2 2l20 20'} />
    </Stroke>
  );
}


/** The lens of a search */
export function SearchGlyph(): React.ReactNode {
  return (
    <Stroke>
      <circle cx={11} cy={11} r={7} />
      <path d={'M20 20l-3.5-3.5'} />
    </Stroke>
  );
}


/** The x that empties, closes or removes */
export function ClearGlyph(): React.ReactNode {
  return (
    <Stroke>
      <path d={'M18 6L6 18'} />
      <path d={'M6 6l12 12'} />
    </Stroke>
  );
}


/** The mark of a tone, with the slot of the part it is when it is one */
export function ToneGlyph(props: { tone: ToneGlyphTone; className?: string; slot?: string }): React.ReactNode {
  const { className, slot, tone } = props;

  return (
    <svg
      data-slot={slot}
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
      {TONE_PATHS[tone].map((path) => <path key={path} d={path} />)}
    </svg>
  );
}


/**
 * The mark in front of an error message: the `destructive` mark of a tone, so an error looks the
 * same in a field, a list and an alert. It inherits the colour of the message.
 *
 * The box around it is one line tall (`h-lh`) and centres the icon in it, so the icon sits on the
 * first line of the message whatever the size of its text: a fixed top margin is right for one
 * line height only, and a theme that makes the message smaller would leave the icon below the text.
 */
export function ErrorGlyph(): React.ReactNode {
  return (
    <Stack gap={0} as={'span'} data-slot={'field-error-icon-box'} direction={'horizontal'} align={'center'} className={'h-lh shrink-0'}>
      <ToneGlyph tone={'destructive'} slot={'field-error-icon'} className={'size-3.5'} />
    </Stack>
  );
}


/** The tick of a checked box or a chosen option, a stroke of 2 on a grid of 12 */
export function CheckGlyph(props: MarkProps): React.ReactNode {
  return (
    <svg
      viewBox={'0 0 12 12'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={cn('size-3', props.className)}
    >
      <path d={'M2.5 6.25l2.25 2.25 4.75-5'} />
    </svg>
  );
}


/** The dash of a partial box: the same weight as the tick, only the mark changes */
export function DashGlyph(props: MarkProps): React.ReactNode {
  return (
    <svg
      viewBox={'0 0 12 12'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={cn('size-3', props.className)}
    >
      <path d={'M3 6h6'} />
    </svg>
  );
}
