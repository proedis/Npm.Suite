'use client';

import * as React from 'react';

import { Stack } from '../../layout/Stack';

import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';
import { Menu } from '../../actions/menu/Menu';

import { TableGlyph } from './tableGlyphs';

import type { TableSelection, TableSelectionAction } from './tableTypes';


/* --------
 * Types Definition
 * -------- */

export interface TableSelectionBarProps {
  /** "3 reports selected", announced at every change */
  text: string;

  /** "Select all 312" or "Clear selection", after the count */
  extra?: React.ReactNode;

  actions: readonly TableSelectionAction[];

  /** Up to two ids of `actions`, as buttons with label and icon; the rest in the ⋯ */
  inline: readonly string[];

  selection: TableSelection;
  count: number;

  onClear: () => void;

  labels: {
    deselect: string;
    moreActions: string;
    menu: string;
  };
}


/* --------
 * Helpers
 * -------- */

/** The menu items of some actions, the destructive ones after a separator */
export function selectionMenuItems(
  actions: readonly TableSelectionAction[],
  selection: TableSelection,
  count: number,
  useMenuLabel: boolean
): React.ReactNode {
  return actions.map((action, index) => {
    const previous = actions[index - 1];
    const separate = action.tone === 'destructive' && previous !== undefined && previous.tone !== 'destructive';

    return (
      <React.Fragment key={action.id}>
        {separate && <Menu.Separator />}
        <Menu.Item
          icon={action.icon}
          tone={action.tone}
          disabled={action.disabled}
          description={action.disabled ? action.description : undefined}
          onSelect={() => action.onSelect(selection)}
        >
          {useMenuLabel && action.menuLabel ? action.menuLabel(count) : action.label}
        </Menu.Item>
      </React.Fragment>
    );
  });
}


/* --------
 * Component Definition
 * -------- */

/**
 * The bar of the selected rows, in place of the row above the table and as tall: the table does not
 * move at the first checkbox. The count on the left, up to two actions with label and icon, the rest
 * in the ⋯, "Deselect" at the end.
 */
export function TableSelectionBar(props: TableSelectionBarProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { actions, count, extra, inline, labels, onClear, selection, text } = props;


  // ----
  // Style Computation
  // ----
  const shown = inline
    .map((id) => actions.find((action) => action.id === id))
    .filter((action) => action !== undefined)
    .slice(0, 2);
  const rest = actions.filter((action) => !shown.includes(action));


  // ----
  // Component Render
  // ----
  return (
    <Stack
      data-slot={'table-selection-bar'}
      direction={'horizontal'}
      align={'center'}
      gap={2}
      className={'h-7 min-w-0 flex-1 rounded-md bg-primary-soft ps-3 pe-1 text-primary-soft-foreground'}
    >
      <span aria-live={'polite'} className={'shrink-0 text-xs font-semibold tabular-nums'}>{text}</span>
      {extra}

      {shown.length > 0 && <span aria-hidden className={'mx-1 h-4 w-px shrink-0 bg-primary-soft-foreground/20'} />}

      {shown.map((action) => (
        <Button
          key={action.id}
          size={'sm'}
          fill={'plain'}
          tone={action.tone === 'destructive' ? 'destructive' : 'primary'}
          leading={action.icon}
          disabled={action.disabled}
          onClick={() => action.onSelect(selection)}
        >
          {action.label}
        </Button>
      ))}

      {rest.length > 0 && (
        <Menu
          trigger={<IconButton label={labels.moreActions} icon={<TableGlyph name={'ellipsis'} />} size={'sm'} fill={'plain'} tone={'primary'} />}
          aria-label={labels.menu}
          align={'start'}
        >
          {selectionMenuItems(rest, selection, count, false)}
        </Menu>
      )}

      <Button size={'sm'} fill={'plain'} tone={'primary'} onClick={onClear} className={'ms-auto'}>{labels.deselect}</Button>
    </Stack>
  );

}

TableSelectionBar.displayName = 'TableSelectionBar';
