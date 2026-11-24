import * as React from 'react';

import { Combobox } from '@proedis/ui/forms/combobox';
import { Field } from '@proedis/ui/forms/field';

import type { ComboboxItem } from '@proedis/ui/forms/combobox';

import { CONTRACTS } from './contracts';
import labels from './labels-multiple';
import useContractSearch from './useContractSearch';


export default function Example(): React.ReactNode {
  /* The multiple field has no pending Enter: it takes neither the settled term nor the flush */
  const { onFlush: _onFlush, resultsFor: _resultsFor, ...search } = useContractSearch();
  const [ contracts, setContracts ] = React.useState<ComboboxItem[]>([ CONTRACTS[3], CONTRACTS[10] ]);

  const handleValueChange = React.useCallback((_values: string[], items: ComboboxItem[]) => setContracts(items), []);

  return (
    <Field
      className={'w-full max-w-md'}
      label={'Contracts on the round'}
      description={'Search inside the list; each tick adds a chip, in the order chosen.'}
    >
      <Combobox
        multiple
        value={contracts.map((contract) => contract.value)}
        selectedItems={contracts}
        onValueChange={handleValueChange}
        labels={labels}
        {...search}
      />
    </Field>
  );
}
