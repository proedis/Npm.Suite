import * as React from 'react';

import { useLocation } from '@tanstack/react-router';

import { Box, Container, Split, Stack } from '@proedis/ui/layout';
import { ScrollArea } from '@proedis/ui/primitives';

import { Pager } from './Pager';
import { Sidebar } from './Sidebar';
import { Toc } from './Toc';

import type { NavGroup } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

/**
 * The rail is the height of the window under the bar, and scrolls inside: sticky, it stays in view while
 * the page scrolls. `self-start` is what lets it stick at all: a grid item stretched to the height of
 * the row is as tall as the page, and a box that tall has nowhere to stick to.
 */
const RAIL_HEIGHT: React.CSSProperties = { height: 'calc(100dvh - 3.5rem)' };


/* --------
 * Component Definition
 * -------- */

/**
 * The frame of a documentation section, under the bar of the platform: the navigation rail of the section
 * from `lg`, the page, and the outline of the page from `xl`. Built with the package it documents, so the
 * site is its first consumer.
 */
export function DocsLayout(props: { nav: readonly NavGroup[]; children: React.ReactNode }): React.ReactNode {

  // ----
  // Internal Hooks
  // ----
  const { pathname } = useLocation();


  // ----
  // Component Render
  // ----
  return (
    <Container size={'xl'}>
      <Split
        collapseBelow={'lg'}
        railWidth={'15rem'}
        gap={{ base: 0, lg: 10 }}
        rail={(
          <Box hideBelow={'lg'} className={'sticky top-14 -mt-px self-start'} style={RAIL_HEIGHT}>
            <ScrollArea className={'h-full py-10 pe-2'}>
              <Sidebar groups={props.nav} />
            </ScrollArea>
          </Box>
        )}
      >
        <Stack direction={'horizontal'} align={'start'} gap={12}>
          <Box as={'main'} className={'min-w-0 flex-1 pt-10 pb-24'}>
            {props.children}
            <Pager />
          </Box>

          <Box as={'aside'} hideBelow={'xl'} className={'sticky top-14 w-56 shrink-0'}>
            <ScrollArea maxHeight={'calc(100dvh - 3.5rem)'} className={'py-10'}>
              <Toc key={pathname} />
            </ScrollArea>
          </Box>
        </Stack>
      </Split>
    </Container>
  );

}

DocsLayout.displayName = 'DocsLayout';
