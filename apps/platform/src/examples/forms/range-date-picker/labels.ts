import type { RangeDatePickerLabels } from '@proedis/ui/forms/range-date-picker';


/** The texts of a RangeDatePicker in British English: the format follows the order of the language */
const labels: RangeDatePickerLabels = {
  format       : 'dd/mm/yyyy',
  calendar     : 'Calendar',
  clear        : 'Clear',
  previousMonth: 'Previous month',
  nextMonth    : 'Next month',
  chooseMonth  : 'Choose the month',
  chooseYear   : 'Choose the year',
  previousYears: 'Previous years',
  nextYears    : 'Next years',
  pickEnd      : (from) => `From ${from} · pick the end`,
  rangeSummary : (from, to, days) => `From ${from} to ${to} · ${days} day${days === 1 ? '' : 's'}`
};

export default labels;
