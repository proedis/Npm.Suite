import * as React from 'react';

import { Filter, Search } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack direction={'horizontal'} align={'center'} gap={2} className={'w-full max-w-xl'}>
      {/* Outside a Field the control needs a name of its own */}
      <TextInput size={'sm'} aria-label={'Find a customer'} leading={<Search />} placeholder={'Name, VAT number or code'} />
      <Button size={'sm'} fill={'soft'} tone={'secondary'} leading={<Filter />}>Filters</Button>
    </Stack>
  );
}
