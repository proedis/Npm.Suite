import * as React from 'react';

import { Check, X } from 'lucide-react';

import { Stack } from '@proedis/ui/layout';
import { IconBox } from '@proedis/ui/display/icon-box';

import { useDocsTarget } from './target';


/* --------
 * Types Definition
 * -------- */

interface GuidanceProps {
  /** `do` what to reach for, `dont` what to avoid */
  kind: 'do' | 'dont';

  /** The rule, in one line */
  title: React.ReactNode;

  /** Why, and the example that makes it concrete */
  children?: React.ReactNode;
}


/* --------
 * Components Definition
 * -------- */

/** Two columns of rules from a width up */
export function GuidanceGrid(props: { children: React.ReactNode }): React.ReactNode {
  return <Stack columns={{ base: 1, md: 2 }} gap={4}>{props.children}</Stack>;
}

GuidanceGrid.displayName = 'GuidanceGrid';


/** A rule of use, told by the mark and the word as well as by the colour */
export function Guidance(props: GuidanceProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { children, kind, title } = props;
  const isDo = kind === 'do';


  // ----
  // Internal Hooks
  // ----
  const { mode } = useDocsTarget();


  // ----
  // Component Render
  // ----
  /** In text the mark is a word in front of the rule */
  if (mode === 'text') {
    return (
      <React.Fragment>
        <p><strong>{isDo ? 'Do' : 'Avoid'}</strong>: {title}</p>
        {children && <p>{children}</p>}
      </React.Fragment>
    );
  }

  return (
    <Stack gap={3} className={'rounded-xl border border-border bg-card p-5'}>
      <Stack direction={'horizontal'} align={'center'} gap={2}>
        <IconBox size={'xs'} radius={'full'} fill={'soft'} tone={isDo ? 'success' : 'destructive'}>
          {isDo ? <Check /> : <X />}
        </IconBox>
        <span className={isDo ? 'text-sm font-semibold text-success' : 'text-sm font-semibold text-destructive'}>
          {isDo ? 'Do' : 'Avoid'}
        </span>
      </Stack>
      <p className={'font-semibold text-foreground'}>{title}</p>
      {children && <div className={'text-sm/6 text-muted-foreground'}>{children}</div>}
    </Stack>
  );

}

Guidance.displayName = 'Guidance';
