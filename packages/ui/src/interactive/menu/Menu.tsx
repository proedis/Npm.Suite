'use client';

import * as React from 'react';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { cn } from '../../core/cn';

import { CloseWhenAnchorHidden } from '../anchor/CloseWhenAnchorHidden';
import { CheckGlyph } from '../choice/choice';
import { LIST_ITEM } from '../list-panel/listPanel';

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

interface MenuContextValue {
  /** Runs `action` once the menu has finished closing */
  afterClose: (action: () => void) => void;
}


/* --------
 * Constants Definition
 * -------- */

const PANEL = [
  'max-h-(--available-height) min-w-40 max-w-70 overflow-y-auto overscroll-contain scrollbar-thin',
  'rounded-md bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none',
  'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:transition-none motion-reduce:transition-none'
].join(' ');

/** The item of the Select's list, with the keyboard ring and the disabled look on the label only */
const ITEM = cn(
  LIST_ITEM,
  'group/menu-item data-disabled:opacity-100',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
  'data-popup-open:bg-accent'
);

const ITEM_TONE = {
  default    : '',
  destructive: 'text-destructive-soft-foreground data-highlighted:bg-destructive-soft data-highlighted:text-destructive-soft-foreground'
} as const;

const ITEM_ICON = 'mt-0.5 inline-flex shrink-0 text-muted-foreground group-data-disabled/menu-item:opacity-50 [&_svg]:size-4';

const MenuContext = React.createContext<MenuContextValue>({ afterClose: (action) => action() });


/* --------
 * Helpers
 * -------- */

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
        <span data-slot={'menu-item-icon'} className={cn(ITEM_ICON, tone === 'destructive' && 'text-current')}>{icon}</span>
      )}
      <span className={'flex min-w-0 flex-1 flex-col'}>
        <span data-slot={'menu-item-label'} className={'group-data-disabled/menu-item:opacity-50'}>{children}</span>
        {description !== null && description !== undefined && description !== '' && (
          <span id={descriptionId} data-slot={'menu-item-description'} className={'text-xs text-muted-foreground'}>
            {description}
          </span>
        )}
      </span>
    </React.Fragment>
  );
}

function Panel(props: {
  side: 'bottom' | 'top' | 'right';
  align: 'start' | 'end';
  label?: string;
  onAnchorHidden: () => void;
  className?: string;
  children: React.ReactNode;
}): React.ReactNode {
  const { align, children, className, label, onAnchorHidden, side } = props;

  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side === 'right' ? 'inline-end' : side}
        align={align}
        sideOffset={4}
        alignOffset={side === 'right' ? -4 : 0}
        collisionPadding={8}
        className={'z-popover outline-none'}
        render={(positionerProps, state) => (
          <div {...positionerProps}>
            <CloseWhenAnchorHidden hidden={state.anchorHidden} onHidden={onAnchorHidden} />
            {positionerProps.children}
          </div>
        )}
      >
        <MenuPrimitive.Popup aria-label={label} data-slot={'menu'} className={cn(PANEL, className)}>
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
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
 * `menu-item-label`, `menu-item-description`, `menu-group`, `menu-group-label`, `menu-separator`,
 * `menu-checkbox-item`, `menu-radio-item`, `menu-submenu-trigger`.
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
  const pendingRef = React.useRef<(() => void) | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

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

  const handleOpenChangeComplete = (next: boolean): void => {
    if (next) {
      return;
    }

    const action = pendingRef.current;

    pendingRef.current = null;

    /*
     * The focus is back on the trigger before the action runs: a dialog it opens takes the trigger as
     * the control to return to, instead of an item that is no longer there.
     */
    if (action) {
      triggerRef.current?.focus({ preventScroll: true });
      action();
    }
  };


  // ----
  // Memoized Data
  // ----
  const context = React.useMemo<MenuContextValue>(() => ({
    afterClose: (action) => {
      pendingRef.current = action;
    }
  }), []);


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
  const { afterClose } = React.useContext(MenuContext);
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
    <MenuPrimitive.RadioItem value={value} disabled={disabled} data-slot={'menu-radio-item'} className={cn(ITEM, 'data-checked:font-medium')}>
      <span className={'min-w-0 flex-1 group-data-disabled/menu-item:opacity-50'}>{children}</span>
      <MenuPrimitive.RadioItemIndicator className={'ms-auto mt-0.5 inline-flex shrink-0 text-primary [&_svg]:size-4'}>
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
      className={cn(ITEM, 'data-checked:font-medium')}
    >
      <span className={'min-w-0 flex-1 group-data-disabled/menu-item:opacity-50'}>{children}</span>
      <MenuPrimitive.CheckboxItemIndicator className={'ms-auto mt-0.5 inline-flex shrink-0 text-primary [&_svg]:size-4'}>
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
      <MenuPrimitive.SubmenuTrigger openOnHover delay={100} disabled={disabled} data-slot={'menu-submenu-trigger'} className={ITEM}>
        {icon !== null && icon !== undefined && <span data-slot={'menu-item-icon'} className={ITEM_ICON}>{icon}</span>}
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
