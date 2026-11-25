import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';


const ROWS = [
  [ 'Paper', '412 kg' ],
  [ 'Glass', '688 kg' ],
  [ 'Organic', '104 kg' ]
] as const;


/** A flush section gives its edges to the content: the rows of a table reach the sides of the card */
export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-md'}>
      <Surface.Header>
        <Item.Heading size={'lg'}>
          <Heading.Title>Collected today</Heading.Title>
        </Item.Heading>
      </Surface.Header>
      <Surface.Separator />
      <Surface.Section flush>
        <table className={'w-full text-sm'}>
          <tbody>
            {ROWS.map(([ kind, weight ]) => (
              <tr key={kind} className={'border-b border-border last:border-b-0'}>
                <td className={'px-5 py-3'}>{kind}</td>
                <td className={'px-5 py-3 text-end tabular-nums'}>{weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Surface.Section>
      <Surface.Footer muted justify={'between'} className={'text-xs text-muted-foreground'}>
        <span>3 of 3 kinds</span>
        <span>Total 1,204 kg</span>
      </Surface.Footer>
    </Surface>
  );
}
