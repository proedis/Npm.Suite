import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster, Stack } from '@proedis/ui/layout';
import { TextInput } from '@proedis/ui/forms/text-input';

import type { ButtonRadius } from '@proedis/ui/actions/button';


const RADII: readonly ButtonRadius[] = [ 'none', 'sm', 'md', 'lg', 'xl', '2xl', 'full' ];

/** A product whose controls are pills: one variable, and the field and the button keep one shape */
const PILLS = { '--control-radius': 'var(--radius-full)' } as React.CSSProperties;


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'xl'} align={'center'}>
      <Cluster justify={'center'}>
        {RADII.map((radius) => <Button key={radius} radius={radius} fill={'soft'}>{radius}</Button>)}
      </Cluster>
      <Stack gap={'xs'} align={'center'}>
        <code className={'font-mono text-xs text-muted-foreground'}>--control-radius: var(--radius-full)</code>
        <Stack direction={'horizontal'} align={'center'} gap={'sm'} style={PILLS}>
          <TextInput aria-label={'Plate'} placeholder={'FT-234-KL'} className={'w-44'} />
          <Button>Search</Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
