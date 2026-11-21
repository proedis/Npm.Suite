import * as React from 'react';

import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'w-full max-w-sm'}>
      <TextInput size={'sm'} aria-label={'Small'} placeholder={'sm: a table row, a filter bar'} />
      <TextInput size={'md'} aria-label={'Medium'} placeholder={'md: a form, the default'} />
      <TextInput size={'lg'} aria-label={'Large'} placeholder={'lg: a sign in, an empty state'} />
    </Stack>
  );
}
