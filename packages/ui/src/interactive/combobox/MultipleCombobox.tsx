'use client';

import * as React from 'react';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';

import { useDelayedBusy, useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Spinner } from '../../components/Spinner';

import { VisuallyHidden } from '../../components/VisuallyHidden';

import { Button } from '../button/Button';
import { CheckGlyph } from '../choice/choice';
import { useFieldControl, useNonNativeFieldLabel } from '../field/fieldContext';
import {
  LIST_FOOTER,
  LIST_ITEM,
  LIST_ITEMS,
  LIST_MESSAGE,
  LIST_OPTION_BOX,
  LIST_PANEL,
  LIST_POSITIONER,
  LIST_RETRY,
  LIST_SEARCH,
  LIST_SEARCH_INPUT,
  LIST_SIDE_OFFSET,
  ListChips,
  ListFieldEnd,
  remoteListMessages,
  toggleFromFrame
} from '../list-panel/listPanel';
import { TEXT_CONTROL_FRAME, TEXT_CONTROL_SIZES, textControlState } from '../text-control/textControl';
import { SearchGlyph } from '../text-input/glyphs';

import type { ComboboxItem, MultipleComboboxProps } from './comboboxTypes';


/* --------
 * Component Definition
 * -------- */

/**
 * The combobox with several values: the closed field of the MultiSelect (chips, "+N", the arrow),
 * and a panel with the search at its top, the values already chosen first and ticked, then the
 * results with their boxes. The footer has only "Clear": "Select all" would pick the first fifty found.
 *
 * The text searched stays after a tick and is reset when the list closes. Backspace in the search does
 * not remove chips: a value goes with its x or from the list.
 */
