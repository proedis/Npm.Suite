'use client';

import * as React from 'react';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { CheckGlyph } from '../../internal/glyphs';

import { LIST_ITEM } from '../list-panel/listPanel';

import { MenuContext, Panel, useAfterClose, useMenuContext } from './menuPanel';

import type { LinkTarget } from '../../core/link';


/* --------
 * Types Definition
 * -------- */

export interface MenuProps {
  /** Normally an icon button with the ⋯. It must forward its ref; it stays pressed while the menu is open */
  trigger: React.ReactElement;

  /** The name of the menu, with its object: "Actions on SG-2038" */
  'aria-label': string;

  /** Defaults to `bottom`, flipping on its own */
  side?: 'bottom' | 'top';

  /** Defaults to `end`: from a ⋯ at the end of a row the menu lines up with its right edge */
  align?: 'start' | 'end';

  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  children: React.ReactNode;
  className?: string;
}

export interface MenuItemProps {
  /** The label */
  children: React.ReactNode;

  /** A 16px icon: on every item of the menu or on none */
  icon?: React.ReactNode;

  /** `destructive` goes last, after a separator, and always opens a confirmation */
  tone?: 'default' | 'destructive';

  /** Not available: reachable with the arrows, never run */
  disabled?: boolean;

  /** The reason it is not available, under the label. An item off with no reason is not shown at all */
  description?: React.ReactNode;

  /**
   * What it does. Called once the menu has closed, so a dialog it opens finds the focus on the
   * control and gives it back there
   */
  onSelect?: () => void;

  /** Or where it goes: a real link, with the middle click and a new tab */
  to?: LinkTarget;

  className?: string;
}

export interface MenuGroupProps {
  /** The small title, only when groups act on different things, and saying on what */
  label?: React.ReactNode;
  children: React.ReactNode;
}

export interface MenuRadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;

  /** The small title of the choice: "Sort by" */
  label?: React.ReactNode;

  children: React.ReactNode;
}

export interface MenuRadioItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface MenuCheckboxItemProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface MenuSubmenuProps {
  /** The item that opens it */
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
}


/* --------
 * Constants Definition
 * -------- */


/** The item of the Select's list, with the keyboard ring and the disabled look on the label only */
const ITEM = cn(
  LIST_ITEM,
  'group/menu-item data-disabled:opacity-100',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
  'data-popup-open:bg-accent'
);

const ITEM_TONE = {
  default    : '',
  destructive: 'text-destructive data-highlighted:bg-destructive-soft data-highlighted:text-destructive-soft-foreground'
} as const;

const ITEM_ICON = 'mt-0.5 shrink-0 text-muted-foreground group-data-disabled/menu-item:opacity-50 [&_svg]:size-4';

/** The mark at the end of a checkbox or radio item, shown when it is chosen */
const ITEM_INDICATOR = <Stack as={'span'} inline direction={'horizontal'} />;

/** The layout of an item (`LIST_ITEM`): a row aligned at the top, given through `render` to the Base UI part */
const ITEM_LAYOUT = <Stack direction={'horizontal'} align={'start'} gap={2} />;

/** The same row for the item that is a link, which Base UI renders as an anchor */
const LINK_ITEM_LAYOUT = <Stack as={'a'} direction={'horizontal'} align={'start'} gap={2} />;


/* --------
 * Helpers
 * -------- */

/** The icon before the label of an item */
function ItemIcon(props: { className?: string; children: React.ReactNode }): React.ReactNode {
  return (
    <Stack as={'span'} data-slot={'menu-item-icon'} inline direction={'horizontal'} className={cn(ITEM_ICON, props.className)}>
      {props.children}
    </Stack>
  );
}

function ChevronEndGlyph(): React.ReactNode {
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
      className={'ms-auto mt-0.5 size-4 shrink-0 text-muted-foreground rtl:rotate-180'}
    >
      <path d={'m9 18 6-6-6-6'} />
    </svg>
  );
}

