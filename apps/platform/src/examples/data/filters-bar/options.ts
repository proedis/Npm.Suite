import type { FilterOption } from '@proedis/ui/data/filters-bar';
import { DISTRICTS, PEOPLE } from '../fixtures';


/** The values of the filters of a list of rounds, as the module of the entity declares them */
export const STATUS_OPTIONS: readonly FilterOption[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'late', label: 'Late' },
  { value: 'cancelled', label: 'Cancelled' }
];

export const DISTRICT_OPTIONS: readonly FilterOption[] = DISTRICTS.map((district) => ({ value: district, label: district }));

export const DRIVER_OPTIONS: readonly FilterOption[] = PEOPLE.map((person) => ({ value: person.id, label: person.name }));

export const SHIFT_OPTIONS: readonly FilterOption[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'night', label: 'Night' }
];

export const MATERIAL_OPTIONS: readonly FilterOption[] = [
  { value: 'paper', label: 'Paper' },
  { value: 'glass', label: 'Glass' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'organic', label: 'Organic' },
  { value: 'residual', label: 'Residual' }
];
