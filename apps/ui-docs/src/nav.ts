import {
  AppWindow,
  AlignVerticalSpaceAround,
  BadgeCheck,
  Bell,
  Box,
  Brackets,
  CalendarDays,
  ChevronsUpDown,
  CircleDot,
  CircleUser,
  Columns2,
  Compass,
  Component,
  Contrast,
  Crop,
  Ellipsis,
  FileText,
  Filter,
  FormInput,
  Frame,
  Grid2x2Check,
  Grid3x3,
  Hash,
  Heading,
  Inbox,
  KeyRound,
  LayoutGrid,
  LayoutList,
  ListChecks,
  ListFilter,
  Loader,
  LoaderCircle,
  MessageSquare,
  MessageSquareWarning,
  Minus,
  MonitorSmartphone,
  MousePointerClick,
  MoveHorizontal,
  Palette,
  PanelBottom,
  PanelRight,
  PanelsTopLeft,
  Paperclip,
  Pin,
  Rows3,
  ScanLine,
  ScrollText,
  Search,
  Shapes,
  Smartphone,
  SquareCheck,
  SquareDashed,
  SquareStack,
  Table2,
  Tag,
  Tags,
  TextCursorInput,
  TextSearch,
  ToggleLeft,
  ToggleRight,
  Tv,
  Webhook,
  WrapText
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';


/* --------
 * Types Definition
 * -------- */

/** An optional peer an import of the subpath needs installed */
export type Peer = '@base-ui/react' | 'dayjs' | '@tanstack/react-table';

export interface NavItem {
  /** The name of the page: the component, or the topic */
  readonly title: string;

  /** The route, which is the subpath for a component: `/actions/button` documents `@proedis/ui/actions/button` */
  readonly to: string;

  /** One line, shown on the overview and under the title of the page */
  readonly description: string;

  readonly icon: LucideIcon;

  /** The specifier an application imports it from, when the page documents an entry point */
  readonly subpath?: string;

  /** The optional peers that subpath needs */
  readonly peers?: readonly Peer[];

  /** The page is written. A page still to write is listed, greyed, so the map is complete from day one */
  readonly ready: boolean;
}

export interface NavGroup {
  readonly title: string;

  /** What the section of the package answers, shown on the overview */
  readonly description: string;

  readonly items: readonly NavItem[];
}


/* --------
 * Constants Definition
 * -------- */

const BASE_UI: readonly Peer[] = [ '@base-ui/react' ];

const BASE_UI_DAYJS: readonly Peer[] = [ '@base-ui/react', 'dayjs' ];


/**
 * Every page of the site, in reading order: the sidebar, the pager and the overview read this one
 * list. The groups after Foundations are the sections of the package, in the order they depend on
 * each other.
 */
export const NAV: readonly NavGroup[] = [
  {
    title      : 'Getting started',
    description: 'What the package is, how to install it, and the first component on screen.',
    items      : [
      { title: 'Overview', to: '/', description: 'The package, its sections and how to start.', icon: Compass, ready: true }
    ]
  },
  {
    title      : 'Foundations',
    description: 'The rules every component follows, explained once.',
    items      : [
      { title: 'Theming', to: '/foundations/theming', description: 'The token contract, the two stylesheets, dark mode and what a product overrides.', icon: Palette, ready: true },
      { title: 'Tones', to: '/foundations/tones', description: 'Seven tones, three fills, one table that paints them everywhere.', icon: Contrast, ready: true },
      { title: 'Shared props', to: '/foundations/shared-props', description: 'hideBelow and hideFrom, on every component that renders a root of its own.', icon: Brackets, ready: true },
      { title: 'Responsive values', to: '/foundations/responsive', description: 'One value, or one per breakpoint: how a layout prop changes with the width.', icon: MonitorSmartphone, ready: true },
      { title: 'Polymorphism', to: '/foundations/polymorphism', description: 'The as prop, typed by the element it renders.', icon: Shapes, ready: true },
      { title: 'Slots and data attributes', to: '/foundations/slots', description: 'The data-slot and data-* surface a product skins without touching a call site.', icon: Hash, ready: true }
    ]
  },
  {
    title      : 'Layout',
    description: 'Where things are. No colour, no opinion: every component of the package lays out through these.',
    items      : [
      { title: 'Box', to: '/layout/box', subpath: '@proedis/ui/layout', description: 'An element with the shared props and nothing else.', icon: Box, ready: false },
      { title: 'Stack', to: '/layout/stack', subpath: '@proedis/ui/layout', description: 'A column or a row with a gap, or equal columns: the container everything else is.', icon: Rows3, ready: false },
      { title: 'Cluster', to: '/layout/cluster', subpath: '@proedis/ui/layout', description: 'A row that wraps, centred on its line: tags, actions, filters.', icon: LayoutList, ready: false },
      { title: 'Grid', to: '/layout/grid', subpath: '@proedis/ui/layout', description: 'As many columns as fit, each at least a given width.', icon: LayoutGrid, ready: false },
      { title: 'Center', to: '/layout/center', subpath: '@proedis/ui/layout', description: 'Content centred on both axes, with a maximum width.', icon: AlignVerticalSpaceAround, ready: false },
      { title: 'Container', to: '/layout/container', subpath: '@proedis/ui/layout', description: 'The page column: a maximum width and the side padding.', icon: Frame, ready: false },
      { title: 'Split', to: '/layout/split', subpath: '@proedis/ui/layout', description: 'A fixed rail and a flexible pane, stacked below a breakpoint.', icon: Columns2, ready: false },
      { title: 'Spacer', to: '/layout/spacer', subpath: '@proedis/ui/layout', description: 'The free space of a row, or a fixed gap of the scale.', icon: MoveHorizontal, ready: false },
      { title: 'Sticky', to: '/layout/sticky', subpath: '@proedis/ui/layout', description: 'Pinned to the top or the bottom edge while its parent scrolls.', icon: Pin, ready: false },
      { title: 'AspectRatio', to: '/layout/aspect-ratio', subpath: '@proedis/ui/layout', description: 'A box that keeps its proportions at any width.', icon: Crop, ready: false },
      { title: 'Bleed', to: '/layout/bleed', subpath: '@proedis/ui/layout', description: 'Undoes the padding of the container, to reach its edges.', icon: ScanLine, ready: false },
      { title: 'SafeArea', to: '/layout/safe-area', subpath: '@proedis/ui/layout', description: 'The insets of a notch and a home indicator, as padding.', icon: Smartphone, ready: false }
    ]
  },
  {
    title      : 'Primitives',
    description: 'The small pieces with a look of their own, shared by the components above them.',
    items      : [
      { title: 'BusyVeil', to: '/primitives/busy-veil', subpath: '@proedis/ui/primitives', description: 'A veil over content that is working, with a spinner and a label.', icon: SquareDashed, ready: false },
      { title: 'Divider', to: '/primitives/divider', subpath: '@proedis/ui/primitives', description: 'A hairline between two things, with a label when it needs one.', icon: Minus, ready: false },
      { title: 'Label', to: '/primitives/label', subpath: '@proedis/ui/primitives', description: 'The name of a value or a control, with a description under it.', icon: Tag, ready: false },
      { title: 'LoadingBar', to: '/primitives/loading-bar', subpath: '@proedis/ui/primitives', description: 'A thin bar at the top of a region that is loading.', icon: Loader, ready: false },
      { title: 'ScrollArea', to: '/primitives/scroll-area', subpath: '@proedis/ui/primitives', description: 'Native overflow with a thin scrollbar, that shrinks in a flex parent.', icon: ScrollText, ready: false },
      { title: 'Skeleton', to: '/primitives/skeleton', subpath: '@proedis/ui/primitives', description: 'The shape of content that has not arrived yet.', icon: Rows3, ready: false },
      { title: 'Spinner', to: '/primitives/spinner', subpath: '@proedis/ui/primitives', description: 'The rotating ring, with the label a screen reader hears.', icon: LoaderCircle, ready: false },
      { title: 'VisuallyHidden', to: '/primitives/visually-hidden', subpath: '@proedis/ui/primitives', description: 'Text for assistive technology only.', icon: Ellipsis, ready: false }
    ]
  },
  {
    title      : 'Display',
    description: 'What things look like: values, rows, cards, people. Static, renderable from a server component.',
    items      : [
      { title: 'Badge', to: '/display/badge', subpath: '@proedis/ui/display/badge', description: 'A short state or a category, in a tone.', icon: BadgeCheck, ready: false },
      { title: 'BadgeCounter', to: '/display/badge-counter', subpath: '@proedis/ui/display/badge-counter', description: 'A count on a control: unread, pending, selected.', icon: Hash, ready: false },
      { title: 'Heading', to: '/display/heading', subpath: '@proedis/ui/display/heading', description: 'A title with its eyebrow and its description.', icon: Heading, ready: false },
      { title: 'IconBox', to: '/display/icon-box', subpath: '@proedis/ui/display/icon-box', description: 'An icon in a frame, sized and toned.', icon: Component, ready: false },
      { title: 'Item', to: '/display/item', subpath: '@proedis/ui/display/item', description: 'A row: media, a title that truncates, actions that stay.', icon: LayoutList, ready: false },
      { title: 'LabeledContent', to: '/display/labeled-content', subpath: '@proedis/ui/display/labeled-content', description: 'A quiet name over a loud value.', icon: Tags, ready: false },
      { title: 'Person', to: '/display/person', subpath: '@proedis/ui/display/person', peers: BASE_UI, description: 'Avatar, name and the card on hover; a group of avatars.', icon: CircleUser, ready: false },
      { title: 'Surface', to: '/display/surface', subpath: '@proedis/ui/display/surface', description: 'The card, with its header, sections, separators and footer.', icon: SquareStack, ready: false }
    ]
  },
  {
    title      : 'Actions',
    description: 'What a user presses: buttons, menus, views, tabs.',
    items      : [
      { title: 'Button', to: '/actions/button', subpath: '@proedis/ui/actions/button', peers: BASE_UI, description: 'Three fills, seven tones, three sizes, and IconButton with the tooltip it always carries.', icon: MousePointerClick, ready: true },
      { title: 'CollapsibleSection', to: '/actions/collapsible', subpath: '@proedis/ui/actions/collapsible', peers: BASE_UI, description: 'A section that opens and closes from its header.', icon: ChevronsUpDown, ready: false },
      { title: 'Menu', to: '/actions/menu', subpath: '@proedis/ui/actions/menu', peers: BASE_UI, description: 'The actions on a thing, with groups, view choices and one level of submenu.', icon: Ellipsis, ready: false },
      { title: 'SegmentedControl', to: '/actions/segmented-control', subpath: '@proedis/ui/actions/segmented-control', peers: BASE_UI, description: 'One choice among a few views of the same thing.', icon: Columns2, ready: false },
      { title: 'Tabs', to: '/actions/tabs', subpath: '@proedis/ui/actions/tabs', peers: BASE_UI, description: 'The sections of one thing read one at a time, with More for those that do not fit.', icon: PanelsTopLeft, ready: false },
      { title: 'Toggle', to: '/actions/toggle', subpath: '@proedis/ui/actions/toggle', peers: BASE_UI, description: 'A button that stays on in a bar, and a group of them.', icon: ToggleRight, ready: false },
      { title: 'Tooltip', to: '/actions/tooltip', subpath: '@proedis/ui/actions/tooltip', peers: BASE_UI, description: 'The dark label over a control, and the provider that groups them.', icon: MessageSquare, ready: false }
    ]
  },
  {
    title      : 'Feedback',
    description: 'What the interface says back: alerts, empty states, notifications.',
    items      : [
      { title: 'Alert', to: '/feedback/alert', subpath: '@proedis/ui/feedback/alert', peers: BASE_UI, description: 'A state that lasts on a page, and what to do about it.', icon: MessageSquareWarning, ready: false },
      { title: 'EmptyState', to: '/feedback/empty-state', subpath: '@proedis/ui/feedback/empty-state', peers: BASE_UI, description: 'First use, no results, an error, a missing permission.', icon: Inbox, ready: false },
      { title: 'Notifications', to: '/feedback/notifications', subpath: '@proedis/ui/feedback/notifications', peers: BASE_UI, description: 'Toasts and the jobs panel, called from anywhere.', icon: Bell, ready: false }
    ]
  },
  {
    title      : 'Forms',
    description: 'The form, its fields and every control, with the same frame, states and errors.',
    items      : [
      { title: 'Form', to: '/forms/form', subpath: '@proedis/ui/forms/form', peers: BASE_UI, description: 'Header, error summary, sections on a grid of six, footer.', icon: FileText, ready: false },
      { title: 'Field', to: '/forms/field', subpath: '@proedis/ui/forms/field', peers: BASE_UI, description: 'Label, description, error and counter around any control.', icon: FormInput, ready: false },
      { title: 'FieldShell', to: '/forms/field-shell', subpath: '@proedis/ui/forms/field-shell', peers: BASE_UI, description: 'The frame of every text control, for a control of your own.', icon: Frame, ready: false },
      { title: 'TextInput', to: '/forms/text-input', subpath: '@proedis/ui/forms/text-input', peers: BASE_UI, description: 'The single line text field, with its actions.', icon: TextCursorInput, ready: false },
      { title: 'PasswordInput', to: '/forms/password-input', subpath: '@proedis/ui/forms/password-input', peers: BASE_UI, description: 'A text field that shows and hides its value.', icon: KeyRound, ready: false },
      { title: 'SearchInput', to: '/forms/search-input', subpath: '@proedis/ui/forms/search-input', peers: BASE_UI, description: 'A lens, a clear action, and Esc that empties it.', icon: Search, ready: false },
      { title: 'NumberInput', to: '/forms/number-input', subpath: '@proedis/ui/forms/number-input', peers: BASE_UI, description: 'A quantity, a weight, an amount.', icon: Hash, ready: false },
      { title: 'Textarea', to: '/forms/textarea', subpath: '@proedis/ui/forms/textarea', peers: BASE_UI, description: 'The multi-line text field.', icon: WrapText, ready: false },
      { title: 'Select', to: '/forms/select', subpath: '@proedis/ui/forms/select', peers: BASE_UI, description: 'One choice from a list, with a search past eight options.', icon: ChevronsUpDown, ready: false },
      { title: 'MultiSelect', to: '/forms/multi-select', subpath: '@proedis/ui/forms/multi-select', peers: BASE_UI, description: 'Several choices from a list that is not in view.', icon: ListChecks, ready: false },
      { title: 'Combobox', to: '/forms/combobox', subpath: '@proedis/ui/forms/combobox', peers: BASE_UI, description: 'One record or several, among results from the server.', icon: TextSearch, ready: false },
      { title: 'DatePicker', to: '/forms/date-picker', subpath: '@proedis/ui/forms/date-picker', peers: BASE_UI_DAYJS, description: 'A date or a period, typed or picked from a calendar.', icon: CalendarDays, ready: false },
      { title: 'Checkbox', to: '/forms/checkbox', subpath: '@proedis/ui/forms/checkbox', peers: BASE_UI, description: 'A box, and a group with the parent box computed from its options.', icon: SquareCheck, ready: false },
      { title: 'CheckboxGrid', to: '/forms/checkbox-grid', subpath: '@proedis/ui/forms/checkbox-grid', peers: BASE_UI, description: 'A grid of boxes in groups that open and close.', icon: Grid2x2Check, ready: false },
      { title: 'Radio', to: '/forms/radio', subpath: '@proedis/ui/forms/radio', peers: BASE_UI, description: 'One choice in view, classic or as cards.', icon: CircleDot, ready: false },
      { title: 'Switch', to: '/forms/switch', subpath: '@proedis/ui/forms/switch', peers: BASE_UI, description: 'On or off, at once.', icon: ToggleLeft, ready: false },
      { title: 'FileUpload', to: '/forms/file-upload', subpath: '@proedis/ui/forms/file-upload', peers: BASE_UI, description: 'Attaching files in a form, and the attachments of an element.', icon: Paperclip, ready: false }
    ]
  },
  {
    title      : 'Overlays',
    description: 'What opens above the page: dialogs, drawers, confirmations, popovers.',
    items      : [
      { title: 'Dialog', to: '/overlays/dialog', subpath: '@proedis/ui/overlays/dialog', peers: BASE_UI, description: 'The modal panel, with submit, cancel and the discard prompt.', icon: AppWindow, ready: false },
      { title: 'Drawer', to: '/overlays/drawer', subpath: '@proedis/ui/overlays/drawer', peers: BASE_UI, description: 'The detail of an element beside its list, and its form.', icon: PanelRight, ready: false },
      { title: 'AlertDialog', to: '/overlays/alert-dialog', subpath: '@proedis/ui/overlays/alert-dialog', peers: BASE_UI, description: 'The stop before losing something, in three grades.', icon: MessageSquareWarning, ready: false },
      { title: 'Popover', to: '/overlays/popover', subpath: '@proedis/ui/overlays/popover', peers: BASE_UI, description: 'Help, a choice or a small form, anchored to its control.', icon: PanelBottom, ready: false }
    ]
  },
  {
    title      : 'Data',
    description: 'Lists of records and the detail of one: tables, filters, selectors.',
    items      : [
      { title: 'Table', to: '/data/table', subpath: '@proedis/ui/data/table', peers: [ '@base-ui/react', '@tanstack/react-table' ], description: 'Sorting, pages, selection, row actions, from the client or the server.', icon: Table2, ready: false },
      { title: 'FiltersBar', to: '/data/filters-bar', subpath: '@proedis/ui/data/filters-bar', peers: BASE_UI_DAYJS, description: 'The filters of a list, with More for those that do not fit.', icon: ListFilter, ready: false },
      { title: 'ModalSelector', to: '/data/modal-selector', subpath: '@proedis/ui/data/modal-selector', peers: [ '@base-ui/react', 'dayjs', '@tanstack/react-table' ], description: 'Choosing records from a long list, in a dialog.', icon: Filter, ready: false },
      { title: 'Detail', to: '/data/detail', subpath: '@proedis/ui/data/detail', peers: BASE_UI, description: 'The fields of one record, on the grid of its form.', icon: Grid3x3, ready: false }
    ]
  },
  {
    title      : 'Hooks',
    description: 'Client only, in the vocabulary of the breakpoints the package declares.',
    items      : [
      { title: 'useBreakpoint', to: '/hooks/use-breakpoint', subpath: '@proedis/ui/hooks', description: 'Whether the window is at least a breakpoint wide.', icon: Tv, ready: false },
      { title: 'useIsMobile', to: '/hooks/use-is-mobile', subpath: '@proedis/ui/hooks', description: 'Whether the window is below the mobile breakpoint.', icon: Webhook, ready: false }
    ]
  }
];

/** Every page, in reading order */
export const PAGES: readonly NavItem[] = NAV.flatMap((group) => group.items);

/** The page a path belongs to, and its neighbours among the written ones */
export function findPage(pathname: string): { page?: NavItem; previous?: NavItem; next?: NavItem } {
  const path = pathname.replace(/\/$/, '') || '/';
  const ready = PAGES.filter((item) => item.ready);
  const index = ready.findIndex((item) => item.to === path);

  return {
    page    : PAGES.find((item) => item.to === path),
    previous: index > 0 ? ready[index - 1] : undefined,
    next    : index >= 0 && index < ready.length - 1 ? ready[index + 1] : undefined
  };
}

/** The group a page belongs to */
export function findGroup(item: NavItem): NavGroup | undefined {
  return NAV.find((group) => group.items.includes(item));
}

/** The page at a route: a page component names its own route, and a typo fails as soon as it loads */
export function pageAt(to: string): NavItem {
  const page = PAGES.find((item) => item.to === to);

  if (!page) {
    throw new Error(`No page at ${to} in the navigation`);
  }

  return page;
}
