import * as React from 'react';

import { Badge } from '@proedis/ui/display/badge';
import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Stack } from '@proedis/ui/layout';


/** The name on the left, the value pushed to the end: a settings or a summary row */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={0} divided className={'w-full max-w-sm rounded-xl border border-border'}>
      <LabeledContent inline className={'px-4 py-3'}>
        <LabeledContent.Label>Push notifications</LabeledContent.Label>
        <LabeledContent.Value>On</LabeledContent.Value>
      </LabeledContent>
      <LabeledContent inline className={'px-4 py-3'}>
        <LabeledContent.Label>Contract</LabeledContent.Label>
        <LabeledContent.Value><Badge tone={'success'}>Active</Badge></LabeledContent.Value>
      </LabeledContent>
      <LabeledContent inline className={'px-4 py-3'}>
        <LabeledContent.Label>Billing address for the collection service and the skip hire</LabeledContent.Label>
        <LabeledContent.Value>Chieri</LabeledContent.Value>
      </LabeledContent>
    </Stack>
  );
}
