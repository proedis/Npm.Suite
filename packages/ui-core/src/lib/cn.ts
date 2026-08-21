import { clsx } from 'clsx';

import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';


/**
 * Compose class names, letting the last conflicting utility win.
 *
 * `clsx` flattens whatever it is given — strings, arrays, conditionals — and `tailwind-merge`
 * resolves the conflicts inside the result, which is what makes `className` an override rather than
 * an addition: `<Stack gap={4} className={'gap-8'} />` renders `gap-8`.
 *
 * That property is the reason every primitive here builds its classes and never inline styles: an
 * inline style would beat the class and the override would silently stop working.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
