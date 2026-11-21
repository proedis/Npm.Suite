import * as React from 'react';

import { ChevronRight } from 'lucide-react';

import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


const ORDERS = [
  { code: '2026/1184', place: 'Via Roma 21, Chieri', state: 'Planned', tone: 'primary' },
  { code: '2026/1185', place: 'Piazza Cavour 3, Pino', state: 'Collected', tone: 'success' },
  { code: '2026/1186', place: 'Strada Fontaneto 40, Chieri', state: 'Late', tone: 'warning' }
] as const;


/** A row that IS a button: no control inside it, so the whole row can be one */
export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-md border border-border'}>
      <Stack as={'ul'} divided>
        {ORDERS.map((order) => (
          <li key={order.code}>
            <Item as={'button'} type={'button'} interactive inset className={'w-full text-start'}>
              <Heading>
                <Heading.Title>Order {order.code}</Heading.Title>
                <Heading.Description>{order.place}</Heading.Description>
              </Heading>
              <Badge tone={order.tone}>{order.state}</Badge>
              <Item.Trailing><ChevronRight className={'size-4'} /></Item.Trailing>
            </Item>
          </li>
        ))}
      </Stack>
    </Surface>
  );
}
