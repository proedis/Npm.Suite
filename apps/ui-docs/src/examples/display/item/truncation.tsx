import * as React from 'react';

import { MapPin } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';


/** The heading grows and truncates; the actions never shrink out of the row */
export default function Example(): React.ReactNode {
  return (
    <Item className={'w-full max-w-sm rounded-xl border border-border p-3'}>
      <IconBox fill={'plain'}><MapPin /></IconBox>
      <Heading>
        <Heading.Title lines={1}>Via Vittorio Emanuele II 104, courtyard on the left of the caretaker’s lodge</Heading.Title>
        <Heading.Description lines={1}>Bulky items, a sofa and two chairs, to be collected before noon</Heading.Description>
      </Heading>
      <Item.Actions>
        <Badge tone={'warning'}>Late</Badge>
        <Button size={'sm'} fill={'soft'}>Assign</Button>
      </Item.Actions>
    </Item>
  );
}
