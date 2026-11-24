import * as React from 'react';

import { Bell, Lock, Scale } from 'lucide-react';

import { Stack } from '@proedis/ui/layout';
import { Label } from '@proedis/ui/primitives';


/** A glyph as tall as the text, on its first line: the description lines up with the name */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-sm'}>
      <Label leading={<Lock />} description={'At least 12 characters, one of them a digit'}>Password</Label>
      <Label leading={<Bell />} emphasis={'regular'} description={'One message a day, at 18:00'}>Daily summary</Label>
      <Label leading={<Scale />} emphasis={'quiet'}>Collected today</Label>
    </Stack>
  );
}
