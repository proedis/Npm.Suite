import * as React from 'react';

import { Link, useLocation } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@proedis/ui/core';
import { Stack } from '@proedis/ui/layout';

import { findPage } from '@/nav';

import type { NavItem } from '@/nav';


/* --------
 * Parts
 * -------- */

function PagerLink(props: { item: NavItem; direction: 'previous' | 'next' }): React.ReactNode {
  const { direction, item } = props;
  const isNext = direction === 'next';

  return (
    <Stack
      as={Link}
      to={item.to as never}
      gap={1}
      align={isNext ? 'end' : 'start'}
      className={cn(
        'group rounded-xl border border-border p-4 transition-colors outline-none',
        'hover:border-primary/40 hover:bg-muted/40 focus-visible:border-primary',
        isNext && 'col-start-2 text-end'
      )}
    >
      <Stack as={'span'} direction={'horizontal'} align={'center'} gap={1.5} className={'text-xs text-muted-foreground'}>
        {!isNext && <ArrowLeft aria-hidden className={'size-3.5'} />}
        {isNext ? 'Next' : 'Previous'}
        {isNext && <ArrowRight aria-hidden className={'size-3.5'} />}
      </Stack>
      <span className={'font-semibold text-foreground group-hover:text-primary'}>{item.title}</span>
    </Stack>
  );
}


/* --------
 * Component Definition
 * -------- */

/** The written pages before and after this one */
export function Pager(): React.ReactNode {

  // ----
  // Internal Hooks
  // ----
  const { pathname } = useLocation();
  const { next, previous } = findPage(pathname);


  // ----
  // Component Render
  // ----
  if (!next && !previous) {
    return null;
  }

  return (
    <Stack as={'nav'} aria-label={'Pages'} columns={2} gap={4} className={'mt-20 border-t border-border pt-8'}>
      {previous && <PagerLink item={previous} direction={'previous'} />}
      {next && <PagerLink item={next} direction={'next'} />}
    </Stack>
  );

}

Pager.displayName = 'Pager';
