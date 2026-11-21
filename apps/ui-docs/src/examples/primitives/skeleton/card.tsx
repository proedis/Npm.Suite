import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';
import { Label, Skeleton } from '@proedis/ui/primitives';


/** The real frame, title and labels from the start; only the values are shapes */
export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-md border border-border'} aria-busy>
      <Surface.Header>
        <Heading>
          <Heading.Title size={'lg'}>Vehicle</Heading.Title>
          <Skeleton className={'mt-1.5 w-32'} />
        </Heading>
        <Skeleton shape={'pill'} />
      </Surface.Header>
      <Surface.Section>
        <Stack columns={2} gap={5}>
          <Stack gap={2}>
            <Label as={'span'} emphasis={'quiet'}>Plate</Label>
            <Skeleton className={'w-24'} />
          </Stack>
          <Stack gap={2}>
            <Label as={'span'} emphasis={'quiet'}>Last service</Label>
            <Skeleton className={'w-20'} />
          </Stack>
          <Stack gap={2}>
            <Label as={'span'} emphasis={'quiet'}>Driver</Label>
            <Skeleton className={'w-28'} />
          </Stack>
          <Stack gap={2}>
            <Label as={'span'} emphasis={'quiet'}>Notes</Label>
            <Skeleton lines={2} />
          </Stack>
        </Stack>
      </Surface.Section>
    </Surface>
  );
}
