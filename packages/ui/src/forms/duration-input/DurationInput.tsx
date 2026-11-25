'use client';

import * as React from 'react';

import { splitBaseProps } from '../../core/base';
import { bindable } from '../../core/binding';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { useFieldControl, useNonNativeFieldLabel } from '../field/fieldContext';
import { FieldShell } from '../field-shell/FieldShell';

import { durationFromTimeSpan, joinDuration, splitDuration } from './durationTime';

import type { BaseProps } from '../../core/base';
import type { BoundValue } from '../../core/binding';
import type { ControlSize } from '../../core/control';


/* --------
 * Types Definition
 * -------- */

export interface DurationInputLabels {
  /** The name of each segment, read as the user moves into it: "Hours", "Minutes", "Seconds" */
  readonly hours: string;
  readonly minutes: string;
  readonly seconds: string;
}

/** `seconds` shows hh:mm:ss, `minutes` hh:mm */
export type DurationPrecision = 'seconds' | 'minutes';

export interface StrictDurationInputProps extends BaseProps {
  /** The duration in whole seconds, or `null` for empty */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;

  /** Told when the focus leaves the whole field, not one of its segments */
  onBlur?: () => void;

  /** Defaults to `seconds` */
  precision?: DurationPrecision;

  /** The longest duration, in seconds: the arrows stop there, and the hours take as many digits as it needs */
  max?: number;

  /** The texts: the package writes none */
  labels: DurationInputLabels;

  /** `sm` in bars and tables. Defaults to `md` */
  size?: ControlSize;

  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;

  /** The name the seconds are submitted with, in a `<form>` */
  name?: string;

  /** Before the segments, a clock */
  leading?: React.ReactNode;

  id?: string;
  className?: string;
}

export type DurationInputProps = StrictDurationInputProps;

type Unit = 'hours' | 'minutes' | 'seconds';

interface Segments {
  readonly hours: number | null;
  readonly minutes: number | null;
  readonly seconds: number | null;
}


/* --------
 * Constants Definition
 * -------- */

const EMPTY: Segments = { hours: null, minutes: null, seconds: null };

/** Two digits of hours unless `max` asks for more: 99 hours is four days, plenty for a task */
const DEFAULT_MAX_HOURS = 99;

const SECONDS_OF: Readonly<Record<Unit, number>> = { hours: 3_600, minutes: 60, seconds: 1 };

/** What moves to the next segment, besides a segment that is full */
const SEPARATORS = new Set([ ':', '.', ',', ' ' ]);


/* --------
 * Helpers
 * -------- */

function setRef<T>(ref: React.ForwardedRef<T>, element: T | null): void {
  if (typeof ref === 'function') {
    ref(element);
  }
  else if (ref) {
    ref.current = element;
  }
}

function toSegments(value: number | null | undefined, units: readonly Unit[]): Segments {
  if (value === null || value === undefined) {
    return EMPTY;
  }

  const parts = splitDuration(units.includes('seconds') ? value : Math.round(value / 60) * 60);

  return { hours: parts.hours, minutes: parts.minutes, seconds: units.includes('seconds') ? parts.seconds : null };
}

function toValue(segments: Segments): number | null {
  if (segments.hours === null && segments.minutes === null && segments.seconds === null) {
    return null;
  }

  return joinDuration({ hours: segments.hours ?? 0, minutes: segments.minutes ?? 0, seconds: segments.seconds ?? 0 });
}

/** A pasted duration: a TimeSpan, or "1:30" and "1:30:15" as hours, minutes and seconds */
function readPasted(text: string): number | null {
  const timeSpan = durationFromTimeSpan(text);

  if (timeSpan !== null) {
    return Math.max(0, timeSpan);
  }

  const match = /^(\d+)(?::(\d{1,2}))?(?::(\d{1,2}))?$/.exec(text.trim());

  if (!match || Number(match[2] ?? 0) > 59 || Number(match[3] ?? 0) > 59) {
    return null;
  }

  return joinDuration({ hours: Number(match[1]), minutes: Number(match[2] ?? 0), seconds: Number(match[3] ?? 0) });
}


/* --------
 * Component Definition
 * -------- */

