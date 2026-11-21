import * as React from 'react';

import { Clock } from 'lucide-react';

import { FieldShell } from '@proedis/ui/forms/field-shell';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';

import type { FieldShellSize } from '@proedis/ui/forms/field-shell';


const SIZES: readonly FieldShellSize[] = [ 'sm', 'md', 'lg' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'w-full max-w-lg'}>
      {SIZES.map((size) => (
        <Stack key={size} direction={'horizontal'} align={'center'} gap={2}>
          <FieldShell size={size} leading={<Clock />} trailing={<span className={'text-xs text-muted-foreground'}>24h</span>}>
            <input aria-label={`Opening time, ${size}`} defaultValue={'07:30'} data-field-control={''} className={'w-full bg-transparent outline-none'} />
          </FieldShell>
          <TextInput size={size} aria-label={`Closing time, ${size}`} defaultValue={'19:00'} />
        </Stack>
      ))}
    </Stack>
  );
}
