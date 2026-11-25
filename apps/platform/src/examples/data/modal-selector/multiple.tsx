import * as React from 'react';

import { TriangleAlert, Users } from 'lucide-react';

import { ModalSelector, ModalSelectorField } from '@proedis/ui/data/modal-selector';
import { Field } from '@proedis/ui/forms/field';

import type { TableSelection } from '@proedis/ui/data/table';
import { CUSTOMERS } from '../fixtures';

import { customerColumns, customerLabel, customerSelectorLabels } from './customers';

import type { Customer } from '../fixtures';


export default function Example(): React.ReactNode {
  const [ customers, setCustomers ] = React.useState<Customer[]>([ CUSTOMERS[3], CUSTOMERS[11] ] as Customer[]);
  const [ open, setOpen ] = React.useState(false);
  const [ term, setTerm ] = React.useState('');
  const [ outcome, setOutcome ] = React.useState<string | null>(null);
  const fieldRef = React.useRef<HTMLButtonElement>(null);

  const handleOpen = React.useCallback((text: string) => {
    setTerm(text);
    setOpen(true);
  }, []);

  /** By ids, the rows come along; "all but a few" is for the server to resolve */
  const handleConfirm = React.useCallback((selection: TableSelection, rows: Customer[]) => {
    if (selection.all) {
      setOutcome(`Every customer of the search but ${selection.excludedIds.length}: the server resolves which`);
      return;
    }

    setOutcome(null);
    setCustomers(rows);
  }, []);

  return (
    <Field className={'w-full max-w-md'} label={'Customers to notify'} hint={outcome}>
      <ModalSelectorField
        value={customers}
        getRowLabel={customerLabel}
        buttonRef={fieldRef}
        onOpen={handleOpen}
        onClear={() => setCustomers([])}
        labels={{ placeholder: 'Choose the customers', clear: 'Clear Customers to notify', more: (count) => `${count} more customers` }}
      />

      <ModalSelector
        multiple
        supportsAll
        open={open}
        onOpenChange={setOpen}
        title={'Customers to notify'}
        description={'They receive the notice of the new collection calendar'}
        icon={<Users />}
        mode={'client'}
        columns={customerColumns}
        rows={CUSTOMERS}
        getRowId={(row) => row.id}
        getRowLabel={customerLabel}
        search={{ value: term, onValueChange: setTerm, label: 'Search by name or code', placeholder: 'E.g. Panificio' }}
        value={customers.map((customer) => customer.id)}
        selectedRows={customers}
        onConfirm={handleConfirm}
        confirmLabel={(count) => (count === 1 ? 'Notify 1 customer' : `Notify ${count} customers`)}
        discard={{
          title      : 'Discard the choices?',
          description: 'The customers ticked since you opened the list will not be added.',
          action     : 'Discard',
          cancel     : 'Keep choosing',
          icon       : <TriangleAlert />
        }}
        returnFocus={fieldRef}
        labels={customerSelectorLabels}
      />
    </Field>
  );
}
