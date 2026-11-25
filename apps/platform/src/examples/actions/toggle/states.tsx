import * as React from 'react';

import { Bell } from 'lucide-react';

import { Toggle } from '@proedis/ui/actions/toggle';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ alerts, setAlerts ] = React.useState(false);
  const [ saving, setSaving ] = React.useState(false);

  /** Stands in for a request: the toggle is disabled, with a spinner, until the change is saved */
  const handleAlerts = React.useCallback((next: boolean) => {
    setAlerts(next);
    setSaving(true);
    window.setTimeout(() => setSaving(false), 1500);
  }, []);

  return (
    <Cluster gap={3}>
      <Toggle disabled disabledReason={'Only a dispatcher can change the layout'}>Edit layout</Toggle>
      {/* The label never changes with the state: aria-pressed says it. Pending, the icon is a spinner */}
      <Toggle leading={<Bell />} pressed={alerts} pending={saving} onPressedChange={handleAlerts}>
        Delay alerts
      </Toggle>
    </Cluster>
  );
}
