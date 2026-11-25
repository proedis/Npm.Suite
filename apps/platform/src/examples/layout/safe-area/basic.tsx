import * as React from 'react';

import { Home, List, Map, User } from 'lucide-react';

import { Box, SafeArea, Stack } from '@proedis/ui/layout';


const TABS = [
  { label: 'Today', icon: Home },
  { label: 'Stops', icon: List },
  { label: 'Map', icon: Map },
  { label: 'Me', icon: User }
];


export default function Example(): React.ReactNode {
  return (
    <Box className={'w-full max-w-xs overflow-hidden rounded-3xl border border-border'}>
      <p className={'h-40 p-4 text-sm text-muted-foreground'}>The screen of the driver’s app.</p>

      {/* A bottom bar that clears the home indicator of the phone, and nothing on a desktop */}
      <SafeArea as={'nav'} aria-label={'Sections'} sides={'bottom'} className={'border-t border-border bg-card'}>
        <Stack gap={0} direction={'horizontal'} justify={'around'} className={'py-2'}>
          {TABS.map(({ icon: Icon, label }) => (
            <Stack key={label} align={'center'} gap={0.5} className={'px-3 py-1 text-xs text-muted-foreground'}>
              <Icon aria-hidden className={'size-5'} />
              {label}
            </Stack>
          ))}
        </Stack>
      </SafeArea>
    </Box>
  );
}
