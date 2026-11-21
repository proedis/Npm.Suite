import type { AlertDialogLabels } from '@proedis/ui/overlays/alert-dialog';


/** The texts every AlertDialog of these examples shares: in an application they come from its translations */
const LABELS: AlertDialogLabels = {
  busyLoad  : 'Loading what changes',
  busyAction: 'Deleting',
  close     : 'Close',
  timeout   : {
    title      : 'No answer from the server',
    description: 'It may have been deleted anyway. Reload the list before trying again.'
  }
};

export default LABELS;
