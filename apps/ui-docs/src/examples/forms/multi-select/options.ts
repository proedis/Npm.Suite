/** The kinds of waste a round collects: under the threshold, a plain list of boxes */
export const WASTE = [
  { value: 'paper', label: 'Paper' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'glass', label: 'Glass' },
  { value: 'organic', label: 'Organic' },
  { value: 'residual', label: 'Residual' },
  { value: 'green', label: 'Garden waste' }
];

/** Twenty towns: past the threshold, a search and the footer act on what it finds */
export const TOWNS = [
  'Andezeno', 'Arignano', 'Baldissero Torinese', 'Cambiano', 'Carmagnola', 'Chieri', 'Isolabella', 'Marentino',
  'Mombello di Torino', 'Moncalieri', 'Montaldo Torinese', 'Moriondo Torinese', 'Pavarolo', 'Pecetto Torinese',
  'Pino Torinese', 'Poirino', 'Riva presso Chieri', 'Santena', 'Trofarello', 'Villastellone'
].map((name) => ({ value: name.toLowerCase().replace(/[^a-z]+/g, '-'), label: name }));
