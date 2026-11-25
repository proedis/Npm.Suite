import * as React from 'react';

import { Avatar } from '@proedis/ui/display/person';
import { Cluster } from '@proedis/ui/layout';

import type { AvatarRadius } from '@proedis/ui/display/person';


const RADII: readonly AvatarRadius[] = [ 'default', 'xl', 'md', 'none' ];


export default function Example(): React.ReactNode {
  return (
    <Cluster gap={'md'}>
      {RADII.map((radius) => (
        <Avatar key={radius} kind={'person'} name={`radius="${radius}"`} initials={'RM'} radius={radius} size={40} />
      ))}
      <Avatar kind={'organization'} name={'Comune di Chieri, radius="md"'} radius={'md'} size={40} />
    </Cluster>
  );
}
