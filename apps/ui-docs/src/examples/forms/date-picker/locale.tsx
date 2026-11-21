import * as React from 'react';

import 'dayjs/locale/it';

import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Field } from '@proedis/ui/forms/field';

import type { DatePickerLabels } from '@proedis/ui/forms/date-picker';


/** The same field in Italian: the labels, the order of the parts and the first day of the week follow the language */
const labels: DatePickerLabels = {
  format       : 'gg/mm/aaaa',
  calendar     : 'Calendario',
  clear        : 'Svuota',
  today        : 'Oggi',
  previousMonth: 'Mese precedente',
  nextMonth    : 'Mese successivo',
  chooseMonth  : 'Scegli il mese',
  chooseYear   : 'Scegli l’anno',
  previousYears: 'Anni precedenti',
  nextYears    : 'Anni successivi',
  pickEnd      : (from) => `Dal ${from} · scegli la fine`,
  rangeSummary : (from, to, days) => `Dal ${from} al ${to} · ${days} ${days === 1 ? 'giorno' : 'giorni'}`
};


export default function Example(): React.ReactNode {
  return (
    <Field className={'w-full max-w-xs'}>
      <Field.Label>Data del ritiro</Field.Label>
      <DatePicker locale={'it'} defaultValue={'2026-11-16'} labels={labels} />
      <Field.Description>Locale “it”: day, month, year, and weeks from Monday.</Field.Description>
    </Field>
  );
}
