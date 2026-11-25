import * as React from 'react';

import { List, MapIcon, Plus } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { SegmentedControl } from '@proedis/ui/actions/segmented-control';
import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ view, setView ] = React.useState('list');
  const titleId = React.useId();

  return (
    <Surface className={'w-full max-w-xl'}>
      <Surface.Header inset>
        <Item.Heading>
          <Heading.Title id={titleId}>Collection points</Heading.Title>
          <Heading.Description>North district, 214 points</Heading.Description>
        </Item.Heading>
        <Stack direction={'horizontal'} align={'center'} gap={2}>
          <SegmentedControl aria-labelledby={titleId} size={'sm'} value={view} onValueChange={setView}>
            <SegmentedControl.Item value={'list'} leading={<List />} aria-label={'List'} />
            <SegmentedControl.Item value={'map'} leading={<MapIcon />} aria-label={'Map'} />
          </SegmentedControl>
          <Button size={'sm'} leading={<Plus />}>New point</Button>
        </Stack>
      </Surface.Header>
      <Surface.Section>
        <p className={'text-sm text-muted-foreground'}>
          {view === 'list' ? 'The points, one per row.' : 'The points, on the map of the district.'}
        </p>
      </Surface.Section>
    </Surface>
  );
}
