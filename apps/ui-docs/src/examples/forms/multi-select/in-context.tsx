import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { MultiSelect } from '@proedis/ui/forms/multi-select';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';
import { TOWNS, WASTE } from './options';


export default function Example(): React.ReactNode {
  const [ towns, setTowns ] = React.useState<string[]>([ 'chieri', 'pino-torinese' ]);
  const [ waste, setWaste ] = React.useState<string[]>([]);

  const handleReset = React.useCallback(() => {
    setTowns([]);
    setWaste([]);
  }, []);

  return (
    <Stack gap={4} className={'w-full max-w-2xl'}>
      <Stack direction={{ base: 'vertical', md: 'horizontal' }} align={{ base: 'stretch', md: 'end' }} gap={4}>
        <Field className={'flex-1'}>
          <Field.Label>Towns</Field.Label>
          <MultiSelect size={'sm'} options={TOWNS} value={towns} onValueChange={setTowns} placeholder={'All'} labels={labels} />
        </Field>
        <Field className={'flex-1'}>
          <Field.Label>Waste</Field.Label>
          <MultiSelect size={'sm'} options={WASTE} value={waste} onValueChange={setWaste} placeholder={'All'} labels={labels} />
        </Field>
        <Button size={'sm'} fill={'plain'} tone={'muted'} onClick={handleReset}>Reset</Button>
      </Stack>
      <p className={'text-sm text-muted-foreground'}>
        The collection report, filtered on {towns.length || 'every'} town{towns.length === 1 ? '' : 's'} and{' '}
        {waste.length || 'every'} kind{waste.length === 1 ? '' : 's'} of waste.
      </p>
    </Stack>
  );
}
