import * as React from 'react';

import notify from '../../notify';
import type { NotificationRaiser, NotificationContent } from '../../notify';

import type { BaseActionBuilderNotifications } from '../action-builder.types';


/* --------
 * Internal Types
 * -------- */
interface UseActionNotificationsResult {
  /** Use the predefined raiser to show the onCanceled Notification */
  raiseCanceled: () => void;

  /** Use the predefined raiser to show the onError Notification */
  raiseError: (thrownError?: any) => void;

  /** Use the predefined raiser to show the onSubmitted Notification */
  raiseSubmitted: () => void;
}


/* --------
 * External Utilities
 * -------- */
const raiseNotification = (raiser: NotificationRaiser, content?: NotificationContent) => {
  /** Assert the content exists before using raiser function */
  if (!content) {
    return;
  }

  /** Raise the notification using requested raiser */
  raiser(content);
};


/* --------
 * Hook Definition
 * -------- */
export default function useActionNotifications(notifications: BaseActionBuilderNotifications): UseActionNotificationsResult {

  // ----
  // Destruct the Notifications
  // ----
  const {
    onCanceled,
    onError,
    onSubmitted
  } = notifications;


  // ----
  // Build Raisers
  // ----
  const notifyCanceled = React.useCallback(
    () => raiseNotification(notify.show, onCanceled),
    [ onCanceled ]
  );

  const notifySubmitted = React.useCallback(
    () => raiseNotification(notify.success, onSubmitted),
    [ onSubmitted ]
  );

  const notifyError = React.useCallback(
    (thrownError?: any) => {
      if (onError === 'thrown') {
        raiseNotification(notify.error, thrownError);
      }
      else if (typeof onError === 'function') {
        raiseNotification(notify.error, onError(thrownError));
      }
      else if (onError) {
        raiseNotification(notify.error, onError);
      }
    },
    [ onError ]
  );


  // ----
  // Return the Utilities
  // ----
  return {
    raiseCanceled : notifyCanceled,
    raiseError    : notifyError,
    raiseSubmitted: notifySubmitted
  };

}