function ItemContent(props: {
  icon?: React.ReactNode;
  tone: 'default' | 'destructive';
  description?: React.ReactNode;
  descriptionId: string;
  children: React.ReactNode;
}): React.ReactNode {
  const { children, description, descriptionId, icon, tone } = props;

  return (
    <React.Fragment>
      {icon !== null && icon !== undefined && (
        <ItemIcon className={tone === 'destructive' ? 'text-current' : undefined}>{icon}</ItemIcon>
      )}
      <Stack as={'span'} data-slot={'menu-item-text'} className={'min-w-0 flex-1'}>
        <span data-slot={'menu-item-label'} className={'group-data-disabled/menu-item:opacity-50'}>{children}</span>
        {description !== null && description !== undefined && description !== '' && (
          <span id={descriptionId} data-slot={'menu-item-description'} className={'text-xs text-muted-foreground'}>
            {description}
          </span>
        )}
      </Stack>
    </React.Fragment>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * The list of actions on a thing: the ⋯ of a row, the rest of an action bar, a few view choices that
 * apply at once ("Sort by"). The panel and the items are the Select's list.
 *
 * ```tsx
 * <Menu trigger={<IconButton label={'Actions'} icon={<Ellipsis />} />} aria-label={`Actions on ${code}`}>
 *   <Menu.Item icon={<Pencil />} onSelect={edit}>Edit</Menu.Item>
 *   <Menu.Item icon={<ExternalLink />} to={navigation.detail(id)}>Open</Menu.Item>
 *   <Menu.Separator />
 *   <Menu.Item icon={<Trash />} tone={'destructive'} onSelect={askDelete}>Delete</Menu.Item>
 * </Menu>
 * ```
 *
 * Not modal: the page scrolls and the click outside reaches what is under it. The arrows stop at the
 * first and last item instead of looping. Items not available stay reachable with their reason under
 * the label. An item's action runs once the menu has closed, so a dialog it opens gives the focus back
 * to the ⋯. Checkbox and radio items keep the menu open. When the control leaves the view the menu
 * closes. Opened with the pointer it has no active item.
 *
 * Parts with a slot: `menu` (the panel), `menu-item` (with `data-tone`), `menu-item-icon`,
 * `menu-item-text`, `menu-item-label`, `menu-item-description`, `menu-group`, `menu-group-label`,
 * `menu-separator`, `menu-checkbox-item`, `menu-checkbox-item-indicator`, `menu-radio-item`,
 * `menu-radio-item-indicator`, `menu-submenu-trigger`.
 */
function MenuRoot(props: MenuProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-label': ariaLabel,
    align = 'end',
    children,
    className,
    onOpenChange,
    open: openProp,
    side = 'bottom',
    trigger
  } = props;


  // ----
  // Internal State
  // ----
  const [ ownOpen, setOwnOpen ] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const { context, handleOpenChangeComplete } = useAfterClose(triggerRef);

  const open = openProp ?? ownOpen;


  // ----
  // Handlers
  // ----
  const setOpen = React.useCallback((next: boolean): void => {
    if (openProp === undefined) {
      setOwnOpen(next);
    }

    onOpenChange?.(next);
  }, [ openProp, onOpenChange ]);

  const closeOnHidden = React.useCallback(() => setOpen(false), [ setOpen ]);


  // ----
  // Component Render
  // ----
  return (
    <MenuContext.Provider value={context}>
      <MenuPrimitive.Root
        open={open}
        onOpenChange={(next) => setOpen(next)}
        onOpenChangeComplete={handleOpenChangeComplete}
        modal={false}
        loopFocus={false}
      >
        <MenuPrimitive.Trigger ref={triggerRef} render={trigger} />

        <Panel side={side} align={align} label={ariaLabel} onAnchorHidden={closeOnHidden} className={className}>
          {children}
        </Panel>
      </MenuPrimitive.Root>
    </MenuContext.Provider>
  );

}

MenuRoot.displayName = 'Menu';


const MenuItem = React.forwardRef<HTMLElement, MenuItemProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    description,
    disabled = false,
    icon,
    onSelect,
    to,
    tone = 'default'
  } = props;


  // ----
  // Internal Hooks
  // ----
  const { afterClose } = useMenuContext();
  const descriptionId = React.useId();


  // ----
  // Component Render
  // ----
  const hasDescription = description !== null && description !== undefined && description !== '';

  const shared = {
    'data-slot'       : 'menu-item',
    'data-tone'       : tone,
    'aria-describedby': hasDescription ? descriptionId : undefined,
    className         : cn(ITEM, ITEM_TONE[tone], className)
  };

  const content = (
    <ItemContent icon={icon} tone={tone} description={description} descriptionId={descriptionId}>
      {children}
    </ItemContent>
  );

  /* A link that is off has no href: Base UI's link item has no disabled state, a plain item does */
  if (to && !disabled) {
    return (
      <MenuPrimitive.LinkItem
        {...shared}
        render={LINK_ITEM_LAYOUT}
        ref={ref as React.Ref<HTMLAnchorElement>}
        closeOnClick
        href={to.href}
        onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
          }

          event.preventDefault();
          afterClose(to.go);
        }}
      >
        {content}
      </MenuPrimitive.LinkItem>
    );
  }

  return (
    <MenuPrimitive.Item
      {...shared}
      render={ITEM_LAYOUT}
      ref={ref as React.Ref<HTMLDivElement>}
      disabled={disabled}
      onClick={() => {
        if (onSelect) {
          afterClose(onSelect);
        }
      }}
    >
      {content}
    </MenuPrimitive.Item>
  );

});

MenuItem.displayName = 'Menu.Item';


