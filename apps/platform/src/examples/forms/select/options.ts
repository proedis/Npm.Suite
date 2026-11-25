import type { SelectOption } from '@proedis/ui/forms/select';


/** A few depots: under the threshold, a plain list */
export const DEPOTS: readonly SelectOption[] = [
  { value: 'chieri', label: 'Chieri' },
  { value: 'moncalieri', label: 'Moncalieri' },
  { value: 'pinerolo', label: 'Pinerolo' },
  { value: 'carmagnola', label: 'Carmagnola' },
  { value: 'rivoli', label: 'Rivoli' }
];

/** Twenty towns: past the threshold of eight, the list gets a search */
export const TOWNS: readonly SelectOption[] = [
  'Andezeno', 'Arignano', 'Baldissero Torinese', 'Cambiano', 'Cantù', 'Carmagnola', 'Chieri', 'Forlì',
  'Marentino', 'Mombello di Torino', 'Moncalieri', 'Montaldo Torinese', 'Pavarolo', 'Pecetto Torinese',
  'Pino Torinese', 'Poirino', 'Riva presso Chieri', 'Saint-Vincent', 'Santena', 'Villastellone'
].map((name) => ({ value: name.toLowerCase().replace(/[^a-z]+/g, '-'), label: name }));
