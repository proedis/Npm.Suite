import * as React from 'react';

import { Search, X } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { EmptyState } from '@proedis/ui/feedback/empty-state';


export default function Example(): React.ReactNode {
  return (
    <EmptyState>
      <EmptyState.Icon><Search /></EmptyState.Icon>
      <EmptyState.Title>No contract for “rossy”</EmptyState.Title>
      <EmptyState.Description>Check the spelling or clear the filters.</EmptyState.Description>
      <EmptyState.Actions>
        <Button size={'sm'} fill={'plain'} tone={'destructive'} leading={<X />}>Clear filters</Button>
      </EmptyState.Actions>
    </EmptyState>
  );
}
