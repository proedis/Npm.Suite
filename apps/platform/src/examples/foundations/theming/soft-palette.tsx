import * as React from 'react';

import { CircleCheck, Truck } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Cluster, Stack } from '@proedis/ui/layout';


/** A designed soft register for two tones. Every other tone keeps the fallback, a tenth of itself */
const DESIGNED = `
  [data-soft-demo='designed'] {
    --primary-soft: oklch(0.932 0.032 255.585);
    --primary-soft-foreground: oklch(0.379 0.146 265.522);
    --success-soft: oklch(0.95 0.052 163.051);
    --success-soft-foreground: oklch(0.432 0.095 166.913);
  }

  .dark [data-soft-demo='designed'] {
    --primary-soft: oklch(0.282 0.091 267.935);
    --primary-soft-foreground: oklch(0.882 0.059 254.128);
    --success-soft: oklch(0.262 0.051 172.552);
    --success-soft-foreground: oklch(0.845 0.143 164.978);
  }
`;


function Row(props: { title: string; variant: 'fallback' | 'designed' }): React.ReactNode {
  return (
    <Stack data-soft-demo={props.variant} gap={3} className={'rounded-xl border border-border p-4'}>
      <p className={'text-sm font-semibold text-foreground'}>{props.title}</p>
      <Cluster gap={2}>
        <IconBox fill={'soft'} tone={'primary'}><Truck /></IconBox>
        <IconBox fill={'soft'} tone={'success'}><CircleCheck /></IconBox>
        <Badge fill={'soft'} tone={'primary'}>Planned</Badge>
        <Badge fill={'soft'} tone={'success'}>Completed</Badge>
        <Button fill={'soft'} size={'sm'}>Open</Button>
      </Cluster>
    </Stack>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 2 }} gap={4} className={'w-full'}>
      <style>{DESIGNED}</style>
      <Row title={'Fallback: a tenth of the tone'} variant={'fallback'} />
      <Row title={'A designed soft palette'} variant={'designed'} />
    </Stack>
  );
}
