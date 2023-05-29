import * as React from 'react';

import { useSyncedRef } from '@proedis/react';

import { createStyles } from '@mantine/core';

import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import type { OnDragEndResponder } from 'react-beautiful-dnd';

import Item from './Item';

import type { ItemGroupProps } from './ItemGroup.types';


/* --------
 * Styles Definition
 * -------- */
const useStyle = createStyles((theme, props: { relaxed?: boolean, divided?: boolean }) => ({

  root: {
    '& > :not([hidden])~:not([hidden])': props.divided
      ? {
        marginTop           : props.relaxed ? theme.spacing.sm : theme.spacing.xs,
        paddingTop          : props.relaxed ? theme.spacing.sm : theme.spacing.xs,
        borderTopStyle      : 'solid',
        borderTopWidth      : 1,
        borderTopColor      : theme.colors.cloud[3],
        borderTopLeftRadius : 0,
        borderTopRightRadius: 0
      }
      : {
        marginTop: props.relaxed ? theme.spacing.md : theme.spacing.sm
      }
  }

}));


/* --------
 * Component Definition
 * -------- */
const ItemGroup: React.FunctionComponent<ItemGroupProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,

    items: userDefinedItems,

    divided,
    relaxed,

    sortable,
    sortableId,
    sortableProps,
    onSortEnd
  } = props;


  // ----
  // Internal Hooks
  // ----
  const sortableOnDragEndResponder = useSyncedRef(sortableProps?.onDragEnd);
  const { classes, cx } = useStyle(
    { relaxed, divided },
    { name: 'ItemGroup' }
  );


  // ----
  // Handlers
  // ----
  const handleDragEnd = React.useCallback<OnDragEndResponder>(
    (result, provided) => {
      /** Call user defined handler if exists and if sorting has not been canceled */
      if (result.reason !== 'CANCEL' && typeof onSortEnd === 'function') {
        onSortEnd({
          from: result.source.index,
          to  : result.destination?.index || 0
        });
      }

      /** Call the complete function if defined */
      if (typeof sortableOnDragEndResponder.current === 'function') {
        sortableOnDragEndResponder.current(result, provided);
      }
    },
    [ onSortEnd, sortableOnDragEndResponder ]
  );


  // ----
  // Items Element Builder
  // ----
  const itemElement = (() => {
    /** Assert the user-defined items array exists */
    if (!Array.isArray(userDefinedItems) || !userDefinedItems.length) {
      return null;
    }

    /** Map the items prop to build inner item */
    return userDefinedItems.map((item, index) => (
      Item.create(item, {
        autoGenerateKey: true,
        defaultProps   : {
          draggable     : sortable,
          draggableIndex: index,
          draggableId   : (item as React.ReactElement | undefined)?.key?.toString()
        }
      })
    )).filter(Boolean);
  })();


  // ----
  // Component Render
  // ----

  /** If no sortable, render as plain list */
  if (!sortable) {
    return (
      <div className={cx(className, classes.root)}>
        {itemElement}
      </div>
    );
  }

  /** Check required props while using the sortable list */
  if (!sortableId) {
    throw new Error('\'sortableId\' is required for a sortable items group');
  }

  /** Else, return a DragDropContext */
  return (
    <DragDropContext {...sortableProps} onDragEnd={handleDragEnd}>
      <Droppable droppableId={sortableId}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cx(className, classes.root)}
          >
            {itemElement}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );

};

ItemGroup.displayName = 'ItemGroup';

export default ItemGroup;
