'use client';

import * as React from 'react';

import { Stack } from '../../layout/Stack';


import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';

import { BadgeCounter } from '../../display/badge-counter/BadgeCounter';

import { Checkbox } from '../../forms/checkbox/Checkbox';

import { Popover } from '../../overlays/popover/Popover';

import { TableGlyph } from './tableGlyphs';
import { changedColumns, isColumnVisible } from './tableState';

import type { TableColumn, TableLabels } from './tableTypes';


/* --------
 * Component Definition
 * -------- */

/**
 * "Columns": a panel with a checkbox per column, the choices valid at once, "Reset" in the footer.
 * The code column stays, read only, with the reason under it. When the columns are not the default
 * ones the button carries a counter, read through its description: its name never changes.
 */
export function TableColumnsButton<TData>(props: {
  columns: readonly TableColumn<TData>[];
  visibility: Readonly<Record<string, boolean>>;
  onVisibilityChange: (visibility: Record<string, boolean>) => void;
  onReset: () => void;
  labels: TableLabels<TData>;
}): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { columns, labels, onReset, onVisibilityChange, visibility } = props;


  // ----
  // Internal Hooks
  // ----
  const countId = React.useId();


  // ----
  // Style Computation
  // ----
  const changed = changedColumns(columns, visibility);


  // ----
  // Component Render
  // ----
  return (
    <Stack gap={0} as={'span'} data-slot={'table-columns'} inline direction={'horizontal'} className={'relative shrink-0'}>
      <Popover
        trigger={(
          <IconButton
            label={labels.columns}
            icon={<TableGlyph name={'columns'} />}
            size={'sm'}
            fill={'plain'}
            tone={'muted'}
            aria-describedby={changed > 0 ? countId : undefined}
          />
        )}
        title={labels.columns}
        labels={{ close: labels.close }}
        footer={<Button size={'sm'} fill={'plain'} tone={'secondary'} onClick={onReset} className={'me-auto'}>{labels.columnsReset}</Button>}
      >
        <Stack data-slot={'table-columns-list'} gap={2}>
          {columns.map((column) => {
            const locked = column.kind === 'code' || column.hideable === false;

            return (
              <Checkbox
                key={column.id}
                checked={isColumnVisible(column, visibility)}
                readOnly={locked}
                description={locked && column.kind === 'code' ? labels.columnsLocked : undefined}
                onCheckedChange={(checked) => onVisibilityChange({ ...visibility, [column.id]: checked })}
              >
                {column.header}
              </Checkbox>
            );
          })}
        </Stack>
      </Popover>

      <BadgeCounter count={changed} tone={'info'} />
      {changed > 0 && <span id={countId} hidden>{labels.columnsChanged(changed)}</span>}
    </Stack>
  );

}

TableColumnsButton.displayName = 'TableColumnsButton';