/**
 * A duration typed in segments, hours, minutes and seconds, each a spinbutton: digits move to the next
 * segment once it is full, the arrows change it with a carry (59 minutes and one more is the next hour).
 *
 * ```tsx
 * <Field label={'Duration of the round'}>
 *   <DurationInput
 *     value={seconds} onValueChange={setSeconds} labels={{ hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' }}
 *   />
 * </Field>
 * ```
 *
 * The value is a number of seconds, or `null` while every segment is empty; a segment left empty counts
 * as zero beside one that is not. The hours are not capped at a day. `durationFromTimeSpan` and
 * `durationToTimeSpan` read and write the `TimeSpan` an API speaks, `'01:30:00'`. Pasting `1:30:00` or a
 * TimeSpan fills every segment. ←→ move between segments, ↑↓ add or take one, Page Up and Down ten,
 * Backspace empties the segment.
 *
 * Parts with a slot: `duration-input` (the frame, with the states of a field), `duration-input-segments`,
 * `duration-input-segment` (with `data-unit`, `data-empty`), `duration-input-separator`.
 */
const DurationInputBase = React.forwardRef<HTMLSpanElement, DurationInputProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    defaultValue,
    disabled = false,
    id,
    invalid = false,
    labels,
    leading,
    max,
    name,
    onBlur,
    onValueChange,
    precision = 'seconds',
    readOnly = false,
    size = 'md',
    value: valueProp,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();

  useNonNativeFieldLabel();

  const units: readonly Unit[] = precision === 'seconds' ? [ 'hours', 'minutes', 'seconds' ] : [ 'hours', 'minutes' ];
  const segmentRefs = React.useRef<Partial<Record<Unit, HTMLSpanElement | null>>>({});


  // ----
  // Internal State
  // ----
  const [ segments, setSegments ] = React.useState<Segments>(() => toSegments(valueProp ?? defaultValue, units));
  const [ typing, setTyping ] = React.useState<{ unit: Unit; text: string } | null>(null);

  /**
   * A value set from outside replaces the segments, adjusted while rendering. The segments are the
   * truth while typing, since "1" in the hours and nothing elsewhere is a value the number cannot hold
   */
  const [ seenValue, setSeenValue ] = React.useState(valueProp);

  if (valueProp !== seenValue) {
    setSeenValue(valueProp);

    if (valueProp !== undefined && valueProp !== toValue(segments)) {
      setSegments(toSegments(valueProp, units));
    }
  }


  // ----
  // Handlers
  // ----
  const isDisabled = disabled || field.disabled;
  const isInvalid = invalid || field.invalid;
  const maxHours = max === undefined ? DEFAULT_MAX_HOURS : Math.floor(max / 3_600);
  const hourDigits = Math.max(2, String(maxHours).length);
  const limitOf = (unit: Unit): number => (unit === 'hours' ? maxHours : 59);

  const commit = (next: Segments): void => {
    setSegments(next);
    onValueChange?.(toValue(next));
  };

  const focusUnit = (unit: Unit | undefined): void => {
    if (unit) {
      segmentRefs.current[unit]?.focus();
    }
  };

  const neighbour = (unit: Unit, step: 1 | -1): Unit | undefined => units[units.indexOf(unit) + step];

  /** Adds `delta` units to the whole duration, so 59 minutes and one more is the next hour */
  const shift = (unit: Unit, delta: number): void => {
    const total = toValue(segments) ?? 0;
    const ceiling = max ?? (((maxHours + 1) * 3_600) - 1);
    const next = Math.min(ceiling, Math.max(0, total + (delta * SECONDS_OF[unit])));

    commit(toSegments(next, units));
  };

  const handleKeyDown = (unit: Unit) => (event: React.KeyboardEvent<HTMLSpanElement>): void => {
    if (event.altKey || event.metaKey || event.ctrlKey) {
      return;
    }

    const { key } = event;

    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      event.preventDefault();
      focusUnit(neighbour(unit, key === 'ArrowRight' ? 1 : -1));
      return;
    }

    if (readOnly || isDisabled) {
      return;
    }

    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'PageUp' || key === 'PageDown') {
      event.preventDefault();
      setTyping(null);
      shift(unit, (key === 'ArrowUp' || key === 'PageUp' ? 1 : -1) * (key.startsWith('Page') ? 10 : 1));
      return;
    }

    if (key === 'Home' || key === 'End') {
      event.preventDefault();
      setTyping(null);
      commit({ ...segments, [unit]: key === 'Home' ? 0 : limitOf(unit) });
      return;
    }

    if (key === 'Backspace' || key === 'Delete') {
      event.preventDefault();
      setTyping(null);

      if (segments[unit] === null && key === 'Backspace') {
        focusUnit(neighbour(unit, -1));
      }
      else {
        commit({ ...segments, [unit]: null });
      }

      return;
    }

    if (SEPARATORS.has(key)) {
      event.preventDefault();
      setTyping(null);
      focusUnit(neighbour(unit, 1));
      return;
    }

    if (/^\d$/.test(key)) {
      event.preventDefault();

      const text = typing?.unit === unit ? `${typing.text}${key}` : key;
      const digits = unit === 'hours' ? hourDigits : 2;
      const number = Math.min(Number(text), limitOf(unit));
      const full = text.length >= digits || (Number(text) * 10) > limitOf(unit);

      commit({ ...segments, [unit]: number });

      if (full) {
        setTyping(null);
        focusUnit(neighbour(unit, 1));
      }
      else {
        setTyping({ unit, text });
      }
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>): void => {
    if (readOnly || isDisabled) {
      return;
    }

    const pasted = readPasted(event.clipboardData.getData('text'));

    if (pasted !== null) {
      event.preventDefault();
      setTyping(null);
      commit(toSegments(max === undefined ? pasted : Math.min(max, pasted), units));
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setTyping(null);
      onBlur?.();
    }
  };


  // ----
  // Component Render
  // ----
  const value = toValue(segments);

  return (
    <FieldShell
      data-slot={'duration-input'}
      size={size}
      invalid={isInvalid}
      disabled={isDisabled}
      readOnly={readOnly}
      leading={leading}
      className={cn('w-auto', baseClasses, className)}
    >
      <Stack
        {...rest}
        id={id}
        role={'group'}
        aria-labelledby={field.labelId}
        aria-invalid={isInvalid || undefined}
        aria-required={field.required || undefined}
        data-slot={'duration-input-segments'}
        direction={'horizontal'}
        align={'center'}
        gap={0}
        className={'tabular-nums'}
        onPaste={handlePaste}
        onBlur={handleBlur}
      >
        {units.map((unit, index) => {
          const current = segments[unit];
          const shown = typing?.unit === unit
            ? typing.text
            : (current === null ? '––' : String(current).padStart(2, '0'));

          return (
            <React.Fragment key={unit}>
              {index > 0 && <span aria-hidden data-slot={'duration-input-separator'} className={'px-px text-muted-foreground'}>:</span>}
              <span
                ref={(element) => {
                  segmentRefs.current[unit] = element;

                  /* The ref is the first segment, the element a form focuses on an error */
                  if (unit === 'hours') {
                    setRef(ref, element);
                  }
                }}
                role={'spinbutton'}
                tabIndex={isDisabled ? -1 : 0}
                aria-label={labels[unit]}
                aria-valuemin={0}
                aria-valuemax={limitOf(unit)}
                aria-valuenow={current ?? undefined}
                aria-valuetext={current === null ? '' : String(current)}
                aria-readonly={readOnly || undefined}
                aria-disabled={isDisabled || undefined}
                inputMode={'numeric'}
                data-field-control={''}
                data-slot={'duration-input-segment'}
                data-unit={unit}
                data-empty={current === null || undefined}
                className={cn(
                  'cursor-text rounded-sm px-0.5 outline-none caret-transparent',
                  'focus:bg-primary-soft focus:text-primary-soft-foreground',
                  'data-empty:text-placeholder'
                )}
                onKeyDown={handleKeyDown(unit)}
                onFocus={() => setTyping(null)}
              >
                {shown}
              </span>
            </React.Fragment>
          );
        })}
      </Stack>
      {name && <input type={'hidden'} name={name} value={value ?? ''} />}
    </FieldShell>
  );

});

DurationInputBase.displayName = 'DurationInput';

/** Bound to a form through `binding`: a number of seconds, so the bounds of a schema reach it */
export const DurationInput = bindable(DurationInputBase, {
  kind: 'number',
  bind: (field: BoundValue<number>) => ({
    name         : field.name,
    ref          : field.ref,
    value        : field.value ?? null,
    onValueChange: field.onChange,
    onBlur       : field.onBlur
  })
});
