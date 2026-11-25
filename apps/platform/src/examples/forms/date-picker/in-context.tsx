import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Surface } from '@proedis/ui/display/surface';
import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';


/** Today, as the value of a date: a string, never a `Date` */
function todayIso(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}


/** Moving a collection: a single date that cannot be in the past */
export default function Example(): React.ReactNode {
  const [ date, setDate ] = React.useState<string | null>(null);

  return (
    <Surface className={'w-full max-w-lg'}>
      <Surface.Section>
        <Stack gap={5}>
          <Field required label={'Move the collection to'} description={'The bins of the round are emptied on this day.'}>
            <DatePicker locale={'en-GB'} min={todayIso()} value={date} onValueChange={setDate} labels={labels} />
          </Field>
        </Stack>
      </Surface.Section>
      <Surface.Footer muted>
        <Button fill={'plain'} tone={'muted'}>Cancel</Button>
        <Button>Move</Button>
      </Surface.Footer>
    </Surface>
  );
}
