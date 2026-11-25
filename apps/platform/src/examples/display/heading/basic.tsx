import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';


export default function Example(): React.ReactNode {
  return (
    <Heading>
      <Heading.Eyebrow>In service</Heading.Eyebrow>
      <Heading.Title>FT-234-KL</Heading.Title>
      <Heading.Description>Last stop 12:04, Via Roma 21</Heading.Description>
    </Heading>
  );
}
