import * as React from 'react';

import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';

import type { LinkTarget } from '@proedis/ui/core';


export default function Example(): React.ReactNode {
  const navigate = useNavigate();

  /** What the application's own navigation would hand over: an address and a way to go there */
  const overview: LinkTarget = {
    href: '/',
    go  : () => {
      navigate({ to: '/' }).catch(() => undefined);
    }
  };

  return (
    <Cluster gap={3}>
      <Button to={overview} fill={'soft'} leading={<ArrowLeft />}>Back to the overview</Button>
      <Button to={overview} fill={'plain'} disabled>Disabled link</Button>
    </Cluster>
  );
}
