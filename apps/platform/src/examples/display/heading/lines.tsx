import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';


/** lines clamps each part on its own: the eyebrow and the title on one line, the description on two */
export default function Example(): React.ReactNode {
  return (
    <Heading className={'w-full max-w-xs'}>
      <Heading.Eyebrow lines={1}>Bulky items, booked by phone</Heading.Eyebrow>
      <Heading.Title lines={1}>Bulky items collection, Via Vittorio Emanuele II 104, Chieri</Heading.Title>
      <Heading.Description lines={2}>
        A sofa, two chairs and a mattress, to be collected from the courtyard. The customer asks to ring at the
        caretaker’s lodge before entering, as the gate is closed until nine.
      </Heading.Description>
    </Heading>
  );
}
