'use client';

import * as React from 'react';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card';

import { inertValue } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';
import { linkProps } from '../../core/link';

import { Tooltip } from '../tooltip/Tooltip';

import type { BaseProps } from '../../core/base';
import type { LinkTarget } from '../../core/link';


/* --------
 * Types Definition
 * -------- */

export type AvatarSize = 24 | 32 | 40 | 56;

/** Who the circle stands for. A union: combinations with no look do not compile */
export type AvatarIdentity =
  | {
    kind: 'person';
    name: string;

    /** Two letters, from the one helper of the application: first surname, first given name */
    initials: string;

    /** Already usable by an `<img>`: a URL that needs the token arrives as a blob URL */
    src?: string;

    /** The user of the application: `primary-soft` */
    current?: boolean;

    /** Dashed, grey photo. Wins over `current` */
    inactive?: boolean;
  }
  | { kind: 'organization'; name: string; inactive?: boolean }
  | { kind: 'system'; name: string }

  /** The reference is there but the person cannot be read: deleted, of another tenant, not visible */
  | { kind: 'unknown'; name: string };

export type AvatarProps = AvatarIdentity & BaseProps & {
  /** Defaults to 24 */
  size?: AvatarSize;

  /** Next to the name it is decorative; alone it has a name and a tooltip. Defaults to `false` */
  decorative?: boolean;

  /** Read after the name when alone: "account disabled" */
  stateLabel?: string;

  className?: string;
};

export interface PersonProps extends BaseProps {
  /** The circle; decorative here */
  avatar: AvatarIdentity;

  /** The written name. It truncates with an ellipsis */
  name: React.ReactNode;

  /** The state, never truncated: "(account disabled)" */
  suffix?: React.ReactNode;

  /** The person's page: the name becomes a real link */
  target?: LinkTarget;

  /** The content of the card shown on hover and on focus, under its head */
  preview?: React.ReactNode;

  /** `stacked` for a history: the person above, `children` (the action) under. Defaults to `inline` */
  layout?: 'inline' | 'stacked';

  /** The second line of `stacked` */
  children?: React.ReactNode;

  className?: string;
}

export interface AvatarGroupItem {
  readonly id: string;
  readonly avatar: AvatarIdentity;
  readonly name: React.ReactNode;
  readonly target?: LinkTarget;

  /** The second line in the list */
  readonly description?: React.ReactNode;
}

export interface AvatarGroupProps extends BaseProps {
  items: readonly AvatarGroupItem[];

  /** Circles shown at most. The count appears from two hidden up. Defaults to 3 */
  max?: number;

  /** The name of the button, with every name: "Operators: Rossi Mario, Bianchi Laura" */
  label: string;

  /** The head of the list: "Operators · AT-1188" */
  title: React.ReactNode;

  /** 24 in a table, 32 elsewhere. Defaults to 24 */
  size?: 24 | 32;

  className?: string;
}


/* --------
 * Constants Definition
 * -------- */

const SIZES: Readonly<Record<AvatarSize, string>> = {
  24: 'size-6 text-2xs [&_svg]:size-3.5',
  32: 'size-8 text-xs [&_svg]:size-4',
  40: 'size-10 text-sm [&_svg]:size-5',
  56: 'size-14 text-xl [&_svg]:size-6'
};

const OVERLAP: Readonly<Record<24 | 32, string>> = { 24: '-space-x-0.5', 32: '-space-x-1' };


/* --------
 * Glyphs
 * -------- */

