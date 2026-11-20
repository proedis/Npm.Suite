'use client';

import * as React from 'react';

import { VisuallyHidden } from '../../components/VisuallyHidden';
import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { IconButton } from '../button/IconButton';
import { useFieldControl, useNonNativeFieldLabel } from '../field/fieldContext';
import { TEXT_CONTROL_FRAME, TEXT_CONTROL_SIZES, textControlState } from '../text-control/textControl';
import { ClearGlyph } from '../text-input/glyphs';
import { Tooltip } from '../tooltip/Tooltip';

import type { BaseProps } from '../../core/base';
import type { TextControlSize } from '../text-control/textControl';

import type { ModalSelectorRowLabel } from './modalSelectorTypes';


/* --------
 * Types Definition
 * -------- */

export interface ModalSelectorFieldLabels {
  /** An invitation, "Choose a contract" */
  readonly placeholder?: string;

  /** Name and tooltip of the x of an optional field: "Clear Contract" */
  readonly clear: string;

  /** The name of "+N" with several values: "3 more contracts" */
  readonly more?: (count: number) => string;
}

export interface StrictModalSelectorFieldProps<TData> extends BaseProps {
  /** The row of the value, or the rows with several values */
  value: TData | null | readonly TData[];

  getRowLabel: (row: TData) => ModalSelectorRowLabel;

  /**
   * Open the selector. `text` is the letter typed on the field, to start its search with; empty from
   * Enter, Space, ↓ or a click
   */
  onOpen: (text: string) => void;

  /** The x of an optional field: empties the value without opening */
  onClear?: () => void;

  /** Defaults to `md` */
  size?: TextControlSize;

  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  invalid?: boolean;

  /** The button, for the focus to come back to when the selector closes */
  buttonRef?: React.Ref<HTMLButtonElement>;

  labels: ModalSelectorFieldLabels;

  /** Classes for the frame, last so they win */
  className?: string;
}

/**
 * The frame takes `className` and the shared props; the native props reach the button that opens the
 * selector, the element that takes the focus: `id`, `aria-*`, `onBlur` for a form library.
 */
export type ModalSelectorFieldProps<TData> = StrictModalSelectorFieldProps<TData> & Omit<
  React.ComponentProps<'button'>,
  keyof StrictModalSelectorFieldProps<TData> | 'ref' | 'children' | 'type' | 'value'
>;


/* --------
 * Constants Definition
 * -------- */

const MAX_CHIPS = 3;

const CHIP = 'inline-flex h-5 max-w-30 shrink-0 items-center truncate rounded-sm bg-secondary px-1.5 text-xs font-medium text-secondary-foreground';


/* --------
 * Glyphs
 * -------- */

