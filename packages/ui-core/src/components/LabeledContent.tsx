import * as React from 'react';

import { splitBaseProps } from '../lib/base';
import { cn } from '../lib/cn';

import type { BaseProps } from '../lib/base';

import { Label } from './Label';


/* --------
 * Types Definition
 * -------- */
export interface LabeledContentProps extends Omit<React.ComponentProps<'div'>, 'title'>, BaseProps {
  /** The value being labelled */
  children: React.ReactNode;

  /** A second line under the label: the unit, the format, where the number comes from */
  description?: React.ReactNode;

  /** Shown left of the label, and it indents the whole text column */
  icon?: React.ReactNode;

  /** Label on the left, value on the right — the shape a settings or a summary row wants */
  inline?: boolean;

  label: React.ReactNode;
}


/* --------
 * Internal Components
 * -------- */
const LabeledIcon: React.FunctionComponent<{ icon: React.ReactNode }> = ({ icon }) => (
  <span
    className={cn(
      'flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground',
      '[&_svg:not([class*=size-])]:size-4.5'
    )}
  >
    {icon}
  </span>
);

LabeledIcon.displayName = 'LabeledIcon';


/* --------
 * Component Definition
 * -------- */

/**
 * A value with a label: the read-only counterpart of a form field.
 *
 * The label goes through `Label` in its **quiet** emphasis, which is the whole reason that component
 * has two: here the value is the prominent element and a label competing with it flattens the pair.
 * It renders as a `span`, since there is no control to point at.
 *
 * Reads `--muted`, `--muted-foreground`, `--foreground` and the radius scale.
 */
export function LabeledContent(props: LabeledContentProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    description,
    icon,
    inline = false,
    label,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  if (inline) {
    return (
      <div data-slot={'labeled-content'} className={cn('flex items-center justify-between gap-4', baseClasses, className)} {...rest}>
        <div className={'flex min-w-0 items-center gap-3'}>
          {icon !== null && icon !== undefined && <LabeledIcon icon={icon} />}
          <Label as={'span'} description={description} emphasis={'quiet'}>{label}</Label>
        </div>
        <div className={'min-w-0 text-right text-sm font-semibold text-foreground'}>{children}</div>
      </div>
    );
  }

  return (
    /** `items-start`, so the icon indents the whole column: label, description and value stay aligned */
    <div data-slot={'labeled-content'} className={cn('flex items-start gap-3', baseClasses, className)} {...rest}>
      {icon !== null && icon !== undefined && <LabeledIcon icon={icon} />}
      <div className={'flex min-w-0 flex-1 flex-col gap-1'}>
        <Label as={'span'} description={description} emphasis={'quiet'}>{label}</Label>
        <div className={'text-sm font-semibold text-foreground'}>{children}</div>
      </div>
    </div>
  );

}

LabeledContent.displayName = 'LabeledContent';
