import * as React from 'react';

import { Bell } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { TONES } from '@proedis/ui/core';
import { Badge } from '@proedis/ui/display/badge';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Stack } from '@proedis/ui/layout';

import type { ToneFill } from '@proedis/ui/core';


const FILLS: readonly ToneFill[] = [ 'solid', 'soft', 'plain' ];


/** Ten columns: the tone, then each fill of Button, Badge and IconBox side by side */
export default function Example(): React.ReactNode {
  return (
    <Stack columns={10} gap={2} align={'center'} className={'min-w-3xl'}>
      <span />
      {[ 'Button', 'Badge', 'IconBox' ].map((component) => FILLS.map((fill) => (
        <span key={`${component}-${fill}`} className={'text-center font-mono text-2xs text-muted-foreground'}>
          {component}
          <br />
          {fill}
        </span>
      )))}

      {TONES.map((tone) => (
        <React.Fragment key={tone}>
          <code className={'font-mono text-2xs text-muted-foreground'}>{tone}</code>
          {FILLS.map((fill) => (
            <Button key={`button-${fill}`} size={'sm'} fill={fill} tone={tone}>Action</Button>
          ))}
          {FILLS.map((fill) => (
            <Stack key={`badge-${fill}`} align={'center'}>
              <Badge fill={fill} tone={tone}>State</Badge>
            </Stack>
          ))}
          {FILLS.map((fill) => (
            <Stack key={`icon-${fill}`} align={'center'}>
              <IconBox size={'sm'} fill={fill} tone={tone}><Bell /></IconBox>
            </Stack>
          ))}
        </React.Fragment>
      ))}
    </Stack>
  );
}
