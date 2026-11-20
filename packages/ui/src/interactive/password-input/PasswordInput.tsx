'use client';

import * as React from 'react';

import { EyeGlyph, EyeOffGlyph } from '../text-input/glyphs';
import { TextInput } from '../text-input/TextInput';

import type { TextInputLoadingProps, TextInputProps } from '../text-input/TextInput';


/* --------
 * Types Definition
 * -------- */

export interface PasswordInputLabels {
  /** The name and tooltip of the action while the value is hidden: "Show password" */
  show: string;

  /** The name and tooltip of the action while the value is shown: "Hide password" */
  hide: string;
}

/** The loading pair is put back as the union of `TextInput`: an `Omit` over it flattens it */
export type PasswordInputProps = Omit<TextInputProps, 'type' | 'trailing' | 'autoComplete' | 'loading' | 'loadingLabel'> & TextInputLoadingProps & {
  /** The texts of the show and hide action: the package writes none */
  labels: PasswordInputLabels;

  /**
   * Required, and only the two that mean something here: a password manager fills a sign-in field
   * and offers to generate a new one, and it can only tell which is which from this.
   */
  autoComplete: 'current-password' | 'new-password';
};


/* --------
 * Component Definition
 * -------- */

/**
 * A `TextInput` for a password, with an action at its end that shows and hides the value.
 *
 * ```tsx
 * <PasswordInput autoComplete={'current-password'} labels={{ show: t('…SHOW'), hide: t('…HIDE') }} />
 * ```
 *
 * The name of the action and its icon change together, so the button says what it will do next.
 * No `aria-pressed` on top: with a name that changes, a pressed state would say the same thing twice.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const { labels, ...rest } = props;


  // ----
  // Internal State
  // ----
  const [ visible, setVisible ] = React.useState(false);


  // ----
  // Component Render
  // ----
  return (
    <TextInput
      {...(rest as TextInputProps)}
      ref={ref}
      type={visible ? 'text' : 'password'}
      trailing={(
        <TextInput.Action
          label={visible ? labels.hide : labels.show}
          icon={visible ? <EyeOffGlyph /> : <EyeGlyph />}
          onClick={() => setVisible((current) => !current)}
        />
      )}
    />
  );

});

PasswordInput.displayName = 'PasswordInput';
