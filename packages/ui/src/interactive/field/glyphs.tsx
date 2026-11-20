import * as React from 'react';

import { ToneGlyph } from '../tone-glyphs/toneGlyphs';


/**
 * The mark in front of an error message: a circle with an exclamation mark.
 *
 * The `destructive` mark of the tone glyphs, so an error looks the same in a field, a list and an
 * alert. It inherits the colour of the message.
 *
 * The box around it is one line tall (`h-lh`) and centres the icon in it, so the icon sits on the
 * first line of the message whatever the size of its text: a fixed top margin is right for one
 * line height only, and a theme that makes the message smaller would leave the icon below the text.
 */
export function ErrorGlyph(): React.ReactNode {
  return (
    <span data-slot={'field-error-icon-box'} className={'flex h-lh shrink-0 items-center'}>
      <ToneGlyph tone={'destructive'} slot={'field-error-icon'} className={'size-3.5'} />
    </span>
  );
}
