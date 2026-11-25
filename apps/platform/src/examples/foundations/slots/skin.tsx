import * as React from 'react';

import { Trash2 } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { Surface } from '@proedis/ui/display/surface';
import { Cluster, Stack } from '@proedis/ui/layout';


/**
 * A product's skin: plain CSS, outside any layer, targeting the slots and the attributes. It beats the
 * utilities of the package, which live in `@layer utilities`, with no `!important`. Scoped here to
 * one container; an application writes the same rules without the scope.
 */
const SKIN = `
  [data-skin] [data-slot='button'] {
    border-radius: 9999px;
  }

  [data-skin] [data-slot='badge'][data-fill='soft'] {
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  [data-skin] [data-slot='button'][data-tone='destructive'][data-fill='plain'] {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  [data-skin] [data-slot='surface'][data-elevation='default'] {
    box-shadow: none;
    outline: 1px dashed var(--border);
  }
`;


function Sample(props: { title: string }): React.ReactNode {
  return (
    <Surface className={'p-5'}>
      <Stack gap={4}>
        <p className={'text-sm font-semibold text-foreground'}>{props.title}</p>
        <Cluster gap={2}>
          <Badge fill={'soft'} tone={'success'}>Completed</Badge>
          <Badge fill={'soft'} tone={'warning'}>Late</Badge>
        </Cluster>
        <Cluster gap={2}>
          <Button>Start the round</Button>
          <Button fill={'plain'} tone={'destructive'} leading={<Trash2 />}>Delete</Button>
        </Cluster>
      </Stack>
    </Surface>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, md: 2 }} gap={4} className={'w-full'}>
      <style>{SKIN}</style>
      <Sample title={'The package'} />
      <Stack gap={0} data-skin>
        <Sample title={'The same markup, skinned'} />
      </Stack>
    </Stack>
  );
}
