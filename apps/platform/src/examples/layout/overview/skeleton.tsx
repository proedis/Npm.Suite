import * as React from 'react';

import { Container, Grid, Split, Stack } from '@proedis/ui/layout';

import { Block } from '../Block';


/**
 * The bones of a screen, before any look: the page column, a header that turns from a column into a row,
 * a rail beside the content from `lg`, and as many cards as fit. Nothing in it writes a display or a gap.
 */
export default function Example(): React.ReactNode {
  return (
    <Container size={'full'} padded={false}>
      <Stack gap={'lg'}>
        <Stack direction={{ base: 'vertical', md: 'horizontal' }} justify={'between'} gap={'sm'}>
          <Block>Title and description</Block>
          <Stack direction={'horizontal'} gap={'xs'}>
            <Block>Action</Block>
            <Block>Action</Block>
          </Stack>
        </Stack>

        <Split rail={<Block>Rail: filters, navigation</Block>} railWidth={'14rem'} collapseBelow={'lg'} gap={'lg'}>
          <Grid minColWidth={180} gap={'md'}>
            <Block>Card</Block>
            <Block>Card</Block>
            <Block>Card</Block>
            <Block>Card</Block>
          </Grid>
        </Split>
      </Stack>
    </Container>
  );
}
