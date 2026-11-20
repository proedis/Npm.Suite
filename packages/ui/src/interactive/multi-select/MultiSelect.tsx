'use client';

import * as React from 'react';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { Select as SelectPrimitive } from '@base-ui/react/select';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Spinner } from '../../components/Spinner';
import { VisuallyHidden } from '../../components/VisuallyHidden';

import { Button } from '../button/Button';
import { IconButton } from '../button/IconButton';
import { CheckGlyph } from '../choice/choice';
import { useFieldControl, useNonNativeFieldLabel } from '../field/fieldContext';
import {
  LIST_FOOTER,
  LIST_ITEM,
  LIST_ITEMS,
  LIST_MESSAGE,
  LIST_PANEL,
  LIST_POSITIONER,
  LIST_SEARCH,
  LIST_SEARCH_INPUT,
  LIST_SIDE_OFFSET,
  ListFieldEnd,
  matchesSearch
} from '../list-panel/listPanel';
import { TEXT_CONTROL_FRAME, TEXT_CONTROL_SIZES, textControlState } from '../text-control/textControl';
import { ClearGlyph, SearchGlyph } from '../text-input/glyphs';
import { Tooltip } from '../tooltip/Tooltip';

import type { BaseProps } from '../../core/base';

import type { SelectOption } from '../select/Select';
import type { TextControlSize } from '../text-control/textControl';


/* --------
 * Types Definition
 * -------- */

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

  id?: string;
  className?: string;
  'aria-label'?: string;
}

export type MultiSelectLoadingProps =
  | { loading?: false; loadingLabel?: string }
  | { loading: true; loadingLabel: string };

export type MultiSelectProps = StrictMultiSelectProps & MultiSelectLoadingProps;


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_THRESHOLD = 8;

const TOOLTIP_LIST_LIMIT = 10;

const CHIP = 'inline-flex h-5 max-w-full shrink-0 items-center gap-0.5 rounded-sm bg-secondary ps-1.5 text-xs font-medium text-secondary-foreground';

/** The box of an option: the Checkbox's drawing, with no focus of its own; the option is the control */
const OPTION_BOX = [
  'mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-card text-primary-foreground',
  'group-data-selected/option:border-transparent group-data-selected/option:bg-primary'
].join(' ');


/* --------
 * Component Definition
 * -------- */

