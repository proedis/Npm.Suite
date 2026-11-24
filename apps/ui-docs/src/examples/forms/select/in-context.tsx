import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Surface } from '@proedis/ui/display/surface';
import { Field } from '@proedis/ui/forms/field';
import { Select } from '@proedis/ui/forms/select';
import { Stack } from '@proedis/ui/layout';

import type { SelectOption } from '@proedis/ui/forms/select';
import labels from './labels';
import { DEPOTS, TOWNS } from './options';


const BODIES: readonly SelectOption[] = [
  { value: 'rear', label: 'Rear loader' },
  { value: 'side', label: 'Side loader' },
  { value: 'crane', label: 'Crane' },
  { value: 'tipper', label: 'Tipper' }
];


export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-lg border border-border'}>
      <Surface.Section>
        <Stack gap={5}>
          <Stack direction={{ base: 'vertical', sm: 'horizontal' }} gap={4}>
            <Field className={'flex-1'} required label={'Depot'} description={'Where the round starts.'}>
              <Select options={DEPOTS} defaultValue={'chieri'} labels={labels} />
            </Field>
            <Field className={'flex-1'} required label={'Body'} description={'What the vehicle must carry.'}>
              <Select options={BODIES} placeholder={'Select'} labels={labels} />
            </Field>
          </Stack>
          <Field optional={'optional'} label={'First town'} description={'Leave it empty to let the planner choose.'}>
            <Select options={TOWNS} placeholder={'Select'} labels={labels} />
          </Field>
        </Stack>
      </Surface.Section>
      <Surface.Footer muted>
        <Button fill={'plain'} tone={'muted'}>Cancel</Button>
        <Button>Plan the round</Button>
      </Surface.Footer>
    </Surface>
  );
}
