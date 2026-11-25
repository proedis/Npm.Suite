import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Select } from '@proedis/ui/forms/select';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';
import { DEPOTS } from './options';


export default function Example(): React.ReactNode {
  const [ depot, setDepot ] = React.useState<string | null>('chieri');

  const handleReset = React.useCallback(() => setDepot('chieri'), []);

  return (
    <Stack gap={4} className={'w-full max-w-xs'}>
      <Field label={'Depot'}>
        <Select options={DEPOTS} value={depot} onValueChange={setDepot} placeholder={'Select'} labels={labels} />
      </Field>

      <Stack direction={'horizontal'} align={'center'} justify={'between'} gap={3} className={'text-sm text-muted-foreground'}>
        <span>
          Value: <code className={'font-mono text-foreground'}>{JSON.stringify(depot)}</code>
        </span>
        <Button size={'sm'} fill={'plain'} tone={'muted'} onClick={handleReset}>Reset</Button>
      </Stack>
    </Stack>
  );
}
