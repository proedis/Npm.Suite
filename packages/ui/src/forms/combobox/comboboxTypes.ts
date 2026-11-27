import type * as React from 'react';

import type { BaseProps } from '../../core/base';

import type { TextControlSize } from '../text-control/textControl';


/* --------
 * Types Definition
 * -------- */

export interface ComboboxItem {
  /** The key of the record */
  readonly value: string;

  /** Its name: the first line, and the text of the field at rest */
  readonly label: string;

  /** Its code, on the right of the field and at the start of the second line */
  readonly code?: string;

  /** The rest of the second line: an address, a description */
  readonly description?: string;

  readonly disabled?: boolean;
}

export interface ComboboxLabels {
  /** An example, as in a TextInput: "E.g. Rossi or UT-004812" */
  readonly placeholder?: string;

  /** The hint under the minimum: "Type at least 2 characters: code, holder or address" */
  readonly minChars: string;

  /** "Searching…", shown only when the answer is slow */
  readonly searching: string;

  /** Announced on arrival: "5 contracts found" */
  readonly results: (count: number) => string;

  /** "No contract for «rossx»" */
  readonly noResults: (text: string) => string;

  /** The footer past the limit: "First 50 shown: type more to narrow the search" */
  readonly tooMany: (count: number) => string;

  /** "Search failed" */
  readonly error: string;

  /** The one item offered after an error */
  readonly retry: string;

  /** Name and tooltip of the x that empties an optional field */
  readonly clear: string;

  /** Name and tooltip of the x that empties the text typed */
  readonly clearSearch: string;

  /** The line that recalls the value while typing: "Current value: Rossi Mario · UT-004812" */
  readonly current: (label: string) => string;
}

/** What the two variants share: the search and the states of a field */
export interface StrictComboboxSearchProps extends BaseProps {
  /** The results of the current search */
  items: readonly ComboboxItem[];

  /** Every change of the text typed: the caller's search term */
  onInputValueChange?: (text: string) => void;

  /** A search is on its way: debouncing or travelling */
  searching?: boolean;

  /** The search failed after its retry: the list offers "Retry" */
  searchError?: boolean;
  onRetry?: () => void;

  /** More results than shown exist */
  hasMore?: boolean;

  /** Under this many characters nothing is searched. Defaults to 2 */
  minChars?: number;

  /** Defaults to `md` */
  size?: TextControlSize;

  /** No x on a value, and an emptied text gives the value back on leaving */
  required?: boolean;

  /** The name the key is submitted under */
  name?: string;

  invalid?: boolean;
  readOnly?: boolean;
  disabled?: boolean;

  /** Classes for the frame, last so they win */
  className?: string;
}
export type ComboboxSearchProps = StrictComboboxSearchProps;


export interface StrictSingleComboboxProps extends ComboboxSearchProps {
  multiple?: false;

  /**
   * The term `items` answer. Enter during a search waits until it matches the text, then picks an
   * exact code. Single only: the multiple field has no pending Enter, so it does not take these two
   */
  resultsFor?: string;

  /** Ends the debounce at once, so Enter from a scanner does not wait the delay */
  onFlush?: () => void;

  /** The key of the chosen record, or `null` */
  value?: string | null;
  onValueChange?: (value: string | null, item: ComboboxItem | null) => void;

  /** The record of the value: the field shows it without asking the server, even if no search finds it */
  selectedItem?: ComboboxItem | null;

  labels: ComboboxLabels;
}

/** The multiple field has no x of its own: `clear` and `clearSearch` are not asked for */
export interface MultipleComboboxLabels extends Omit<ComboboxLabels, 'clear' | 'clearSearch'> {
  /** The footer action that clears every value */
  readonly clearAll: string;

  /** Name and tooltip of the x of a chip */
  readonly remove: (label: string) => string;

  /** Name of the "+N" chip */
  readonly more: (count: number) => string;

  /** The closing line of the "+N" tooltip past the tenth value */
  readonly moreRest: (count: number) => string;
}

export interface StrictMultipleComboboxProps extends ComboboxSearchProps {
  multiple: true;

  /** The keys of the chosen records, in the order they were chosen */
  value?: readonly string[];
  onValueChange?: (values: string[], items: ComboboxItem[]) => void;

  /** The records of the values: the chips take their labels from here, not from the current results */
  selectedItems: readonly ComboboxItem[];

  /** Chips shown at most; the rest go into "+N". Defaults to 3 */
  maxChips?: number;

  labels: MultipleComboboxLabels;
}

/** The frame takes `className` and the shared props; the native props and the ref reach the text */
export type SingleComboboxProps = StrictSingleComboboxProps & Omit<
  React.ComponentProps<'input'>,
  keyof StrictSingleComboboxProps | 'ref' | 'children' | 'value' | 'defaultValue' | 'onChange' | 'size' | 'type'
>;

/** The frame takes `className` and the shared props; the native props and the ref reach the button under the chips */
export type MultipleComboboxProps = StrictMultipleComboboxProps & Omit<
  React.ComponentProps<'button'>,
  keyof StrictMultipleComboboxProps | 'ref' | 'children' | 'value' | 'defaultValue' | 'onChange' | 'type'
>;

export type StrictComboboxProps = StrictSingleComboboxProps | StrictMultipleComboboxProps;

export type ComboboxProps = SingleComboboxProps | MultipleComboboxProps;
