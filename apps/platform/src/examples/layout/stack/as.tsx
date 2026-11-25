import * as React from 'react';

import { Stack } from '@proedis/ui/layout';


const SECTIONS = [ 'Vehicles', 'Drivers', 'Rounds', 'Depots' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={0} as={'nav'} aria-label={'Fleet'} className={'w-full max-w-xs'}>
      <Stack as={'ul'} gap={1}>
        {SECTIONS.map((section) => (
          <li key={section}>
            <Stack
              gap={0}
              as={'a'}
              href={`#${section.toLowerCase()}`}
              direction={'horizontal'}
              justify={'between'}
              className={'rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted'}
            >
              {section}
              <span aria-hidden className={'text-muted-foreground'}>→</span>
            </Stack>
          </li>
        ))}
      </Stack>
    </Stack>
  );
}
