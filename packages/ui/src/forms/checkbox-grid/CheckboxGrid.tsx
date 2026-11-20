'use client';

import * as React from 'react';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';

import { useAnnouncer } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { CHECKBOX_BOX, CheckGlyph, DashGlyph } from '../choice/choice';
import { CollapsibleSection } from '../../actions/collapsible/CollapsibleSection';
import { Tooltip } from '../../actions/tooltip/Tooltip';

import type { BaseProps } from '../../core/base';
import type { CollapsibleSectionHeadingLevel } from '../../actions/collapsible/CollapsibleSection';


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

  /** The columns decided by the system: shown as they are in the value, never changed from here */
  readonly locked?: readonly string[];
}

export interface CheckboxGridGroup {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly items: readonly CheckboxGridItem[];
}

/** Item id → the ids of its checked columns */
export type CheckboxGridValue = Readonly<Record<string, readonly string[]>>;

export interface CheckboxGridGroupArgs {
  readonly group: CheckboxGridGroup;
}

export interface CheckboxGridMetaArgs extends CheckboxGridGroupArgs {
  /** The items with at least one box ticked by hand: locked boxes never count */
  readonly selected: number;

  /** Every item of the group */
  readonly total: number;
}

export interface CheckboxGridMixedArgs extends CheckboxGridGroupArgs {
  readonly column: CheckboxGridColumn;
  readonly checked: number;

  /** The editable items of the column */
  readonly total: number;
}

export interface CheckboxGridBulkArgs extends CheckboxGridGroupArgs {
  readonly column: CheckboxGridColumn;
  readonly checked: boolean;

  /** The items the parent box changed */
  readonly count: number;

  /** The items whose other columns the rules changed too: "Read added to 12" */
  readonly cascaded: number;
}

export interface CheckboxGridToggledArgs {
  readonly item: CheckboxGridItem;
  readonly column: CheckboxGridColumn;
  readonly checked: boolean;

  /** The other columns of the same item the rules ticked or cleared with it */
  readonly alsoChecked: readonly CheckboxGridColumn[];
  readonly alsoUnchecked: readonly CheckboxGridColumn[];
}

/** Every text of service the grid shows. The package writes none */
export interface CheckboxGridLabels {
  /** The header of the first column ("Area and entity"). Only with two columns or more */
  itemsHeader?: React.ReactNode;

  /** The name of the first row of an open group, the one with the parent boxes: "Whole area" */
  allItems: React.ReactNode;

  /** The summary of a group, always with its unit: "2 of 6 entities with permissions" */
  groupMeta: (args: CheckboxGridMetaArgs) => React.ReactNode;

  /** The accessible name of the grid of an open group: "Permissions of the area Fleet" */
  groupGrid: (args: CheckboxGridGroupArgs) => string;

  /** After the name of a group that differs from `savedValue` */
  modified: React.ReactNode;

  /** The description of a box that differs from `savedValue`: "modified" */
  changed?: string;

  /** The tooltip and description of a partial parent box: "Create granted to 4 of 20 editable entities" */
  mixed: (args: CheckboxGridMixedArgs) => string;

  /** Announced after a parent box changed a whole group: "Read granted to 20 entities of Fleet" */
  bulk: (args: CheckboxGridBulkArgs) => string;

  /** Announced after a box changed, with what the rules changed with it: "Create and Read granted to Report" */
  toggled?: (args: CheckboxGridToggledArgs) => string;

  /** Why a locked box cannot change: "Read always granted, not editable" */
  locked: string;

  /** In read only, the checked columns of an item as text, an empty list included */
  readOnlyValue?: (item: CheckboxGridItem, checked: readonly CheckboxGridColumn[]) => React.ReactNode;
}

