import * as React from 'react';

import { Download, Filter, Printer, RefreshCw, Share2 } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Box, Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack direction={'horizontal'} wrap gap={2}>
      <Button fill={'soft'} leading={<Filter />}>Filters</Button>
      <Button fill={'soft'} leading={<RefreshCw />}>Refresh</Button>

      {/*
        * `contents` takes the Box out of the layout: its buttons are children of the row, with the
        * row's gap. hideBelow adds `not-md:hidden`, which hides them below md and touches nothing above.
        */}
      <Box hideBelow={'md'} className={'contents'}>
        <Button fill={'soft'} leading={<Download />}>Export</Button>
        <Button fill={'soft'} leading={<Printer />}>Print</Button>
        <Button fill={'soft'} leading={<Share2 />}>Share</Button>
      </Box>
    </Stack>
  );
}
