import * as React from 'react';

import { Combobox } from '@proedis/ui/forms/combobox';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import type { ComboboxItem } from '@proedis/ui/forms/combobox';

import labels from './labels';
import useContractSearch from './useContractSearch';


export default function Example(): React.ReactNode {
  const search = useContractSearch({ slow: true });
  const [ contract, setContract ] = React.useState<ComboboxItem | null>(null);

  const handleValueChange = React.useCallback((_value: string | null, item: ComboboxItem | null) => setContract(item), []);

  return (
    <Stack gap={3} className={'w-full max-w-md'}>
      <Field>
        <Field.Label>Contract</Field.Label>
        <Combobox
          value={contract?.value ?? null}
          selectedItem={contract}
          onValueChange={handleValueChange}
          labels={labels}
          {...search}
        />
        <Field.Description>Type “UT-004812” and press Enter at once, as a scanner would.</Field.Description>
      </Field>
      <p className={'text-sm text-muted-foreground'}>
        Chosen: <span className={'font-medium text-foreground'}>{contract ? `${contract.label} · ${contract.code}` : 'nothing yet'}</span>
      </p>
    </Stack>
  );
}
