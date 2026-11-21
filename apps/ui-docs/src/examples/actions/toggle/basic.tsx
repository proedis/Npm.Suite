import * as React from 'react';

import { Toggle } from '@proedis/ui/actions/toggle';


export default function Example(): React.ReactNode {
  const [ compact, setCompact ] = React.useState(false);

  return <Toggle pressed={compact} onPressedChange={setCompact}>Compact view</Toggle>;
}
