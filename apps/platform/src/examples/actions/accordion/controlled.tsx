import * as React from 'react';

import { Accordion } from '@proedis/ui/actions/accordion';
import { Button } from '@proedis/ui/actions/button';
import { Stack } from '@proedis/ui/layout';


const SECTIONS = [
  { id: 'route', title: 'Route', text: 'North district, 38 stops, starting from the depot at 06:00.' },
  { id: 'vehicle', title: 'Vehicle', text: 'FT-234-KL, rear loader, 18 cubic metres.' },
  { id: 'crew', title: 'Crew', text: 'One driver and two operators.' }
] as const;


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState<string[]>([ 'route' ]);

  return (
    <Stack gap={'md'} className={'w-full max-w-lg'}>
      <Stack direction={'horizontal'} gap={'sm'}>
        <Button size={'sm'} fill={'soft'} onClick={() => setOpen(SECTIONS.map((section) => section.id))}>Open all</Button>
        <Button size={'sm'} fill={'plain'} tone={'muted'} onClick={() => setOpen([])}>Close all</Button>
      </Stack>

      <Accordion value={open} onValueChange={setOpen}>
        {SECTIONS.map((section) => (
          <Accordion.Item key={section.id} value={section.id} title={section.title}>
            <p className={'text-sm text-muted-foreground'}>{section.text}</p>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
}
