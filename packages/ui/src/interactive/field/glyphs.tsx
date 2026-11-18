import * as React from 'react';


/**
 * The mark in front of an error message.
 *
 * Drawn here, not imported: the package carries no icon library, for the same reason `Spinner`
 * exists. An octagon rather than a circle so that an error does not share its outline with an
 * informational note. It inherits the colour of the message.
 */
export function ErrorGlyph(): React.ReactNode {
  return (
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
      className={'mt-0.5 size-3.5 shrink-0'}
    >
      <path d={'M8 2h8l6 6v8l-6 6H8l-6-6V8z'} />
      <path d={'M12 7.5v5'} />
      <path d={'M12 16.5h.01'} />
    </svg>
  );
}
