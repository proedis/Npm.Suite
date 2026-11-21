import * as React from 'react';

import { useNavigate } from '@tanstack/react-router';
import { FileQuestion } from 'lucide-react';

import { EmptyState } from '@proedis/ui/feedback/empty-state';

import type { LinkTarget } from '@proedis/ui/core';


export default function Example(): React.ReactNode {
  const navigate = useNavigate();

  /** A destination renders the action as a real link */
  const overview: LinkTarget = {
    href: '/',
    go  : () => {
      navigate({ to: '/' }).catch(() => undefined);
    }
  };

  return (
    <EmptyState
      kind={'not-found'}
      icon={<FileQuestion />}
      title={'This page is not there'}
      description={'The address may be old, or the page was moved.'}
      actions={[ { role: 'back', label: 'Back to the overview', target: overview } ]}
    />
  );
}
