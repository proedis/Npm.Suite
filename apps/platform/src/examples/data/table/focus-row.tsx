import * as React from 'react';

import { ArrowLeft } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Table } from '@proedis/ui/data/table';
import { Stack } from '@proedis/ui/layout';

import type { TableColumn } from '@proedis/ui/data/table';
import { ROUNDS } from '../fixtures';

import { roundLabels } from './rounds';

import type { Round } from '../fixtures';


const ROWS = ROUNDS.slice(0, 10);


export default function Example(): React.ReactNode {
  const [ opened, setOpened ] = React.useState<Round | null>(null);
  const [ returnedFrom, setReturnedFrom ] = React.useState<string | undefined>(undefined);

  /** The code opens the detail, as a real link: a new tab keeps working */
  const columns = React.useMemo<TableColumn<Round>[]>(() => [
    { id: 'code', header: 'Round', kind: 'code', width: 'sm', target: (round) => ({ href: `#${round.code}`, go: () => setOpened(round) }) },
    { id: 'district', header: 'District', kind: 'reference', width: 'fill' },
    { id: 'stops', header: 'Stops', kind: 'number', width: 'xs' }
  ], []);

  const handleBack = React.useCallback(() => {
    setReturnedFrom(opened?.id);
    setOpened(null);
  }, [ opened ]);

  if (opened) {
    return (
      <Stack gap={3} align={'start'} className={'w-full rounded-lg border border-border p-5'}>
        <Button fill={'plain'} tone={'muted'} size={'sm'} leading={<ArrowLeft />} onClick={handleBack}>Back to the list</Button>
        <p className={'text-lg font-semibold'}>{opened.code}</p>
        <p className={'text-sm text-muted-foreground'}>{opened.district}, {opened.stops} stops</p>
      </Stack>
    );
  }

  return (
    <Table
      caption={'Collection rounds'}
      mode={'client'}
      columns={columns}
      data={ROWS}
      getRowId={(round) => round.id}
      focusRowId={returnedFrom}
      labels={roundLabels}
      className={'w-full'}
    />
  );
}
