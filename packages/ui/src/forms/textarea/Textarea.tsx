'use client';

import * as React from 'react';

import { Field as FieldPrimitive } from '@base-ui/react/field';

import { useEnhancedEffect, useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { bindable } from '../../core/binding';
import { cn } from '../../core/cn';

import { useFieldControl } from '../field/fieldContext';
import { TEXT_CONTROL_SELF, TEXT_CONTROL_TEXT, textControlState } from '../text-control/textControl';

import type { BaseProps } from '../../core/base';
import type { BoundValue } from '../../core/binding';


/* --------
 * Types Definition
 * -------- */

export interface StrictTextareaProps extends BaseProps {
  /** Lines at the start. Defaults to 3 */
  rows?: number;

  /** Lines at most, dragging the handle or in read only. Defaults to 12 */
  maxRows?: number;

  /** The error state. Inside a `Field` with an `error` it is on already */
  invalid?: boolean;

  className?: string;
}

/**
 * `maxLength` is left out on purpose: a native limit blocks typing and cuts a pasted text without
 * saying so. The limit is the caller's, shown by the `counter` of its `Field`.
 */
export type TextareaProps = StrictTextareaProps & Omit<
  React.ComponentProps<'textarea'>,
  keyof StrictTextareaProps | 'maxLength' | 'ref'
>;


/* --------
 * Helpers
 * -------- */

/** Read only, the height follows the text, from one line to `maxRows`; the cap is the stylesheet's */
function fitToContent(element: HTMLTextAreaElement): void {
  const style = getComputedStyle(element);
  const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight + borders}px`;
}


/* --------
 * Component Definition
 * -------- */

/**
 * The multi-line text field: the border of a `TextInput`, three lines to start, longer by hand.
 *
 * ```tsx
 * <Field span={6} label={'Notes'} counter={'{note.length}/250'}>
 *   <Textarea placeholder={'E.g. wet material, repeated weighing'} />
 * </Field>
 * ```
 *
 * One size, the `md` of TextInput: its first line falls where the text of the field beside it does.
 * The height does not change while typing, so the form stays still; the browser's handle lengthens
 * it vertically up to `maxRows`. Enter goes to a new line, Tab leaves. Read only it is as tall as its
 * text, measured, since `field-sizing: content` is not in every browser.
 *
 * Slot: `textarea` (with `data-invalid`, `data-readonly`, `data-disabled`).
 */
const TextareaBase = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    disabled = false,
    invalid = false,
    maxRows = 12,
    readOnly = false,
    rows = 3,
    style,
    value,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();

  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);


  // ----
  // Lifecycle Events
  // ----
  useEnhancedEffect(() => {
    const element = innerRef.current;

    if (!readOnly || !element) {
      if (element) {
        element.style.height = '';
      }

      return undefined;
    }

    fitToContent(element);

    /* A narrower column wraps the text on more lines */
    const observer = new ResizeObserver(() => fitToContent(element));

    observer.observe(element);

    return () => observer.disconnect();
  }, [ readOnly, value ]);


  // ----
  // Handlers
  // ----
  const setRefs = useForkRef(innerRef, ref);


  // ----
  // Component Render
  // ----
  const isDisabled = disabled || field.disabled;
  const isInvalid = invalid || field.invalid;

  return (
    <FieldPrimitive.Control
      render={(
        <textarea
          {...rest}
          ref={setRefs}
          rows={readOnly ? 1 : rows}
          value={value}
          style={{
            ...style,
            '--textarea-rows'    : readOnly ? 1 : rows,
            '--textarea-max-rows': maxRows
          } as React.CSSProperties}
        />
      )}
      disabled={isDisabled}
      readOnly={readOnly}
      aria-required={field.required || undefined}
      aria-invalid={isInvalid || undefined}
      data-slot={'textarea'}
      data-field-control={''}
      {...textControlState({ invalid: isInvalid, readOnly, disabled: isDisabled, status: field.status })}
      className={cn(
        TEXT_CONTROL_SELF,
        TEXT_CONTROL_TEXT,
        'block w-full px-2.5 py-1.25 textarea-bounds scrollbar-thin',
        readOnly || isDisabled ? 'resize-none' : 'resize-y',
        baseClasses,
        className
      )}
    />
  );

});

TextareaBase.displayName = 'Textarea';

/** Bound to a form through `binding`: see `bindable` in core */
export const Textarea = bindable(TextareaBase, {
  kind: 'text',
  bind: (field: BoundValue<string>) => ({
    name    : field.name,
    ref     : field.ref,
    value   : field.value ?? '',
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => field.onChange(event.currentTarget.value),
    onBlur  : field.onBlur
  })
});
