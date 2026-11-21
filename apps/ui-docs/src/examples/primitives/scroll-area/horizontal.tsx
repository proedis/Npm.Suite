import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { Stack } from '@proedis/ui/layout';
import { ScrollArea } from '@proedis/ui/primitives';


const WASTE = [ 'Paper', 'Cardboard', 'Glass', 'Plastic', 'Metals', 'Organic', 'Green waste', 'Bulky items', 'Electronics', 'Textiles', 'Batteries', 'Oils' ];


export default function Example(): React.ReactNode {
  return (
    <ScrollArea orientation={'horizontal'} className={'w-full max-w-sm pb-2'}>
      {/* A row that does not wrap: the scroll is the point */}
      <Stack direction={'horizontal'} gap={2} className={'w-max'}>
        {WASTE.map((kind) => <Badge key={kind} size={'lg'}>{kind}</Badge>)}
      </Stack>
    </ScrollArea>
  );
}
