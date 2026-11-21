import * as React from 'react';

import { Link, useLocation } from '@tanstack/react-router';
import { Menu as MenuIcon } from 'lucide-react';

import { Box, Container, Split, Stack } from '@proedis/ui/layout';
import { Badge } from '@proedis/ui/display/badge';
import { IconButton } from '@proedis/ui/actions/button';
import { TooltipProvider } from '@proedis/ui/actions/tooltip';
import { Popover } from '@proedis/ui/overlays/popover';
import { ScrollArea } from '@proedis/ui/primitives';

import { Pager } from './Pager';
import { Sidebar } from './Sidebar';
import { ThemeMenu } from './ThemeMenu';
import { Toc } from './Toc';
import { useScrollAlong } from './useScrollAlong';


/* --------
 * Constants Definition
 * -------- */

/** The height of the bar, `h-14`: where the sticky columns stop under it */
const HEADER_HEIGHT = 56;


/* --------
 * Parts
 * -------- */

/** The navigation on a narrow window, from a button in the bar */
function MobileNav(): React.ReactNode {

  // ----
  // Internal State
  // ----
  const [ open, setOpen ] = React.useState(false);


  // ----
  // Handlers
  // ----
  const handleNavigate = React.useCallback(() => setOpen(false), []);


  // ----
  // Component Render
  // ----
  return (
    <Popover
      aria-label={'Documentation'}
      open={open}
      onOpenChange={setOpen}
      width={'md'}
      labels={{ close: 'Close' }}
      trigger={<IconButton label={'Open the navigation'} icon={<MenuIcon />} tooltipSide={'bottom'} />}
    >
      <ScrollArea maxHeight={'70dvh'}>
        <Sidebar onNavigate={handleNavigate} />
      </ScrollArea>
    </Popover>
  );

}


/** The bar across the top: the name of the site, and the theme */
function Header(): React.ReactNode {
  return (
    <Box
      as={'header'}
      className={'sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70'}
    >
      <Container size={'xl'}>
        <Stack direction={'horizontal'} align={'center'} gap={3} className={'h-14'}>
          <Box hideFrom={'lg'}>
            <MobileNav />
          </Box>

          <Stack as={Link} to={'/'} direction={'horizontal'} align={'center'} gap={2} className={'font-semibold text-foreground'}>
            <span className={'size-6 rounded-md bg-primary'} aria-hidden />
            Proedis UI
          </Stack>
          <Badge fill={'soft'} tone={'secondary'} size={'sm'} className={'font-mono'}>2.0</Badge>

          <Box className={'ms-auto'}>
            <ThemeMenu />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * The frame of every page: the bar, the navigation rail from `lg`, the page, and the outline of the
 * page from `xl`. Built with the package it documents, so the site is its first consumer.
 */
export function DocsLayout(props: { children: React.ReactNode }): React.ReactNode {

  // ----
  // Internal Hooks
  // ----
  const { pathname } = useLocation();


  // ----
  // Internal Refs
  // ----
  const railRef = React.useRef<HTMLDivElement | null>(null);
  const outlineRef = React.useRef<HTMLElement | null>(null);

  /** Both columns move with the page when taller than the window, never with a scroll of their own */
  useScrollAlong(railRef, HEADER_HEIGHT);
  useScrollAlong(outlineRef, HEADER_HEIGHT);


  // ----
  // Lifecycle Events
  // ----

  /** A new page starts at its top, unless the address points into it */
  React.useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0 });
    }
  }, [ pathname ]);


  // ----
  // Component Render
  // ----
  return (
    <TooltipProvider>
      <Header />

      <Container size={'xl'}>
        <Split
          collapseBelow={'lg'}
          railWidth={'15rem'}
          gap={{ base: 0, lg: 10 }}
          rail={(
            <Box ref={railRef} hideBelow={'lg'} className={'sticky top-14 -mt-px self-start py-10 pe-2'}>
              <Sidebar />
            </Box>
          )}
        >
          <Stack direction={'horizontal'} align={'start'} gap={12}>
            <Box as={'main'} className={'min-w-0 flex-1 pt-10 pb-24'}>
              {props.children}
              <Pager />
            </Box>

            <Box ref={outlineRef} as={'aside'} hideBelow={'xl'} className={'sticky top-14 w-56 shrink-0 py-10'}>
              <Toc key={pathname} />
            </Box>
          </Stack>
        </Split>
      </Container>
    </TooltipProvider>
  );

}

DocsLayout.displayName = 'DocsLayout';