export const MultipleCombobox = React.forwardRef<HTMLButtonElement, MultipleComboboxProps>((props, forwardedRef) => {

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
    maxChips = 3,
    minChars = 2,
    multiple: _multiple,
    name,
    onInputValueChange,
    onRetry,
    onValueChange,
    readOnly = false,
    required = false,
    searchError = false,
    searching = false,
    selectedItems,
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

  useNonNativeFieldLabel();

  const frameRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const handleTriggerRef = useForkRef(triggerRef, forwardedRef);
  const summaryId = React.useId();


  // ----
  // Internal State
  // ----
  const [ open, setOpen ] = React.useState(false);
  const [ query, setQuery ] = React.useState('');

  const chosen = value === undefined
    ? selectedItems
    : value.map((key) => selectedItems.find((item) => item.value === key) ?? { value: key, label: key });


  // ----
  // Handlers
  // ----
  const change = (next: readonly ComboboxItem[]): void => {
    onValueChange?.(next.map((item) => item.value), [ ...next ]);
  };

  const search = (text: string): void => {
    setQuery(text);
    onInputValueChange?.(text);
  };

  const handleOpenChange = (next: boolean): void => {
    if (next && (readOnly || disabled || field.disabled)) {
      return;
    }

    if (!next) {
      search('');
    }

    setOpen(next);
  };

  const handleFrameMouseDown = (event: React.MouseEvent<HTMLDivElement>): void => {
    toggleFromFrame(event, '[data-slot=combobox-trigger], [data-slot=combobox-chip-remove]', triggerRef.current, open, handleOpenChange);
  };


  // ----
  // Component Render
  // ----
  const isDisabled = disabled || field.disabled;
  const isInvalid = invalid || field.invalid;
  const inert = readOnly || isDisabled;
  const term = query.trim();
  const underMin = term.length < minChars;

  /* The values first, ticked; then the results that are not already among them */
  let listItems: ComboboxItem[] = [ ...chosen ];

  if (!underMin) {
    listItems = searchError && !searching
      ? [ LIST_RETRY ]
      : [ ...chosen, ...items.filter((item) => !chosen.some((picked) => picked.value === item.value)) ];
  }

  const { message, status } = remoteListMessages({
    term,
    underMin,
    searching,
    busyVisible: showBusy,
    failed     : searchError && !searching,
    count      : items.length,
    empty      : items.length === 0,
    hasMore
  }, labels);

  const chips = (
    <ListChips
      slot={'combobox'}
      items={chosen}
      maxChips={maxChips}
      readOnly={readOnly}
      inert={inert}
      placeholder={labels.placeholder}
      labels={labels}
      onRemove={(item) => change(chosen.filter((picked) => picked.value !== item.value))}
    />
  );

  const frameAttributes = {
    'data-slot': 'combobox',
    'data-size': size,
    'data-multiple': '',
    ...textControlState({ invalid: isInvalid, readOnly, disabled: isDisabled })
  };

  const frameClasses = cn(
    TEXT_CONTROL_FRAME,
    TEXT_CONTROL_SIZES[size],
    'group/list-field relative flex w-full min-w-60 items-center',
    readOnly && 'h-auto min-h-control-md',
    '[&_svg]:shrink-0 [&_svg]:text-muted-foreground',
    baseClasses,
    className
  );

  const summary = <VisuallyHidden id={summaryId}>{chosen.map((item) => item.label).join(', ')}</VisuallyHidden>;

  if (readOnly) {
    return (
      <div {...frameAttributes} className={frameClasses}>
        <input
          id={rest.id}
          aria-label={rest['aria-label']}
          aria-labelledby={rest['aria-labelledby']}
          readOnly
          value={chosen.map((item) => item.label).join(', ')}
          className={'sr-only'}
          data-field-control={''}
        />
        {chips}
        {name && chosen.map((item) => <input key={item.value} type={'hidden'} name={name} value={item.value} />)}
      </div>
    );
  }

  return (
    <ComboboxPrimitive.Root
      multiple
      items={listItems}
      filter={null}
      value={[ ...chosen ]}
      onValueChange={(next, details) => {
        const picked = next as ComboboxItem[];

        if (picked.includes(LIST_RETRY)) {
          details.cancel();
          onRetry?.();
          return;
        }

        change(picked);
      }}
      inputValue={query}
      onInputValueChange={(next, details) => {
        /* Only typing changes the search: a tick does not clear it */
        if (details.reason === 'input-change') {
          search(next);
        }
      }}
      itemToStringLabel={(item: ComboboxItem) => item.label}
      itemToStringValue={(item: ComboboxItem) => item.value}
      isItemEqualToValue={(a: ComboboxItem, b: ComboboxItem) => a.value === b.value}
      autoHighlight
      open={open}
      onOpenChange={handleOpenChange}
      modal={false}
      disabled={isDisabled}
      name={name}
    >
      <div ref={frameRef} {...frameAttributes} className={frameClasses} onMouseDown={handleFrameMouseDown}>
        <ComboboxPrimitive.Trigger
          {...rest}
          ref={handleTriggerRef}
          aria-describedby={[ summaryId, rest['aria-describedby'] ].filter(Boolean).join(' ')}
          aria-required={required || field.required || undefined}
          aria-invalid={isInvalid || undefined}
          data-slot={'combobox-trigger'}
          data-field-control={''}
          className={'absolute inset-0 cursor-default rounded-md outline-none'}
        >
          {summary}
        </ComboboxPrimitive.Trigger>
        {chips}
        <ListFieldEnd
          loading={false}
          spinner={null}
          className={'pointer-events-none relative z-10'}
        />
      </div>

      <ComboboxPrimitive.Status className={'sr-only'}>{status}</ComboboxPrimitive.Status>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner anchor={frameRef} sideOffset={LIST_SIDE_OFFSET} className={LIST_POSITIONER}>
          <ComboboxPrimitive.Popup data-slot={'combobox-panel'} className={cn(LIST_PANEL, 'min-w-80')}>
            <div data-slot={'combobox-search'} className={LIST_SEARCH}>
              <SearchGlyph />
              <ComboboxPrimitive.Input
                placeholder={labels.placeholder}
                className={LIST_SEARCH_INPUT}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement> & { preventBaseUIHandler?: () => void }) => {
                  /* Backspace in an empty search does not remove a chip */
                  if (event.key === 'Backspace' && query === '') {
                    event.preventBaseUIHandler?.();
                  }
                }}
              />
              {showBusy && <Spinner size={'sm'} className={'size-3.5'} />}
            </div>

            {message && <div data-slot={'combobox-message'} className={cn(LIST_MESSAGE, 'text-xs')}>{message}</div>}

            <ComboboxPrimitive.List aria-busy={searching || undefined} className={cn(LIST_ITEMS, 'empty:hidden')}>
              {(item: ComboboxItem) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  disabled={item.disabled}
                  data-slot={'combobox-item'}
                  className={cn(LIST_ITEM, 'group/option', item.code || item.description ? 'min-h-12' : '')}
                >
                  {item === LIST_RETRY
                    ? <span data-slot={'combobox-retry'} className={'min-w-0 flex-1'}>{labels.retry}</span>
                    : (
                      <React.Fragment>
                        <span data-slot={'combobox-item-box'} className={LIST_OPTION_BOX} aria-hidden={'true'}><CheckGlyph /></span>
                        <span data-slot={'combobox-item-text'} className={'flex min-w-0 flex-1 flex-col'}>
                          <span data-slot={'combobox-item-label'}>{item.label}</span>
                          {(item.code || item.description) && (
                            <span className={'text-xs text-muted-foreground'}>
                              {[ item.code, item.description ].filter(Boolean).join(' · ')}
                            </span>
                          )}
                        </span>
                      </React.Fragment>
                    )}
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>

            {!underMin && hasMore && !searching && !searchError && (
              <div data-slot={'combobox-too-many'} className={cn(LIST_MESSAGE, 'text-xs')}>{labels.tooMany(items.length)}</div>
            )}

            <div data-slot={'combobox-footer'} className={LIST_FOOTER}>
              <span />
              <Button size={'sm'} fill={'plain'} tone={'primary'} disabled={chosen.length === 0} onClick={() => change([])}>
                {labels.clearAll}
              </Button>
            </div>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );

});

MultipleCombobox.displayName = 'MultipleCombobox';
