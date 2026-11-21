import * as React from 'react';

import { Trash2 } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';
import { AlertDialog } from '@proedis/ui/overlays/alert-dialog';

import type { AlertDialogResult } from '@proedis/ui/overlays/alert-dialog';
import LABELS from './labels';


type Scenario = 'partial' | 'error' | 'silent';


export default function Example(): React.ReactNode {
  const [ scenario, setScenario ] = React.useState<Scenario | null>(null);
  const [ running, setRunning ] = React.useState(false);
  const [ error, setError ] = React.useState<string | null>(null);
  const [ result, setResult ] = React.useState<AlertDialogResult | undefined>(undefined);

  const open = React.useCallback((next: Scenario) => {
    setScenario(next);
    setRunning(false);
    setError(null);
    setResult(undefined);
  }, []);

  const handleOpenChange = React.useCallback((next: boolean) => {
    if (!next) {
      setScenario(null);
    }
  }, []);

  /** Stands in for the request: each scenario ends a different way, the silent one never */
  const handleAction = React.useCallback(() => {
    setRunning(true);
    setError(null);

    if (scenario === 'silent') {
      return;
    }

    window.setTimeout(() => {
      setRunning(false);

      if (scenario === 'error') {
        setError('The server could not be reached. Nothing was deleted: try again.');
        return;
      }

      setResult({ title: '8 of 12 stops deleted', description: '4 are on a route today and stay until it ends.' });
    }, 1200);
  }, [ scenario ]);

  return (
    <Cluster gap={3}>
      <Button fill={'soft'} tone={'secondary'} onClick={() => open('partial')}>Partly done</Button>
      <Button fill={'soft'} tone={'secondary'} onClick={() => open('error')}>An error to retry</Button>
      <Button fill={'soft'} tone={'secondary'} onClick={() => open('silent')}>No answer</Button>

      <AlertDialog
        open={scenario !== null}
        onOpenChange={handleOpenChange}
        icon={<Trash2 />}
        title={'Delete 12 stops?'}
        description={'They cannot be recovered.'}
        busy={running ? 'action' : false}
        error={error}
        result={result}
        timeoutMs={4000}
        actionLabel={'Delete 12 stops'}
        onAction={handleAction}
        cancelLabel={'Cancel'}
        labels={LABELS}
      />
    </Cluster>
  );
}
