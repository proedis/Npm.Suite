import * as React from 'react';

import { Combobox } from '@proedis/ui/forms/combobox';
import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import type { ComboboxItem } from '@proedis/ui/forms/combobox';

import { CONTRACTS } from './contracts';
import labels from './labels';
import useContractSearch from './useContractSearch';


/** A field that opens with its value: the record comes with the form, no search needed to show it */
function ContractField(props: { required: boolean; initial: ComboboxItem; description: string }): React.ReactNode {
  const { description, initial, required } = props;

  const search = useContractSearch();
  const [ contract, setContract ] = React.useState<ComboboxItem | null>(initial);

  const handleValueChange = React.useCallback((_value: string | null, item: ComboboxItem | null) => setContract(item), []);

  return (
    <Field>
      <Field.Label required={required} optional={required ? undefined : 'optional'}>Contract</Field.Label>
      <Combobox
        value={contract?.value ?? null}
        selectedItem={contract}
        onValueChange={handleValueChange}
        labels={labels}
        {...search}
      />
      <Field.Description>{description}</Field.Description>
    </Field>
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} className={'w-full max-w-md'}>
      <ContractField
        required
        initial={CONTRACTS[3]}
        description={'Required: no x. Empty the text and leave: the value comes back.'}
      />
      <ContractField
        required={false}
        initial={CONTRACTS[10]}
        description={'Optional: the x empties it, and an emptied text empties it on leaving.'}
      />
    </Stack>
  );
}
