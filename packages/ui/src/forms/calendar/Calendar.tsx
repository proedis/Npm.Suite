'use client';

import * as React from 'react';

import dayjs from 'dayjs';

import type { Dayjs } from 'dayjs';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';

import { intlWeekStart } from './dateText';


/* --------
 * Types Definition
 * -------- */

export interface CalendarLabels {
  readonly previousMonth: string;
  readonly nextMonth: string;
  readonly chooseMonth: string;
  readonly chooseYear: string;
  readonly previousYears: string;
  readonly nextYears: string;
}

/** What a day says besides its number: a holiday is `muted` with its name as `hint` */
export interface DayMeta {
  readonly muted?: boolean;
  readonly hint?: string;
}

export interface CalendarRange {
  readonly from: string | null;
  readonly to: string | null;
}

export interface CalendarProps {
  /** The language of names and of the first day of the week, as dayjs and `Intl` know it */
  locale?: string;

  /** The chosen day, as `"2026-11-16"` */
  selected?: string | null;

  /** A period: the band between the two ends */
  range?: CalendarRange | null;

  /** The day under the pointer while the end of a period is being picked */
  preview?: string | null;

  min?: string;
  max?: string;

  isDateUnavailable?: (day: string) => boolean;
  dayMeta?: (day: string) => DayMeta | undefined;

  onSelect: (day: string) => void;
  onHoverDay?: (day: string | null) => void;

  labels: CalendarLabels;

  /** Takes the focus on the chosen day, or today, when it mounts */
  autoFocus?: boolean;
}

type CalendarView = 'days' | 'months' | 'years';


/* --------
 * Constants Definition
 * -------- */

const ISO = 'YYYY-MM-DD';

/** Always six rows: the panel never changes height */
const GRID_DAYS = 42;

const HEAD_BUTTON = 'size-7 rounded-sm [&_svg]:size-4';

/** A day: a button centring its number, as a Stack (`as={'button'}`) */
const CELL_BUTTON = [
  'relative h-8 w-full rounded-sm text-sm tabular-nums outline-none',
  'hover:bg-accent hover:text-accent-foreground',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
  'data-weekend:text-muted-foreground data-muted:text-muted-foreground data-outside:text-placeholder',
  'data-today:font-semibold data-today:inset-ring data-today:inset-ring-primary',
  'data-in-range:rounded-none data-in-range:bg-primary-soft data-in-range:text-primary-soft-foreground',
  'data-selected:rounded-sm data-selected:bg-primary data-selected:font-semibold data-selected:text-primary-foreground',
  'data-selected:focus-visible:inset-ring-2 data-selected:focus-visible:inset-ring-primary-foreground',
  'data-unavailable:cursor-not-allowed data-unavailable:line-through data-unavailable:opacity-50'
].join(' ');

/** A month or a year: a button centring its name, as a Stack (`as={'button'}`) */
const PICK_BUTTON = [
  'h-11 rounded-sm text-sm outline-none hover:bg-accent',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
  'data-selected:bg-primary data-selected:font-semibold data-selected:text-primary-foreground'
].join(' ');


/* --------
 * Glyphs
 * -------- */

function ArrowGlyph(props: { direction: 'left' | 'right' }): React.ReactNode {
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
      <path d={props.direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
    </svg>
  );
}


interface CalendarHeaderProps {
  title: string;
  titleLabel: string;
  onTitle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  previousLabel: string;
  nextLabel: string;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}

/** The arrows and the title: the title opens the level above (months, then years) */
function CalendarHeader(props: CalendarHeaderProps): React.ReactNode {
  return (
    <Stack data-slot={'calendar-header'} direction={'horizontal'} align={'center'} justify={'between'} gap={1} className={'pb-1'}>
      <IconButton
        data-slot={'calendar-previous'}
        label={props.previousLabel}
        icon={<ArrowGlyph direction={'left'} />}
        size={'sm'}
        disabled={props.previousDisabled}
        className={HEAD_BUTTON}
        onClick={props.onPrevious}
      />
      <Button
        size={'sm'}
        fill={'plain'}
        tone={'muted'}
        aria-label={`${props.title}, ${props.titleLabel}`}
        aria-live={'polite'}
        data-slot={'calendar-title'}
        className={'font-semibold text-foreground'}
        onClick={props.onTitle}
      >
        {props.title}
      </Button>
      <IconButton
        data-slot={'calendar-next'}
        label={props.nextLabel}
        icon={<ArrowGlyph direction={'right'} />}
        size={'sm'}
        disabled={props.nextDisabled}
        className={HEAD_BUTTON}
        onClick={props.onNext}
      />
    </Stack>
  );
}


