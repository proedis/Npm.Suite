import * as React from 'react';

import { Text } from '@mantine/core';
import type { MantineColor } from '@mantine/core';

import { notifications } from '@mantine/notifications';
import type { NotificationProps } from '@mantine/notifications';

import { RequestError } from '@proedis/client';
import { ZodError } from 'zod';

import Icon from '../../components/Icon';

import type {
  NotificationType,
  NotificationContent,
  NotificationController,
  NotificationRaiser,
  RaiseProps,
  StrictNotificationContentProps
} from './notify.types';


/* --------
 * Notification System Prop Builder
 * -------- */
const buildNotificationProps = (
  content: StrictNotificationContentProps,
  options?: RaiseProps,
  id?: string
): NotificationProps & { id: string } => {

  // ----
  // Deconstruct the content
  // ----
  const {
    content: notificationContent,
    title  : notificationTitle,
    icon   : userDefinedIcon
  } = content;


  // ----
  // Deconstruct Options
  // ----
  const {
    infinite: userDefinedInfinite,
    type = 'default'
  } = options || {};


  // ----
  // Create the Content
  // ----
  const iconElement = (() => {
    /** If an icon has been defined, use it */
    if (userDefinedIcon) {
      return Icon.create(userDefinedIcon, { autoGenerateKey: false });
    }

    /** An error notification will render a 'times' icon */
    if (type === 'error') {
      return Icon.create('times', { autoGenerateKey: false });
    }

    /** A warning notification will render an 'exclamation' icon */
    if (type === 'warning') {
      return Icon.create('exclamation', { autoGenerateKey: false });
    }

    /** A success notification will render a 'check' icon */
    if (type === 'success') {
      return Icon.create('check', { autoGenerateKey: false });
    }

    /** If the type is loading, or default, no icon will be rendered */
    return null;
  })();


  // ----
  // Compute notification color
  // ----
  const computedColor: MantineColor | undefined = ({
    default: 'primary',
    success: 'success',
    warning: 'warning',
    error  : 'danger',
    loading: 'primary.4'
  } as Record<NotificationType, MantineColor>)[type] || undefined;


  // ----
  // Return the Props
  // ----
  return {
    id             : id ?? `notification-${Math.ceil(Math.random() * 2_000)}`,
    withCloseButton: userDefinedInfinite && type !== 'loading',
    withBorder     : false,
    autoClose      : userDefinedInfinite ? false : undefined,
    title          : notificationTitle,
    message        : notificationContent,
    icon           : iconElement,
    color          : computedColor,
    loading        : type === 'loading',
    radius         : 'md',
    styles         : (theme) => ({
      root: {
        backgroundColor: theme.colors.cloud[7],
        opacity        : .75,
        paddingLeft    : theme.spacing.md,
        paddingRight   : theme.spacing.md,

        '&[data-with-icon]': {
          paddingLeft: theme.spacing.sm
        },

        '&::before': {
          display: 'none'
        }
      },

      body: {
        color: theme.colors.cloud[2]
      },

      icon: {
        marginRight: theme.spacing.sm
      },

      loader: {
        marginRight: theme.spacing.sm
      },

      title: {
        color     : 'inherit',
        fontWeight: theme.other.fontWeight.bold,
        fontSize  : theme.fontSizes.sm
      },

      description: {
        color     : 'inherit',
        fontWeight: theme.other.fontWeight.medium,
        fontSize  : theme.fontSizes.xs,
        opacity   : .75
      }
    })
  };

};


/* --------
 * Shared Raiser
 * -------- */
const raiseNotification = (content: NotificationContent, options?: RaiseProps, id?: string): NotificationController => {

  // ----
  // Content Parser
  // ----
  if (!content) {
    return raiseNotification({ content: 'Invalid Notification' }, { type: 'error' }, id);
  }

  if (typeof content === 'string') {
    return raiseNotification({ content }, options, id);
  }

  if (content instanceof ZodError) {
    return raiseNotification({
      title  : 'Errore nei Dati',
      content: (
        <React.Fragment>
          {content.errors.map((error) => (
            <Text key={error.message}>{error.message}</Text>
          ))}
        </React.Fragment>
      )
    }, options, id);
  }

  if (content instanceof RequestError) {
    return raiseNotification({
      title  : content.error,
      content: content.message
    }, options, id);
  }


  // ----
  // Get the NotificationProps using content and options
  // ----
  const notificationProps = buildNotificationProps(content, options, id);


  // ----
  // Build the notification controller
  // ----
  const controller: NotificationController = {
    hide  : () => notifications.hide(notificationProps.id),
    update: (newContent, newOptions) => (
      raiseNotification(newContent, newOptions, id)
    )
  };


  // ----
  // Choose the right method to raise/update a notification
  // ----
  if (typeof id === 'string') {
    notifications.update(notificationProps);
  }

  notifications.show(notificationProps);


  // ----
  // Return the controller
  // ----
  return controller;

};


// ----
// Shorthand Raisers
// ----
export const show: NotificationRaiser = (content, options) => (
  raiseNotification(content, { ...options, type: 'default' })
);

export const success: NotificationRaiser = (content, options) => (
  raiseNotification(content, { ...options, type: 'success' })
);

export const warning: NotificationRaiser = (content, options) => (
  raiseNotification(content, { ...options, type: 'warning' })
);

export const error: NotificationRaiser = (content, options) => (
  raiseNotification(content, { ...options, type: 'error' })
);

export const loading: NotificationRaiser = (content, options) => (
  raiseNotification(content, { infinite: true, ...options, type: 'loading' })
);