function MenuGroup(props: MenuGroupProps): React.ReactNode {
  const { children, label } = props;

  return (
    <MenuPrimitive.Group data-slot={'menu-group'}>
      {label !== null && label !== undefined && label !== '' && (
        <MenuPrimitive.GroupLabel data-slot={'menu-group-label'} className={'px-2 pt-1.5 pb-1 text-xs font-semibold text-muted-foreground'}>
          {label}
        </MenuPrimitive.GroupLabel>
      )}
      {children}
    </MenuPrimitive.Group>
  );
}

MenuGroup.displayName = 'Menu.Group';


function MenuSeparator(): React.ReactNode {
  return <MenuPrimitive.Separator data-slot={'menu-separator'} className={'-mx-1 my-1 h-px bg-border'} />;
}

MenuSeparator.displayName = 'Menu.Separator';


function MenuRadioGroup(props: MenuRadioGroupProps): React.ReactNode {
  const { children, label, onValueChange, value } = props;

  return (
    <MenuPrimitive.RadioGroup value={value} onValueChange={(next: string) => onValueChange(next)} data-slot={'menu-group'}>
      {label !== null && label !== undefined && label !== '' && (
        <MenuPrimitive.GroupLabel data-slot={'menu-group-label'} className={'px-2 pt-1.5 pb-1 text-xs font-semibold text-muted-foreground'}>
          {label}
        </MenuPrimitive.GroupLabel>
      )}
      {children}
    </MenuPrimitive.RadioGroup>
  );
}

MenuRadioGroup.displayName = 'Menu.RadioGroup';


function MenuRadioItem(props: MenuRadioItemProps): React.ReactNode {
  const { children, disabled = false, value } = props;

  return (
    <MenuPrimitive.RadioItem
      value={value}
      disabled={disabled}
      data-slot={'menu-radio-item'}
      render={ITEM_LAYOUT}
      className={cn(ITEM, 'data-checked:font-medium')}
    >
      <span className={'min-w-0 flex-1 group-data-disabled/menu-item:opacity-50'}>{children}</span>
      <MenuPrimitive.RadioItemIndicator
        data-slot={'menu-radio-item-indicator'}
        render={ITEM_INDICATOR}
        className={'ms-auto mt-0.5 shrink-0 text-primary [&_svg]:size-4'}
      >
        <CheckGlyph />
      </MenuPrimitive.RadioItemIndicator>
    </MenuPrimitive.RadioItem>
  );
}

MenuRadioItem.displayName = 'Menu.RadioItem';


function MenuCheckboxItem(props: MenuCheckboxItemProps): React.ReactNode {
  const { checked, children, disabled = false, onCheckedChange } = props;

  return (
    <MenuPrimitive.CheckboxItem
      checked={checked}
      onCheckedChange={(next: boolean) => onCheckedChange(next)}
      disabled={disabled}
      data-slot={'menu-checkbox-item'}
      render={ITEM_LAYOUT}
      className={cn(ITEM, 'data-checked:font-medium')}
    >
      <span className={'min-w-0 flex-1 group-data-disabled/menu-item:opacity-50'}>{children}</span>
      <MenuPrimitive.CheckboxItemIndicator
        data-slot={'menu-checkbox-item-indicator'}
        render={ITEM_INDICATOR}
        className={'ms-auto mt-0.5 shrink-0 text-primary [&_svg]:size-4'}
      >
        <CheckGlyph />
      </MenuPrimitive.CheckboxItemIndicator>
    </MenuPrimitive.CheckboxItem>
  );
}

MenuCheckboxItem.displayName = 'Menu.CheckboxItem';


/**
 * One level only, and only for fixed lists ("Export as › PDF, CSV"). A list that comes from the data
 * opens a dialog with a Select instead.
 */
function MenuSubmenu(props: MenuSubmenuProps): React.ReactNode {
  const { children, disabled = false, icon, label } = props;

  return (
    <MenuPrimitive.SubmenuRoot>
      <MenuPrimitive.SubmenuTrigger
        openOnHover
        delay={100}
        disabled={disabled}
        data-slot={'menu-submenu-trigger'}
        render={ITEM_LAYOUT}
        className={ITEM}
      >
        {icon !== null && icon !== undefined && <ItemIcon>{icon}</ItemIcon>}
        <span className={'min-w-0 flex-1 group-data-disabled/menu-item:opacity-50'}>{label}</span>
        <ChevronEndGlyph />
      </MenuPrimitive.SubmenuTrigger>

      <Panel side={'right'} align={'start'} onAnchorHidden={() => undefined}>
        {children}
      </Panel>
    </MenuPrimitive.SubmenuRoot>
  );
}

MenuSubmenu.displayName = 'Menu.Submenu';


export const Menu = Object.assign(MenuRoot, {
  Item        : MenuItem,
  Group       : MenuGroup,
  Separator   : MenuSeparator,
  RadioGroup  : MenuRadioGroup,
  RadioItem   : MenuRadioItem,
  CheckboxItem: MenuCheckboxItem,
  Submenu     : MenuSubmenu
});
