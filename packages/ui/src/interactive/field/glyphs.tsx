import * as React from 'react';


/**
 * The mark in front of an error message: a circle with an exclamation mark.
 *
 * Drawn here, not imported: the package carries no icon library, for the same reason `Spinner`
 * exists. It inherits the colour of the message.
 *
 * The box around it is one line tall (`h-lh`) and centres the icon in it, so the icon sits on the
 * first line of the message whatever the size of its text: a fixed top margin is right for one
 * line height only, and a theme that makes the message smaller would leave the icon below the text.
 */
export function ErrorGlyph(): React.ReactNode {
  return (
    <span data-slot={'field-error-icon-box'} className={'flex h-lh shrink-0 items-center'}>
      <svg
        data-slot={'field-error-icon'}
        viewBox={'0 0 24 24'}
        fill={'none'}
        stroke={'currentColor'}
        strokeWidth={2}
        strokeLinecap={'round'}
        strokeLinejoin={'round'}
        aria-hidden={'true'}
        focusable={'false'}
        className={'size-3.5'}
      >
        <path d={'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z'} />
        <path d={'M12 8v4'} />
        <path d={'M12 16h.01'} />
      </svg>
    </span>
  );
}
