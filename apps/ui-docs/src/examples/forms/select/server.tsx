import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Select } from '@proedis/ui/forms/select';
import { Stack } from '@proedis/ui/layout';

import type { SelectOption } from '@proedis/ui/forms/select';
import labels from './labels';
import { TOWNS } from './options';


/** Stands in for the request of the application: the whole list, after a second */
function fetchTowns(): Promise<readonly SelectOption[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(TOWNS), 1000);
  });
}


export default function Example(): React.ReactNode {
  const [ options, setOptions ] = React.useState<readonly SelectOption[] | null>(null);
  const [ town, setTown ] = React.useState<string | null>('chieri');

  const [ attempt, setAttempt ] = React.useState(0);

  /* One request per attempt; an answer that arrives after a newer attempt started is dropped */
  React.useEffect(() => {
    let current = true;

    fetchTowns().then((towns) => {
      if (current) {
        setOptions(towns);
      }
    }, () => undefined);

    return () => {
      current = false;
    };
  }, [ attempt ]);

  const handleReload = React.useCallback(() => {
    setOptions(null);
    setAttempt((count) => count + 1);
  }, []);

  return (
    <Stack gap={3} className={'w-full max-w-xs'}>
      <Field>
        <Field.Label>Town</Field.Label>
        {options === null
          ? <Select options={[]} value={town} placeholder={'Select'} loading loadingLabel={'Loading the towns'} labels={labels} />
          : <Select options={options} value={town} onValueChange={setTown} placeholder={'Select'} labels={labels} />}
        <Field.Description>The towns arrive from the server, all at once.</Field.Description>
      </Field>
      <Button size={'sm'} fill={'soft'} tone={'secondary'} onClick={handleReload}>Load again</Button>
    </Stack>
  );
}
