import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';


/**
 * `tailwind-merge` with the names this package adds to Tailwind's theme.
 *
 * It recognises a class by its value, and a value it has never seen is not a conflict: without this
 * `h-control-md size-6` keeps both and the stylesheet's order decides, so a `className` stops being
 * an override exactly on the steps this package introduced. Every name declared in the stylesheets
 * for a utility a component writes belongs here.
 */
const twMerge = extendTailwindMerge<'scrollbar'>({
  extend: {
    theme: {
      spacing: [ 'control-sm', 'control-md', 'control-lg', 'xs', 'sm', 'md', 'lg', 'xl', '2xl' ],
      font   : [ 'heading' ]
    },
    classGroups: {
      'grid-cols': [ { 'grid-cols': [ 'field', 'field-horizontal' ] } ],
      gap        : [ { gap: [ 'stack', 'cluster', 'grid', 'split', 'item', 'heading' ] } ],
      h          : [ { h: [ 'separator' ] } ],
      scrollbar  : [ { scrollbar: [ 'thin', 'hover', 'none' ] } ],
      animate    : [ { animate: [ 'loading-bar', 'nudge-x', 'nudge-y' ] } ],
      z          : [ { z: [ 'dialog', 'popover', 'toast', 'tooltip' ] } ]
    }
  }
});


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
