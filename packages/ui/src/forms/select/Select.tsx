'use client';

import * as React from 'react';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { Input } from '@base-ui/react/input';
import { Select as SelectPrimitive } from '@base-ui/react/select';

import { useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { Spinner } from '../../primitives/Spinner';

import { CheckGlyph, ClearGlyph, SearchGlyph } from '../../internal/glyphs';

import { IconButton } from '../../actions/button/IconButton';
import {
  LIST_ITEM,
  LIST_ITEMS,
  LIST_MESSAGE,
  LIST_PANEL,
  LIST_POSITIONER,
  LIST_SEARCH,
  LIST_SEARCH_INPUT,
  LIST_SIDE_OFFSET,
  ListFieldEnd,
  matchesSearch,
  normalizeForSearch
} from '../../actions/list-panel/listPanel';

import { useFieldControl, useNonNativeFieldLabel } from '../field/fieldContext';
import { LIST_ITEM_LAYOUT, LIST_PANEL_LAYOUT, toggleFromFrame } from '../list-field/listField';
import { TEXT_CONTROL_FRAME, TEXT_CONTROL_GAP, TEXT_CONTROL_SIZES, TEXT_CONTROL_TEXT, textControlState } from '../text-control/textControl';

import type { BaseProps } from '../../core/base';

import type { TextControlSize } from '../text-control/textControl';


/* --------
 * Types Definition
 * -------- */

export interface SelectOption {
  readonly value: string;
  readonly label: string;

  /** Out of reach. A value no longer offered is still passed, disabled, so the field shows its label */
  readonly disabled?: boolean;
}

export interface SelectLabels {
  /** The placeholder of the search, past the threshold */
  readonly search: string;

  /** The line that replaces an empty list */
  readonly noResults: string;

  /** Name and tooltip of the button that empties the field */
  readonly clear: string;
}

export interface StrictSelectProps extends BaseProps {
  /** Every option, all at once: a Select does not load in pieces */
  options: readonly SelectOption[];

  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;

  /** A short invitation, "Select". Not an example and not the label again */
  placeholder?: string;

  /** Defaults to `md` */
  size?: TextControlSize;

  /** Past this many options the list gets a search. Defaults to 8 */
  searchThreshold?: number;

  /** No button to empty the field. Inside a field with a required label it is on already */
  required?: boolean;

  /** The name the value is submitted under */
  name?: string;

  /** The error state. Inside a field with a `Field.Error` it is on already */
  invalid?: boolean;

  /** Reachable, selectable, submitted; it does not open */
  readOnly?: boolean;

  disabled?: boolean;

  /** The texts of the search, the empty list and the clear button */
  labels: SelectLabels;

  /** Classes for the frame, last so they win */
  className?: string;
}

/** `loadingLabel` is required with `loading`: the options are on their way, the field does not open */
export type SelectLoadingProps =
  | { loading?: false; loadingLabel?: string }
  | { loading: true; loadingLabel: string };

/**
 * The frame takes `className` and the shared props; the native props and the ref reach the button
 * that opens the list, the element that takes the focus: `id`, `aria-*`, `onBlur` for a form library.
 */
export type SelectProps = StrictSelectProps & SelectLoadingProps & Omit<
  React.ComponentProps<'button'>,
  keyof StrictSelectProps | 'loading' | 'ref' | 'children' | 'value' | 'defaultValue' | 'onChange' | 'type'
>;


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_THRESHOLD = 8;

/** The button that opens the list, a row through `render` (`TRIGGER_LAYOUT`) */
const TRIGGER = 'h-full min-w-0 flex-1 cursor-default bg-transparent text-start outline-none';

const TRIGGER_LAYOUT = <Stack gap={0} as={'button'} direction={'horizontal'} align={'center'} />;

const VALUE = 'min-w-0 flex-1 truncate data-placeholder:text-placeholder';

const TICK = 'ms-auto mt-0.5 shrink-0 [&_svg]:size-4 [&_svg]:text-primary';


/* --------
 * Helpers
 * -------- */

function firstStartingWith(options: readonly SelectOption[], key: string): SelectOption | undefined {
  const wanted = normalizeForSearch(key);

  return options.find((option) => !option.disabled && normalizeForSearch(option.label).startsWith(wanted));
}


/* --------
 * Component Definition
 * -------- */

/**
 * One choice from a list that is not in view. The field is the TextInput's; the list opens under it.
 *
 * ```tsx
 * <Field>
 *   <Field.Label required>Town</Field.Label>
 *   <Select options={towns} value={town} onValueChange={setTown} placeholder={t('…SELECT')} labels={selectLabels} />
 * </Field>
 * ```
 *
 * Up to `searchThreshold` options it runs on Base UI's `Select`; past it on its `Combobox`, with the
 * search at the top of the list, because a Select cannot hold a search. The two look and behave the
 * same from the outside. Search ignores case and accents and keeps the order of the list.
 *
 * What it decides on its own, from the guide:
 *
 * - a letter on the closed field opens the list on the first option starting with it, and does not
 *   change the value: a key pressed by mistake never changes a form in silence;
 * - an optional field with a value has a button that empties it, not a Tab stop: from the keyboard,
 *   Delete or Backspace on the closed field;
 * - read only it stays reachable and its text selectable, and it does not open; loading it keeps its
 *   value and does not open;
 * - the label of its field names it and focuses it, without opening the list.
 *
 * Slots: `select` (the frame, with `data-size` and the states), `select-trigger`, `select-value`,
 * `select-clear`, `list-field-end`, `list-chevron`, `select-panel`, `select-search`, `select-item`,
 * `select-empty`.
 */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>((props, forwardedRef) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    defaultValue = null,
    disabled = false,
    invalid = false,
    labels,
    loading = false,
    loadingLabel,
    name,
    onValueChange,
    options,
    placeholder,
    readOnly = false,
    required = false,
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
  const pendingKeyRef = React.useRef<string | null>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);


  // ----
  // Internal State
  // ----
  const [ ownValue, setOwnValue ] = React.useState<string | null>(defaultValue);
  const [ open, setOpen ] = React.useState(false);

  const current = value !== undefined ? value : ownValue;
  const selected = options.find((option) => option.value === current) ?? null;

  const isDisabled = disabled || field.disabled;
  const isInvalid = invalid || field.invalid;
  const isRequired = required || field.required;
  const canClear = !isRequired && !readOnly && !isDisabled && !loading && current !== null;

  /**
   * The engine is chosen while the list is closed and kept while it is open, adjusted while
   * rendering. Options that cross the threshold under an open list (an async load, a filter upstream)
   * would otherwise unmount one engine and mount the other with the list still open.
   */
  const [ searchable, setSearchable ] = React.useState(options.length > searchThreshold);

  if (!open && searchable !== options.length > searchThreshold) {
    setSearchable(options.length > searchThreshold);
  }


  // ----
  // Handlers
  // ----
  const change = (next: string | null): void => {
    if (value === undefined) {
      setOwnValue(next);
    }

    onValueChange?.(next);
  };

  const handleOpenChange = (next: boolean): void => {
    if (next && (loading || readOnly)) {
      return;
    }

    setOpen(next);
  };

  /** Arrow, padding, the space around the value: the whole frame opens the list, but the clear button */
  const handleFrameMouseDown = (event: React.MouseEvent<HTMLDivElement>): void => {
    toggleFromFrame(event, '[data-slot=select-trigger], [data-slot=select-clear]', triggerRef.current, open, handleOpenChange);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement> & { preventBaseUIHandler?: () => void }): void => {
    rest.onKeyDown?.(event);

    if (open || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    /* Delete and Backspace empty an optional field */
    if ((event.key === 'Delete' || event.key === 'Backspace') && canClear) {
      event.preventDefault();
      change(null);
      return;
    }

    /* A letter opens the list on its first match, and never changes the value with the list closed */
    if (event.key.length === 1 && event.key !== ' ') {
      event.preventBaseUIHandler?.();
      event.preventDefault();
      pendingKeyRef.current = event.key;
      handleOpenChange(true);
    }
  };

  /**
   * Once the list is open, after Base UI has highlighted the value: the letter goes into the search,
   * or, with no search, the first option starting with it takes the highlight.
   */
  const handleOpenChangeComplete = (isOpen: boolean): void => {
    const key = pendingKeyRef.current;
    const popup = popupRef.current;

    pendingKeyRef.current = null;

    if (!isOpen || !key || !popup) {
      return;
    }

    const search = popup.querySelector<HTMLInputElement>('[data-slot=select-search] input');

    if (search) {
      search.setRangeText(key, 0, search.value.length, 'end');
      search.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    const match = firstStartingWith(options, key);

    if (match) {
      popup.querySelector<HTMLElement>(`[data-slot=select-item][data-option-value="${CSS.escape(match.value)}"]`)?.focus();
    }
  };


  // ----
  // Component Render
  // ----

  const frameClasses = cn(
    TEXT_CONTROL_FRAME,
    TEXT_CONTROL_SIZES[size],
    'group/list-field w-full min-w-0',
    '[&_svg]:shrink-0 [&_svg]:text-muted-foreground',
    baseClasses,
    className
  );

  /** The frame is a row: its parts are the trigger, the clear button and the arrow */
  const frameLayout = { direction: 'horizontal', align: 'center', gap: TEXT_CONTROL_GAP[size] } as const;

  const frameAttributes = {
    'data-slot': 'select',
    'data-size': size,
    'data-loading': loading || undefined,
    ...textControlState({ invalid: isInvalid, readOnly, disabled: isDisabled })
  };

  const spinner = (
    <Spinner size={'sm'} className={size === 'sm' ? 'size-3.5' : undefined} label={loadingLabel} />
  );

  const clearButton = canClear && (
    <IconButton
      label={labels.clear}
      icon={<ClearGlyph />}
      tabIndex={-1}
      size={size === 'sm' ? 'sm' : 'md'}
      data-slot={'select-clear'}
      className={'size-6 rounded-sm'}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        change(null);
        triggerRef.current?.focus();
      }}
    />
  );

  const triggerAttributes = {
    ...rest,
    'aria-required'     : isRequired || undefined,
    'aria-invalid'      : isInvalid || undefined,
    'data-slot'         : 'select-trigger',
    'data-field-control': ''
  };

  /* Read only: the text is selectable and the value is submitted, and nothing opens */
  if (readOnly) {
    return (
      <Stack {...frameAttributes} {...frameLayout} className={frameClasses}>
        <Input
          id={rest.id}
          aria-label={rest['aria-label']}
          aria-labelledby={rest['aria-labelledby']}
          aria-describedby={rest['aria-describedby']}
          readOnly
          value={selected?.label ?? ''}
          data-slot={'select-value'}
          data-field-control={''}
          className={cn('h-full min-w-0 flex-1 truncate bg-transparent outline-none', TEXT_CONTROL_TEXT)}
        />
        {name && <input type={'hidden'} name={name} value={current ?? ''} />}
      </Stack>
    );
  }

  const item = (option: SelectOption, content: React.ReactNode, Indicator: React.ElementType): React.ReactNode => (
    <React.Fragment>
      <span data-slot={'select-item-label'} className={'min-w-0 flex-1'}>{content}</span>
      <Indicator data-slot={'select-item-tick'} className={TICK}>
        <CheckGlyph />
      </Indicator>
    </React.Fragment>
  );

  if (!searchable) {
    return (
      <SelectPrimitive.Root
        items={options as SelectOption[]}
        value={current}
        onValueChange={(next) => change(next as string | null)}
        open={open}
        onOpenChange={handleOpenChange}
        onOpenChangeComplete={handleOpenChangeComplete}
        modal={false}
        disabled={isDisabled}
        name={name}
      >
        <Stack ref={frameRef} {...frameAttributes} {...frameLayout} className={frameClasses} onMouseDown={handleFrameMouseDown}>
          <SelectPrimitive.Trigger
            ref={handleTriggerRef}
            {...triggerAttributes}
            render={TRIGGER_LAYOUT}
            className={TRIGGER}
            onKeyDown={handleTriggerKeyDown}
          >
            <SelectPrimitive.Value placeholder={placeholder} data-slot={'select-value'} className={VALUE} />
          </SelectPrimitive.Trigger>

          <ListFieldEnd loading={loading} spinner={spinner}>{clearButton}</ListFieldEnd>
        </Stack>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            anchor={frameRef}
            alignItemWithTrigger={false}
            sideOffset={LIST_SIDE_OFFSET}
            className={LIST_POSITIONER}
          >
            <SelectPrimitive.Popup ref={popupRef} data-slot={'select-panel'} render={LIST_PANEL_LAYOUT} className={LIST_PANEL}>
              <SelectPrimitive.List className={LIST_ITEMS}>
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    disabled={option.disabled}
                    data-slot={'select-item'}
                    data-option-value={option.value}
                    render={LIST_ITEM_LAYOUT}
                    className={cn(LIST_ITEM, 'data-selected:font-medium')}
                  >
                    {item(
                      option,
                      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>,
                      SelectPrimitive.ItemIndicator
                    )}
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.List>
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  }

  return (
    <ComboboxPrimitive.Root
      items={options as SelectOption[]}
      value={selected}
      onValueChange={(next) => change((next as SelectOption | null)?.value ?? null)}
      itemToStringLabel={(option: SelectOption) => option.label}
      itemToStringValue={(option: SelectOption) => option.value}
      isItemEqualToValue={(a: SelectOption, b: SelectOption) => a.value === b.value}
      filter={(option: SelectOption, query: string) => matchesSearch(option.label, query)}
      autoHighlight
      open={open}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
      modal={false}
      disabled={isDisabled}
      name={name}
    >
      <Stack ref={frameRef} {...frameAttributes} {...frameLayout} className={frameClasses} onMouseDown={handleFrameMouseDown}>
        <ComboboxPrimitive.Trigger
          ref={handleTriggerRef}
          {...triggerAttributes}
          render={TRIGGER_LAYOUT}
          className={TRIGGER}
          onKeyDown={handleTriggerKeyDown}
        >
          <ComboboxPrimitive.Value placeholder={placeholder}>
            {(option: SelectOption | null) => (
              <span data-slot={'select-value'} data-placeholder={option ? undefined : ''} className={VALUE}>
                {option ? option.label : placeholder}
              </span>
            )}
          </ComboboxPrimitive.Value>
        </ComboboxPrimitive.Trigger>

        <ListFieldEnd loading={loading} spinner={spinner}>{clearButton}</ListFieldEnd>
      </Stack>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner anchor={frameRef} sideOffset={LIST_SIDE_OFFSET} className={LIST_POSITIONER}>
          <ComboboxPrimitive.Popup ref={popupRef} data-slot={'select-panel'} render={LIST_PANEL_LAYOUT} className={LIST_PANEL}>
            <Stack data-slot={'select-search'} direction={'horizontal'} align={'center'} gap={2} className={LIST_SEARCH}>
              <SearchGlyph />
              <ComboboxPrimitive.Input data-slot={'select-search-input'} placeholder={labels.search} className={LIST_SEARCH_INPUT} />
            </Stack>

            <ComboboxPrimitive.Empty data-slot={'select-empty'} className={cn(LIST_MESSAGE, 'empty:hidden')}>
              {labels.noResults}
            </ComboboxPrimitive.Empty>

            <ComboboxPrimitive.List className={LIST_ITEMS}>
              {(option: SelectOption) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option}
                  disabled={option.disabled}
                  data-slot={'select-item'}
                  data-option-value={option.value}
                  render={LIST_ITEM_LAYOUT}
                  className={cn(LIST_ITEM, 'data-selected:font-medium')}
                >
                  {item(option, option.label, ComboboxPrimitive.ItemIndicator)}
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );

});

Select.displayName = 'Select';
