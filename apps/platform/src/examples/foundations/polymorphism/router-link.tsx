import * as React from 'react';

import { Link } from '@tanstack/react-router';
import { ChevronRight, Palette } from 'lucide-react';

import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';


export default function Example(): React.ReactNode {
  return (
    /* The router's own Link as the element: a real anchor, with the router's navigation on click */
    <Item as={Link} to={'/ui/foundations/tones'} interactive inset className={'w-full max-w-md rounded-xl border border-border'}>
      <Item.Icon><IconBox fill={'soft'} tone={'primary'}><Palette /></IconBox></Item.Icon>
      <Item.Heading>
        <Heading.Title>Tones</Heading.Title>
        <Heading.Description>Seven tones, three fills</Heading.Description>
      </Item.Heading>
      <Item.Trailing><ChevronRight className={'size-4'} /></Item.Trailing>
    </Item>
  );
}
