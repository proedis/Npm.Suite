'use client';

import * as React from 'react';

import { Input } from '@base-ui/react/input';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import dayjs from 'dayjs';

import { useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { ClearGlyph } from '../../internal/glyphs';

import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';
import { LIST_POSITIONER, LIST_SIDE_OFFSET } from '../../actions/list-panel/listPanel';

import { Calendar } from '../calendar/Calendar';
import { dateOrderOf, maskDate, maskRange, RANGE_SEPARATOR, readDate, readPastedDates, readRange, writeDate, writeRange } from '../calendar/dateText';
import { useFieldControl, useNonNativeFieldLabel } from '../field/fieldContext';
import { FieldShell } from '../field-shell/FieldShell';
import { TEXT_CONTROL_TEXT } from '../text-control/textControl';

import type { BaseProps } from '../../core/base';
import type { ControlSize } from '../../core/control';

import type { CalendarLabels, CalendarRange, DayMeta } from '../calendar/Calendar';
import type { DatePart, DateReading } from '../calendar/dateText';


/*
 * The field behind DatePicker and RangeDatePicker: one implementation, which a date and a period
 * share down to the typing, the calendar and the footer. Private to the package, reached by relative
 * path: the two public components are thin, each with its own props, labels and binding, so neither
 * carries what only the other needs (Marco, 2026-11-25: a `mode` that changed half the props was hard
 * to read).
 */


/* --------
 * Types Definition
 * -------- */

export type { CalendarLabels, CalendarRange as DateRange, DayMeta };

/** The texts a date and a period share */
export interface DateFieldLabels extends CalendarLabels {
  /** The order to type in, shown in the empty field: "dd/mm/yyyy". A period shows it twice */
  readonly format: string;

  /** Name and tooltip of the calendar button, and the name of the panel */
  readonly calendar: string;

  /** Name and tooltip of the x, and the footer action that empties */
  readonly clear: string;
}

export interface DatePickerLabels extends DateFieldLabels {
  /** The footer action that picks today */
  readonly today: string;
}

export interface RangeDatePickerLabels extends DateFieldLabels {
  /** The footer while the end is missing: "From 09/11/2026 · pick the end" */
  readonly pickEnd: (from: string) => string;

  /** The footer of a whole period: "From 09/11 to 22/11/2026 · 14 days" */
  readonly rangeSummary: (from: string, to: string, days: number) => string;
}

/** Why a typed date was not taken, for the caller to write the message. `null` once it is fine */
export type DateValidity =
  | { readonly code: 'incomplete'; readonly missing: DatePart }
  | { readonly code: 'impossible' }
  | { readonly code: 'outOfRange' }
  | { readonly code: 'order' }
  | { readonly code: 'open' }
  | null;

/** What a date and a period share: everything but the value, its texts and how it is reported */
export interface CommonDateFieldProps extends BaseProps {
  /** The language of the order, the names and the first day of the week. dayjs must have it loaded */
  locale?: string;

  /** Limits, included, as `"2026-11-16"` */
  min?: string;
  max?: string;

  isDateUnavailable?: (day: string) => boolean;

  /** Holidays and days to mark: `{ muted, hint }` */
  dayMeta?: (day: string) => DayMeta | undefined;

  /** `sm` in bars and tables. Defaults to `md` */
  size?: ControlSize;

  /** No x and no "Clear" */
  required?: boolean;

  readOnly?: boolean;
  disabled?: boolean;
  invalid?: boolean;

  name?: string;

  /** Classes for the wrapper of the field, last so they win */
  className?: string;
}

/**
 * The wrapper takes `className` and the shared props; everything else an `<input>` accepts reaches the
 * text, the element that takes the focus: `id`, `aria-*`, `onBlur` for a form library. The component's
 * own handlers run after the caller's.
 */
export type DateFieldInputProps = Omit<
  React.ComponentProps<'input'>,
  keyof CommonDateFieldProps | 'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'ref' | 'children'
>;

export interface StrictDatePickerProps extends CommonDateFieldProps {
  /** `"2026-11-16"`, or `null` for empty. Never a `Date` */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;

  /** Told on leaving the field what was wrong, or `null` */
  onValidityChange?: (validity: DateValidity, field: 'date') => void;

  labels: DatePickerLabels;
}

export interface StrictRangeDatePickerProps extends CommonDateFieldProps {
  /** Two `"2026-11-16"`, each `null` while empty */
  value?: CalendarRange;
  defaultValue?: CalendarRange;
  onValueChange?: (value: CalendarRange) => void;

  /** One end may stay empty: on in the filters. Off, a period with one end is reported as `open` */
  allowOpenRange?: boolean;

  /** Told on leaving the field what was wrong, or `null`, and with which end */
  onValidityChange?: (validity: DateValidity, field: 'from' | 'to') => void;

  labels: RangeDatePickerLabels;
}

/** The private field: the props of either component, told apart by `mode` */
export type DatePickerFieldProps = (
  | (StrictDatePickerProps & { mode: 'date' })
  | (StrictRangeDatePickerProps & { mode: 'range' })
) & DateFieldInputProps;


/* --------
 * Constants Definition
 * -------- */

const EMPTY_RANGE: CalendarRange = { from: null, to: null };

/** What Tab stops on, to move past the field by hand while the calendar is open */
const TABBABLE = 'input:not([type="hidden"]), select, textarea, button, a[href], [tabindex]';

/** The input fits its text, the buttons sit beside it: a date never runs under the x */
const INPUT_WIDTH = { date: 'w-24', range: 'w-48' } as const;


/* --------
 * Glyphs
 * -------- */

function CalendarGlyph(): React.ReactNode {
  return (
    <svg
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
    >
      <rect x={3} y={4.5} width={18} height={16.5} rx={2} />
      <path d={'M3 9.5h18M8 2.5v4M16 2.5v4'} />
    </svg>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * The field of DatePicker and RangeDatePicker, see their documentation. `mode` tells the two apart and
 * never changes during the life of a field.
 */
export const DatePickerField = React.forwardRef<HTMLInputElement, DatePickerFieldProps>((props, forwardedRef) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    allowOpenRange: _allowOpenRange,
    className,
    dayMeta,
    defaultValue: _defaultValue,
    disabled = false,
    invalid = false,
    isDateUnavailable,
    labels,
    locale,
    max,
    min,
    name,
    onValidityChange: onValidityChangeProp,
    readOnly = false,
    required = false,
    mode: _mode,
    onValueChange: _onValueChange,
    size = 'md',
    value: _value,
    ...others
  } = props as DatePickerFieldProps & Partial<StrictRangeDatePickerProps>;

  const { baseClasses, rest } = splitBaseProps(others);

  /** Each component types its own ends; inside, one function takes any of them */
  const onValidityChange = onValidityChangeProp as ((validity: DateValidity, field: 'from' | 'to' | 'date') => void) | undefined;


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();
  const isRange = props.mode === 'range';

  useNonNativeFieldLabel();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleInputRef = useForkRef(inputRef, forwardedRef);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);

  /** Whether closing gives the focus back to the field: only when it was inside the calendar */
  const refocusRef = React.useRef(false);


  // ----
  // Internal State
  // ----
  const dateOrder = React.useMemo(() => dateOrderOf(locale ?? dayjs.locale()), [ locale ]);

  const [ ownDate, setOwnDate ] = React.useState<string | null>(!isRange ? props.defaultValue ?? null : null);
  const [ ownRange, setOwnRange ] = React.useState<CalendarRange>(isRange ? props.defaultValue ?? EMPTY_RANGE : EMPTY_RANGE);

  const date = !isRange ? (props.value !== undefined ? props.value : ownDate) : null;
  const range = isRange ? props.value ?? ownRange : EMPTY_RANGE;

  /** The value as the field writes it: what the text shows whenever nobody is typing */
  const written = isRange ? writeRange(range, dateOrder) : writeDate(date, dateOrder);

  const [ text, setText ] = React.useState(written);

  /**
   * The written value the text last came from, or last went to. A value that differs from it arrived
   * from outside (a reset, a record loaded after mount, a parent that normalised it) and replaces the
   * text, adjusted while rendering. A value the field itself committed matches it, so a half date
   * typed over a value and committed as `null` stays as typed, to be fixed.
   */
  const [ textSource, setTextSource ] = React.useState(written);

  if (textSource !== written) {
    setTextSource(written);
    setText(written);
  }

  const [ open, setOpen ] = React.useState(false);

  /** Opened by a click in the text, the focus stays there to type; from the button or Alt ↓ it goes to the grid */
  const [ focusGrid, setFocusGrid ] = React.useState(true);
  const [ draft, setDraft ] = React.useState<CalendarRange | null>(null);
  const [ preview, setPreview ] = React.useState<string | null>(null);

  const isDisabled = disabled || field.disabled;
  const isInvalid = invalid || field.invalid;
  const isRequired = required || field.required;
  const hasValue = isRange ? range.from !== null || range.to !== null : date !== null;
  const canClear = !isRequired && !readOnly && !isDisabled && hasValue;


  // ----
  // Handlers
  // ----
  const commitDate = (next: string | null): void => {
    if (isRange) {
      return;
    }

    if (props.value === undefined) {
      setOwnDate(next);
    }

    setTextSource(writeDate(next, dateOrder));
    props.onValueChange?.(next);
  };

  const commitRange = (next: CalendarRange): void => {
    if (!isRange) {
      return;
    }

    if (props.value === undefined) {
      setOwnRange(next);
    }

    setTextSource(writeRange(next, dateOrder));
    props.onValueChange?.(next);
  };

  const outOfLimits = (iso: string): boolean => (min !== undefined && iso < min) || (max !== undefined && iso > max);

  /** A reading turned into the value it gives and what was wrong with it */
  const judge = (reading: DateReading): { iso: string | null; validity: DateValidity } => {
    switch (reading.status) {
      case 'valid':
        return { iso: reading.iso, validity: outOfLimits(reading.iso) ? { code: 'outOfRange' } : null };
      case 'incomplete':
        return { iso: null, validity: { code: 'incomplete', missing: reading.missing } };
      case 'impossible':
        return { iso: null, validity: { code: 'impossible' } };
      default:
        return { iso: null, validity: null };
    }
  };

  /**
   * Both ends of a period, each time. Reporting only the end that was wrong left the other one's
   * previous error standing at the caller: fixing the start never cleared the error the start had.
   */
  const reportRange = (fromValidity: DateValidity, toValidity: DateValidity): void => {
    onValidityChange?.(fromValidity, 'from');
    onValidityChange?.(toValidity, 'to');
  };

  /**
   * Leaving the field: read it, set the value, and say what was wrong.
   *
   * A text that is still the value as written was not typed, so nothing is committed: opening the
   * calendar runs this too, and must not report a change that never happened.
   */
  const handleBlur = (): void => {
    const typed = text !== written;

    if (!isRange) {
      const reading = readDate(text, dateOrder);
      const { iso, validity } = judge(reading);

      if (typed) {
        if (reading.status === 'valid') {
          setText(writeDate(iso, dateOrder));
        }

        commitDate(iso);
      }

      onValidityChange?.(validity, 'date');
      return;
    }

    const readings = readRange(text, dateOrder);
    const from = judge(readings.from);
    const to = judge(readings.to);
    const next = { from: from.iso, to: to.iso };

    if (typed) {
      /* Rewritten only when both halves are read: a half typed wrong stays as typed, to be fixed */
      if (from.iso !== null || readings.from.status === 'empty') {
        if (to.iso !== null || readings.to.status === 'empty') {
          setText(writeRange(next, dateOrder));
        }
      }

      commitRange(next);
    }

    const halfOpen = !props.allowOpenRange && (next.from === null) !== (next.to === null);
    const reversed = next.from !== null && next.to !== null && next.to < next.from;

    reportRange(
      from.validity ?? (halfOpen && next.from === null ? { code: 'open' } : null),
      to.validity ?? (reversed ? { code: 'order' } : null) ?? (halfOpen && next.to === null ? { code: 'open' } : null)
    );
  };


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const raw = event.currentTarget.value;
    const deleting = raw.length < text.length;

    setText(isRange ? maskRange(raw, dateOrder, deleting) : maskDate(raw, dateOrder, deleting));
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {
    const found = readPastedDates(event.clipboardData.getData('text'), dateOrder);

    event.preventDefault();

    if (found.length === 0) {
      return;
    }

    if (!isRange) {
      setText(writeDate(found[0], dateOrder));
      return;
    }

    /* Two dates fill the whole period */
    if (found.length === 2) {
      const next = { from: found[0], to: found[1] };

      setText(writeRange(next, dateOrder));
      commitRange(next);
      return;
    }

    /* One date goes to the half the caret is in: after the dash, or after a whole start, it is the end */
    const readings = readRange(text, dateOrder);
    const dash = text.indexOf(RANGE_SEPARATOR.trim());
    const caret = event.currentTarget.selectionStart ?? text.length;
    const isEnd = dash >= 0 ? caret > dash : readings.from.status === 'valid' && caret >= text.length;

    const kept = (reading: DateReading): string | null => (reading.status === 'valid' ? reading.iso : null);

    const next = isEnd ? { from: kept(readings.from), to: found[0] } : { from: found[0], to: kept(readings.to) };

    setText(writeRange(next, dateOrder));
  };

  const clearAll = (): void => {
    setText('');

    if (isRange) {
      commitRange(EMPTY_RANGE);
    }
    else {
      commitDate(null);
    }

    if (isRange) {
      reportRange(null, null);
    }
    else {
      onValidityChange?.(null, 'date');
    }
  };

  const handleOpenChange = (next: boolean, details?: PopoverPrimitive.Root.ChangeEventDetails): void => {
    if (next && (readOnly || isDisabled)) {
      return;
    }

    /* A press in the field is not outside: the text was clicked to type or to open */
    if (!next && details?.reason === 'outside-press' && anchorRef.current?.contains(details.event.target as Node)) {
      details.cancel();
      return;
    }

    /* Opened by Base UI means opened by the button */
    if (next && details) {
      setFocusGrid(true);
    }

    /* A date typed and not yet confirmed is the one the calendar opens on */
    if (next) {
      handleBlur();
    }

    /* A period left after one click gives back the one there was */
    if (!next) {
      refocusRef.current = details?.reason !== 'outside-press' && (popupRef.current?.contains(document.activeElement) ?? false);
      setDraft(null);
      setPreview(null);
    }

    setOpen(next);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();

      /* Open from a click, Alt ↓ moves into the grid */
      if (open) {
        popupRef.current?.querySelector<HTMLElement>('[data-day][tabindex="0"]')?.focus();
        return;
      }

      setFocusGrid(true);
      handleOpenChange(true);
      return;
    }

    /* Tab from the text while the calendar is open: the guards of Base UI would send it back here */
    if (event.key === 'Tab' && open) {
      const stops = Array.from(document.querySelectorAll<HTMLElement>(TABBABLE)).filter((element) => (
        element.tabIndex >= 0
        && !element.matches(':disabled')
        && !element.hasAttribute('data-base-ui-focus-guard')
        && !popupRef.current?.contains(element)
        && element.getClientRects().length > 0
      ));
      const next = stops[stops.indexOf(event.currentTarget) + (event.shiftKey ? -1 : 1)];

      event.preventDefault();
      handleOpenChange(false);
      next?.focus();
      return;
    }

    if (event.key === 'Backspace' && (event.ctrlKey || event.metaKey) && canClear) {
      event.preventDefault();
      clearAll();
    }
  };

  const handleSelect = (day: string): void => {
    if (!isRange) {
      setText(writeDate(day, dateOrder));
      commitDate(day);
      onValidityChange?.(outOfLimits(day) ? { code: 'outOfRange' } : null, 'date');
      handleOpenChange(false);
      return;
    }

    if (!draft || !draft.from || day < draft.from) {
      setDraft({ from: day, to: null });
      return;
    }

    const next = { from: draft.from, to: day };

    setText(writeRange(next, dateOrder));
    commitRange(next);
    reportRange(null, null);
    handleOpenChange(false);
  };


  // ----
  // Component Render
  // ----

  const today = dayjs().format('YYYY-MM-DD');
  const shownRange = draft ?? range;
  const formatShort = (iso: string): string => writeDate(iso, dateOrder);

  let footerText: string | null = null;

  if (isRange && draft?.from) {
    footerText = (labels as RangeDatePickerLabels).pickEnd(formatShort(draft.from));
  }
  else if (isRange && range.from && range.to) {
    footerText = (labels as RangeDatePickerLabels).rangeSummary(formatShort(range.from), formatShort(range.to), dayjs(range.to).diff(range.from, 'day') + 1);
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange} modal={false}>
      <Stack
        gap={0}
        data-slot={'date-picker'}
        direction={'horizontal'}
        align={'center'}
        className={cn(baseClasses, className)}
        /* The mode of the picker: a part named by its slot carries no layout attribute of the stack */
        data-mode={isRange ? 'range' : 'date'}
      >
        {/* The frame is `FieldShell`, as wide as the date it holds rather than its row */}
        <FieldShell
          ref={anchorRef}
          data-slot={'date-picker-field'}
          size={size}
          invalid={isInvalid}
          readOnly={readOnly}
          disabled={isDisabled}
          className={'group/list-field w-auto min-w-auto'}
        >
          <Input
            {...rest}
            ref={handleInputRef}
            name={isRange ? undefined : name}
            value={text}
            readOnly={readOnly}
            disabled={isDisabled}
            inputMode={'numeric'}
            placeholder={isRange ? `${labels.format}${RANGE_SEPARATOR}${labels.format}` : labels.format}
            aria-required={isRequired || undefined}
            aria-invalid={isInvalid || undefined}
            data-slot={'date-picker-input'}
            data-field-control={''}
            className={cn('frame-line shrink-0 bg-transparent outline-none', INPUT_WIDTH[isRange ? 'range' : 'date'], TEXT_CONTROL_TEXT, 'placeholder:text-muted-foreground')}
            onChange={handleChange}
            onClick={(event: React.MouseEvent<HTMLInputElement>) => {
              rest.onClick?.(event);

              if (!open && !readOnly && !isDisabled) {
                setFocusGrid(false);
                handleOpenChange(true);
              }
            }}
            onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
              rest.onBlur?.(event);
              handleBlur();

              /* Leaving for the next field closes the calendar; going into it or to its button does not */
              const to = event.relatedTarget as Node | null;

              if (open && !popupRef.current?.contains(to) && !anchorRef.current?.contains(to)) {
                handleOpenChange(false);
              }
            }}
            onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => {
              rest.onPaste?.(event);
              handlePaste(event);
            }}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              rest.onKeyDown?.(event);
              handleKeyDown(event);
            }}
          />

          {!readOnly && (
            <Stack as={'span'} data-slot={'date-picker-actions'} direction={'horizontal'} align={'center'} gap={0.5} className={'-me-1 shrink-0'}>
              {/* Its place is kept while it is hidden, so the field does not change width */}
              {!isRequired && (
                <IconButton
                  label={labels.clear}
                  icon={<ClearGlyph />}
                  tabIndex={-1}
                  size={size === 'sm' ? 'sm' : 'md'}
                  aria-hidden={!canClear || undefined}
                  data-slot={'date-picker-clear'}
                  className={cn('size-6 rounded-sm', !canClear && 'invisible')}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    clearAll();
                    inputRef.current?.focus();
                  }}
                />
              )}
              <PopoverPrimitive.Trigger
                render={(
                  <IconButton
                    label={labels.calendar}
                    icon={<CalendarGlyph />}
                    tabIndex={-1}
                    disabled={isDisabled}
                    size={size === 'sm' ? 'sm' : 'md'}
                    data-slot={'date-picker-calendar-button'}
                    className={'size-6 rounded-sm'}
                  />
                )}
              />
            </Stack>
          )}
        </FieldShell>

        {isRange && name && (
          <React.Fragment>
            <input type={'hidden'} name={`${name}.from`} value={range.from ?? ''} />
            <input type={'hidden'} name={`${name}.to`} value={range.to ?? ''} />
          </React.Fragment>
        )}
      </Stack>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner anchor={anchorRef} side={'bottom'} align={'start'} sideOffset={LIST_SIDE_OFFSET} className={LIST_POSITIONER}>
          <PopoverPrimitive.Popup
            ref={popupRef}
            aria-label={labels.calendar}
            initialFocus={false}
            finalFocus={() => (refocusRef.current ? inputRef.current : false)}
            data-slot={'date-picker-panel'}
            className={'rounded-md bg-popover p-1 text-popover-foreground shadow-md outline-none'}
          >
            <Calendar
              autoFocus={focusGrid}
              locale={locale}
              selected={isRange ? null : date}
              range={isRange ? shownRange : null}
              preview={isRange && draft?.from ? preview : null}
              min={min}
              max={max}
              isDateUnavailable={isDateUnavailable}
              dayMeta={dayMeta}
              labels={labels}
              onSelect={handleSelect}
              onHoverDay={setPreview}
            />

            <Stack data-slot={'date-picker-footer'} gap={1} className={'mt-1 border-t border-border pt-1'}>
              {footerText && <span data-slot={'date-picker-footer-text'} className={'px-1 text-xs text-muted-foreground'}>{footerText}</span>}
              <Stack gap={0} data-slot={'date-picker-footer-actions'} direction={'horizontal'} align={'center'} justify={'between'}>
                {!isRange && (
                  <Button data-slot={'date-picker-today'} size={'sm'} fill={'plain'} tone={'primary'} disabled={isDateUnavailable?.(today) || outOfLimits(today)} onClick={() => handleSelect(today)}>
                    {(labels as DatePickerLabels).today}
                  </Button>
                )}
                {canClear && (
                  <Button
                    data-slot={'date-picker-footer-clear'}
                    size={'sm'}
                    fill={'plain'}
                    tone={'primary'}
                    className={'ms-auto'}
                    onClick={() => {
                      clearAll();
                      handleOpenChange(false);
                    }}
                  >
                    {labels.clear}
                  </Button>
                )}
              </Stack>
            </Stack>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );

});

DatePickerField.displayName = 'DatePickerField';
