import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={8} className={'w-full max-w-md'}>
      {/* A list row: no props, the frequent case */}
      <Heading>
        <Heading.Title>Skip 1204</Heading.Title>
        <Heading.Description>Paper, 1.1 m³</Heading.Description>
      </Heading>

      {/* The header of a card */}
      <Heading>
        <Heading.Title size={'lg'}>Vehicles in service</Heading.Title>
        <Heading.Description>Updated two minutes ago</Heading.Description>
      </Heading>

      {/* A page or an empty state */}
      <Heading gap={2}>
        <Heading.Eyebrow size={'sm'}>Rounds</Heading.Eyebrow>
        <Heading.Title size={'xl'}>No round planned today</Heading.Title>
        <Heading.Description size={'md'}>Plan one from the calendar, or copy last week’s.</Heading.Description>
      </Heading>
    </Stack>
  );
}
