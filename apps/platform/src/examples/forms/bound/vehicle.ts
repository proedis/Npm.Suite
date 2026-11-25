import { z } from 'zod';

import { nullableNumber, nullableString } from '@proedis/zod';

import type { DefaultValues } from 'react-hook-form';


/**
 * The schema of a vehicle: every label, every bound and every requiredness of the form below is
 * written here and nowhere else. `.describe()` is the label of the field.
 */
export const vehicleSchema = z.object({
  plate   : z.string().min(1, 'Write the plate').max(10, 'At most 10 characters').describe('Plate'),
  model   : z.string().min(2, 'At least 2 characters').max(40, 'At most 40 characters').describe('Model'),
  capacity: z.number({ error: 'Write the capacity' }).int('Whole kilograms').min(500, 'At least 500 kg').max(26000, 'At most 26,000 kg')
    .describe('Capacity'),
  depot   : z.string({ error: 'Choose a depot' }).describe('Depot'),
  inService: z.string({ error: 'Choose the date' }).describe('In service since'),
  notes   : nullableString((text) => text.max(120, 'At most 120 characters')).describe('Notes'),
  axles   : nullableNumber((value) => value.int().min(2).max(5)).describe('Axles')
});

export type VehicleInput = z.input<typeof vehicleSchema>;

export type Vehicle = z.output<typeof vehicleSchema>;

/**
 * The values a new vehicle starts from. The texts start empty; a number, a choice and a date may be
 * left out, since each control stays controlled with no value: the binding hands it its own empty.
 */
export const EMPTY_VEHICLE: DefaultValues<VehicleInput> = {
  plate: '',
  model: '',
  notes: '',
  axles: null
};
