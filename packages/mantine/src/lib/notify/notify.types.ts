import type { ZodError } from 'zod';
import type { RequestError } from '@proedis/client';

import type { ShorthandContent } from '@proedis/react';

import type { ShorthandIcon } from '../../components/Icon';


/* --------
 * Notification Content
 * -------- */
export type NotificationType = 'default' | 'success' | 'warning' | 'error' | 'loading';

export interface StrictNotificationContentProps {
  /** The content of the notification */
  content: ShorthandContent;

  /**
   * The icon to show.
   * Icon, if not defined while raising the notification will be
   * auto-controlled based on the notification type:
   *  - default has no icon
   *  - success has a check icon
   *  - warning has an exclamation icon
   *  - error has an invalid icon
   *  - loading has an inner spinner loader
   */
  icon?: ShorthandIcon;

  /** The title of the notification */
  title?: ShorthandContent;
}

export type NotificationContent =
  | string
  | StrictNotificationContentProps
  | RequestError
  | ZodError;


/* --------
 * Notification Raiser
 * -------- */
export interface RaiseProps {
  /**
   * Set the notification as infinite, removing the autoClose timer.
   * If not specifically defined, a 'loading' type notification will have the infinite
   * raise property set to true.
   * Pay attention that the unique way to hide an infinite notification is to use
   * the 'hide()' method of the returned controller
   */
  infinite?: boolean;

  /** Set the type of the notification */
  type?: NotificationType;
}

export interface NotificationController {
  /** Hide the notification */
  hide: () => void;

  /** Update the notification with new content */
  update: NotificationRaiser;
}

export type NotificationRaiser = (
  content: NotificationContent,
  options?: Omit<RaiseProps, 'type'>
) => NotificationController;
