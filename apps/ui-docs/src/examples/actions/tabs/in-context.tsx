import * as React from 'react';

import { Fuel, MapPin, Wrench } from 'lucide-react';

import { Tabs } from '@proedis/ui/actions/tabs';
import { Badge } from '@proedis/ui/display/badge';
import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Stack } from '@proedis/ui/layout';

import type { TabItem } from '@proedis/ui/actions/tabs';


const ITEMS: readonly TabItem[] = [
  { value: 'position', label: 'Position', leading: <MapPin /> },
  { value: 'maintenance', label: 'Maintenance', leading: <Wrench />, count: 2, countLabel: '2 interventions due' },
  { value: 'refuels', label: 'Refuels', leading: <Fuel />, count: 31, countLabel: '31 refuels' }
];


export default function Example(): React.ReactNode {
  const titleId = React.useId();
  const [ tab, setTab ] = React.useState('position');

  return (
    <Stack gap={5} className={'w-full max-w-xl'}>
      <Stack direction={'horizontal'} align={'center'} gap={3}>
        <h2 id={titleId} className={'text-xl font-semibold text-foreground'}>FT-234-KL</h2>
        <Badge fill={'soft'} tone={'info'}>On a round</Badge>
      </Stack>

      <Tabs aria-labelledby={titleId} items={ITEMS} value={tab} onValueChange={setTab} labels={{ overflow: 'More' }}>
        <Tabs.Panel value={'position'}>
          <Stack columns={2} gap={4}>
            <LabeledContent>
              <LabeledContent.Label>Last position</LabeledContent.Label>
              <LabeledContent.Value>Via Torino 3, Chieri</LabeledContent.Value>
            </LabeledContent>
            <LabeledContent>
              <LabeledContent.Label>Updated</LabeledContent.Label>
              <LabeledContent.Value>2 minutes ago</LabeledContent.Value>
            </LabeledContent>
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value={'maintenance'}>
          <p className={'text-sm text-muted-foreground'}>Brake check and oil change, both due in November.</p>
        </Tabs.Panel>
        <Tabs.Panel value={'refuels'}>
          <p className={'text-sm text-muted-foreground'}>31 refuels this year, 4,120 litres in all.</p>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
