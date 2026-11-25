import * as React from 'react';

import { Users } from 'lucide-react';

import { ModalSelector, ModalSelectorField } from '@proedis/ui/data/modal-selector';
import { Field } from '@proedis/ui/forms/field';

import { CUSTOMERS } from '../fixtures';

import { customerColumns, customerLabel, customerSelectorLabels } from './customers';

import type { Customer } from '../fixtures';


export default function Example(): React.ReactNode {
  const [ customer, setCustomer ] = React.useState<Customer | null>(null);
  const [ open, setOpen ] = React.useState(false);
  const [ term, setTerm ] = React.useState('');
  const fieldRef = React.useRef<HTMLButtonElement>(null);

  /** A letter typed on the field opens the selector with that letter already in the search */
  const handleOpen = React.useCallback((text: string) => {
    setTerm(text);
    setOpen(true);
  }, []);

  return (
    <Field className={'w-full max-w-sm'} label={'Customer'}>
      <ModalSelectorField
        value={customer}
        getRowLabel={customerLabel}
        buttonRef={fieldRef}
        onOpen={handleOpen}
        onClear={() => setCustomer(null)}
        labels={{ placeholder: 'Choose a customer', clear: 'Clear Customer' }}
      />

      <ModalSelector
        open={open}
        onOpenChange={setOpen}
        title={'Choose a customer'}
        description={'The customer the new contract is for'}
        icon={<Users />}
        iconTone={'muted'}
        mode={'client'}
        columns={customerColumns}
        rows={CUSTOMERS}
        getRowId={(row) => row.id}
        getRowLabel={customerLabel}
        search={{ value: term, onValueChange: setTerm, label: 'Search by name or code', placeholder: 'E.g. CL-004813' }}
        enableRowSelection={(row) => (row.blocked ? { note: 'Unpaid invoices', reason: 'This customer has unpaid invoices and cannot take a new contract' } : true)}
        value={customer?.id ?? null}
        selectedRow={customer}
        onConfirm={(_, row) => setCustomer(row)}
        confirmLabel={() => 'Choose'}
        returnFocus={fieldRef}
        labels={customerSelectorLabels}
      />
    </Field>
  );
}
