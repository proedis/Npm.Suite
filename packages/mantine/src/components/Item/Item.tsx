import * as React from 'react';

import { creatableComponent } from '@proedis/react';

import { createStyles, Grid, Stack, Text } from '@mantine/core';

import { Draggable } from 'react-beautiful-dnd';

import Avatar from '../Avatar';
import { ButtonGroup } from '../Button';
import IconButton from '../IconButton';
import Icon from '../Icon';

import type { ItemProps } from './Item.types';


/* --------
* Styles Definition
* -------- */
const useStyles = createStyles((theme) => ({

  root: {
    borderRadius: theme.radius.md,
    padding     : theme.spacing.sm,

    '&[data-active]': {
      backgroundColor: theme.colors.gray[1]
    },

    '&[data-clickable]': {
      cursor: 'pointer',

      '&:not([data-active]):hover': theme.fn.hover({
        backgroundColor: theme.colors.gray[0]
      })
    }
  },

  itemDragging: {
    border         : 'none !important',
    borderRadius   : `${theme.radius.md} !important`,
    backgroundColor: theme.fn.rgba(theme.white, .75),
    boxShadow      : theme.shadows.lg
  }

}));


const ItemBase = React.forwardRef<HTMLDivElement, ItemProps>((props, ref) => {

  // ----
  // Props Destruct
  // ----
  const {
    actions,
    avatar,

    title,
    subtitle,
    content,

    className,

    active,
    onClick: handleItemClick,
    truncate,

    draggable,
    draggableId,
    draggableIndex,
    useDragHandle

  } = props;


  // ----
  // Internal Hooks
  // ----
  const { classes, cx, theme } = useStyles(
    undefined,
    { name: 'Item' }
  );


  // ----
  // Element Memoized
  // ----
  const itemAvatarElement = React.useMemo(
    () => {
      /** Create the avatar element */
      const avatarElement = Avatar.create(avatar, { autoGenerateKey: false });

      /** If no element built, return null */
      if (!avatarElement) {
        return null;
      }

      /** Return the Avatar wrapper in Column */
      return (
        <Grid.Col span={'content'}>
          {avatarElement}
        </Grid.Col>
      );
    },
    [ avatar ]
  );


  // ----
  // Inner Content Element
  // ----
  const itemTextElement = (() => {
    /** Create the inner text element */
    const titleElement = title && (
      <Text fw={theme.other.fontWeight.medium}>{title}</Text>
    );

    const subtitleElement = subtitle && (
      <Text opacity={.5} fz={'xs'} lineClamp={truncate ? 1 : undefined}>{subtitle}</Text>
    );

    /** If no elements exists, return empty content */
    if (!titleElement && !subtitleElement && !content) {
      return null;
    }

    /** Return the column element */
    return (
      <Grid.Col span={'auto'}>
        <Stack justify={'flex-start'} spacing={'sm'}>
          {(titleElement || subtitleElement) && (
            <div>
              {titleElement}
              {subtitleElement}
            </div>
          )}
          {content}
        </Stack>
      </Grid.Col>
    );
  })();


  // ----
  // Actions Element
  // ----
  const itemActionsElement = Array.isArray(actions) && !!actions.length && (
    <Grid.Col span={'content'}>
      <ButtonGroup>
        {actions.map((action) => IconButton.create(action, {
          autoGenerateKey: true,
          defaultProps   : {
            color  : 'cloud.4',
            size   : 'md',
            variant: 'subtle'
          }
        }))}
      </ButtonGroup>
    </Grid.Col>
  );


  // ----
  // Item Wrapper Props Builder
  // ----
  const itemProps = {
    className       : cx(className, classes.root),
    onClick         : handleItemClick,
    'data-active'   : active || undefined,
    'data-clickable': typeof handleItemClick === 'function' || undefined
  };


  // ----
  // Component Render
  // ----

  /** If no draggable, render plain */
  if (!draggable) {
    return (
      <div ref={ref} {...itemProps}>
        <Grid>
          {itemAvatarElement}
          {itemTextElement}
          {itemActionsElement}
        </Grid>
      </div>
    );
  }

  /** Assert required props exists */
  if (!draggableId || typeof draggableIndex !== 'number') {
    throw new Error('\'draggableId\' and \'draggableIndex\' are required for draggable items');
  }

  return (
    <Draggable draggableId={draggableId} index={draggableIndex}>
      {(provided, snapshot) => (
        <div
          {...itemProps}
          ref={provided.innerRef}
          className={cx(itemProps.className, { [classes.itemDragging]: snapshot.isDragging })}
          {...provided.draggableProps}
          {...(useDragHandle ? {} : provided.dragHandleProps)}
        >
          <Grid>
            {useDragHandle && (
              <Grid.Col span={'content'} {...provided.dragHandleProps}>
                <Icon icon={'grip-vertical'} />
              </Grid.Col>
            )}
            {itemAvatarElement}
            {itemTextElement}
            {itemActionsElement}
          </Grid>
        </div>
      )}
    </Draggable>
  );

});

const Item = creatableComponent(
  ItemBase,
  (content: React.ReactNode) => ({ content })
);

Item.defaultProps = {
  truncate: true
};

Item.displayName = 'Item';

export default Item;
