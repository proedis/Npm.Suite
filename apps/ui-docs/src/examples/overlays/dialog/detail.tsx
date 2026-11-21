import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Stack } from '@proedis/ui/layout';
import { Dialog } from '@proedis/ui/overlays/dialog';


const FACTS: readonly (readonly [ string, string ])[] = [
  [ 'Container', 'Organic, 240 l' ],
  [ 'Collection days', 'Monday, Thursday' ],
  [ 'Last emptied', 'Today, 06:42' ],
  [ 'Fill level', '35%' ]
];


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);

  return (
    <React.Fragment>
      <Button fill={'soft'} tone={'secondary'} onClick={() => setOpen(true)}>Open the collection point</Button>

      {/* No footer: a detail to read. A click on the veil closes it, and the body takes the focus */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={'Collection point CP-0412'}
        description={'Via Roma 18, Chieri'}
        labels={{ close: 'Close' }}
      >
        <Stack columns={2} gap={4}>
          {FACTS.map(([ label, value ]) => (
            <LabeledContent key={label}>
              <LabeledContent.Label>{label}</LabeledContent.Label>
              <LabeledContent.Value>{value}</LabeledContent.Value>
            </LabeledContent>
          ))}
        </Stack>
      </Dialog>
    </React.Fragment>
  );
}
