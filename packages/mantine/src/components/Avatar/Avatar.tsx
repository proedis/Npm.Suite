import * as React from 'react';

import { Avatar as BaseAvatar, Tooltip } from '@mantine/core';

import { creatableComponent } from '@proedis/react';

import Icon from '../Icon';

import type { AvatarProps } from './Avatar.types';


/* --------
* Component Definition
* -------- */
const AvatarBase: React.FunctionComponent<AvatarProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    content,
    icon,
    tooltip,

    ...restAvatarProps
  } = props;


  // ----
  // Avatar Content
  // ----
  const avatarContentElement = React.useMemo(
    () => {
      /** If an image has been provided, return nothing */
      if (restAvatarProps.src) {
        return null;
      }

      /** Icon win on all other props */
      if (icon) {
        return Icon.create(icon, { autoGenerateKey: false });
      }

      /** Fallback to content/children */
      return content || children;
    },
    [ restAvatarProps.src, icon, content, children ]
  );


  // ----
  // Component Render
  // ----
  const avatarElement = (
    <BaseAvatar {...restAvatarProps}>
      {avatarContentElement}
    </BaseAvatar>
  );

  /** Show with tooltip, if defined */
  if (tooltip) {
    return (
      <Tooltip label={tooltip}>
        {avatarElement}
      </Tooltip>
    );
  }

  /** Show without tooltip */
  return avatarElement;

};

/* --------
* Creatable Component
* -------- */
const Avatar = creatableComponent(
  AvatarBase,
  (content: React.ReactNode) => ({ content })
);

Avatar.displayName = 'Avatar';

export default Avatar;
