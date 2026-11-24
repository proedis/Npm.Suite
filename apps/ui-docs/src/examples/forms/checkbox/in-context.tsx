import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Surface } from '@proedis/ui/display/surface';
import { Checkbox, CheckboxGroup } from '@proedis/ui/forms/checkbox';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-lg border border-border'}>
      <Surface.Section>
        <Stack gap={6}>
          <Field
            label={'Waste accepted at the depot'}
            description={'A vehicle carrying anything else is sent to the next depot.'}
          >
            <CheckboxGroup defaultValue={[ 'paper', 'glass' ]} orientation={{ base: 'vertical', sm: 'horizontal' }}>
              <Checkbox value={'paper'}>Paper</Checkbox>
              <Checkbox value={'glass'}>Glass</Checkbox>
              <Checkbox value={'plastic'}>Plastic</Checkbox>
            </CheckboxGroup>
          </Field>
          <Checkbox description={'The depot appears in the planner only from the next round.'}>
            Open to the public
          </Checkbox>
        </Stack>
      </Surface.Section>
      <Surface.Footer muted>
        <Button fill={'plain'} tone={'muted'}>Cancel</Button>
        <Button>Save the depot</Button>
      </Surface.Footer>
    </Surface>
  );
}
