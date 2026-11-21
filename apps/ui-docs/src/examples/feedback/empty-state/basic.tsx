import * as React from 'react';

import { Search } from 'lucide-react';

import { EmptyState } from '@proedis/ui/feedback/empty-state';


export default function Example(): React.ReactNode {
  return (
    <EmptyState
      kind={'no-results'}
      icon={<Search />}
      title={'No contract for “rossy”'}
      description={'Check the spelling or clear the filters.'}
      actions={[ { role: 'clear', label: 'Clear filters', onClick: () => undefined } ]}
    />
  );
}
