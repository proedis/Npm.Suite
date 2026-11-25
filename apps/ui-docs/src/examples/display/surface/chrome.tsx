import * as React from 'react';

import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'xl'} className={'w-full max-w-2xl'}>
      <Stack columns={{ base: 2, sm: 4 }} gap={'md'}>
        <Surface><Surface.Section className={'text-sm'}>default</Surface.Section></Surface>
        <Surface elevation={'xs'}><Surface.Section className={'text-sm'}>elevation xs</Surface.Section></Surface>
        <Surface elevation={'md'} border={false}><Surface.Section className={'text-sm'}>md, no border</Surface.Section></Surface>
        <Surface elevation={'lg'} border={false}><Surface.Section className={'text-sm'}>lg, no border</Surface.Section></Surface>
      </Stack>
      <Stack columns={{ base: 2, sm: 4 }} gap={'md'}>
        <Surface radius={'none'}><Surface.Section className={'text-sm'}>radius none</Surface.Section></Surface>
        <Surface radius={'md'}><Surface.Section className={'text-sm'}>md</Surface.Section></Surface>
        <Surface radius={'default'}><Surface.Section className={'text-sm'}>default</Surface.Section></Surface>
        <Surface radius={'2xl'}><Surface.Section className={'text-sm'}>2xl</Surface.Section></Surface>
      </Stack>
    </Stack>
  );
}
