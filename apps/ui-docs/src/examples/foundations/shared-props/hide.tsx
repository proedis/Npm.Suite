import * as React from 'react';

import { Monitor, Smartphone } from 'lucide-react';

import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';
import { Cluster, Stack } from '@proedis/ui/layout';

import type { MediaBreakpoint } from '@proedis/ui/core';


const BREAKPOINTS: readonly MediaBreakpoint[] = [ 'sm', 'md', 'lg', 'xl', '2xl' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={6} className={'w-full'}>
      {/* Two halves of one layout: exactly one of them is on screen at any width */}
      <Item hideBelow={'lg'} inset className={'rounded-xl border border-border'}>
        <IconBox fill={'soft'} tone={'primary'}><Monitor /></IconBox>
        <Heading>
          <Heading.Title>The desktop half</Heading.Title>
          <Heading.Description>With hideBelow lg: shown from lg up</Heading.Description>
        </Heading>
      </Item>
      <Item hideFrom={'lg'} inset className={'rounded-xl border border-border'}>
        <IconBox fill={'soft'} tone={'info'}><Smartphone /></IconBox>
        <Heading>
          <Heading.Title>The mobile half</Heading.Title>
          <Heading.Description>With hideFrom lg: shown below lg</Heading.Description>
        </Heading>
      </Item>

      {/* Resize the window: each badge appears at its own breakpoint */}
      <Cluster gap={2}>
        <Badge fill={'solid'} tone={'primary'}>always</Badge>
        {BREAKPOINTS.map((breakpoint) => (
          <Badge key={breakpoint} fill={'soft'} tone={'primary'} hideBelow={breakpoint}>from {breakpoint}</Badge>
        ))}
      </Cluster>
    </Stack>
  );
}
