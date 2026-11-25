import * as React from 'react';

import { Check, Copy } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';


/* --------
 * Constants Definition
 * -------- */

/** How long the tick stays after a copy */
const CONFIRMATION_MS = 1600;


/* --------
 * Component Definition
 * -------- */

/** Copies a piece of code, and says so for a moment */
export function CopyButton(props: { text: string }): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { text } = props;


  // ----
  // Internal State
  // ----
  const [ copied, setCopied ] = React.useState(false);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = window.setTimeout(() => setCopied(false), CONFIRMATION_MS);
    return () => window.clearTimeout(timer);
  }, [ copied ]);


  // ----
  // Handlers
  // ----
  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(text).then(() => setCopied(true), () => undefined);
  }, [ text ]);


  // ----
  // Component Render
  // ----
  return (
    <IconButton
      size={'sm'}
      label={copied ? 'Copied' : 'Copy code'}
      icon={copied ? <Check /> : <Copy />}
      onClick={handleCopy}
    />
  );

}

CopyButton.displayName = 'CopyButton';
