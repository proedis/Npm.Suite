import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { CheckboxGrid } from '@proedis/ui/forms/checkbox-grid';
import { Stack } from '@proedis/ui/layout';

import type { CheckboxGridValue } from '@proedis/ui/forms/checkbox-grid';

import labels from './labels';
import { COLUMNS, grantReadWithOthers, GROUPS, SAVED } from './permissions';


export default function Example(): React.ReactNode {
  const [ saved, setSaved ] = React.useState<CheckboxGridValue>(SAVED);
  const [ value, setValue ] = React.useState<CheckboxGridValue>(SAVED);

  const handleSave = React.useCallback(() => setSaved(value), [ value ]);
  const handleReset = React.useCallback(() => setValue(saved), [ saved ]);

  return (
    <Stack gap={4} className={'w-full'}>
      <CheckboxGrid
        groups={GROUPS}
        columns={COLUMNS}
        value={value}
        savedValue={saved}
        onValueChange={setValue}
        resolve={grantReadWithOthers}
        defaultOpenGroups={[ 'collection' ]}
        labels={labels}
      />
      <Stack direction={'horizontal'} justify={'end'} gap={2}>
        <Button fill={'plain'} tone={'muted'} onClick={handleReset}>Discard changes</Button>
        <Button onClick={handleSave}>Save the profile</Button>
      </Stack>
    </Stack>
  );
}