export interface CheckboxGridProps extends BaseProps, Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  readonly groups: readonly CheckboxGridGroup[];
  readonly columns: readonly CheckboxGridColumn[];

  value?: CheckboxGridValue;
  defaultValue?: CheckboxGridValue;
  onValueChange?: (value: CheckboxGridValue) => void;

  /**
   * The value as it is saved. Every box that differs from it carries a dot, and its group is marked
   * with `labels.modified`; a box brought back as it was loses both. Absent: no marks
   */
  savedValue?: CheckboxGridValue;

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
   * A search is on: only these items are shown, with their groups open; a group that shows only part
   * of its items has no parent boxes (they would act on rows that are not seen). The matching is the
   * caller's, who knows the text of the labels; a group that matches by its name passes all its items.
   * `null` or absent: no search
   */
  visibleItems?: ReadonlySet<string> | null;

  /** Consultation: no boxes, the checked columns of each item as text */
  readOnly?: boolean;

  /** The level of the headings of the groups. Defaults to 3 */
  headingLevel?: CollapsibleSectionHeadingLevel;

  labels: CheckboxGridLabels;
}

interface RowModel {
  readonly key: string;
  readonly item: CheckboxGridItem | null;
}


/* --------
 * Constants Definition
 * -------- */

const NO_GROUPS: readonly string[] = [];

const NO_VALUE: CheckboxGridValue = {};

/** The width of a column of boxes */
const COLUMN_WIDTH = '6rem';

/** In read only, the width of the column with the checked columns as text */
const TEXT_WIDTH = '24rem';

const CELL_FOCUS = 'has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-ring';

/** The header of an open group stays put under the header of the columns */
const STICKY_HEADER = 'data-open:[&>[data-slot=collapsible-section-header]]:sticky '
  + 'data-open:[&>[data-slot=collapsible-section-header]]:z-1 '
  + '[&>[data-slot=collapsible-section-header]]:bg-card';


/* --------
 * Helpers
 * -------- */

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


