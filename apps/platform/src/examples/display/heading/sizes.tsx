import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';
import { Stack } from '@proedis/ui/layout';

import type { HeadingSize } from '@proedis/ui/display/heading';


const SIZES: readonly { size: HeadingSize; title: string; description: string }[] = [
  { size: 'sm', title: 'Skip 1204', description: 'A list row: no prop, the frequent case' },
  { size: 'md', title: 'Route 14, north district', description: 'A section of a page' },
  { size: 'lg', title: 'Vehicles in service', description: 'The header of a card' },
  { size: 'xl', title: 'No round planned today', description: 'A page, or an empty state' }
];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'xl'} className={'w-full max-w-md'}>
      {SIZES.map((entry) => (
        <Heading key={entry.size} size={entry.size}>
          <Heading.Eyebrow>{`size="${entry.size}"`}</Heading.Eyebrow>
          <Heading.Title>{entry.title}</Heading.Title>
          <Heading.Description>{entry.description}</Heading.Description>
        </Heading>
      ))}
    </Stack>
  );
}
