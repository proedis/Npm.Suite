import * as React from 'react';

import { ArrowUpDown } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ sort, setSort ] = React.useState('date');
  const [ archived, setArchived ] = React.useState(false);
  const [ compact, setCompact ] = React.useState(true);

  return (
    <Stack align={'center'} gap={3}>
      <Menu
        aria-label={'View options'}
        align={'start'}
        trigger={<Button fill={'soft'} tone={'secondary'} leading={<ArrowUpDown />}>View</Button>}
      >
        <Menu.RadioGroup label={'Sort by'} value={sort} onValueChange={setSort}>
          <Menu.RadioItem value={'date'}>Date</Menu.RadioItem>
          <Menu.RadioItem value={'customer'}>Customer</Menu.RadioItem>
          <Menu.RadioItem value={'weight'}>Weight</Menu.RadioItem>
        </Menu.RadioGroup>
        <Menu.Separator />
        <Menu.Group label={'Show'}>
          <Menu.CheckboxItem checked={archived} onCheckedChange={setArchived}>Archived orders</Menu.CheckboxItem>
          <Menu.CheckboxItem checked={compact} onCheckedChange={setCompact}>Compact rows</Menu.CheckboxItem>
        </Menu.Group>
      </Menu>
      <p className={'text-sm text-muted-foreground'}>
        {`Sorted by ${sort}, archived ${archived ? 'shown' : 'hidden'}, ${compact ? 'compact' : 'comfortable'} rows`}
      </p>
    </Stack>
  );
}