/** Lucide `list`: it says a dialog opens, not a list under the field */
function ListGlyph(): React.ReactNode {
  return (
    <svg viewBox={'0 0 24 24'} fill={'none'} stroke={'currentColor'} strokeWidth={2} strokeLinecap={'round'} strokeLinejoin={'round'} aria-hidden={'true'} focusable={'false'}>
      <path d={'M3 6h.01M3 12h.01M3 18h.01M8 6h13M8 12h13M8 18h13'} />
    </svg>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * The field that opens a ModalSelector: the shape and the states of the Combobox, with a list icon in
 * place of the arrow. The value reads as its name, then its code in `muted-foreground`; the name is
 * the part that is cut. With several values, the chips of the MultiSelect.
 *
 * ```tsx
 * <Field>
 *   <Field.Label>Contract</Field.Label>
 *   <ModalSelectorField
 *     value={contract} getRowLabel={contractLabel} buttonRef={fieldRef}
 *     onOpen={(text) => { setTerm(text); setOpen(true); }} onClear={() => setContract(null)}
 *     labels={{ placeholder: t('…CHOOSE_CONTRACT'), clear: t('…CLEAR_CONTRACT') }}
 *   />
 *   <ModalSelector returnFocus={fieldRef} … />
 * </Field>
 * ```
 *
 * A button with `aria-haspopup="dialog"`: its name comes from the label of the Field, its value from
 * `aria-describedby`. Enter, Space, ↓ and Alt ↓ open; a letter opens with that letter in the search.
 * The x of an optional field is not a Tab stop.
 *
 * Slots: `modal-selector-field` (the frame, with `data-size` and the states), `modal-selector-field-button`,
 * `modal-selector-field-placeholder`, `modal-selector-field-value`, `modal-selector-field-code`,
 * `modal-selector-field-chip`, `modal-selector-field-more`, `modal-selector-field-clear`.
 */
export function ModalSelectorField<TData>(props: ModalSelectorFieldProps<TData>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    buttonRef,
    className,
    disabled = false,
    getRowLabel,
    invalid = false,
    labels,
    onClear,
    onOpen,
    readOnly = false,
    required = false,
    size = 'md',
    value,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();
  const summaryId = React.useId();

  useNonNativeFieldLabel();


  // ----
  // Handlers
  // ----
  const isDisabled = disabled || field.disabled;
  const isRequired = required || field.required;
  const inert = readOnly || isDisabled;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (inert) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      onOpen('');
      return;
    }

    /* A letter opens with that letter already in the search */
    if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      onOpen(event.key);
    }
  };


  // ----
  // Component Render
  // ----
  const rows: readonly TData[] = Array.isArray(value) ? value : (value === null ? [] : [ value as TData ]);
  const multiple = Array.isArray(value);
  const named = rows.map(getRowLabel);
  const hidden = named.slice(MAX_CHIPS);

  let content: React.ReactNode;

  if (named.length === 0) {
    content = labels.placeholder
      ? <span data-slot={'modal-selector-field-placeholder'} className={'truncate text-placeholder'}>{labels.placeholder}</span>
      : null;
  }
  else if (!multiple) {
    content = (
      <span className={'flex min-w-0 items-baseline gap-1.5'}>
        <span data-slot={'modal-selector-field-value'} className={'min-w-0 truncate'}>{named[0]!.label}</span>
        {named[0]!.code && <span data-slot={'modal-selector-field-code'} className={'shrink-0 text-muted-foreground tabular-nums'}>{named[0]!.code}</span>}
      </span>
    );
  }
  else {
    content = (
      <span className={'flex min-w-0 items-center gap-1.5 overflow-hidden'}>
        {named.slice(0, MAX_CHIPS).map((item, index) => <span key={`${item.label}-${index}`} data-slot={'modal-selector-field-chip'} className={CHIP}>{item.label}</span>)}
        {hidden.length > 0 && (
          <Tooltip content={<span className={'flex flex-col'}>{hidden.slice(0, 10).map((item, index) => <span key={`${item.label}-${index}`}>{item.label}</span>)}</span>}>
            <span data-slot={'modal-selector-field-more'} className={cn(CHIP, 'pointer-events-auto')}>
              <span aria-hidden={labels.more ? 'true' : undefined}>{`+${hidden.length}`}</span>
              {labels.more && <VisuallyHidden>{labels.more(hidden.length)}</VisuallyHidden>}
            </span>
          </Tooltip>
        )}
      </span>
    );
  }

  const summary = named.map((item) => (item.code ? `${item.label} ${item.code}` : item.label)).join(', ');
  const canClear = !isRequired && !inert && named.length > 0 && onClear !== undefined;

  return (
    <div
      data-slot={'modal-selector-field'}
      data-size={size}
      {...textControlState({ invalid: invalid || field.invalid, readOnly, disabled: isDisabled })}
      className={cn(
        TEXT_CONTROL_FRAME,
        TEXT_CONTROL_SIZES[size],
        'relative flex w-full min-w-60 items-center',
        '[&_svg]:shrink-0 [&_svg]:text-muted-foreground',
        baseClasses,
        className
      )}
    >
      <button
        {...rest}
        ref={buttonRef}
        type={'button'}
        disabled={isDisabled}
        aria-haspopup={'dialog'}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : field.labelId}
        aria-describedby={[ summaryId, ariaDescribedBy ].filter(Boolean).join(' ')}
        aria-required={isRequired || undefined}
        aria-invalid={invalid || field.invalid || undefined}
        aria-readonly={readOnly || undefined}
        data-slot={'modal-selector-field-button'}
        data-field-control={''}
        className={'absolute inset-0 cursor-default rounded-md outline-none disabled:cursor-not-allowed'}
        onClick={(event) => {
          rest.onClick?.(event);

          if (!inert && !event.defaultPrevented) {
            onOpen('');
          }
        }}
        onKeyDown={(event) => {
          rest.onKeyDown?.(event);
          handleKeyDown(event);
        }}
      >
        <VisuallyHidden id={summaryId}>{summary}</VisuallyHidden>
      </button>

      <span className={'pointer-events-none relative z-10 flex min-w-0 flex-1 items-center'}>{content}</span>

      <span className={'relative z-10 flex shrink-0 items-center gap-1'}>
        {canClear && (
          <IconButton
            label={labels.clear}
            icon={<ClearGlyph />}
            tabIndex={-1}
            size={'sm'}
            data-slot={'modal-selector-field-clear'}
            className={'size-5 rounded-sm [&_svg]:size-3.5'}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
          />
        )}
        <span className={'pointer-events-none inline-flex'}><ListGlyph /></span>
      </span>
    </div>
  );

}

ModalSelectorField.displayName = 'ModalSelectorField';
