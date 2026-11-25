import * as React from 'react';

import { Select } from '@proedis/ui/forms/select';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';
import { DEPOTS } from './options';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'w-full max-w-xs'}>
      <Select size={'sm'} options={DEPOTS} defaultValue={'chieri'} aria-label={'Depot, small'} labels={labels} />
      <Select size={'md'} options={DEPOTS} defaultValue={'chieri'} aria-label={'Depot, medium'} labels={labels} />
      <Select size={'lg'} options={DEPOTS} defaultValue={'chieri'} aria-label={'Depot, large'} labels={labels} />
    </Stack>
  );
}
