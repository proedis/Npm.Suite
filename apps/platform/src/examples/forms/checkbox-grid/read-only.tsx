import * as React from 'react';

import { CheckboxGrid } from '@proedis/ui/forms/checkbox-grid';

import labels from './labels';
import { COLUMNS, GROUPS, SAVED } from './permissions';


export default function Example(): React.ReactNode {
  return (
    <CheckboxGrid
      readOnly
      groups={GROUPS}
      columns={COLUMNS}
      value={SAVED}
      defaultOpenGroups={[ 'fleet' ]}
      labels={labels}
      className={'w-full'}
    />
  );
}
