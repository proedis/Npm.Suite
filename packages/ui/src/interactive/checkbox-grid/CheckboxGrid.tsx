'use client';

import * as React from 'react';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { CHECKBOX_BOX, CheckGlyph, DashGlyph } from '../choice/choice';
import { Tooltip } from '../tooltip/Tooltip';

import type { BaseProps } from '../../core/base';


/* --------
 * Types Definition
 * -------- */

/** One choice, a column: a permission, a flag */
export interface CheckboxGridColumn {
  readonly id: string;
  readonly label: React.ReactNode;
}

/** One row of a group */
export interface CheckboxGridItem {
  readonly id: string;
  readonly label: React.ReactNode;

  /** A line under the label: what a rule allows */
  readonly description?: React.ReactNode;

  /** The columns decided by the system: shown as they are in the value, never changed from here */
  readonly locked?: readonly string[];
}

export interface CheckboxGridGroup {
  readonly id: string;
  readonly label: React.ReactNode;

  /** The summary after the label, always with its unit: "20 entities", "2 rules" */
  readonly meta?: React.ReactNode;

  readonly items: readonly CheckboxGridItem[];

  /** The group has changes that are not saved: marked with a dot and `labels.modified` */
  readonly modified?: boolean;
}

/** Item id → the ids of its checked columns */
export type CheckboxGridValue = Readonly<Record<string, readonly string[]>>;

export interface CheckboxGridMixedArgs {
  readonly column: CheckboxGridColumn;
  readonly group: CheckboxGridGroup;
  readonly checked: number;
  readonly total: number;
}

export interface CheckboxGridBulkArgs {
  readonly column: CheckboxGridColumn;
  readonly group: CheckboxGridGroup;
  readonly checked: boolean;
  readonly count: number;
}

/** Every text of service the grid shows. The package writes none */
export interface CheckboxGridLabels {
  /** The header of the first column ("Area and entity"). Only with two columns or more */
  itemsHeader?: React.ReactNode;

  /** After the summary of a group with changes not saved */
  modified: React.ReactNode;

  /** The tooltip and description of a partial parent box: "Create: 4 of 20 entities" */
  mixed: (args: CheckboxGridMixedArgs) => string;

  /** Announced after a parent box changed a whole group: "Read granted to 20 entities of Fleet" */
  bulk: (args: CheckboxGridBulkArgs) => string;

  /** Why a locked box cannot change: "Always granted, not editable" */
  locked: string;

  /** In read only, the checked columns of an item as text */
  readOnlyValue?: (item: CheckboxGridItem, checked: readonly CheckboxGridColumn[]) => React.ReactNode;
}

export interface CheckboxGridProps extends BaseProps, Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  readonly groups: readonly CheckboxGridGroup[];
  readonly columns: readonly CheckboxGridColumn[];

  value?: CheckboxGridValue;
  defaultValue?: CheckboxGridValue;
  onValueChange?: (value: CheckboxGridValue) => void;

  /**
   * The rules between the columns, which the grid does not know: it receives the value a click
   * proposes and returns the one to keep. For the permissions of a profile, a grant of create, update
   * or delete brings read with it
   */
  resolve?: (next: CheckboxGridValue, previous: CheckboxGridValue) => CheckboxGridValue;

  /** The ids of the open groups, controlled. All closed by default, and not remembered */
  openGroups?: readonly string[];
  defaultOpenGroups?: readonly string[];
  onOpenGroupsChange?: (openGroups: readonly string[]) => void;

  /**
   * A search is on: only these items are shown, with their groups open, no arrows and no parent
   * boxes (they would act on rows that are not seen). The matching is the caller's, who knows the text
   * of the labels; a group that matches by its name passes all its items. `null` or absent: no search
   */
  visibleItems?: ReadonlySet<string> | null;

  /** Consultation: no boxes, the checked columns of each item as text */
  readOnly?: boolean;

  labels: CheckboxGridLabels;
}

type CellKey = string;

interface RowModel {
  readonly key: string;
  readonly kind: 'group' | 'item';
  readonly groupId: string;
  readonly cells: number;
}


