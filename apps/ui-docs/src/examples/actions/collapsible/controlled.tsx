import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { CollapsibleSection } from '@proedis/ui/actions/collapsible';
import { Stack } from '@proedis/ui/layout';


const SECTIONS = [
  { id: 'route', title: 'Route', text: 'North district, 38 stops, starting from the depot at 06:00.' },
  { id: 'vehicle', title: 'Vehicle', text: 'FT-234-KL, rear loader, 18 cubic metres.' },
  { id: 'crew', title: 'Crew', text: 'One driver and two operators.' }
] as const;


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState<ReadonlySet<string>>(() => new Set([ 'route' ]));

  const handleOpenAll = React.useCallback(() => setOpen(new Set(SECTIONS.map((section) => section.id))), []);
  const handleCloseAll = React.useCallback(() => setOpen(new Set()), []);

  const handleToggle = React.useCallback((id: string, next: boolean) => {
    setOpen((previous) => {
      const copy = new Set(previous);

      if (next) {
        copy.add(id);
      }
      else {
        copy.delete(id);
      }

      return copy;
    });
  }, []);

  return (
    <Stack gap={4} className={'w-full max-w-lg'}>
      <Stack direction={'horizontal'} gap={2}>
        <Button size={'sm'} fill={'soft'} onClick={handleOpenAll}>Open all</Button>
        <Button size={'sm'} fill={'plain'} tone={'muted'} onClick={handleCloseAll}>Close all</Button>
      </Stack>

      <Stack gap={0}>
        {SECTIONS.map((section) => (
          <CollapsibleSection
            key={section.id}
            title={section.title}
            open={open.has(section.id)}
            onOpenChange={(next) => handleToggle(section.id, next)}
          >
            <p className={'text-sm text-muted-foreground'}>{section.text}</p>
          </CollapsibleSection>
        ))}
      </Stack>
    </Stack>
  );
}
