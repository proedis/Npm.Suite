import type { DatePickerLabels } from '@proedis/ui/forms/date-picker';


/** The texts of a DatePicker in British English: the format follows the order of the language */
const labels: DatePickerLabels = {
  format       : 'dd/mm/yyyy',
  calendar     : 'Calendar',
  clear        : 'Clear',
  today        : 'Today',
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