/* --------
 * Constants Definition
 * -------- */

const NO_GROUPS: readonly string[] = [];

/** The width of a column of boxes: 96 with several columns, 56 when there is one */
const COLUMN_WIDTH = { many: '6rem', one: '3.5rem' } as const;

const ROW_FOCUS = 'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring';

const CELL_FOCUS = 'has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-ring';


/* --------
 * Helpers
 * -------- */

function cellKey(row: string, column: number): CellKey {
  return `${row}|${column}`;
}


function isChecked(value: CheckboxGridValue, itemId: string, columnId: string): boolean {
  return value[itemId]?.includes(columnId) ?? false;
}


function isLocked(item: CheckboxGridItem, columnId: string): boolean {
  return item.locked?.includes(columnId) ?? false;
}


/** The state of a parent box, from the editable items of its group only */
function parentState(group: CheckboxGridGroup, columnId: string, value: CheckboxGridValue): {
  checked: boolean;
  mixed: boolean;
  locked: boolean;
  count: number;
  total: number;
} {
  const editable = group.items.filter((item) => !isLocked(item, columnId));

  if (!editable.length) {
    const all = group.items.every((item) => isChecked(value, item.id, columnId));

    return { checked: all, mixed: false, locked: true, count: 0, total: 0 };
  }

  const count = editable.filter((item) => isChecked(value, item.id, columnId)).length;

  return {
    checked: count === editable.length,
    mixed  : count > 0 && count < editable.length,
    locked : false,
    count,
    total  : editable.length
  };
}


function withColumn(value: CheckboxGridValue, itemIds: readonly string[], columnId: string, checked: boolean): CheckboxGridValue {
  const next: Record<string, readonly string[]> = { ...value };

  itemIds.forEach((itemId) => {
    const current = next[itemId] ?? [];

    next[itemId] = checked
      ? (current.includes(columnId) ? current : [ ...current, columnId ])
      : current.filter((id) => id !== columnId);
  });

  return next;
}


/* --------
 * Glyphs
 * -------- */

