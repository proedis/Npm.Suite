'use client';

import * as React from 'react';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { Input } from '@base-ui/react/input';

import { useDelayedBusy, useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { Spinner } from '../../primitives/Spinner';


import { CheckGlyph, ClearGlyph, SearchGlyph } from '../../internal/glyphs';

import { IconButton } from '../../actions/button/IconButton';
import {
  ChevronGlyph,
  LIST_ITEM,
  LIST_ITEMS,
  LIST_MESSAGE,
  LIST_PANEL,
  LIST_POSITIONER,
  LIST_SIDE_OFFSET
} from '../../actions/list-panel/listPanel';

import { useFieldControl } from '../field/fieldContext';
import { LIST_ITEM_LAYOUT, LIST_PANEL_LAYOUT, LIST_RETRY, remoteListMessages } from '../list-field/listField';
import { TEXT_CONTROL_FRAME, TEXT_CONTROL_GAP, TEXT_CONTROL_SIZES, TEXT_CONTROL_TEXT, textControlState } from '../text-control/textControl';

import { MultipleCombobox } from './MultipleCombobox';

import type { ComboboxItem, ComboboxProps, SingleComboboxProps } from './comboboxTypes';


/* --------
 * Constants Definition
 * -------- */

const CODE = 'shrink-0 text-muted-foreground tabular-nums';


/* --------
 * Helpers
 * -------- */

function restText(item: ComboboxItem | null): string {
  return item?.label ?? '';
}

function focusText(item: ComboboxItem | null): string {
  if (!item) {
    return '';
  }

  return item.code ? `${item.label} · ${item.code}` : item.label;
}

function sameText(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
}


/* --------
 * Component Definition
 * -------- */

/**
 * The Select for lists that do not load whole: registries, estates, contracts. The text is typed in
 * the field, the results arrive from the server, the value is always a record and never a text.
 *
 * ```tsx
 * const search = useSearchQuery({ term, queryKey, queryFn });   // @proedis/react-query
 *
 * <Combobox
 *   value={contractId}
 *   selectedItem={contract}
 *   onValueChange={(id, item) => setContract(item)}
 *   items={search.items}
 *   onInputValueChange={setTerm}
 *   searching={search.isPending}
 *   resultsFor={search.settledTerm}
 *   onFlush={search.flush}
 *   searchError={search.status === 'error'}
 *   onRetry={search.retry}
 *   hasMore={search.hasMore}
 *   labels={comboboxLabels}
 * />
 * ```
 *
 * On Base UI's `Combobox`, with the two defaults that lose a record turned off: emptying the text
 * does not empty the value on the spot, and Esc on a closed list does not clear it. Instead, from the
 * guide:
 *
 * - leaving without choosing gives the value back; an emptied text empties an optional field only on
 *   leaving, and never a required one;
 * - the first Esc closes the list, the second restores the text when it differs from the value and
 *   stops there, otherwise it goes on to the container (a dialog closes);
 * - while typing with a value, a line recalls what stays when leaving;
 * - the spinner and "searching" appear only past 300ms; results announce themselves on arrival;
 * - Enter during a search waits for the answer, and picks on its own only an exact code: a barcode
 *   scanner that ends with Enter gets the right record;
 * - after an error the only item is "Retry", already active.
 *
 * Slots: `combobox` (the frame, with `data-size` and the states), `combobox-input`, `combobox-code`,
 * `combobox-end`, `combobox-clear`, `combobox-chevron`, `combobox-panel`, `combobox-item`, `combobox-item-text`,
 * `combobox-message`, `combobox-current`, `combobox-too-many`, `combobox-status`. With `multiple`, also
 * `combobox-trigger`, `combobox-chips`, `combobox-chip`, `combobox-chip-remove`, `combobox-more`,
 * `combobox-search`, `combobox-item-box`, `combobox-item-text`, `combobox-item-label`, `combobox-retry`
 * and `combobox-footer`, the footer of actions.
 */
const SingleCombobox = React.forwardRef<HTMLInputElement, SingleComboboxProps>((props, forwardedRef) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    disabled = false,
    hasMore = false,
    invalid = false,
    items,
    labels,
    minChars = 2,
    multiple: _multiple,
    name,
    onFlush,
    onInputValueChange,
    onRetry,
    onValueChange,
    readOnly = false,
    required = false,
    resultsFor,
    searchError = false,
    searching = false,
    selectedItem = null,
    size = 'md',
    value,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();
  const showBusy = useDelayedBusy(searching).visible;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleInputRef = useForkRef(inputRef, forwardedRef);
  const pendingEnterRef = React.useRef(false);


  // ----
  // Internal State
  // ----
  /** Neither `value` nor `selectedItem`: the field keeps its own choice, or leaving it would forget it */
  const uncontrolled = value === undefined && props.selectedItem === undefined;
  const [ ownItem, setOwnItem ] = React.useState<ComboboxItem | null>(null);

  const selected = uncontrolled
    ? ownItem
    : value === undefined
      ? selectedItem
      : value === null ? null : selectedItem?.value === value ? selectedItem : { value, label: value };

  const [ text, setText ] = React.useState(restText(selected));
  const [ open, setOpen ] = React.useState(false);
  const [ focused, setFocused ] = React.useState(false);

  /**
   * The texts the field last showed for its value. When the value changes from outside (a reset, the
   * record of the value arriving after it) and the field still shows one of them, it shows the new
   * one, adjusted while rendering. Text being typed is left alone.
   */
  const [ shownFor, setShownFor ] = React.useState({ rest: restText(selected), focus: focusText(selected) });

  if (shownFor.rest !== restText(selected) || shownFor.focus !== focusText(selected)) {
    setShownFor({ rest: restText(selected), focus: focusText(selected) });

    if (sameText(text, shownFor.rest) || sameText(text, shownFor.focus)) {
      setText(focused ? focusText(selected) : restText(selected));
    }
  }

  const editing = !sameText(text, restText(selected)) && !sameText(text, focusText(selected));
  const term = editing ? text.trim() : '';
  const underMin = term.length < minChars;


  // ----
  // Handlers
  // ----
  const choose = (item: ComboboxItem | null): void => {
    if (uncontrolled) {
      setOwnItem(item);
    }

    onValueChange?.(item?.value ?? null, item);
    setText(focused ? focusText(item) : restText(item));
    onInputValueChange?.('');
    setOpen(false);

    /* Still in the field: the next keystroke replaces the choice, as on focus */
    if (focused) {
      window.setTimeout(() => inputRef.current?.select(), 0);
    }
  };

  const typed = (next: string): void => {
    setText(next);
    onInputValueChange?.(next);
  };

  /** Leaving without choosing: the value comes back, or an emptied optional field empties */
  const handleBlur = (): void => {
    setFocused(false);
    pendingEnterRef.current = false;

    if (text.trim() === '' && selected && !required && !field.required) {
      choose(null);
      return;
    }

    setText(restText(selected));
    onInputValueChange?.('');
  };

  const handleFocus = (): void => {
    setFocused(true);

    if (!editing) {
      setText(focusText(selected));
      window.setTimeout(() => inputRef.current?.select(), 0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement> & { preventBaseUIHandler?: () => void }): void => {
    if (event.key === 'Escape' && !open) {
      /* Base UI would clear the text and the value here */
      event.preventBaseUIHandler?.();

      if (editing) {
        event.preventDefault();
        event.stopPropagation();
        setText(focusText(selected));
        onInputValueChange?.('');
      }

      return;
    }

    if (event.key === 'Enter' && searching) {
      /* A scanner sends Enter before the debounce: wait for the answer, then pick an exact code only */
      event.preventBaseUIHandler?.();
      event.preventDefault();
      pendingEnterRef.current = true;
      onFlush?.();
    }
  };


  // ----
  // Lifecycle Events
  // ----
  /* The answer to the term Enter was pressed on has arrived: pick an exact code, or leave the list open */
  React.useEffect(() => {
    if (!pendingEnterRef.current || searching || resultsFor === undefined || !sameText(resultsFor, term)) {
      return undefined;
    }

    pendingEnterRef.current = false;

    const exact = items.find((item) => item.code !== undefined && sameText(item.code, term));

    if (!exact) {
      return undefined;
    }

    const timer = window.setTimeout(() => choose(exact), 0);

    return () => window.clearTimeout(timer);
  });


  // ----
  // Component Render
  // ----
  const isDisabled = disabled || field.disabled;
  const isInvalid = invalid || field.invalid;
  const isRequired = required || field.required;

  /* Opened without typing: only the value, ticked. With an error: only "Retry" */
  let listItems: readonly ComboboxItem[] = [];

  if (editing && !underMin) {
    listItems = searchError && !searching ? [ LIST_RETRY ] : items.filter((item) => item.value !== selected?.value);
  }
  else if (!editing && selected) {
    listItems = [ selected ];
  }

  /* Opened without typing, the list holds the value or nothing: no answer to speak of */
  const { message, status } = editing
    ? remoteListMessages({
      term,
      underMin,
      searching,
      busyVisible: showBusy,
      failed     : searchError && !searching,
      count      : items.length,
      empty      : listItems.length === 0,
      hasMore
    }, labels)
    : { message: selected ? null : labels.minChars, status: '' };

  /** The frame is a row: the glass, the text, the code, then the end */
  const frameLayout = { direction: 'horizontal', align: 'center', gap: TEXT_CONTROL_GAP[size] } as const;

  const frameAttributes = {
    'data-slot': 'combobox',
    'data-size': size,
    ...textControlState({ invalid: isInvalid, readOnly, disabled: isDisabled })
  };

  const frameClasses = cn(
    TEXT_CONTROL_FRAME,
    TEXT_CONTROL_SIZES[size],
    'group/list-field w-full min-w-0 cursor-text',
    '[&_svg]:shrink-0 [&_svg]:text-muted-foreground',
    baseClasses,
    className
  );

  if (readOnly) {
    return (
      <Stack {...frameAttributes} {...frameLayout} className={frameClasses}>
        <Input
          {...rest}
          readOnly
          value={restText(selected)}
          data-slot={'combobox-input'}
          data-field-control={''}
          className={cn('h-full min-w-0 flex-1 truncate bg-transparent outline-none', TEXT_CONTROL_TEXT)}
        />
        {selected?.code && <span data-slot={'combobox-code'} className={CODE}>{selected.code}</span>}
        {name && <input type={'hidden'} name={name} value={selected?.value ?? ''} />}
      </Stack>
    );
  }

  /* With text typed the x empties the text; on a closed optional field it empties the value */
  let clearKind: 'search' | 'value' | null = null;

  if (!isDisabled && editing && text !== '') {
    clearKind = 'search';
  }
  else if (!isDisabled && !isRequired && selected && !open) {
    clearKind = 'value';
  }

  const handleClear = (): void => {
    if (clearKind === 'search') {
      typed('');
    }
    else {
      choose(null);
    }

    inputRef.current?.focus();
  };

  return (
    <ComboboxPrimitive.Root
      items={listItems as ComboboxItem[]}
      filter={null}
      value={selected}
      onValueChange={(next, details) => {
        /* Emptying the text must not empty the value on the spot: leaving decides */
        if (details.reason === 'input-clear') {
          details.cancel();
          return;
        }

        if (next === LIST_RETRY) {
          details.cancel();
          onRetry?.();
          return;
        }

        choose(next as ComboboxItem | null);
      }}
      inputValue={text}
      onInputValueChange={(next, details) => {
        if (details.reason === 'input-change') {
          typed(next);
        }
      }}
      itemToStringLabel={(item: ComboboxItem) => item.label}
      itemToStringValue={(item: ComboboxItem) => item.value}
      isItemEqualToValue={(a: ComboboxItem, b: ComboboxItem) => a.value === b.value}
      autoHighlight
      open={open}
      onOpenChange={(next) => setOpen(next)}
      modal={false}
      disabled={isDisabled}
      name={name}
    >
      <Stack ref={frameRef} {...frameAttributes} {...frameLayout} className={frameClasses}>
        <SearchGlyph />

        <ComboboxPrimitive.Input
          {...rest}
          ref={handleInputRef}
          aria-required={isRequired || undefined}
          aria-invalid={isInvalid || undefined}
          placeholder={labels.placeholder}
          data-slot={'combobox-input'}
          data-field-control={''}
          onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
            rest.onFocus?.(event);
            handleFocus();
          }}
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            rest.onBlur?.(event);
            handleBlur();
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement> & { preventBaseUIHandler?: () => void }) => {
            rest.onKeyDown?.(event);
            handleKeyDown(event);
          }}
          className={cn('h-full min-w-0 flex-1 truncate bg-transparent outline-none', TEXT_CONTROL_TEXT)}
        />

        {!focused && selected?.code && <span data-slot={'combobox-code'} className={CODE}>{selected.code}</span>}

        <Stack as={'span'} data-slot={'combobox-end'} direction={'horizontal'} align={'center'} gap={1} className={'shrink-0'}>
          {clearKind && (
            <IconButton
              label={clearKind === 'search' ? labels.clearSearch : labels.clear}
              icon={<ClearGlyph />}
              tabIndex={-1}
              size={size === 'sm' ? 'sm' : 'md'}
              data-slot={'combobox-clear'}
              className={'size-6 rounded-sm'}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClear}
            />
          )}

          {showBusy
            ? <Spinner size={'sm'} className={size === 'sm' ? 'size-3.5' : undefined} />
            : (
              <ComboboxPrimitive.Trigger
                data-slot={'combobox-chevron'}
                tabIndex={-1}
                aria-hidden={'true'}
                render={<Stack as={'button'} direction={'horizontal'} align={'center'} />}
                className={'outline-none'}
              >
                <ChevronGlyph />
              </ComboboxPrimitive.Trigger>
            )}
        </Stack>
      </Stack>

      <ComboboxPrimitive.Status data-slot={'combobox-status'} className={'sr-only'}>{status}</ComboboxPrimitive.Status>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner anchor={frameRef} sideOffset={LIST_SIDE_OFFSET} className={LIST_POSITIONER}>
          <ComboboxPrimitive.Popup data-slot={'combobox-panel'} render={LIST_PANEL_LAYOUT} className={cn(LIST_PANEL, 'min-w-80')}>
            {editing && selected && (
              <div data-slot={'combobox-current'} className={cn(LIST_MESSAGE, 'text-xs')}>{labels.current(focusText(selected))}</div>
            )}

            {message && <div data-slot={'combobox-message'} className={cn(LIST_MESSAGE, 'text-xs')}>{message}</div>}

            <ComboboxPrimitive.List aria-busy={searching || undefined} className={cn(LIST_ITEMS, 'empty:hidden')}>
              {(item: ComboboxItem) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  disabled={item.disabled}
                  data-slot={'combobox-item'}
                  render={LIST_ITEM_LAYOUT}
                  className={cn(LIST_ITEM, 'data-selected:font-medium', item.code || item.description ? 'min-h-12' : '')}
                >
                  {item === LIST_RETRY
                    ? <span className={'min-w-0 flex-1'}>{labels.retry}</span>
                    : (
                      <Stack as={'span'} data-slot={'combobox-item-text'} className={'min-w-0 flex-1'}>
                        <span>{item.label}</span>
                        {(item.code || item.description) && (
                          <span className={'text-xs text-muted-foreground'}>
                            {item.code && <span className={'tabular-nums'}>{item.code}</span>}
                            {item.code && item.description && (
                              <React.Fragment>
                                <span aria-hidden={'true'}>{' · '}</span>
                                <span className={'sr-only'}>{', '}</span>
                              </React.Fragment>
                            )}
                            {item.description}
                          </span>
                        )}
                      </Stack>
                    )}
                  <ComboboxPrimitive.ItemIndicator className={'ms-auto mt-0.5 shrink-0 [&_svg]:size-4 [&_svg]:text-primary'}>
                    <CheckGlyph />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>

            {editing && hasMore && !searching && !searchError && (
              <div data-slot={'combobox-too-many'} className={cn(LIST_MESSAGE, 'mt-1 border-t border-border text-xs')}>
                {labels.tooMany(items.length)}
              </div>
            )}
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );

});

SingleCombobox.displayName = 'SingleCombobox';


/**
 * The choice of a record, or of several with `multiple`, among results that arrive from the server.
 * See the two variants above and in `MultipleCombobox`.
 */
/** The ref is the element that takes the focus: the text of the single field, the button of the multiple one */
export const Combobox = React.forwardRef<HTMLElement, ComboboxProps>((props, ref) => (
  props.multiple
    ? <MultipleCombobox {...props} ref={ref as React.Ref<HTMLButtonElement>} />
    : <SingleCombobox {...props} ref={ref as React.Ref<HTMLInputElement>} />
));

Combobox.displayName = 'Combobox';
