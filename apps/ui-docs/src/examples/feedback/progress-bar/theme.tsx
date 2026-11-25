import * as React from 'react';

import { ProgressBar } from '@proedis/ui/feedback/progress-bar';


/** In an application these are plain CSS in :root, after the import; here on one bar only */
const THEME = {
  '--progress-radius': 'var(--radius-xs)',
  '--progress-track' : 'var(--color-primary-soft)'
} as React.CSSProperties;


export default function Example(): React.ReactNode {
  return (
    <ProgressBar label={'Square, on the soft of the brand'} value={72} size={'lg'} style={THEME} className={'max-w-md'} />
  );
}
