import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Surface } from '@proedis/ui/display/surface';
import { Combobox } from '@proedis/ui/forms/combobox';
import { Field } from '@proedis/ui/forms/field';
import { Select } from '@proedis/ui/forms/select';
import { Stack } from '@proedis/ui/layout';

import type { ComboboxItem } from '@proedis/ui/forms/combobox';

import labels from './labels';
import useContractSearch from './useContractSearch';


const CONTAINERS = [
  { value: '120', label: '120 l bin' },
  { value: '240', label: '240 l bin' },
  { value: '1100', label: '1,100 l container' }
];

const SELECT_LABELS = { search: 'Search', noResults: 'Nothing matches', clear: 'Clear' };


export default function Example(): React.ReactNode {
  const search = useContractSearch();
  const [ contract, setContract ] = React.useState<ComboboxItem | null>(null);

  const handleValueChange = React.useCallback((_value: string | null, item: ComboboxItem | null) => setContract(item), []);

  return (
    <Surface className={'w-full max-w-lg'}>
      <Surface.Section>
        <Stack gap={5}>
          <Field required label={'Contract'} description={'The contract the container is delivered to.'}>
            <Combobox
              required
              value={contract?.value ?? null}
              selectedItem={contract}
              onValueChange={handleValueChange}
              labels={labels}
              {...search}
            />
          </Field>
          <Field required label={'Container'} description={'The size on the delivery note.'}>
            <Select options={CONTAINERS} placeholder={'Select'} labels={SELECT_LABELS} />
          </Field>
        </Stack>
      </Surface.Section>
      <Surface.Footer muted>
        <Button fill={'plain'} tone={'muted'}>Cancel</Button>
        <Button>Schedule the delivery</Button>
      </Surface.Footer>
    </Surface>
  );
}