const GLYPHS = {
  organization: [ 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z', 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2', 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', 'M10 6h4', 'M10 10h4', 'M10 14h4', 'M10 18h4' ],
  system      : [ 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z' ],
  unknown     : [ 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' ]
} as const;

function KindGlyph(props: { kind: keyof typeof GLYPHS }): React.ReactNode {
  return (
    <svg
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
    >
      {GLYPHS[props.kind].map((path) => <path key={path} d={path} />)}
    </svg>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * The circle of a person: a photo or two initials, or the icon of an organization, of the system, of
 * a person who cannot be read. Four sizes. No colour per person: the user of the application is
 * `primary-soft`, an inactive one is dashed.
 *
 * ```tsx
 * <Avatar kind={'person'} name={'Rossi Mario'} initials={'RM'} size={32} />
 * ```
 *
 * Alone it has a name and a tooltip saying the same, with the state; next to a written name (in
 * `Person`, `AvatarGroup`) it is decorative. The initials appear at once without a photo, after a
 * moment with one, so a fast photo never flashes letters.
 *
 * Parts with a slot: `avatar` (with `data-kind`, `data-size`, `data-current`, `data-inactive`),
 * `avatar-image`, `avatar-fallback`.
 */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const { className, decorative = false, hideBelow, hideFrom, size = 24, stateLabel, ...identity } = props;
  const { baseClasses } = splitBaseProps({ hideBelow, hideFrom });


  // ----
  // Style Computation
  // ----
  const inactive = 'inactive' in identity && identity.inactive === true;
  const current = identity.kind === 'person' && identity.current === true && !inactive;
  const src = identity.kind === 'person' ? identity.src : undefined;

  let tone = 'bg-muted text-muted-foreground';

  if (inactive) {
    tone = 'border border-dashed border-input bg-transparent text-muted-foreground';
  }
  else if (current) {
    tone = 'bg-primary-soft text-primary-soft-foreground';
  }
  else if (identity.kind === 'person') {
    tone = 'bg-muted text-foreground/80';
  }

  const name = stateLabel ? `${identity.name}, ${stateLabel}` : identity.name;


  // ----
  // Component Render
  // ----
  const circle = (
    <AvatarPrimitive.Root
      ref={ref}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? undefined : 0}
      data-slot={'avatar'}
      data-kind={identity.kind}
      data-size={size}
      data-current={current || undefined}
      data-inactive={inactive || undefined}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold select-none',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:inset-ring after:inset-ring-foreground/8',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        SIZES[size],
        tone,
        baseClasses,
        className
      )}
    >
      {src && (
        <AvatarPrimitive.Image src={src} alt={''} data-slot={'avatar-image'} className={cn('size-full object-cover', inactive && 'grayscale')} />
      )}
      <AvatarPrimitive.Fallback delay={src ? 600 : undefined} data-slot={'avatar-fallback'} className={'inline-flex items-center justify-center'}>
        {identity.kind === 'person' ? identity.initials : <KindGlyph kind={identity.kind} />}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );

  return decorative ? circle : <Tooltip content={name}>{circle}</Tooltip>;

});

Avatar.displayName = 'Avatar';


/**
 * A person with a name: the avatar, the name, the state, and a card on hover and on focus. The name
 * is a link when the person has a page, a button that looks like text when there is only the card,
 * plain text otherwise.
 *
 * ```tsx
 * <Person
 *   avatar={{ kind: 'person', name, initials }}
 *   name={name}
 *   target={navigation.operator(id)}
 *   preview={<OperatorCard id={id} />}
 * />
 * ```
 *
 * The card opens after 600ms and closes after 300, so crossing a column of names does not open one
 * after the other; Esc closes it. It is a preview: nothing in it is a Tab stop, and the page is
 * reached by clicking the name. `stacked` puts the action of a history under the person.
 *
 * Parts with a slot: `person` (with `data-layout`), `person-name`, `person-suffix`, `person-detail`,
 * `person-card`.
 */
export function Person(props: PersonProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { avatar, children, className, layout = 'inline', name, preview, suffix, target } = props;
  const { baseClasses } = splitBaseProps(props);


  // ----
  // Component Render
  // ----
  const stacked = layout === 'stacked';
  const muted = avatar.kind === 'system' || avatar.kind === 'unknown';
  const hasPreview = preview !== null && preview !== undefined && !muted;

  const nameClasses = cn(
    'min-w-0 truncate rounded-sm text-start outline-none',
    'focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    stacked ? 'font-semibold' : 'font-normal',
    muted ? 'text-muted-foreground' : 'text-foreground'
  );

  let nameElement: React.ReactElement;

  if (target && !muted) {
    nameElement = (
      <a {...linkProps(target)} data-slot={'person-name'} className={cn(nameClasses, 'hover:underline')}>
        {name}
      </a>
    );
  }
  else if (hasPreview) {
    nameElement = <button type={'button'} data-slot={'person-name'} className={cn(nameClasses, 'cursor-default')}>{name}</button>;
  }
  else {
    nameElement = <span data-slot={'person-name'} className={nameClasses}>{name}</span>;
  }

  const withCard = hasPreview
    ? (
      <PreviewCardPrimitive.Root>
        <PreviewCardPrimitive.Trigger delay={600} closeDelay={300} render={nameElement} />
        <PreviewCardPrimitive.Portal>
          <PreviewCardPrimitive.Positioner sideOffset={8} collisionPadding={8} className={'z-popover'}>
            <PreviewCardPrimitive.Popup
              data-slot={'person-card'}
              className={cn(
                'w-75 rounded-md bg-popover p-4 text-sm text-popover-foreground shadow-md outline-none wrap-anywhere',
                'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:transition-none motion-reduce:transition-none'
              )}
            >
              <div className={'flex items-center gap-3'}>
                <Avatar {...avatar} size={40} decorative />
                <div className={'min-w-0 font-semibold'}>{name}</div>
              </div>
              <div inert={inertValue(true)} className={'mt-3 flex flex-col gap-2'}>{preview}</div>
            </PreviewCardPrimitive.Popup>
          </PreviewCardPrimitive.Positioner>
        </PreviewCardPrimitive.Portal>
      </PreviewCardPrimitive.Root>
    )
    : nameElement;

  const nameLine = (
    <span className={'flex min-w-0 items-baseline gap-1'}>
      {withCard}
      {suffix !== null && suffix !== undefined && suffix !== '' && (
        <span data-slot={'person-suffix'} className={'shrink-0 text-muted-foreground'}>{suffix}</span>
      )}
    </span>
  );

  return (
    <span data-slot={'person'} data-layout={layout} className={cn('inline-flex max-w-full min-w-0 items-start gap-2 text-sm', baseClasses, className)}>
      <Avatar {...avatar} size={24} decorative className={stacked ? undefined : '-my-0.5'} />
      {stacked
        ? (
          <span className={'flex min-w-0 flex-col'}>
            {nameLine}
            {children !== null && children !== undefined && (
              <span data-slot={'person-detail'} className={'text-muted-foreground'}>{children}</span>
            )}
          </span>
        )
        : nameLine}
    </span>
  );

}

