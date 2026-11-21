import * as React from 'react';

import { Pencil } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { CollapsibleSection } from '@proedis/ui/actions/collapsible';
import { Badge } from '@proedis/ui/display/badge';
import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={6} className={'w-full max-w-xl'}>
      <Stack direction={'horizontal'} align={'center'} gap={3}>
        <h2 className={'text-xl font-semibold text-foreground'}>Via Roma 14, Chieri</h2>
        <Badge fill={'soft'} tone={'success'}>Active</Badge>
      </Stack>

      <Stack>
        <CollapsibleSection
          defaultOpen
          headingLevel={3}
          title={'Contract'}
          actions={<IconButton label={'Edit the contract'} icon={<Pencil />} size={'sm'} />}
        >
          <Stack columns={2} gap={4}>
            <LabeledContent>
              <LabeledContent.Label>Customer</LabeledContent.Label>
              <LabeledContent.Value>Rossi Costruzioni</LabeledContent.Value>
            </LabeledContent>
            <LabeledContent>
              <LabeledContent.Label>Frequency</LabeledContent.Label>
              <LabeledContent.Value>Weekly, Monday</LabeledContent.Value>
            </LabeledContent>
          </Stack>
        </CollapsibleSection>

        <CollapsibleSection headingLevel={3} title={'Containers'} meta={'4 containers'}>
          <p className={'text-sm text-muted-foreground'}>Two for paper, one for glass, one for organic waste.</p>
        </CollapsibleSection>

        <CollapsibleSection headingLevel={3} title={'History'} meta={'128 entries'}>
          <p className={'text-sm text-muted-foreground'}>Last collection on Monday 14 October at 06:42.</p>
        </CollapsibleSection>
      </Stack>
    </Stack>
  );
}
