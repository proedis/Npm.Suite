import * as React from 'react';

import { ArrowLeft, FileQuestion } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { EmptyState } from '@proedis/ui/feedback/empty-state';


/** An action that leads somewhere is a Button with a destination: a real link */
export default function Example(): React.ReactNode {
  return (
    <EmptyState>
      <EmptyState.Icon><FileQuestion /></EmptyState.Icon>
      <EmptyState.Title>This page is not there</EmptyState.Title>
      <EmptyState.Description>The address may be old, or the page was moved.</EmptyState.Description>
      <EmptyState.Actions>
        <Button size={'sm'} tone={'muted'} leading={<ArrowLeft />} to={'/ui'}>Back to the overview</Button>
      </EmptyState.Actions>
    </EmptyState>
  );
}