Person.displayName = 'Person';


/**
 * Several people in a cell: only circles, at most three, then the count. On hover the list of
 * everybody opens; from the keyboard the group is one button, and Enter or Space opens the same list.
 *
 * ```tsx
 * <AvatarGroup items={operators} label={t('…', { names })} title={`Operators · ${code}`} />
 * ```
 *
 * With four people all four show: the count appears from two hidden up. Past 9 it is a pill, past 99
 * "99+". One person is written as a `Person`, nobody as "—": that is the caller's. Each circle has a
 * 2px ring in `--avatar-ring`, the colour of what is under it.
 *
 * Parts with a slot: `avatar-group`, `avatar-group-count`, `avatar-group-list`.
 */
export function AvatarGroup(props: AvatarGroupProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, items, label, max = 3, size = 24, title } = props;
  const { baseClasses } = splitBaseProps(props);


  // ----
  // Component Render
  // ----
  const shownCount = items.length - max >= 2 ? max : items.length;
  const hidden = items.length - shownCount;
  const countText = hidden > 99 ? '99+' : `+${hidden}`;

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        openOnHover
        delay={600}
        closeDelay={300}
        aria-label={label}
        data-slot={'avatar-group'}
        className={cn(
          'inline-flex shrink-0 cursor-default items-center rounded-full outline-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          OVERLAP[size],
          baseClasses,
          className
        )}
      >
        {items.slice(0, shownCount).map((item) => (
          <Avatar key={item.id} {...item.avatar} size={size} decorative className={'ring-2 avatar-ring'} />
        ))}
        {hidden > 0 && (
          <span
            aria-hidden
            data-slot={'avatar-group-count'}
            className={cn(
              'relative inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground tabular-nums ring-2 avatar-ring',
              size === 24 ? 'h-6 text-2xs' : 'h-8 text-xs',
              hidden > 9 ? 'px-1.5' : size === 24 ? 'w-6' : 'w-8'
            )}
          >
            {countText}
          </span>
        )}
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={8} collisionPadding={8} align={'start'} className={'z-popover'}>
          <PopoverPrimitive.Popup
            data-slot={'avatar-group-list'}
            className={cn(
              'flex max-h-(--available-height) w-75 flex-col overflow-y-auto overscroll-contain rounded-md bg-popover p-3 text-sm text-popover-foreground shadow-md outline-none',
              'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:transition-none motion-reduce:transition-none'
            )}
          >
            <PopoverPrimitive.Title className={'mb-2 text-xs font-semibold text-muted-foreground'}>{title}</PopoverPrimitive.Title>
            <ul className={'flex flex-col gap-2'}>
              {items.map((item) => (
                <li key={item.id}>
                  <Person avatar={item.avatar} name={item.name} target={item.target} layout={item.description ? 'stacked' : 'inline'}>
                    {item.description}
                  </Person>
                </li>
              ))}
            </ul>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );

}

AvatarGroup.displayName = 'AvatarGroup';
