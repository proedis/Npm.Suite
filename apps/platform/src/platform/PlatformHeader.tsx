import * as React from 'react';

import { Link, useLocation } from '@tanstack/react-router';
import { Menu as MenuIcon } from 'lucide-react';

import { Box, Container, Stack } from '@proedis/ui/layout';
import { Badge } from '@proedis/ui/display/badge';
import { IconButton } from '@proedis/ui/actions/button';
import { Popover } from '@proedis/ui/overlays/popover';
import { ScrollArea } from '@proedis/ui/primitives';

import { Sidebar } from '@/docs/Sidebar';
import { ThemeMenu } from '@/docs/ThemeMenu';

import { sectionAt } from './sections';

import type { NavGroup } from '@/nav';


/* --------
 * Parts
 * -------- */

/** The navigation of the section on a narrow window, from a button in the bar */
function MobileNav(props: { groups: readonly NavGroup[] }): React.ReactNode {

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
      aria-label={'Navigation of the section'}
      open={open}
      onOpenChange={setOpen}
      width={'md'}
      labels={{ close: 'Close' }}
      trigger={<IconButton label={'Open the navigation'} icon={<MenuIcon />} tooltipSide={'bottom'} />}
    >
      <ScrollArea maxHeight={'70dvh'}>
        <Sidebar groups={props.groups} onNavigate={handleNavigate} />
      </ScrollArea>
    </Popover>
  );

}


/* --------
 * Component Definition
 * -------- */

/**
 * The bar across the top of every page: the name of the platform, which leads home, the section the page
 * belongs to with its version, and the theme. On a narrow window the navigation of the section opens from
 * the button at its start.
 */
export function PlatformHeader(): React.ReactNode {

  // ----
  // Internal Hooks
  // ----
  const { pathname } = useLocation();


  // ----
  // Component Render
  // ----
  const section = sectionAt(pathname);

  return (
    <Box
      as={'header'}
      className={'sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70'}
    >
      <Container size={'xl'}>
        <Stack direction={'horizontal'} align={'center'} gap={3} className={'h-14'}>
          {section?.nav && (
            <Box hideFrom={'lg'}>
              <MobileNav groups={section.nav} />
            </Box>
          )}

          <Stack as={Link} to={'/'} direction={'horizontal'} align={'center'} gap={2} className={'font-semibold text-foreground'}>
            <span className={'size-6 rounded-md bg-primary'} aria-hidden />
            <span className={section ? 'not-sm:sr-only' : undefined}>Proedis Internal Platform</span>
          </Stack>

          {section && (
            <React.Fragment>
              <span aria-hidden className={'text-muted-foreground'}>/</span>
              <Link to={section.to} className={'font-medium text-foreground'}>{section.title}</Link>
              {section.version && (
                <Badge fill={'soft'} tone={'secondary'} size={'sm'} className={'font-mono'}>{section.version}</Badge>
              )}
            </React.Fragment>
          )}

          <Box className={'ms-auto'}>
            <ThemeMenu />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
