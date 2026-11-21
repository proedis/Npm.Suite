import * as React from 'react';

import { Combobox } from '@proedis/ui/forms/combobox';
import { Field } from '@proedis/ui/forms/field';
import { Switch } from '@proedis/ui/forms/switch';
import { Cluster, Stack } from '@proedis/ui/layout';

import type { ComboboxItem } from '@proedis/ui/forms/combobox';

import labels from './labels';
import useContractSearch from './useContractSearch';


export default function Example(): React.ReactNode {
  const [ slow, setSlow ] = React.useState(true);
  const [ failing, setFailing ] = React.useState(false);
  const [ contract, setContract ] = React.useState<ComboboxItem | null>(null);

  const search = useContractSearch({ slow, failing });

  const handleValueChange = React.useCallback((_value: string | null, item: ComboboxItem | null) => setContract(item), []);

  return (
    <Stack gap={5} className={'w-full max-w-md'}>
      <Cluster gap={6}>
        <Switch checked={slow} onCheckedChange={setSlow}>Slow server</Switch>
        <Switch checked={failing} onCheckedChange={setFailing}>Failing server</Switch>
      </Cluster>

      <Field>
        <Field.Label>Contract</Field.Label>
        <Combobox
          value={contract?.value ?? null}
          selectedItem={contract}
          onValueChange={handleValueChange}
          labels={labels}
          {...search}
        />
        <Field.Description>Type one letter, then two, then “zzz”; turn the failure on and type again.</Field.Description>
      </Field>
    </Stack>
  );
}
