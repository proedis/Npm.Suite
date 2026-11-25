import * as React from 'react';

import { Checkbox } from '@proedis/ui/forms/checkbox';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={4} className={'w-full max-w-lg'}>
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Partial</Checkbox>
      <Checkbox invalid>Invalid</Checkbox>
      <Checkbox readOnly defaultChecked>Read only</Checkbox>
      <Checkbox disabled defaultChecked>Disabled</Checkbox>
    </Stack>
  );
}
