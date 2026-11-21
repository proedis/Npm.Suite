import type { ComboboxItem } from '@proedis/ui/forms/combobox';


/*
 * A registry of 240 waste contracts, standing in for the table on the server. Deterministic, so every
 * reader sees the same records: the code is the key a scanner reads, the label the holder.
 */

const SURNAMES = [ 'Rossi', 'Bianchi', 'Ferrero', 'Gallo', 'Bruno', 'Costa', 'Ricci', 'Marino', 'Greco', 'Conti', 'Romano', 'Colombo' ];

const NAMES = [ 'Mario', 'Anna', 'Luca', 'Giulia', 'Paolo', 'Elena', 'Marco', 'Sara', 'Davide', 'Chiara' ];

const STREETS = [ 'Via Roma', 'Corso Torino', 'Via Vittorio Veneto', 'Piazza Cavour', 'Via Garibaldi', 'Strada Cambiano' ];

const TOWNS = [ 'Chieri', 'Pino Torinese', 'Santena', 'Poirino', 'Cambiano', 'Pecetto Torinese' ];

export const CONTRACTS: readonly ComboboxItem[] = Array.from({ length: 240 }, (_, index) => {
  const code = `UT-${String(4800 + index * 4).padStart(6, '0')}`;

  return {
    value      : code,
    code,
    label      : `${SURNAMES[index % SURNAMES.length]} ${NAMES[(index * 7) % NAMES.length]}`,
    description: `${STREETS[index % STREETS.length]} ${(index % 90) + 1}, ${TOWNS[(index * 5) % TOWNS.length]}`
  };
});
