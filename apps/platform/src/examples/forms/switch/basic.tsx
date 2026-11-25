import * as React from 'react';

import { Switch } from '@proedis/ui/forms/switch';


export default function Example(): React.ReactNode {
  const [ showClosed, setShowClosed ] = React.useState(false);

  return (
    <Switch checked={showClosed} onCheckedChange={setShowClosed}>Show the closed rounds too</Switch>
  );
}
