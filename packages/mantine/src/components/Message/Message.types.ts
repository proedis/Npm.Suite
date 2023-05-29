import type { AppearanceColorName } from '@mantine/core';

import type { RequestError } from '@proedis/client';

import type { ShorthandContent, UIVoidComponentProps } from '@proedis/react';

import type { ShorthandIcon } from '../Icon';


export type MessageProps = UIVoidComponentProps<StrictMessageProps>;

export interface StrictMessageProps {
  /** Appearance to use, will change the message icon and color */
  appearance?: AppearanceColorName;

  /** Message content */
  content?: ShorthandContent;

  /** Message header content */
  header?: ShorthandContent;

  /** Show an icon */
  icon?: ShorthandIcon;

  /** A request error object, in this case, message will rebuild all props according to error data */
  requestError?: RequestError;
}
