'use client';

import * as React from 'react';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { Select as SelectPrimitive } from '@base-ui/react/select';

import { useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { bindable } from '../../core/binding';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { Spinner } from '../../primitives/Spinner';
import { VisuallyHidden } from '../../primitives/VisuallyHidden';

import { CheckGlyph, SearchGlyph } from '../../internal/glyphs';

import { Button } from '../../actions/button/Button';
import {
  LIST_FOOTER,
  LIST_ITEM,
  LIST_ITEMS,
  LIST_MESSAGE,
  LIST_OPTION_BOX,
  LIST_PANEL,
  LIST_POSITIONER,
  LIST_SEARCH,
  LIST_SEARCH_INPUT,
  LIST_SIDE_OFFSET,
  ListFieldEnd,
  matchesSearch
} from '../../actions/list-panel/listPanel';

import { useFieldControl, useNonNativeFieldLabel } from '../field/fieldContext';
import { FieldShell } from '../field-shell/FieldShell';
import { LIST_ITEM_LAYOUT, LIST_PANEL_LAYOUT, ListChips, toggleFromFrame } from '../list-field/listField';

import type { BaseProps } from '../../core/base';
import type { BoundValue } from '../../core/binding';

import type { SelectOption } from '../select/Select';
import type { TextControlSize } from '../text-control/textControl';


/* --------
 * Types Definition
 * -------- */

/** The options are the ones of `Select`, re-exported so the subpath is enough to type them */
export type { SelectOption };

export interface MultiSelectLabels {
  /** The placeholder of the search, past the threshold */
  readonly search: string;

  /** The line that replaces an empty list */
  readonly noResults: string;

  /** The footer action that checks every option that can change (only the ones found, when searching) */
  readonly selectAll: string;

  /** The footer action that clears them */
  readonly clear: string;

  /** Name and tooltip of the x of a chip: "Remove Brescia" */
  readonly remove: (label: string) => string;

  /** Name of the "+N" chip: "3 more towns" */
  readonly more: (count: number) => string;

  /** The closing line of the "+N" tooltip past the tenth value: "and 4 more towns" */
  readonly moreRest: (count: number) => string;
}

export interface StrictMultiSelectProps extends BaseProps {
  /** Every option, all at once */
  options: readonly SelectOption[];

  /** The chosen values, always in the order of the list */
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;

  placeholder?: string;

  /** Defaults to `md` */
  size?: TextControlSize;

  /** Past this many options the list gets a search. Defaults to 8 */
  searchThreshold?: number;

  /** Chips shown at most; the rest go into "+N". Defaults to 3 */
  maxChips?: number;

  name?: string;
  invalid?: boolean;
  readOnly?: boolean;
  disabled?: boolean;

  labels: MultiSelectLabels;

  /** Classes for the frame, last so they win */
  className?: string;
}

export type MultiSelectLoadingProps =
  | { loading?: false; loadingLabel?: string }
  | { loading: true; loadingLabel: string };

/**
 * The frame takes `className` and the shared props; the native props and the ref reach the button that
 * opens the list, under the chips, the element that takes the focus.
 */
export type MultiSelectProps = StrictMultiSelectProps & MultiSelectLoadingProps & Omit<
  React.ComponentProps<'button'>,
  keyof StrictMultiSelectProps | 'loading' | 'ref' | 'children' | 'value' | 'defaultValue' | 'onChange' | 'type'
>;


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_THRESHOLD = 8;


/* --------
 * Component Definition
 * -------- */

/**
 * Several choices from a list that is not in view. Closed, a chip per value on one row; open, a box
 * per option.
 *
 * ```tsx
 * <Field label={'Towns'}>
 *   <MultiSelect options={towns} value={selected} onValueChange={setSelected} labels={multiSelectLabels} />
 * </Field>
 * ```
 *
 * The list of the Select, with a box per option that counts at once and keeps the list open; the
 * options do not move when checked, and the search stays after a tick. The footer checks or clears
 * the options that can change, or only the ones found while searching.
 *
 * The chips follow the order of the list. Up to `maxChips` are shown, the rest go into "+N", whose
 * tooltip lists them, ten at most. A chip's x removes its value without opening the list and is not
 * a Tab stop. A chosen option that is disabled stays chosen, and its chip has no x. Read only every
 * value is in view, chips wrap, nothing opens.
 *
 * Slots: `multi-select` (the frame), `multi-select-chips`, `multi-select-chip`, `multi-select-chip-remove`,
 * `multi-select-more`, `multi-select-trigger`, `multi-select-panel`, `multi-select-item`,
 * `multi-select-footer`.
 */
const MultiSelectBase = React.forwardRef<HTMLButtonElement, MultiSelectProps>((props, forwardedRef) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    defaultValue = [],
    disabled = false,
    invalid = false,
    labels,
    loading = false,
    loadingLabel,
    maxChips = 3,
    name,
    onValueChange,
    options,
    placeholder,
    readOnly = false,
    searchThreshold = DEFAULT_THRESHOLD,
    size = 'md',
    value,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();

  useNonNativeFieldLabel();

  const frameRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const handleTriggerRef = useForkRef(triggerRef, forwardedRef);
  const summaryId = React.useId();


  // ----
  // Internal State
  // ----
  const [ ownValue, setOwnValue ] = React.useState<readonly string[]>(defaultValue);
  const [ open, setOpen ] = React.useState(false);
  const [ query, setQuery ] = React.useState('');

  /** The engine is chosen while the list is closed and kept while it is open: see `Select` */
  const [ searchable, setSearchable ] = React.useState(options.length > searchThreshold);

  if (!open && searchable !== options.length > searchThreshold) {
    setSearchable(options.length > searchThreshold);
  }

  const current = value ?? ownValue;
  const chosen = options.filter((option) => current.includes(option.value));


  // ----
  // Handlers
  // ----

  /**
   * Every change lands in the order of the list, whatever the order of the clicks.
   *
   * A chosen value that is not among the options (still loading, no longer offered) is kept, after
   * the ones that are: the list orders what it shows, it does not decide what the value may hold.
   */
  const change = (next: readonly string[]): void => {
    const offered = new Set(options.map((option) => option.value));
    const ordered = [
      ...options.filter((option) => next.includes(option.value)).map((option) => option.value),
      ...next.filter((item, index) => !offered.has(item) && next.indexOf(item) === index)
    ];

    if (value === undefined) {
      setOwnValue(ordered);
    }

    onValueChange?.(ordered);
  };

  const handleOpenChange = (next: boolean): void => {
    if (next && (loading || readOnly)) {
      return;
    }

    if (!next) {
      setQuery('');
    }

    setOpen(next);
  };

  const handleFrameMouseDown = (event: React.MouseEvent<HTMLDivElement>): void => {
    toggleFromFrame(event, '[data-slot=multi-select-trigger], [data-slot=multi-select-chip-remove]', triggerRef.current, open, handleOpenChange);
  };


  // ----
  // Component Render
  // ----
  const isDisabled = disabled || field.disabled;
  const isInvalid = invalid || field.invalid;
  const inert = readOnly || isDisabled || loading;

  /* The footer acts on the options that can change: the ones found, while searching */
  const reachable = options.filter((option) => !option.disabled && (!searchable || matchesSearch(option.label, query)));
  const allChecked = reachable.length > 0 && reachable.every((option) => current.includes(option.value));
  const noneChecked = reachable.every((option) => !current.includes(option.value));

  const selectAll = (): void => change([ ...current, ...reachable.map((option) => option.value) ]);
  const clearAll = (): void => change(current.filter((item) => !reachable.some((option) => option.value === item)));

  const chips = (
    <ListChips
      slot={'multi-select'}
      items={chosen}
      maxChips={maxChips}
      readOnly={readOnly}
      inert={inert}
      isLocked={(option) => option.disabled === true}
      placeholder={placeholder}
      labels={labels}
      onRemove={(option) => change(current.filter((item) => item !== option.value))}
    />
  );

  const frameClasses = cn(
    'group/list-field relative w-full min-w-60',
    readOnly && 'h-auto min-h-control-md',
    '[&_svg]:shrink-0 [&_svg]:text-muted-foreground',
    baseClasses,
    className
  );


  const frameAttributes = {
    'data-slot': 'multi-select',
    size,
    'data-loading': loading || undefined,
    invalid : isInvalid,
    readOnly,
    disabled: isDisabled
  };

  const spinner = <Spinner size={'sm'} className={size === 'sm' ? 'size-3.5' : undefined} label={loadingLabel} />;

  /** The trigger lies under the chips across the whole frame; what it says is the list of values */
  const triggerProps = {
    ...rest,
    ref                 : handleTriggerRef,
    'aria-describedby'  : [ summaryId, rest['aria-describedby'] ].filter(Boolean).join(' '),
    'aria-required'     : field.required || undefined,
    'aria-invalid'      : isInvalid || undefined,
    'data-slot'         : 'multi-select-trigger',
    'data-field-control': '',
    className           : 'absolute inset-0 cursor-default rounded-md outline-none'
  };

  const summary = (
    <VisuallyHidden id={summaryId}>{chosen.map((option) => option.label).join(', ')}</VisuallyHidden>
  );

  if (readOnly) {
    return (
      <FieldShell {...frameAttributes} className={frameClasses}>
        <input
          id={rest.id}
          aria-label={rest['aria-label']}
          aria-labelledby={rest['aria-labelledby']}
          readOnly
          value={chosen.map((option) => option.label).join(', ')}
          className={'sr-only'}
          data-field-control={''}
        />
        {chips}
        {name && current.map((item) => <input key={item} type={'hidden'} name={name} value={item} />)}
      </FieldShell>
    );
  }

  const optionContent = (option: SelectOption): React.ReactNode => (
    <React.Fragment>
      <Stack
        gap={0}
        as={'span'}
        data-slot={'multi-select-item-box'}
        inline
        direction={'horizontal'}
        align={'center'}
        justify={'center'}
        className={LIST_OPTION_BOX}
        aria-hidden={'true'}
      >
        <CheckGlyph />
      </Stack>
      <span data-slot={'multi-select-item-label'} className={'min-w-0 flex-1'}>{option.label}</span>
    </React.Fragment>
  );

  const footer = (
    <Stack data-slot={'multi-select-footer'} direction={'horizontal'} align={'center'} justify={'between'} gap={1} className={LIST_FOOTER}>
      <Button data-slot={'multi-select-select-all'} size={'sm'} fill={'plain'} tone={'primary'} disabled={allChecked} onClick={selectAll}>
        {labels.selectAll}
      </Button>
      <Button data-slot={'multi-select-clear-all'} size={'sm'} fill={'plain'} tone={'primary'} disabled={noneChecked} onClick={clearAll}>
        {labels.clear}
      </Button>
    </Stack>
  );

  if (!searchable) {
    return (
      <SelectPrimitive.Root
        multiple
        items={options as SelectOption[]}
        value={[ ...current ]}
        onValueChange={(next) => change(next as string[])}
        open={open}
        onOpenChange={handleOpenChange}
        modal={false}
        disabled={isDisabled}
        name={name}
      >
        <FieldShell ref={frameRef} {...frameAttributes} className={frameClasses} onMouseDown={handleFrameMouseDown}>
          <SelectPrimitive.Trigger {...triggerProps}>{summary}</SelectPrimitive.Trigger>
          {chips}
          <ListFieldEnd loading={loading} spinner={spinner} className={'pointer-events-none relative z-10'} />
        </FieldShell>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            anchor={frameRef}
            alignItemWithTrigger={false}
            sideOffset={LIST_SIDE_OFFSET}
            className={LIST_POSITIONER}
          >
            <SelectPrimitive.Popup data-slot={'multi-select-panel'} render={LIST_PANEL_LAYOUT} className={LIST_PANEL}>
              <SelectPrimitive.List className={LIST_ITEMS}>
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    disabled={option.disabled}
                    data-slot={'multi-select-item'}
                    render={LIST_ITEM_LAYOUT}
                    className={cn(LIST_ITEM, 'group/option')}
                  >
                    {optionContent(option)}
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.List>
              {footer}
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  }

  return (
    <ComboboxPrimitive.Root
      multiple
      items={options as SelectOption[]}
      value={chosen}
      onValueChange={(next) => change((next as SelectOption[]).map((option) => option.value))}
      itemToStringLabel={(option: SelectOption) => option.label}
      itemToStringValue={(option: SelectOption) => option.value}
      isItemEqualToValue={(a: SelectOption, b: SelectOption) => a.value === b.value}
      filter={(option: SelectOption, text: string) => matchesSearch(option.label, text)}
      inputValue={query}
      onInputValueChange={setQuery}
      autoHighlight
      open={open}
      onOpenChange={handleOpenChange}
      modal={false}
      disabled={isDisabled}
      name={name}
    >
      <FieldShell ref={frameRef} {...frameAttributes} className={frameClasses} onMouseDown={handleFrameMouseDown}>
        <ComboboxPrimitive.Trigger {...triggerProps}>{summary}</ComboboxPrimitive.Trigger>
        {chips}
        <ListFieldEnd loading={loading} spinner={spinner} className={'pointer-events-none relative z-10'} />
      </FieldShell>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner anchor={frameRef} sideOffset={LIST_SIDE_OFFSET} className={LIST_POSITIONER}>
          <ComboboxPrimitive.Popup data-slot={'multi-select-panel'} render={LIST_PANEL_LAYOUT} className={LIST_PANEL}>
            <Stack data-slot={'multi-select-search'} direction={'horizontal'} align={'center'} gap={2} className={LIST_SEARCH}>
              <SearchGlyph />
              <ComboboxPrimitive.Input data-slot={'multi-select-search-input'} placeholder={labels.search} className={LIST_SEARCH_INPUT} />
            </Stack>

            <ComboboxPrimitive.Empty data-slot={'multi-select-empty'} className={cn(LIST_MESSAGE, 'empty:hidden')}>
              {labels.noResults}
            </ComboboxPrimitive.Empty>

            <ComboboxPrimitive.List className={LIST_ITEMS}>
              {(option: SelectOption) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option}
                  disabled={option.disabled}
                  data-slot={'multi-select-item'}
                  render={LIST_ITEM_LAYOUT}
                  className={cn(LIST_ITEM, 'group/option')}
                >
                  {optionContent(option)}
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>

            {footer}
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );

});

MultiSelectBase.displayName = 'MultiSelect';

/** Bound to a form through `binding`: see `bindable` in core */
export const MultiSelect = bindable(MultiSelectBase, {
  kind: 'options',
  bind: (field: BoundValue<string[]>) => ({
    name         : field.name,
    ref          : field.ref,
    value        : field.value ?? [],
    onValueChange: field.onChange,
    onBlur       : field.onBlur
  })
});