/** The items with at least one box ticked by hand */
function selectedCount(group: CheckboxGridGroup, columns: readonly CheckboxGridColumn[], value: CheckboxGridValue): number {
  return group.items
    .filter((item) => columns.some((column) => !isLocked(item, column.id) && isChecked(value, item.id, column.id)))
    .length;
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
 * Component Definition
 * -------- */

/**
 * Boxes divided in sections that open and close: rows of items, columns of choices. Every group is a
 * `CollapsibleSection` whose summary says the state of the group; open, its first row carries the
 * parent boxes, then the items. It is the value of a form: saved with the button.
 *
 * ```tsx
 * <CheckboxGrid
 *   groups={areas}
 *   columns={[ { id: 'read', label: 'Read' }, { id: 'create', label: 'Create' } ]}
 *   value={permissions}
 *   savedValue={saved}
 *   onValueChange={setPermissions}
 *   resolve={grantReadWithOthers}
 *   labels={gridLabels}
 * />
 * ```
 *
 * Tab goes from one header to the next; in an open group it enters its grid with one stop, the first
 * time on the first parent box, then on the last box visited. In the grid the arrows move between the
 * boxes, Space ticks, Home and End go along the row, Ctrl + Home and Ctrl + End to the first and last
 * row. Base UI has no grid, so the moving tab index is written here, on the boxes themselves.
 *
 * A parent box is full, partial or empty over the editable items of its group only, and read only when
 * every item of its column is locked. A click on an empty or partial one grants the column to every
 * editable item, on a full one takes it away. Every change, the ones the rules make included, is
 * announced in the `status` region with `labels.bulk` and `labels.toggled`. Two levels, group and item:
 * no box in the header of the columns. A closed group has no parent boxes: to act on it, open it.
 *
 * The header of the columns and the header of an open group stay put while the grid scrolls, inside
 * the nearest scrolling ancestor.
 *
 * Slots: `checkbox-grid` (with `data-read-only`, `data-searching`), `checkbox-grid-header`,
 * `checkbox-grid-column-header`, each group a `collapsible-section` (with `data-modified`),
 * `checkbox-grid-modified`, `checkbox-grid-body`, `checkbox-grid-all`, `checkbox-grid-item`,
 * `checkbox-grid-item-name`, `checkbox-grid-cell` (with `data-parent`, `data-locked`, `data-changed`),
 * `checkbox-grid-box`, `checkbox-grid-changed`, `checkbox-grid-text`, `checkbox-grid-status`.
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
    headingLevel = 3,
    labels,
    onOpenGroupsChange,
    onValueChange,
    openGroups,
    readOnly = false,
    resolve,
    savedValue,
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
  const [ uncontrolledValue, setUncontrolledValue ] = React.useState<CheckboxGridValue>(defaultValue ?? NO_VALUE);
  const [ uncontrolledOpen, setUncontrolledOpen ] = React.useState<readonly string[]>(defaultOpenGroups);
  const [ activeCells, setActiveCells ] = React.useState<Readonly<Record<string, string>>>({});
  const [ announcement, announce ] = useAnnouncer();

  /* The groups closed by hand during a search: forgotten when the search changes */
  const [ searchClosed, setSearchClosed ] = React.useState<{
    for: string | null;
    ids: readonly string[];
  }>({ for: null, ids: NO_GROUPS });

  const rootRef = React.useRef<HTMLDivElement>(null);

  const currentValue = value ?? uncontrolledValue;
  const currentOpen = openGroups ?? uncontrolledOpen;
  const searching = visibleItems !== null;
  /*
   * The search is told apart by what it finds, not by the identity of its set: a caller naturally
   * builds the set while rendering, and compared by identity every render of the page was a new
   * search, which reopened the groups closed by hand.
   */
  const searchKey = visibleItems === null ? null : [ ...visibleItems ].sort().join('\u0000');
  const closedInSearch = searchClosed.for === searchKey ? searchClosed.ids : NO_GROUPS;


  // ----
  // Handlers
  // ----
  const commit = (next: CheckboxGridValue): CheckboxGridValue => {
    const resolved = resolve ? resolve(next, currentValue) : next;

    setUncontrolledValue(resolved);
    onValueChange?.(resolved);

    return resolved;
  };

  const setGroupOpen = (groupId: string, open: boolean): void => {
    if (searching) {
      const ids = open ? closedInSearch.filter((id) => id !== groupId) : [ ...closedInSearch, groupId ];

      setSearchClosed({ for: searchKey, ids });

      return;
    }

    const next = open
      ? (currentOpen.includes(groupId) ? currentOpen : [ ...currentOpen, groupId ])
      : currentOpen.filter((id) => id !== groupId);

    setUncontrolledOpen(next);
    onOpenGroupsChange?.(next);
  };

  const toggleItem = (item: CheckboxGridItem, column: CheckboxGridColumn, checked: boolean): void => {
    const resolved = commit(withColumn(currentValue, [ item.id ], column.id, checked));
    const otherColumns = columns.filter((entry) => entry.id !== column.id);
    const before = (entry: CheckboxGridColumn): boolean => isChecked(currentValue, item.id, entry.id);
    const after = (entry: CheckboxGridColumn): boolean => isChecked(resolved, item.id, entry.id);

    announce(labels.toggled?.({
      item,
      column,
      checked,
      alsoChecked  : otherColumns.filter((entry) => !before(entry) && after(entry)),
      alsoUnchecked: otherColumns.filter((entry) => before(entry) && !after(entry))
    }));
  };

  const toggleParent = (group: CheckboxGridGroup, column: CheckboxGridColumn): void => {
    const state = parentState(group, column.id, currentValue);
    const checked = !state.checked;
    const editable = group.items.filter((item) => !isLocked(item, column.id)).map((item) => item.id);
    const resolved = commit(withColumn(currentValue, editable, column.id, checked));
    const otherColumns = columns.filter((entry) => entry.id !== column.id);
    const cascaded = group.items.filter((item) => otherColumns.some((entry) => (
      isChecked(currentValue, item.id, entry.id) !== isChecked(resolved, item.id, entry.id)
    ))).length;

    announce(labels.bulk({ column, group, checked, count: editable.length, cascaded }));
  };


  // ----
  // Memoized Data
  // ----
  const shownGroups = groups
    .map((group) => {
      const items = searching ? group.items.filter((item) => visibleItems.has(item.id)) : group.items;

      return {
        group,
        items,
        open    : searching ? !closedInSearch.includes(group.id) : currentOpen.includes(group.id),
        complete: items.length === group.items.length
      };
    })
    .filter((entry) => !searching || entry.items.length > 0);

  const hasHeader = columns.length > 1 && !readOnly;
  const template = {
    gridTemplateColumns: readOnly
      ? `minmax(0, 1fr) ${TEXT_WIDTH}`
      : `minmax(0, 1fr) repeat(${columns.length}, ${COLUMN_WIDTH})`
  };

  const changed = (itemId: string, columnId: string): boolean => (
    savedValue !== undefined && isChecked(currentValue, itemId, columnId) !== isChecked(savedValue, itemId, columnId)
  );

  const groupChanged = (group: CheckboxGridGroup): boolean => (
    group.items.some((item) => columns.some((column) => changed(item.id, column.id)))
  );


  // ----
  // Keyboard
  // ----
  const cellKey = (groupId: string, rowKey: string, column: number): string => `${groupId}|${rowKey}|${column}`;

  const focusCell = (key: string): void => {
    const [ groupId ] = key.split('|');

    setActiveCells((current) => ({ ...current, [groupId]: key }));
    rootRef.current?.querySelector<HTMLElement>(`[data-grid-cell="${CSS.escape(key)}"]`)?.focus();
  };

  const handleGridKeyDown = (groupId: string, rows: readonly RowModel[]): React.KeyboardEventHandler<HTMLDivElement> => (
    (event) => {
      const key = (event.target as HTMLElement).closest<HTMLElement>('[data-grid-cell]')?.dataset.gridCell;

      if (!key) {
        return;
      }

      const [ , rowKey, columnText ] = key.split('|');
      const column = Number(columnText);
      const rowIndex = rows.findIndex((row) => row.key === rowKey);
      const last = columns.length - 1;
      let target: string | null = null;

      switch (event.key) {
        case 'ArrowDown':
          target = rows[rowIndex + 1] ? cellKey(groupId, rows[rowIndex + 1].key, column) : key;
          break;

        case 'ArrowUp':
          target = rows[rowIndex - 1] ? cellKey(groupId, rows[rowIndex - 1].key, column) : key;
          break;

        case 'ArrowRight':
          target = cellKey(groupId, rowKey, Math.min(column + 1, last));
          break;

        case 'ArrowLeft':
          target = cellKey(groupId, rowKey, Math.max(column - 1, 0));
          break;

        case 'Home':
          target = event.ctrlKey ? cellKey(groupId, rows[0].key, column) : cellKey(groupId, rowKey, 0);
          break;

        case 'End':
          target = event.ctrlKey ? cellKey(groupId, rows[rows.length - 1].key, column) : cellKey(groupId, rowKey, last);
          break;

        case 'Enter':
          /* A box ticks with Space only, as in a grid */
          event.preventDefault();
          break;

        default:
          break;
      }

      if (target) {
        event.preventDefault();
        event.stopPropagation();
        focusCell(target);
      }
    }
  );


  // ----
  // Render Helpers
  // ----
  const lockedId = `${uid}-locked`;
  const changedId = `${uid}-changed`;
  const columnHeaderId = (groupId: string, column: CheckboxGridColumn): string => `${uid}-${groupId}-column-${column.id}`;
  const nameId = (groupId: string, rowKey: string): string => `${uid}-${groupId}-name-${rowKey}`;

  const renderBox = (options: {
    cell: string;
    tabbable: boolean;
    labelledBy: string;
    checked: boolean;
    mixed?: boolean;
    locked: boolean;
    describedBy?: string;
    onChange: (checked: boolean) => void;
  }): React.ReactElement => (
    <CheckboxPrimitive.Root
      data-grid-cell={options.cell}
      tabIndex={options.tabbable ? 0 : -1}
      onFocus={() => setActiveCells((current) => ({ ...current, [options.cell.split('|')[0]]: options.cell }))}
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

  const renderReadOnly = (group: CheckboxGridGroup, items: readonly CheckboxGridItem[]): React.ReactNode => (
    <ul data-slot={'checkbox-grid-body'} className={'m-0 list-none p-0 pb-3'}>
      {items.map((item) => (
        <li
          key={item.id}
          data-slot={'checkbox-grid-item'}
          style={template}
          className={'grid min-h-8 border-t border-border'}
        >
          <span data-slot={'checkbox-grid-item-name'} className={'flex min-w-0 items-center py-1.5 ps-12 pe-2'}>
            {item.label}
          </span>
          <span data-slot={'checkbox-grid-text'} className={'flex items-center py-1.5 pe-6'}>
            {labels.readOnlyValue?.(item, columns.filter((column) => isChecked(currentValue, item.id, column.id)))}
          </span>
        </li>
      ))}
    </ul>
  );

  const renderGrid = (group: CheckboxGridGroup, items: readonly CheckboxGridItem[], complete: boolean): React.ReactNode => {
    const rows: RowModel[] = [
      ...(complete ? [ { key: 'all', item: null } ] : []),
      ...items.map((item) => ({ key: `i:${item.id}`, item }))
    ];
    const known = new Set(rows.flatMap((row) => columns.map((_, column) => cellKey(group.id, row.key, column))));
    const remembered = activeCells[group.id];
    const tabbable = remembered && known.has(remembered) ? remembered : cellKey(group.id, rows[0].key, 0);

    const renderRow = (row: RowModel): React.ReactNode => {
      const { item } = row;
      const rowName = nameId(group.id, row.key);

      return (
        <div
          key={row.key}
          role={'row'}
          data-slot={item ? 'checkbox-grid-item' : 'checkbox-grid-all'}
          style={template}
          className={cn(
            'grid min-h-8',
            item
              ? 'border-t border-border hover:bg-accent focus-within:bg-accent [[data-slot=checkbox-grid-all]+&]:border-t-0'
              : 'border-b border-input font-medium text-muted-foreground'
          )}
        >
          <span
            role={'rowheader'}
            id={rowName}
            data-slot={'checkbox-grid-item-name'}
            className={'flex min-w-0 items-center py-1.5 ps-12 pe-2'}
          >
            {item ? item.label : labels.allItems}
          </span>

          {columns.map((column, columnIndex) => {
            const cell = cellKey(group.id, row.key, columnIndex);
            const labelledBy = hasHeader ? `${columnHeaderId(group.id, column)} ${rowName}` : rowName;

            if (!item) {
              const state = parentState(group, column.id, currentValue);
              const mixedText = state.mixed
                ? labels.mixed({ column, group, checked: state.count, total: state.total })
                : null;
              const mixedId = `${uid}-${group.id}-mixed-${column.id}`;
              const box = renderBox({
                cell,
                tabbable   : cell === tabbable,
                labelledBy,
                checked    : state.checked,
                mixed      : state.mixed,
                locked     : state.locked,
                describedBy: state.locked ? lockedId : (mixedText ? mixedId : undefined),
                onChange   : () => toggleParent(group, column)
              });
              const tip = mixedText ?? (state.locked ? labels.locked : null);

              return (
                <span
                  key={column.id}
                  role={'gridcell'}
                  data-slot={'checkbox-grid-cell'}
                  data-parent={''}
                  data-locked={state.locked || undefined}
                  className={cn('group/choice relative flex items-center justify-center', CELL_FOCUS)}
                >
                  {tip ? <Tooltip content={tip}>{box}</Tooltip> : box}
                  {mixedText && <span id={mixedId} hidden>{mixedText}</span>}
                </span>
              );
            }

            const locked = isLocked(item, column.id);
            const isChanged = changed(item.id, column.id);
            const describedBy = [ locked && lockedId, isChanged && labels.changed && changedId ].filter(Boolean).join(' ');
            const box = renderBox({
              cell,
              tabbable   : cell === tabbable,
              labelledBy,
              checked    : isChecked(currentValue, item.id, column.id),
              locked,
              describedBy: describedBy || undefined,
              onChange   : (checked) => toggleItem(item, column, checked)
            });

            return (
              <span
                key={column.id}
                role={'gridcell'}
                data-slot={'checkbox-grid-cell'}
                data-locked={locked || undefined}
                data-changed={isChanged || undefined}
                className={cn('group/choice relative flex items-center justify-center', CELL_FOCUS)}
              >
                {locked ? <Tooltip content={labels.locked}>{box}</Tooltip> : box}
                {isChanged && (
                  <span
                    aria-hidden={'true'}
                    data-slot={'checkbox-grid-changed'}
                    className={'absolute top-1.5 start-1/2 ms-2 size-1.5 rounded-full bg-primary'}
                  />
                )}
              </span>
            );
          })}
        </div>
      );
    };

    return (
      <div
        role={'grid'}
        aria-label={labels.groupGrid({ group })}
        data-slot={'checkbox-grid-body'}
        className={'pb-3'}
        onKeyDown={handleGridKeyDown(group.id, rows)}
      >
        <div role={'row'} className={'sr-only'}>
          <span role={'columnheader'}>{labels.itemsHeader}</span>
          {columns.map((column) => (
            <span key={column.id} role={'columnheader'} id={columnHeaderId(group.id, column)}>{column.label}</span>
          ))}
        </div>
        {rows.map(renderRow)}
      </div>
    );
  };


  // ----
  // Component Render
  // ----
  return (
    <div
      {...rest}
      ref={rootRef}
      data-slot={'checkbox-grid'}
      data-read-only={readOnly || undefined}
      data-searching={searching || undefined}
      className={cn('relative flex flex-col text-sm text-foreground', baseClasses, className)}
    >
      {hasHeader && (
        <div
          aria-hidden={'true'}
          data-slot={'checkbox-grid-header'}
          style={template}
          className={'sticky top-0 z-2 grid h-8 items-center border-y border-border bg-card text-xs font-semibold text-muted-foreground'}
        >
          <span data-slot={'checkbox-grid-column-header'} className={'ps-12'}>{labels.itemsHeader}</span>
          {columns.map((column) => (
            <span key={column.id} data-slot={'checkbox-grid-column-header'} className={'text-center'}>
              {column.label}
            </span>
          ))}
        </div>
      )}

      {shownGroups.map(({ group, items, open, complete }) => {
        const isModified = !readOnly && groupChanged(group);

        return (
          <CollapsibleSection
            key={group.id}
            inset
            headingLevel={headingLevel}
            open={open}
            onOpenChange={(next) => setGroupOpen(group.id, next)}
            title={group.label}
            status={isModified && (
              <span data-slot={'checkbox-grid-modified'} className={'flex items-center gap-1.5'}>
                <span aria-hidden={'true'} className={'size-1.5 rounded-full bg-primary'} />
                {labels.modified}
              </span>
            )}
            meta={labels.groupMeta({ group, selected: selectedCount(group, columns, currentValue), total: group.items.length })}
            data-modified={isModified || undefined}
            className={cn(
              'first:border-t-0 [[data-slot=checkbox-grid-header]+&]:border-t-0',
              STICKY_HEADER,
              hasHeader ? '[&>[data-slot=collapsible-section-header]]:top-8' : '[&>[data-slot=collapsible-section-header]]:top-0'
            )}
          >
            {readOnly ? renderReadOnly(group, items) : renderGrid(group, items, complete)}
          </CollapsibleSection>
        );
      })}

      <span id={lockedId} hidden>{labels.locked}</span>
      {labels.changed && <span id={changedId} hidden>{labels.changed}</span>}
      <span data-slot={'checkbox-grid-status'} role={'status'} className={'sr-only'}>{announcement}</span>
    </div>
  );

}

CheckboxGrid.displayName = 'CheckboxGrid';
