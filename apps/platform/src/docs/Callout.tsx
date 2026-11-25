import * as React from 'react';

import { Info, TriangleAlert } from 'lucide-react';

import { cn } from '@proedis/ui/core';
import { Stack } from '@proedis/ui/layout';


/* --------
 * Types Definition
 * -------- */

interface CalloutProps {
  /** `note` adds context; `warning` is a footgun, with what happens if it is ignored */
  tone?: 'note' | 'warning';

  title?: React.ReactNode;

  children: React.ReactNode;
}


/* --------
 * Component Definition
 * -------- */

/** A paragraph set apart from the running text */
export function Callout(props: CalloutProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { children, title, tone = 'note' } = props;
  const Icon = tone === 'warning' ? TriangleAlert : Info;


  // ----
  // Component Render
  // ----
  return (
    <Stack
      direction={'horizontal'}
      align={'start'}
      gap={3}
      className={cn(
        'max-w-3xl rounded-xl border px-4 py-3.5 text-sm/6',
        tone === 'warning'
          ? 'border-warning/40 bg-warning-soft text-warning-soft-foreground'
          : 'border-info/30 bg-info-soft text-info-soft-foreground'
      )}
    >
      <Icon aria-hidden className={'mt-1 size-4 shrink-0'} />
      <Stack gap={1} className={'min-w-0 [&_code]:bg-current/10 [&_code]:text-current'}>
        {title && <p className={'font-semibold'}>{title}</p>}
        <div>{children}</div>
      </Stack>
    </Stack>
  );

}

Callout.displayName = 'Callout';