/* --------
 * Helpers
 * -------- */

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}


/* --------
 * Component Definition
 * -------- */

/**
 * The month grid of the date fields, written on dayjs.
 *
 * Seven columns from the first day of the week of the language, six rows always. The grid follows the
 * "grid" pattern of the ARIA Authoring Practices: one Tab stop, the arrows by day and week, Home and
 * End to the ends of the row, Page Up and Down by month, with Shift by year, Enter and Space to choose.
 * The title opens the twelve months, and from there the twelve years; Esc goes back up without
 * closing.
 *
 * Private to the interactive tier for now: the date picker uses it, the filter bar will.
 */
export function Calendar(props: CalendarProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    autoFocus = false,
    dayMeta,
    isDateUnavailable,
    labels,
    locale,
    max,
    min,
    onHoverDay,
    onSelect,
    preview,
    range,
    selected
  } = props;


  // ----
  // Internal State
  // ----
  const today = dayjs().locale(locale ?? dayjs.locale()).startOf('day');
  const anchor = selected ?? range?.from ?? null;

  /**
   * The first day of the week comes from `Intl`, like the names of the days. Read from dayjs it
   * silently became Sunday whenever the application had not loaded that dayjs locale: a Sunday first
   * grid under Italian names. dayjs is the fallback where `Intl` cannot tell.
   */
  const weekStart = intlWeekStart(locale ?? dayjs.locale()) ?? dayjs.Ls[today.locale()]?.weekStart ?? 0;
  const startOfWeek = (day: Dayjs): Dayjs => day.subtract((day.day() - weekStart + 7) % 7, 'day').startOf('day');

  const [ view, setView ] = React.useState<CalendarView>('days');
  const [ focused, setFocused ] = React.useState<Dayjs>(() => (anchor ? dayjs(anchor) : today).locale(locale ?? dayjs.locale()));
  const [ month, setMonth ] = React.useState<Dayjs>(() => focused.startOf('month'));

  const gridRef = React.useRef<HTMLDivElement>(null);
  const moveFocusRef = React.useRef(autoFocus);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    if (!moveFocusRef.current || view !== 'days') {
      return;
    }

    moveFocusRef.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-day="${focused.format(ISO)}"]`)?.focus();
  });


  // ----
  // Handlers
  // ----
  const minDay = min ? dayjs(min) : null;
  const maxDay = max ? dayjs(max) : null;

  const isOutOfLimits = (day: Dayjs): boolean => (
    (minDay !== null && day.isBefore(minDay, 'day')) || (maxDay !== null && day.isAfter(maxDay, 'day'))
  );

  const isUnavailable = (day: Dayjs): boolean => isOutOfLimits(day) || (isDateUnavailable?.(day.format(ISO)) ?? false);

  const goTo = (day: Dayjs): void => {
    moveFocusRef.current = true;
    setFocused(day);

    if (!day.isSame(month, 'month')) {
      setMonth(day.startOf('month'));
    }
  };

  const choose = (day: Dayjs): void => {
    if (isUnavailable(day)) {
      return;
    }

    if (!day.isSame(month, 'month')) {
      goTo(day);
      return;
    }

    onSelect(day.format(ISO));
  };

  const handleGridKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const moves: Record<string, () => Dayjs> = {
      ArrowLeft : () => focused.subtract(1, 'day'),
      ArrowRight: () => focused.add(1, 'day'),
      ArrowUp   : () => focused.subtract(1, 'week'),
      ArrowDown : () => focused.add(1, 'week'),
      Home      : () => startOfWeek(focused),
      End       : () => startOfWeek(focused).add(6, 'day'),
      PageUp    : () => focused.subtract(1, event.shiftKey ? 'year' : 'month'),
      PageDown  : () => focused.add(1, event.shiftKey ? 'year' : 'month')
    };

    const move = moves[event.key];

    if (move) {
      event.preventDefault();
      goTo(move());
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(focused);
    }
  };

  /** Esc from the months or the years goes back to the days, and does not close the panel */
  const handleKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape' && view !== 'days') {
      event.preventDefault();
      event.stopPropagation();
      setView(view === 'years' ? 'months' : 'days');
    }
  };


  // ----
  // Component Render
  // ----
  const intlLocale = locale ?? dayjs.locale();
  const start = startOfWeek(month);
  const days = Array.from({ length: GRID_DAYS }, (_, index) => start.add(index, 'day'));
  const weekdays = days.slice(0, 7);
  const rows = Array.from({ length: 6 }, (_, row) => days.slice(row * 7, row * 7 + 7));

  const longDay = new Intl.DateTimeFormat(intlLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const shortWeekday = new Intl.DateTimeFormat(intlLocale, { weekday: 'short' });
  const longWeekday = new Intl.DateTimeFormat(intlLocale, { weekday: 'long' });
  const monthYear = new Intl.DateTimeFormat(intlLocale, { month: 'long', year: 'numeric' });
  const monthName = new Intl.DateTimeFormat(intlLocale, { month: 'short' });

  const rangeFrom = range?.from ? dayjs(range.from) : null;
  const rangeTo = range?.to ? dayjs(range.to) : preview && rangeFrom ? dayjs(preview) : null;
  const reversed = rangeFrom !== null && rangeTo !== null && rangeTo.isBefore(rangeFrom);
  const [ bandStart, bandEnd ] = reversed ? [ rangeTo, rangeFrom ] : [ rangeFrom, rangeTo ];

  const prevDisabled = minDay !== null && !month.subtract(1, 'month').endOf('month').isAfter(minDay.subtract(1, 'day'));
  const nextDisabled = maxDay !== null && !month.add(1, 'month').startOf('month').isBefore(maxDay.add(1, 'day'));

  const yearBlockStart = month.year() - (month.year() % 12);

  return (
    <div data-slot={'calendar'} data-view={view} className={'w-66'} onKeyDownCapture={handleKeyDownCapture}>
      {view === 'days' && (
        <React.Fragment>
          <CalendarHeader
            title={capitalize(monthYear.format(month.toDate()))}
            titleLabel={labels.chooseMonth}
            onTitle={() => setView('months')}
            onPrevious={() => setMonth(month.subtract(1, 'month'))}
            onNext={() => setMonth(month.add(1, 'month'))}
            previousLabel={labels.previousMonth}
            nextLabel={labels.nextMonth}
            previousDisabled={prevDisabled}
            nextDisabled={nextDisabled}
          />

          <div ref={gridRef} role={'grid'} aria-label={capitalize(monthYear.format(month.toDate()))} data-slot={'calendar-grid'} onKeyDown={handleGridKeyDown}>
            <Stack role={'row'} data-slot={'calendar-weekdays'} columns={7}>
              {weekdays.map((day) => (
                <Stack
                  as={'span'}
                  key={day.day()}
                  role={'columnheader'}
                  data-slot={'calendar-weekday'}
                  aria-label={longWeekday.format(day.toDate())}
                  direction={'horizontal'}
                  align={'center'}
                  justify={'center'}
                  className={'h-8 text-xs font-semibold text-muted-foreground'}
                >
                  {shortWeekday.format(day.toDate()).slice(0, 2)}
                </Stack>
              ))}
            </Stack>

            {rows.map((row) => (
              <Stack key={row[0].format(ISO)} role={'row'} data-slot={'calendar-week'} columns={7}>
                {row.map((day, column) => {
                  const iso = day.format(ISO);
                  const meta = dayMeta?.(iso);
                  const isSelected = selected === iso || range?.from === iso || range?.to === iso;
                  const inBand = bandStart !== null && bandEnd !== null && !isSelected
                    && !day.isBefore(bandStart, 'day') && !day.isAfter(bandEnd, 'day');
                  const unavailable = isUnavailable(day);
                  const isToday = day.isSame(today, 'day');
                  const outside = !day.isSame(month, 'month');

                  const cell = (
                    <Stack
                      as={'button'}
                      type={'button'}
                      tabIndex={day.isSame(focused, 'day') ? 0 : -1}
                      aria-label={meta?.hint ? `${longDay.format(day.toDate())}, ${meta.hint}` : longDay.format(day.toDate())}
                      aria-disabled={unavailable || undefined}
                      aria-current={isToday ? 'date' : undefined}
                      data-day={iso}
                      data-slot={'calendar-day'}
                      data-selected={isSelected || undefined}
                      data-in-range={inBand || undefined}
                      data-today={isToday || undefined}
                      data-outside={outside || undefined}
                      data-weekend={day.day() === 0 || day.day() === 6 || undefined}
                      data-muted={meta?.muted || undefined}
                      data-unavailable={unavailable || undefined}
                      title={meta?.hint}
                      direction={'horizontal'}
                      align={'center'}
                      justify={'center'}
                      className={cn(CELL_BUTTON, inBand && column === 0 && 'rounded-s-sm', inBand && column === 6 && 'rounded-e-sm')}
                      onClick={() => {
                        setFocused(day);
                        choose(day);
                      }}
                      onMouseEnter={() => onHoverDay?.(iso)}
                      onMouseLeave={() => onHoverDay?.(null)}
                    >
                      {day.date()}
                    </Stack>
                  );

                  return (
                    <div key={iso} role={'gridcell'} data-slot={'calendar-cell'} aria-selected={isSelected || undefined} className={'p-px'}>
                      {cell}
                    </div>
                  );
                })}
              </Stack>
            ))}
          </div>
        </React.Fragment>
      )}

      {view === 'months' && (
        <React.Fragment>
          <CalendarHeader
            title={String(month.year())}
            titleLabel={labels.chooseYear}
            onTitle={() => setView('years')}
            onPrevious={() => setMonth(month.subtract(1, 'year'))}
            onNext={() => setMonth(month.add(1, 'year'))}
            previousLabel={labels.previousYears}
            nextLabel={labels.nextYears}
          />
          <Stack data-slot={'calendar-months'} columns={3} gap={1}>
            {Array.from({ length: 12 }, (_, index) => month.month(index)).map((item) => (
              <Stack
                as={'button'}
                key={item.month()}
                type={'button'}
                data-slot={'calendar-month'}
                data-selected={item.isSame(month, 'month') || undefined}
                direction={'horizontal'}
                align={'center'}
                justify={'center'}
                className={PICK_BUTTON}
                onClick={() => {
                  setMonth(item.startOf('month'));
                  setView('days');
                }}
              >
                {capitalize(monthName.format(item.toDate()))}
              </Stack>
            ))}
          </Stack>
        </React.Fragment>
      )}

      {view === 'years' && (
        <React.Fragment>
          <CalendarHeader
            title={`${yearBlockStart} – ${yearBlockStart + 11}`}
            titleLabel={labels.chooseYear}
            onTitle={() => setView('months')}
            onPrevious={() => setMonth(month.subtract(12, 'year'))}
            onNext={() => setMonth(month.add(12, 'year'))}
            previousLabel={labels.previousYears}
            nextLabel={labels.nextYears}
          />
          <Stack data-slot={'calendar-years'} columns={3} gap={1}>
            {Array.from({ length: 12 }, (_, index) => yearBlockStart + index).map((year) => (
              <Stack
                as={'button'}
                key={year}
                type={'button'}
                data-slot={'calendar-year'}
                data-selected={year === month.year() || undefined}
                direction={'horizontal'}
                align={'center'}
                justify={'center'}
                className={PICK_BUTTON}
                onClick={() => {
                  setMonth(month.year(year));
                  setView('months');
                }}
              >
                {year}
              </Stack>
            ))}
          </Stack>
        </React.Fragment>
      )}
    </div>
  );

}

Calendar.displayName = 'Calendar';
