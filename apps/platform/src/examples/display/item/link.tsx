import * as React from 'react';

import { Link } from '@tanstack/react-router';
import { ArrowRight, BookOpen } from 'lucide-react';

import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';


/** A row that navigates: the router's link is the element, the item stays presentational */
export default function Example(): React.ReactNode {
  return (
    <Item as={Link} to={'/ui'} interactive inset className={'w-full max-w-md rounded-xl border border-border'}>
      <Item.Icon><IconBox tone={'primary'}><BookOpen /></IconBox></Item.Icon>
      <Item.Heading>
        <Heading.Title>Back to the overview</Heading.Title>
        <Heading.Description>Every section of the package</Heading.Description>
      </Item.Heading>
      <Item.Trailing><ArrowRight className={'size-4'} /></Item.Trailing>
    </Item>
  );
}
