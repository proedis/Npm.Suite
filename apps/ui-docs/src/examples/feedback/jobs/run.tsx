import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';

import { notifications } from './setup';


/** Stands in for a long request: ten steps of progress, then the outcome */
function simulate(id: string, onDone: () => void): () => void {
  let value = 0;

  const timer = window.setInterval(() => {
    value += 0.1;
    notifications.jobs.progress(id, { value, detail: `${Math.round(value * 214)} of 214 points` });

    if (value >= 1) {
      window.clearInterval(timer);
      onDone();
    }
  }, 400);

  return () => window.clearInterval(timer);
}


export default function Example(): React.ReactNode {
  const handleExport = React.useCallback(() => {
    const id = notifications.jobs.start({ title: 'Exporting the collection points' });

    simulate(id, () => notifications.jobs.succeed(id, {
      title : 'Collection points exported',
      detail: '214 points, 38 KB',
      action: { label: 'Download', onClick: () => undefined }
    }));
  }, []);

  const handleRecalculate = React.useCallback(() => {
    let stop = (): void => undefined;

    const id = notifications.jobs.start({
      title : 'Recalculating the routes',
      onStop: () => stop()
    });

    stop = simulate(id, () => notifications.jobs.warn(id, {
      title : 'Routes recalculated',
      detail: 'Two stops without coordinates were left out'
    }));
  }, []);

  const handleImport = React.useCallback(() => {
    const run = (): void => {
      const id = notifications.jobs.start({ title: 'Importing the customers' });

      window.setTimeout(() => notifications.jobs.fail(id, {
        title : 'Import failed',
        detail: 'Row 18 has no VAT number',
        retry : run
      }), 1500);
    };

    run();
  }, []);

  const handleError = React.useCallback(() => {
    /* The same groupKey twice: one row, with its count */
    notifications.jobs.error({ title: 'The map could not be refreshed', groupKey: 'map-refresh' });
  }, []);

  return (
    <Cluster gap={3}>
      <Button fill={'soft'} onClick={handleExport}>Export</Button>
      <Button fill={'soft'} onClick={handleRecalculate}>Recalculate, with Stop</Button>
      <Button fill={'soft'} onClick={handleImport}>Import that fails</Button>
      <Button fill={'soft'} tone={'destructive'} onClick={handleError}>An error with no place</Button>
    </Cluster>
  );
}
