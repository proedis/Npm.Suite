import * as React from 'react';

import { Bell } from 'lucide-react';

import { JobsButton } from '@proedis/ui/feedback/notifications';
import { Stack } from '@proedis/ui/layout';

import { jobsButtonLabels } from './setup';


export default function Example(): React.ReactNode {
  return (
    /* The top bar of an application: the history of the session sits at its end */
    <Stack
      direction={'horizontal'}
      align={'center'}
      justify={'between'}
      className={'h-14 w-full max-w-xl rounded-lg border border-border bg-card px-4'}
    >
      <span className={'font-semibold text-foreground'}>Collections</span>
      <JobsButton icon={<Bell />} labels={jobsButtonLabels} />
    </Stack>
  );
}
