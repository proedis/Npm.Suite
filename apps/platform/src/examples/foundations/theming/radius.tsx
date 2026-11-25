import * as React from 'react';

import { Truck } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { IconBox } from '@proedis/ui/display/icon-box';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


const SCALES = [ 0, 1, 2 ] as const;


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 3 }} gap={4} className={'w-full'}>
      {SCALES.map((scale) => (
        <Stack
          key={scale}
          gap={3}
          align={'start'}
          className={'rounded-xl border border-border p-4'}
          /* A free number, so an inline custom property: every rounded-* step below multiplies by it */
          style={{ '--radius-scale': scale } as React.CSSProperties}
        >
          <code className={'font-mono text-xs text-muted-foreground'}>--radius-scale: {scale}</code>
          <Button>Start the round</Button>
          <TextInput aria-label={'Plate'} placeholder={'FT-234-KL'} />
          <Stack direction={'horizontal'} align={'center'} gap={2}>
            <IconBox fill={'soft'} tone={'primary'}><Truck /></IconBox>
            <Badge>Full, outside the scale</Badge>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
