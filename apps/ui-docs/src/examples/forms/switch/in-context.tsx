import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { Switch } from '@proedis/ui/forms/switch';
import { Stack } from '@proedis/ui/layout';


const SETTINGS = [
  { id: 'sms', title: 'Text message to the driver', description: 'When a stop is added to the round in progress.', on: true },
  { id: 'mail', title: 'Daily summary by email', description: 'At 18:00, the rounds of the day and their weights.', on: false },
  { id: 'alerts', title: 'Overfull bin alerts', description: 'From the fill sensors, as soon as they arrive.', on: true }
];


export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-lg border border-border'}>
      <Stack divided>
        {SETTINGS.map((setting) => (
          <Item key={setting.id} inset>
            <Heading>
              <Heading.Title as={'h3'} size={'sm'} id={`setting-${setting.id}`}>{setting.title}</Heading.Title>
              <Heading.Description>{setting.description}</Heading.Description>
            </Heading>
            <Item.Actions>
              <Switch defaultChecked={setting.on} aria-labelledby={`setting-${setting.id}`} />
            </Item.Actions>
          </Item>
        ))}
      </Stack>
    </Surface>
  );
}
