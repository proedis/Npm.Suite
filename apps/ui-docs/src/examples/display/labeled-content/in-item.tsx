import * as React from 'react';

import { Scale } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';
import { LabeledContent } from '@proedis/ui/display/labeled-content';


/** The icon and the row belong to Item, which grows the pair like it grows a Heading */
export default function Example(): React.ReactNode {
  return (
    <Item className={'w-full max-w-sm rounded-xl border border-border p-4'}>
      <IconBox tone={'success'}><Scale /></IconBox>
      <LabeledContent>
        <LabeledContent.Label>Collected this week</LabeledContent.Label>
        <LabeledContent.Value className={'text-lg'}>7,830 kg</LabeledContent.Value>
      </LabeledContent>
      <Item.Actions>
        <Button size={'sm'} fill={'plain'}>Details</Button>
      </Item.Actions>
    </Item>
  );
}
