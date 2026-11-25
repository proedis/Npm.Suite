import * as React from 'react';

import { ToggleGroup, Toggle } from '@proedis/ui/actions/toggle';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ columns, setColumns ] = React.useState<string[]>([ 'code', 'state' ]);

  return (
    <Stack align={'center'} gap={3}>
      <ToggleGroup aria-label={'Visible columns'} value={columns} onValueChange={setColumns}>
        <Toggle value={'code'}>Code</Toggle>
        <Toggle value={'state'}>State</Toggle>
        <Toggle value={'customer'}>Customer</Toggle>
        <Toggle value={'weight'}>Weight</Toggle>
      </ToggleGroup>
      <p className={'text-sm text-muted-foreground'}>{columns.length ? `Showing ${columns.join(', ')}` : 'No column shown'}</p>
    </Stack>
  );
}
