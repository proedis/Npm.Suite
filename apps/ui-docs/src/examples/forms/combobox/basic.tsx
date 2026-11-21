import * as React from 'react';

import { Combobox } from '@proedis/ui/forms/combobox';
import { Field } from '@proedis/ui/forms/field';

import type { ComboboxItem } from '@proedis/ui/forms/combobox';

import labels from './labels';
import useContractSearch from './useContractSearch';


export default function Example(): React.ReactNode {
  const search = useContractSearch();
  const [ contract, setContract ] = React.useState<ComboboxItem | null>(null);

  const handleValueChange = React.useCallback((_value: string | null, item: ComboboxItem | null) => setContract(item), []);

  return (
    <Field className={'w-full max-w-md'}>
      <Field.Label>Contract</Field.Label>
      <Combobox
        value={contract?.value ?? null}
        selectedItem={contract}
        onValueChange={handleValueChange}
        labels={labels}
        {...search}
      />
      <Field.Description>The holder, the code or the address: type “rossi” or “4812”.</Field.Description>
    </Field>
  );
}
