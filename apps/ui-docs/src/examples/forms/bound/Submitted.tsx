import * as React from 'react';

import { Label } from '@proedis/ui/primitives';


/** What a form handed its onSubmit, as JSON: the examples show the output of the schema, not the input */
export function Submitted(props: { value: unknown }): React.ReactNode {
  if (props.value === undefined) {
    return null;
  }

  return (
    <div className={'w-full rounded-md bg-muted p-3'}>
      <Label emphasis={'quiet'}>Submitted</Label>
      <pre className={'mt-1 overflow-x-auto font-mono text-xs text-foreground'}>{JSON.stringify(props.value, null, 2)}</pre>
    </div>
  );
}
