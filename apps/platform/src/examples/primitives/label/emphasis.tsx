import * as React from 'react';

import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';
import { Label } from '@proedis/ui/primitives';

import type { LabelEmphasis } from '@proedis/ui/primitives';


const REGISTERS: readonly { emphasis: LabelEmphasis; use: string }[] = [
  { emphasis: 'default', use: 'No opinion given: today the form register' },
  { emphasis: 'strong', use: 'The form register, asked for on purpose' },
  { emphasis: 'regular', use: 'The text of an option: a checkbox, a radio, a switch' },
  { emphasis: 'quiet', use: 'The data register: the value next to it is the point' }
];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'xl'} className={'w-full max-w-lg'}>
      <Stack gap={'sm'}>
        {REGISTERS.map((register) => (
          <Stack key={register.emphasis} direction={'horizontal'} align={'baseline'}>
            <code className={'w-20 shrink-0 font-mono text-xs text-muted-foreground'}>{register.emphasis}</code>
            <Label as={'span'} emphasis={register.emphasis} className={'w-32 shrink-0'}>Collection date</Label>
            <span className={'text-xs text-muted-foreground'}>{register.use}</span>
          </Stack>
        ))}
      </Stack>

      <Stack columns={2} gap={'lg'}>
        <Stack gap={'xs'}>
          <Label htmlFor={'emphasis-plate'}>Plate</Label>
          <TextInput id={'emphasis-plate'} placeholder={'FT-234-KL'} />
        </Stack>
        <Stack gap={'xs'}>
          <Label as={'span'} emphasis={'quiet'}>Plate</Label>
          <span className={'text-sm font-medium text-foreground'}>FT-234-KL</span>
        </Stack>
      </Stack>
    </Stack>
  );
}
