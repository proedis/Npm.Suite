import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ loading, setLoading ] = React.useState(false);

  const handleRefresh = React.useCallback(() => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1800);
  }, []);

  return (
    <Surface loading={loading} loadingLabel={'Refreshing the totals'} className={'w-full max-w-md'}>
      <Surface.Header>
        <Heading size={'lg'}>
          <Heading.Title>Totals of the day</Heading.Title>
        </Heading>
      </Surface.Header>
      <Surface.Section>
        <Stack columns={3} gap={4}>
          <LabeledContent>
            <LabeledContent.Label>Stops</LabeledContent.Label>
            <LabeledContent.Value>29 / 38</LabeledContent.Value>
          </LabeledContent>
          <LabeledContent>
            <LabeledContent.Label>Weight</LabeledContent.Label>
            <LabeledContent.Value>1,204 kg</LabeledContent.Value>
          </LabeledContent>
          <LabeledContent>
            <LabeledContent.Label>Fuel</LabeledContent.Label>
            <LabeledContent.Value>41 l</LabeledContent.Value>
          </LabeledContent>
        </Stack>
      </Surface.Section>
      <Surface.Footer>
        <Button fill={'soft'} onClick={handleRefresh}>Refresh</Button>
      </Surface.Footer>
    </Surface>
  );
}