function ChevronGlyph(props: { open: boolean }): React.ReactNode {
  return (
    <svg
      data-slot={'checkbox-grid-chevron'}
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={1.75}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={cn(
        'size-4 shrink-0 text-muted-foreground transition-transform duration-100 motion-reduce:transition-none',
        props.open && 'rotate-90'
      )}
    >
      <path d={'m9 18 6-6-6-6'} />
    </svg>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * A grid of boxes divided in groups that open and close: rows of items, columns of choices. The row of
 * a group is the header of its section and carries the parent boxes in the columns of the items, so a
 * closed group is governed without opening it. It is the value of a form: saved with the button.
 *
 * ```tsx
 * <CheckboxGrid
 *   aria-labelledby={titleId}
 *   groups={areas}
 *   columns={[ { id: 'read', label: 'Read' }, { id: 'create', label: 'Create' } ]}
 *   value={permissions}
 *   onValueChange={setPermissions}
 *   resolve={grantReadWithOthers}
 *   labels={gridLabels}
 * />
 * ```
 *
 * A treegrid with one entry in the Tab cycle, then the arrows: ↑ ↓ between rows, ← → between cells, →
 * opens and ← closes on the name of a group, ← on the name of an item goes back to its group, Space
 * ticks, Enter on a name opens or closes, Home and End along the row, Ctrl + Home and Ctrl + End to the
 * first and last row. Base UI has no grid, so the moving tab index is written here.
 *
 * A parent box is full, partial or empty over the editable items of its group only, and read only when
 * every item of its column is locked. A click grants or takes away the column from every editable item
 * of the group, open or closed, and the `status` region announces it with `labels.bulk`. Two levels,
 * group and item: no box in the header of the columns.
 *
 * The header of the columns and the row of an open group stay put while the grid scrolls, inside the
 * nearest scrolling ancestor.
 *
 * Slots: `checkbox-grid` (with `data-read-only`, `data-searching`), `checkbox-grid-header`,
 * `checkbox-grid-column-header`, `checkbox-grid-group` (with `data-open`, `data-modified`),
 * `checkbox-grid-group-name`, `checkbox-grid-meta`, `checkbox-grid-modified`, `checkbox-grid-item`,
 * `checkbox-grid-item-name`, `checkbox-grid-description`, `checkbox-grid-cell` (with `data-parent`,
 * `data-locked`), `checkbox-grid-box`, `checkbox-grid-text`, `checkbox-grid-status`.
 */
export function CheckboxGrid(props: CheckboxGridProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    columns,
    defaultOpenGroups = NO_GROUPS,
    defaultValue,
    groups,
    labels,
    onOpenGroupsChange,
    onValueChange,
    openGroups,
    readOnly = false,
    resolve,
    value,
    visibleItems = null,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const uid = React.useId();


  // ----
  // Internal State
  // ----
  const [ uncontrolledValue, setUncontrolledValue ] = React.useState<CheckboxGridValue>(defaultValue ?? {});
  const [ uncontrolledOpen, setUncontrolledOpen ] = React.useState<readonly string[]>(defaultOpenGroups);
  const [ activeCell, setActiveCell ] = React.useState<CellKey | null>(null);
  const [ announcement, setAnnouncement ] = React.useState('');

  const gridRef = React.useRef<HTMLDivElement>(null);

  const currentValue = value ?? uncontrolledValue;
  const currentOpen = openGroups ?? uncontrolledOpen;
  const searching = visibleItems !== null;


  // ----
  // Handlers
  // ----
  const commit = (next: CheckboxGridValue): void => {
    const resolved = resolve ? resolve(next, currentValue) : next;

    setUncontrolledValue(resolved);
    onValueChange?.(resolved);
  };

  const setGroupOpen = (groupId: string, open: boolean): void => {
    const next = open
      ? (currentOpen.includes(groupId) ? currentOpen : [ ...currentOpen, groupId ])
      : currentOpen.filter((id) => id !== groupId);

    setUncontrolledOpen(next);
    onOpenGroupsChange?.(next);
  };

  const toggleItem = (itemId: string, columnId: string, checked: boolean): void => {
    commit(withColumn(currentValue, [ itemId ], columnId, checked));
  };

  const toggleParent = (group: CheckboxGridGroup, column: CheckboxGridColumn): void => {
    const state = parentState(group, column.id, currentValue);
    const checked = !state.checked;
    const editable = group.items.filter((item) => !isLocked(item, column.id)).map((item) => item.id);

    commit(withColumn(currentValue, editable, column.id, checked));

    /* Emptied first, so the same text twice is announced twice */
    setAnnouncement('');
    window.setTimeout(() => setAnnouncement(labels.bulk({ column, group, checked, count: editable.length })));
  };


  // ----
  // Memoized Data
  // ----
  const shownGroups = groups
    .map((group) => ({
      group,
      items: searching ? group.items.filter((item) => visibleItems.has(item.id)) : group.items,
      open : searching || currentOpen.includes(group.id)
    }))
    .filter((entry) => !searching || entry.items.length > 0);

  const boxColumns = readOnly ? 1 : columns.length;
  const hasHeader = columns.length > 1 && !readOnly;
  const rows: RowModel[] = [];

  shownGroups.forEach(({ group, items, open }) => {
    rows.push({ key: `g:${group.id}`, kind: 'group', groupId: group.id, cells: readOnly || searching ? 1 : 1 + columns.length });

    if (open) {
      items.forEach((item) => {
        rows.push({ key: `i:${item.id}`, kind: 'item', groupId: group.id, cells: readOnly ? 1 : 1 + columns.length });
      });
    }
  });

  const firstCell = rows.length ? cellKey(rows[0].key, 0) : null;
  const known = new Set(rows.flatMap((row) => Array.from({ length: row.cells }, (_, column) => cellKey(row.key, column))));
  const tabbable = activeCell && known.has(activeCell) ? activeCell : firstCell;

  const template = {
    gridTemplateColumns: readOnly
      ? 'minmax(0, 2fr) minmax(0, 3fr)'
      : `minmax(0, 1fr) repeat(${boxColumns}, ${columns.length > 1 ? COLUMN_WIDTH.many : COLUMN_WIDTH.one})`
  };


  // ----
  // Keyboard
  // ----
  const focusCell = (key: CellKey | null): void => {
    if (!key) {
      return;
    }

    setActiveCell(key);
    gridRef.current?.querySelector<HTMLElement>(`[data-grid-cell="${CSS.escape(key)}"]`)?.focus();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-grid-cell]');
    const key = target?.dataset.gridCell;

    if (!key) {
      return;
    }

    const [ rowKey, columnText ] = key.split('|');
    const column = Number(columnText);
    const rowIndex = rows.findIndex((row) => row.key === rowKey);
    const row = rows[rowIndex];

    if (!row) {
      return;
    }

    const clamp = (index: number, other: RowModel): number => Math.min(index, other.cells - 1);
    const handled = (): void => {
      event.preventDefault();
      event.stopPropagation();
    };

    switch (event.key) {
      case 'ArrowDown': {
        const next = rows[rowIndex + 1];

        if (next) {
          focusCell(cellKey(next.key, clamp(column, next)));
        }

        handled();
        break;
      }

      case 'ArrowUp': {
        const previous = rows[rowIndex - 1];

        if (previous) {
          focusCell(cellKey(previous.key, clamp(column, previous)));
        }

        handled();
        break;
      }

      case 'ArrowRight': {
        const groupClosed = row.kind === 'group' && !searching && !currentOpen.includes(row.groupId);

        if (column === 0 && groupClosed) {
          setGroupOpen(row.groupId, true);
        }
        else if (column < row.cells - 1) {
          focusCell(cellKey(row.key, column + 1));
        }

        handled();
        break;
      }

      case 'ArrowLeft': {
        if (column > 0) {
          focusCell(cellKey(row.key, column - 1));
        }
        else if (row.kind === 'group' && !searching && currentOpen.includes(row.groupId)) {
          setGroupOpen(row.groupId, false);
        }
        else if (row.kind === 'item') {
          focusCell(cellKey(`g:${row.groupId}`, 0));
        }

        handled();
        break;
      }

      case 'Home': {
        focusCell(event.ctrlKey ? firstCell : cellKey(row.key, 0));
        handled();
        break;
      }

      case 'End': {
        if (event.ctrlKey) {
          const last = rows[rows.length - 1];

          focusCell(cellKey(last.key, clamp(column, last)));
        }
        else {
          focusCell(cellKey(row.key, row.cells - 1));
        }

        handled();
        break;
      }

      case 'Enter':
      case ' ': {
        if (column !== 0) {
          break;
        }

        if (row.kind === 'group' && !searching) {
          setGroupOpen(row.groupId, !currentOpen.includes(row.groupId));
          handled();
        }
        else if (row.kind === 'item' && event.key === ' ' && columns.length === 1 && !readOnly) {
          const item = groups.find((group) => group.id === row.groupId)?.items.find((entry) => `i:${entry.id}` === row.key);

          if (item && !isLocked(item, columns[0].id)) {
            toggleItem(item.id, columns[0].id, !isChecked(currentValue, item.id, columns[0].id));
          }

          handled();
        }

        break;
      }

      default:
        break;
    }
  };


  // ----
  // Render Helpers
  // ----
  const cellProps = (key: CellKey): { 'data-grid-cell': string; tabIndex: number; onFocus: () => void } => ({
    'data-grid-cell': key,
    tabIndex        : key === tabbable ? 0 : -1,
    onFocus         : () => setActiveCell(key)
  });

  const columnHeaderId = (column: CheckboxGridColumn): string => `${uid}-column-${column.id}`;
  const nameId = (rowKey: string): string => `${uid}-name-${rowKey}`;
  const lockedId = `${uid}-locked`;

  const renderBox = (options: {
    key: CellKey;
    labelledBy: string;
    checked: boolean;
    mixed?: boolean;
    locked: boolean;
    describedBy?: string;
    onChange: (checked: boolean) => void;
  }): React.ReactElement => (
    <CheckboxPrimitive.Root
      {...cellProps(options.key)}
      checked={options.checked}
      indeterminate={options.mixed ?? false}
      readOnly={options.locked}
      onCheckedChange={options.onChange}
      aria-labelledby={options.labelledBy}
      aria-describedby={options.describedBy}
      data-slot={'checkbox-grid-box'}
      className={cn(CHECKBOX_BOX, 'outline-none')}
    >
      <CheckboxPrimitive.Indicator className={'flex items-center justify-center'}>
        {options.mixed ? <DashGlyph /> : <CheckGlyph />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  const renderItem = (item: CheckboxGridItem, group: CheckboxGridGroup, index: number, size: number): React.ReactNode => {
    const rowKey = `i:${item.id}`;
    const single = columns.length === 1;
    const descriptionId = `${uid}-description-${item.id}`;
    const checkedColumns = columns.filter((column) => isChecked(currentValue, item.id, column.id));

    return (
      <div
        key={item.id}
        role={'row'}
        aria-level={2}
        aria-posinset={index + 1}
        aria-setsize={size}
        data-slot={'checkbox-grid-item'}
        style={template}
        className={cn('grid min-h-8 border-t border-border hover:bg-accent', single && !readOnly && 'cursor-pointer')}
        onClick={single && !readOnly && !isLocked(item, columns[0].id)
          ? (event) => {
            /* The whole row of a single column ticks its box; the box itself already did */
            if ((event.target as HTMLElement).closest('[data-slot=checkbox-grid-box]')) {
              return;
            }

            toggleItem(item.id, columns[0].id, !isChecked(currentValue, item.id, columns[0].id));
          }
          : undefined}
      >
        <span
          role={'rowheader'}
          id={nameId(rowKey)}
          {...cellProps(cellKey(rowKey, 0))}
          data-slot={'checkbox-grid-item-name'}
          className={cn('flex min-w-0 flex-col justify-center py-1.5 ps-12 pe-2 text-sm', ROW_FOCUS)}
        >
          <span className={'truncate'}>{item.label}</span>
          {item.description && (
            <span id={descriptionId} data-slot={'checkbox-grid-description'} className={'text-xs text-muted-foreground'}>
              {item.description}
            </span>
          )}
        </span>

        {readOnly && (
          <span role={'gridcell'} data-slot={'checkbox-grid-text'} className={'flex items-center pe-6 text-sm'}>
            {labels.readOnlyValue?.(item, checkedColumns)}
          </span>
        )}

        {!readOnly && columns.map((column, columnIndex) => {
          const locked = isLocked(item, column.id);
          const describedBy = [ item.description ? descriptionId : undefined, locked ? lockedId : undefined ]
            .filter(Boolean)
            .join(' ') || undefined;
          const box = renderBox({
            key       : cellKey(rowKey, columnIndex + 1),
            labelledBy: single ? nameId(rowKey) : `${columnHeaderId(column)} ${nameId(rowKey)}`,
            checked   : isChecked(currentValue, item.id, column.id),
            locked,
            describedBy,
            onChange  : (checked) => toggleItem(item.id, column.id, checked)
          });

          return (
            <span
              key={column.id}
              role={'gridcell'}
              data-slot={'checkbox-grid-cell'}
              data-locked={locked || undefined}
              className={cn('group/choice flex justify-center', item.description ? 'items-start pt-2' : 'items-center', CELL_FOCUS)}
            >
              {locked ? <Tooltip content={labels.locked}>{box}</Tooltip> : box}
            </span>
          );
        })}
      </div>
    );
  };


  const renderGroup = (entry: typeof shownGroups[number], index: number): React.ReactNode => {
    const { group, items, open } = entry;
    const rowKey = `g:${group.id}`;
    const nameKey = cellKey(rowKey, 0);

    return (
      <React.Fragment key={group.id}>
        <div
          role={'row'}
          aria-level={1}
          aria-posinset={index + 1}
          aria-setsize={shownGroups.length}
          aria-expanded={searching ? undefined : open}
          data-slot={'checkbox-grid-group'}
          data-open={open || undefined}
          data-modified={group.modified || undefined}
          style={template}
          className={cn(
            'grid min-h-10 border-t border-border bg-muted first:border-t-0',
            open && !searching && 'sticky z-1',
            open && !searching && (hasHeader ? 'top-8' : 'top-0')
          )}
        >
          <span
            role={'rowheader'}
            id={nameId(rowKey)}
            {...cellProps(nameKey)}
            data-slot={'checkbox-grid-group-name'}
            className={cn('flex min-w-0 cursor-pointer items-center gap-2 ps-6 pe-2 text-sm font-semibold', ROW_FOCUS, searching && 'cursor-default ps-12')}
            onClick={searching ? undefined : () => setGroupOpen(group.id, !open)}
          >
            {!searching && <ChevronGlyph open={open} />}
            <span className={'min-w-0 truncate'}>{group.label}</span>
            {group.meta && <span data-slot={'checkbox-grid-meta'} className={'shrink-0 text-xs font-normal text-muted-foreground'}>{group.meta}</span>}
            {group.modified && (
              <span data-slot={'checkbox-grid-modified'} className={'flex shrink-0 items-center gap-1.5 text-xs font-normal text-primary-soft-foreground'}>
                <span aria-hidden={'true'} className={'size-1.5 rounded-full bg-primary'} />
                {labels.modified}
              </span>
            )}
          </span>

          {readOnly && <span role={'gridcell'} />}

          {!readOnly && columns.map((column, columnIndex) => {
            if (searching) {
              return <span key={column.id} role={'gridcell'} />;
            }

            const state = parentState(group, column.id, currentValue);
            const labelledBy = columns.length > 1 ? `${columnHeaderId(column)} ${nameId(rowKey)}` : nameId(rowKey);
            const box = renderBox({
              key        : cellKey(rowKey, columnIndex + 1),
              labelledBy,
              checked    : state.checked,
              mixed      : state.mixed,
              locked     : state.locked,
              describedBy: state.locked ? lockedId : undefined,
              onChange   : () => toggleParent(group, column)
            });
            const mixedTip = state.mixed ? labels.mixed({ column, group, checked: state.count, total: state.total }) : null;
            const tip = mixedTip ?? (state.locked ? labels.locked : null);

            return (
              <span
                key={column.id}
                role={'gridcell'}
                data-slot={'checkbox-grid-cell'}
                data-parent={''}
                data-locked={state.locked || undefined}
                className={cn('group/choice flex items-center justify-center', CELL_FOCUS)}
              >
                {tip ? <Tooltip content={tip}>{box}</Tooltip> : box}
              </span>
            );
          })}
        </div>

        {open && items.map((item, itemIndex) => renderItem(item, group, itemIndex, items.length))}
      </React.Fragment>
    );
  };

  // ----
  // Component Render
  // ----
  return (
    <div
      {...rest}
      ref={gridRef}
      role={'treegrid'}
      aria-readonly={readOnly || undefined}
      data-slot={'checkbox-grid'}
      data-read-only={readOnly || undefined}
      data-searching={searching || undefined}
      className={cn('relative flex flex-col text-sm text-foreground', baseClasses, className)}
      onKeyDown={handleKeyDown}
    >
      {hasHeader && (
        <div
          role={'row'}
          data-slot={'checkbox-grid-header'}
          style={template}
          className={'sticky top-0 z-2 grid h-8 items-center border-y border-border bg-card text-xs font-semibold text-muted-foreground'}
        >
          <span role={'columnheader'} data-slot={'checkbox-grid-column-header'} className={'ps-6'}>{labels.itemsHeader}</span>
          {columns.map((column) => (
            <span key={column.id} id={columnHeaderId(column)} role={'columnheader'} data-slot={'checkbox-grid-column-header'} className={'text-center'}>
              {column.label}
            </span>
          ))}
        </div>
      )}

      {shownGroups.map(renderGroup)}

      <span id={lockedId} hidden>{labels.locked}</span>
      <span data-slot={'checkbox-grid-status'} role={'status'} className={'sr-only'}>{announcement}</span>
    </div>
  );

}

CheckboxGrid.displayName = 'CheckboxGrid';