/**
 * Several choices from a list that is not in view. Closed, a chip per value on one row; open, a box
 * per option.
 *
 * ```tsx
 * <Field>
 *   <Field.Label>Towns</Field.Label>
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
export function MultiSelect(props: MultiSelectProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-label': ariaLabel,
    className,
    defaultValue = [],
    disabled = false,
    id,
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

  const { baseClasses } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();

  useNonNativeFieldLabel();

  const frameRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
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
    const target = event.target as Element;

    if (target.closest('[data-slot=multi-select-trigger], [data-slot=multi-select-chip-remove]') !== null) {
      return;
    }

    event.preventDefault();
    triggerRef.current?.focus();
    handleOpenChange(!open);
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

  const shown = readOnly ? chosen : chosen.slice(0, maxChips);
  const hidden = readOnly ? [] : chosen.slice(maxChips);

  const moreTooltip = (
    <span className={'flex flex-col'}>
      {hidden.slice(0, TOOLTIP_LIST_LIMIT).map((option) => <span key={option.value}>{option.label}</span>)}
      {hidden.length > TOOLTIP_LIST_LIMIT && (
        <span className={'text-tooltip-muted-foreground'}>{labels.moreRest(hidden.length - TOOLTIP_LIST_LIMIT)}</span>
      )}
    </span>
  );

  const chips = (
    <span
      data-slot={'multi-select-chips'}
      className={cn(
        'relative z-10 flex min-w-0 flex-1 items-center gap-1.5',
        readOnly ? 'flex-wrap py-1' : 'overflow-hidden',
        'pointer-events-none *:pointer-events-auto'
      )}
    >
      {chosen.length === 0 && placeholder && (
        <span className={'truncate text-placeholder'}>{placeholder}</span>
      )}

      {shown.map((option) => (
        <span
          key={option.value}
          data-slot={'multi-select-chip'}
          className={cn(CHIP, (inert || option.disabled) && 'pe-1.5', readOnly && 'border border-border bg-card')}
        >
          <Tooltip content={option.label} truncatedOnly align={'start'}>
            <span data-truncate={''} className={cn('min-w-0 truncate', shown.length > 1 && 'max-w-30')}>{option.label}</span>
          </Tooltip>

          {!inert && !option.disabled && (
            <IconButton
              label={labels.remove(option.label)}
              icon={<ClearGlyph />}
              tabIndex={-1}
              size={'sm'}
              data-slot={'multi-select-chip-remove'}
              className={'size-5 rounded-sm [&_svg]:size-3.5'}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => change(current.filter((item) => item !== option.value))}
            />
          )}
        </span>
      ))}

      {hidden.length > 0 && (
        <Tooltip content={moreTooltip}>
          <span data-slot={'multi-select-more'} className={cn(CHIP, 'pe-1.5')}>
            <span aria-hidden={'true'}>{`+${hidden.length}`}</span>
            <VisuallyHidden>{labels.more(hidden.length)}</VisuallyHidden>
          </span>
        </Tooltip>
      )}
    </span>
  );

  const frameClasses = cn(
    TEXT_CONTROL_FRAME,
    TEXT_CONTROL_SIZES[size],
    'group/list-field relative flex w-full min-w-60 items-center',
    readOnly && 'h-auto min-h-control-md',
    '[&_svg]:shrink-0 [&_svg]:text-muted-foreground',
    baseClasses,
    className
  );

  const frameAttributes = {
    'data-slot': 'multi-select',
    'data-size': size,
    'data-loading': loading || undefined,
    ...textControlState({ invalid: isInvalid, readOnly, disabled: isDisabled })
  };

  const spinner = <Spinner size={'sm'} className={size === 'sm' ? 'size-3.5' : undefined} label={loadingLabel} />;

  /** The trigger lies under the chips across the whole frame; what it says is the list of values */
  const triggerProps = {
    ref                 : triggerRef,
    id,
    'aria-label'        : ariaLabel,
    'aria-describedby'  : summaryId,
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
      <div {...frameAttributes} className={frameClasses}>
        <input readOnly aria-label={ariaLabel} value={chosen.map((option) => option.label).join(', ')} className={'sr-only'} data-field-control={''} />
        {chips}
        {name && current.map((item) => <input key={item} type={'hidden'} name={name} value={item} />)}
      </div>
    );
  }

  const optionContent = (option: SelectOption): React.ReactNode => (
    <React.Fragment>
      <span className={OPTION_BOX} aria-hidden={'true'}><CheckGlyph /></span>
      <span className={'min-w-0 flex-1'}>{option.label}</span>
    </React.Fragment>
  );

  const footer = (
    <div data-slot={'multi-select-footer'} className={LIST_FOOTER}>
      <Button size={'sm'} fill={'plain'} tone={'primary'} disabled={allChecked} onClick={selectAll}>{labels.selectAll}</Button>
      <Button size={'sm'} fill={'plain'} tone={'primary'} disabled={noneChecked} onClick={clearAll}>{labels.clear}</Button>
    </div>
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
        <div ref={frameRef} {...frameAttributes} className={frameClasses} onMouseDown={handleFrameMouseDown}>
          <SelectPrimitive.Trigger {...triggerProps}>{summary}</SelectPrimitive.Trigger>
          {chips}
          <ListFieldEnd loading={loading} spinner={spinner} className={'pointer-events-none relative z-10'} />
        </div>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            anchor={frameRef}
            alignItemWithTrigger={false}
            sideOffset={LIST_SIDE_OFFSET}
            className={LIST_POSITIONER}
          >
            <SelectPrimitive.Popup data-slot={'multi-select-panel'} className={LIST_PANEL}>
              <SelectPrimitive.List className={LIST_ITEMS}>
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    disabled={option.disabled}
                    data-slot={'multi-select-item'}
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
      <div ref={frameRef} {...frameAttributes} className={frameClasses} onMouseDown={handleFrameMouseDown}>
        <ComboboxPrimitive.Trigger {...triggerProps}>{summary}</ComboboxPrimitive.Trigger>
        {chips}
        <ListFieldEnd loading={loading} spinner={spinner} className={'pointer-events-none relative z-10'} />
      </div>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner anchor={frameRef} sideOffset={LIST_SIDE_OFFSET} className={LIST_POSITIONER}>
          <ComboboxPrimitive.Popup data-slot={'multi-select-panel'} className={LIST_PANEL}>
            <div className={LIST_SEARCH}>
              <SearchGlyph />
              <ComboboxPrimitive.Input placeholder={labels.search} className={LIST_SEARCH_INPUT} />
            </div>

            <ComboboxPrimitive.Empty className={cn(LIST_MESSAGE, 'empty:hidden')}>{labels.noResults}</ComboboxPrimitive.Empty>

            <ComboboxPrimitive.List className={LIST_ITEMS}>
              {(option: SelectOption) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option}
                  disabled={option.disabled}
                  data-slot={'multi-select-item'}
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

}

MultiSelect.displayName = 'MultiSelect';
