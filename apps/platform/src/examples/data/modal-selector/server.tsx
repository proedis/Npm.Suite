import * as React from 'react';

import { FileText } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { ModalSelector } from '@proedis/ui/data/modal-selector';
import { Stack } from '@proedis/ui/layout';

import type { TableStatus } from '@proedis/ui/data/table';
import { searchCustomers } from '../fixtures';

import { customerColumns, customerLabel, customerSelectorLabels } from './customers';

import type { Customer } from '../fixtures';


/** The rows one search shows: the server sends one more, which only says there are others */
const LIMIT = 25;

const CONTRACT_OPTIONS = [
  { value: 'domestic', label: 'Domestic' },
  { value: 'business', label: 'Business' },
  { value: 'public', label: 'Public body' }
];


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ term, setTerm ] = React.useState('');
  const [ contract, setContract ] = React.useState<string | null>(null);
  const [ chosen, setChosen ] = React.useState<Customer | null>(null);
  const [ attempts, setAttempts ] = React.useState(0);

  /* The answer of the server, with the request it answered: a request without its answer is a wait */
  const [ answer, setAnswer ] = React.useState<{ key: string; rows: Customer[]; total: number } | null>(null);
  const key = JSON.stringify({ term, contract });

  React.useEffect(() => {
    let current = true;

    if (!open) {
      return undefined;
    }

    searchCustomers(term, { contract, limit: LIMIT }).then((page) => {
      if (current) {
        setAnswer({ key: JSON.stringify({ term, contract }), rows: page.rows, total: page.total });
      }
    });

    return () => {
      current = false;
    };
  }, [ open, term, contract ]);

  let status: TableStatus = 'ready';

  if (answer?.key !== key) {
    status = answer ? 'fetching' : 'loading';
  }

  /** The first confirmation fails, as a dropped connection would: the dialog stays, with the rows still chosen */
  const handleConfirm = React.useCallback((_: string, row: Customer) => new Promise<void>((resolve, reject) => {
    window.setTimeout(() => {
      setAttempts((count) => count + 1);

      if (attempts === 0) {
        reject(new Error('Network'));
        return;
      }

      setChosen(row);
      resolve();
    }, 800);
  }), [ attempts ]);

  return (
    <Stack gap={3} align={'center'}>
      <Button fill={'soft'} leading={<FileText />} onClick={() => setOpen(true)}>Assign the contract</Button>
      <p className={'text-sm text-muted-foreground'}>{chosen ? `Assigned to ${chosen.name}` : 'Not assigned yet'}</p>

      <ModalSelector
        open={open}
        onOpenChange={setOpen}
        title={'Assign the contract'}
        description={'Contract CT-2291, weekly collection'}
        icon={<FileText />}
        iconTone={'primary'}
        columns={customerColumns}
        rows={answer?.rows ?? []}
        rowCount={answer?.total}
        hasMore={(answer?.rows.length ?? 0) > LIMIT}
        status={status}
        limit={LIMIT}
        getRowId={(row) => row.id}
        getRowLabel={customerLabel}
        search={{ value: term, onValueChange: setTerm, label: 'Search by name or code', placeholder: 'E.g. CL-004813' }}
        filters={[ { id: 'contract', label: 'Contract', options: CONTRACT_OPTIONS, value: contract, onValueChange: setContract } ]}
        onClearFilters={() => setContract(null)}
        value={chosen?.id ?? null}
        selectedRow={chosen}
        onConfirm={handleConfirm}
        confirmLabel={() => 'Assign'}
        labels={customerSelectorLabels}
      />
    </Stack>
  );
}
