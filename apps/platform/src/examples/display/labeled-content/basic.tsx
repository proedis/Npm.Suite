import * as React from 'react';

import { LabeledContent } from '@proedis/ui/display/labeled-content';


export default function Example(): React.ReactNode {
  return (
    <LabeledContent>
      <LabeledContent.Label>Collected today</LabeledContent.Label>
      <LabeledContent.Value>1,204 kg</LabeledContent.Value>
    </LabeledContent>
  );
}
