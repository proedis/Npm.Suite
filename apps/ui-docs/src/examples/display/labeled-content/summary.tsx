import * as React from 'react';

import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 2, sm: 4 }} gap={6} className={'w-full max-w-2xl'}>
      <LabeledContent>
        <LabeledContent.Label>Plate</LabeledContent.Label>
        <LabeledContent.Value>FT-234-KL</LabeledContent.Value>
      </LabeledContent>
      <LabeledContent>
        <LabeledContent.Label description={'Gross weight'}>Capacity</LabeledContent.Label>
        <LabeledContent.Value>18 t</LabeledContent.Value>
      </LabeledContent>
      <LabeledContent>
        <LabeledContent.Label>Last service</LabeledContent.Label>
        <LabeledContent.Value>12 Oct 2026</LabeledContent.Value>
      </LabeledContent>
      <LabeledContent>
        <LabeledContent.Label>Driver</LabeledContent.Label>
        <LabeledContent.Value>Rossi Mario</LabeledContent.Value>
      </LabeledContent>
    </Stack>
  );
}
