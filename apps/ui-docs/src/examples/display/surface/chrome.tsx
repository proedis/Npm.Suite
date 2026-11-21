import * as React from 'react';

import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={8} className={'w-full max-w-2xl'}>
      <Stack columns={{ base: 2, sm: 4 }} gap={4}>
        <Surface><Surface.Section className={'text-sm'}>default</Surface.Section></Surface>
        <Surface elevation={'flat'} className={'border border-border'}><Surface.Section className={'text-sm'}>flat</Surface.Section></Surface>
        <Surface elevation={'soft'}><Surface.Section className={'text-sm'}>soft</Surface.Section></Surface>
        <Surface elevation={'raised'}><Surface.Section className={'text-sm'}>raised</Surface.Section></Surface>
      </Stack>
      <Stack columns={{ base: 2, sm: 4 }} gap={4}>
        <Surface radius={'none'}><Surface.Section className={'text-sm'}>none</Surface.Section></Surface>
        <Surface radius={'lg'}><Surface.Section className={'text-sm'}>lg</Surface.Section></Surface>
        <Surface radius={'2xl'}><Surface.Section className={'text-sm'}>2xl</Surface.Section></Surface>
        <Surface radius={'default'}><Surface.Section className={'text-sm'}>default</Surface.Section></Surface>
      </Stack>
    </Stack>
  );
}
