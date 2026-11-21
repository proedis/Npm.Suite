import * as React from 'react';

import { CollapsibleSection } from '@proedis/ui/actions/collapsible';


export default function Example(): React.ReactNode {
  return (
    <CollapsibleSection title={'Collection history'} meta={'3 entries'} className={'w-full max-w-lg'}>
      <ul className={'text-sm text-muted-foreground'}>
        <li>Monday 14 October, emptied at 06:42</li>
        <li>Thursday 10 October, emptied at 07:05</li>
        <li>Monday 7 October, skipped: access blocked</li>
      </ul>
    </CollapsibleSection>
  );
}
