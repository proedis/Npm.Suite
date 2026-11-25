import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Surface } from '@proedis/ui/display/surface';
import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import type { DateRange } from '@proedis/ui/forms/date-picker';
import labels from './labels';


/** Today, as the value of a date: a string, never a `Date` */
function todayIso(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}


export default function Example(): React.ReactNode {
  const [ suspension, setSuspension ] = React.useState<DateRange>({ from: null, to: null });

  return (
    <Surface className={'w-full max-w-lg'}>
      <Surface.Section>
        <Stack gap={5}>
          <Field
            required
            label={'Suspend the service'}
            description={'The bins are not emptied in these days, both included.'}
          >
            <DatePicker mode={'range'} locale={'en-GB'} min={todayIso()} value={suspension} onValueChange={setSuspension} labels={labels} />
          </Field>
        </Stack>
      </Surface.Section>
      <Surface.Footer muted>
        <Button fill={'plain'} tone={'muted'}>Cancel</Button>
        <Button>Suspend</Button>
      </Surface.Footer>
    </Surface>
  );
}
