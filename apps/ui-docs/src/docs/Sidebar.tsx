import * as React from 'react';

import { Link, useLocation } from '@tanstack/react-router';

import { cn } from '@proedis/ui/core';
import { Stack } from '@proedis/ui/layout';

import { NAV } from '@/nav';

import type { NavItem } from '@/nav';


/* --------
 * Parts
 * -------- */

const ITEM = 'relative -ms-px border-s py-1.5 ps-4 text-sm';

function SidebarItem(props: { item: NavItem; active: boolean; onNavigate?: () => void }): React.ReactNode {
  const { active, item, onNavigate } = props;
  const Icon = item.icon;

  /* A page still to write is in the map, greyed and not a link: a dead link is worse than a grey line */
  if (!item.ready) {
    return (
      <Stack
        as={'span'}
        direction={'horizontal'}
        align={'center'}
        gap={2.5}
        className={cn(ITEM, 'cursor-default border-transparent text-muted-foreground/60')}
      >
        <Icon aria-hidden className={'size-4 shrink-0'} />
        <span className={'truncate'}>{item.title}</span>
      </Stack>
    );
  }

  return (
    <Stack
      as={Link}
      to={item.to as never}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      direction={'horizontal'}
      align={'center'}
      gap={2.5}
      className={cn(
        ITEM,
        'outline-none transition-colors focus-visible:text-foreground focus-visible:underline',
        active
          ? 'border-primary font-medium text-primary'
          : 'border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground'
      )}
    >
      <Icon aria-hidden className={'size-4 shrink-0'} />
      <span className={'truncate'}>{item.title}</span>
    </Stack>
  );
}


/* --------
 * Component Definition
 * -------- */

/** Every page, by group: the written ones as links, the others greyed */
export function Sidebar(props: { onNavigate?: () => void }): React.ReactNode {

  // ----
  // Internal Hooks
  // ----
  const { pathname } = useLocation();
  const current = pathname.replace(/\/$/, '') || '/';


  // ----
  // Internal Refs
  // ----
  const navRef = React.useRef<HTMLElement | null>(null);


  // ----
  // Lifecycle Events
  // ----

  /**
   * The page being read is in view in the navigation: on load, and after a navigation that did not come
   * from a click on it (the pager, a link in a page). An entry already in view is left where it is, so a
   * click does not make the list jump.
   */
  React.useEffect(() => {
    const nav = navRef.current;
    const scroller = nav?.closest<HTMLElement>('[data-slot="scroll-area"]');
    const entry = nav?.querySelector<HTMLElement>('[aria-current="page"]');

    if (!scroller || !entry) {
      return;
    }

    const view = scroller.getBoundingClientRect();
    const box = entry.getBoundingClientRect();

    if (box.top >= view.top && box.bottom <= view.bottom) {
      return;
    }

    scroller.scrollTop += box.top - view.top - (view.height - box.height) / 2;
  }, [ current ]);


  // ----
  // Component Render
  // ----
  return (
    <Stack ref={navRef} as={'nav'} aria-label={'Documentation'} gap={8}>
      {NAV.map((group) => (
        <Stack key={group.title} gap={3}>
          <h2 className={'text-sm font-semibold text-foreground'}>{group.title}</h2>
          <Stack gap={0} as={'ul'} className={'border-s border-border'}>
            {group.items.map((item) => (
              <li key={item.to}>
                <SidebarItem item={item} active={item.to === current} onNavigate={props.onNavigate} />
              </li>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );

}

Sidebar.displayName = 'Sidebar';
