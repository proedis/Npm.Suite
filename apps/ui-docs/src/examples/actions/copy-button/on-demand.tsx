import * as React from 'react';

import { CopyButton } from '@proedis/ui/actions/copy-button';
import { Cluster } from '@proedis/ui/layout';


/** A link the server makes only when asked: the function runs at the press, and may take its time */
async function createShareLink(): Promise<string> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 600);
  });

  return `https://app.proedis.it/s/${Math.random().toString(36).slice(2, 8)}`;
}


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={'xs'} align={'center'}>
      <span className={'text-sm'}>Round R-14, Monday</span>
      <CopyButton
        fill={'soft'}
        value={createShareLink}
        labels={{ copy: 'Copy a share link', copied: 'Link copied', failed: 'Could not copy the link' }}
      />
    </Cluster>
  );
}
