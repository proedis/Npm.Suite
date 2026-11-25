'use client';

import * as React from 'react';


/**
 * Closes a floating layer when its control leaves the view. Hidden only, a popover with the focus
 * inside would be a trap nobody sees, and a menu would point at nothing. Mounted inside a Base UI
 * positioner's `render`, which knows `anchorHidden`.
 */
export function CloseWhenAnchorHidden(props: { hidden: boolean; onHidden: () => void }): null {
  const { hidden, onHidden } = props;

  React.useEffect(() => {
    if (hidden) {
      onHidden();
    }
  }, [ hidden, onHidden ]);

  return null;
}
