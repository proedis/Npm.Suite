'use client';

import * as React from 'react';

import { useForkRef } from '@proedis/react';

import { ClearGlyph, SearchGlyph } from '../../internal/glyphs';

import { TextInput } from '../text-input/TextInput';

import type { TextInputLoadingProps, TextInputProps } from '../text-input/TextInput';


/* --------
 * Types Definition
 * -------- */

export interface SearchInputLabels {
  /** The name and tooltip of the action that empties the field: "Clear search" */
  clear: string;
}

/** The loading pair is put back as the union of `TextInput`: an `Omit` over it flattens it */
export type SearchInputProps = Omit<
  TextInputProps,
  'type' | 'leading' | 'trailing' | 'value' | 'defaultValue' | 'onChange' | 'loading' | 'loadingLabel'
> & TextInputLoadingProps & {
  /** The texts of the clear action: the package writes none */
  labels: SearchInputLabels;

  /** The query, when the caller owns it */
  value?: string;

  /** The starting query, when the field owns it */
  defaultValue?: string;

  /** Every change of the query: typing, the clear action, Esc */
  onValueChange?: (value: string) => void;
};


/* --------
 * Component Definition
 * -------- */

/**
 * A `TextInput` for a search: a lens at the start, a clear action at the end.
 *
 * ```tsx
 * <SearchInput aria-label={t('…SEARCH')} labels={{ clear: t('…CLEAR') }} value={query} onValueChange={setQuery} />
 * ```
 *
 * No visible label as a rule: the lens says what it does, the title or the table beside it says
 * what it searches, and the accessible name comes from the caller.
 *
 * The clear action shows only with a value, and gives the focus back to the field. Esc empties a field
 * that has a value and stops there; on an empty field it goes through, so a dialog around it closes.
 * `type="search"`, with the browser's own clear button hidden: there is one already.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    defaultValue = '',
    labels,
    onKeyDown,
    onValueChange,
    value,
    ...rest
  } = props;


  // ----
  // Internal State
  // ----
  const [ ownValue, setOwnValue ] = React.useState(defaultValue);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const query = value ?? ownValue;


  // ----
  // Handlers
  // ----
  const change = (next: string): void => {
    if (value === undefined) {
      setOwnValue(next);
    }

    onValueChange?.(next);
  };

  const setRefs = useForkRef(inputRef, ref);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    onKeyDown?.(event);

    if (event.defaultPrevented || event.key !== 'Escape' || query === '') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    change('');
  };

  const handleClear = (): void => {
    change('');
    inputRef.current?.focus();
  };


  // ----
  // Component Render
  // ----
  return (
    <TextInput
      {...(rest as TextInputProps)}
      ref={setRefs}
      type={'search'}
      value={query}
      onChange={(event) => change(event.currentTarget.value)}
      onKeyDown={handleKeyDown}
      leading={<SearchGlyph />}
      trailing={query !== '' && (
        <TextInput.Action label={labels.clear} icon={<ClearGlyph />} onClick={handleClear} />
      )}
    />
  );

});

SearchInput.displayName = 'SearchInput';
