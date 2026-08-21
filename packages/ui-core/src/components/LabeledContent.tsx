import * as React from 'react';

import { cn } from '../lib/cn';


/* --------
 * Types Definition
 * -------- */
export interface LabeledContentProps extends Omit<React.ComponentProps<'div'>, 'title'> {
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
      '[&_svg:not([class*=size-])]:size-[18px]'
    )}
  >
    {icon}
  </span>
);

LabeledIcon.displayName = 'LabeledIcon';


/**
 * The label is deliberately **quiet** — secondary colour, light weight — so the value reads as the
 * prominent element. That is the opposite emphasis of a form label, and it is the whole reason this
 * component exists instead of a `<label>`.
 */
const LabeledHeading: React.FunctionComponent<Pick<LabeledContentProps, 'description' | 'label'>> = (props) => (
  <span className={'flex min-w-0 flex-col gap-0.5'}>
    <span className={'text-[13px] leading-snug font-medium text-muted-foreground'}>{props.label}</span>
    {props.description !== null && props.description !== undefined && (
      <span className={'text-xs leading-snug text-muted-foreground/70'}>{props.description}</span>
    )}
  </span>
);

LabeledHeading.displayName = 'LabeledHeading';


/* --------
 * Component Definition
 * -------- */

/**
 * A value with a label: the read-only counterpart of a form field.
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
    ...rest
  } = props;


  // ----
  // Component Render
  // ----
  if (inline) {
    return (
      <div data-slot={'labeled-content'} className={cn('flex items-center justify-between gap-4', className)} {...rest}>
        <div className={'flex min-w-0 items-center gap-3'}>
          {icon !== null && icon !== undefined && <LabeledIcon icon={icon} />}
          <LabeledHeading description={description} label={label} />
        </div>
        <div className={'min-w-0 text-right text-sm font-semibold text-foreground'}>{children}</div>
      </div>
    );
  }

  return (
    /** `items-start`, so the icon indents the whole column: label, description and value stay aligned */
    <div data-slot={'labeled-content'} className={cn('flex items-start gap-3', className)} {...rest}>
      {icon !== null && icon !== undefined && <LabeledIcon icon={icon} />}
      <div className={'flex min-w-0 flex-1 flex-col gap-1'}>
        <LabeledHeading description={description} label={label} />
        <div className={'text-sm font-semibold text-foreground'}>{children}</div>
      </div>
    </div>
  );

}

LabeledContent.displayName = 'LabeledContent';
