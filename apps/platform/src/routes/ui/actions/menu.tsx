import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import checkboxItemProps from 'virtual:ui-props/MenuCheckboxItemProps';
import groupProps from 'virtual:ui-props/MenuGroupProps';
import itemProps from 'virtual:ui-props/MenuItemProps';
import menuProps from 'virtual:ui-props/MenuProps';
import radioGroupProps from 'virtual:ui-props/MenuRadioGroupProps';
import radioItemProps from 'virtual:ui-props/MenuRadioItemProps';
import submenuProps from 'virtual:ui-props/MenuSubmenuProps';
import themeDoc from 'virtual:ui-theme/actions/menu';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import actions from '@/examples/actions/menu/actions.tsx?example';
import basic from '@/examples/actions/menu/basic.tsx?example';
import choices from '@/examples/actions/menu/choices.tsx?example';
import groups from '@/examples/actions/menu/groups.tsx?example';
import inContext from '@/examples/actions/menu/in-context.tsx?example';
import links from '@/examples/actions/menu/links.tsx?example';
import placement from '@/examples/actions/menu/placement.tsx?example';
import radius from '@/examples/actions/menu/radius.tsx?example';
import submenu from '@/examples/actions/menu/submenu.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/actions/menu');


/* --------
 * Page
 * -------- */

function MenuPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The list of actions on a thing: the ⋯ at the end of a row, the rest of an action bar, a few view choices
            that apply at once. Items with icons and reasons, groups, separators, radio and checkbox items, links,
            and one level of submenu, all on the panel the Select draws its options in.
          </React.Fragment>
        )}
        imports={tsx`
          import { Menu } from '@proedis/ui/actions/menu';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Trigger and name'}
          lead={(
            <React.Fragment>
              <InlineCode>trigger</InlineCode> is the control that opens the menu, normally an IconButton with the ⋯
              or a Button with a chevron. It must forward its ref, and it stays pressed while the menu is open.{' '}
              <InlineCode>aria-label</InlineCode> is required and names the menu with its object: “Actions on route
              R-14”, not “Actions”, because a list of rows has one menu per row.
            </React.Fragment>
          )}
        />

        <Section
          title={'Items'}
          lead={(
            <React.Fragment>
              <InlineCode>onSelect</InlineCode> runs once the menu has closed, with the focus already back on the
              trigger: a dialog it opens takes the trigger as the control to return to. An item that is not available
              stays reachable with the arrows, never runs, and says why under its label.
            </React.Fragment>
          )}
        >
          <Example of={actions} />
          <Callout>
            An item off with no reason is not shown at all. A grey line with no explanation is a question the user
            cannot answer, so <InlineCode>disabled</InlineCode> always travels with a{' '}
            <InlineCode>description</InlineCode>.
          </Callout>
        </Section>

        <Section
          title={'Destructive items'}
          lead={(
            <React.Fragment>
              <InlineCode>{'tone={\'destructive\'}'}</InlineCode> paints the item and its icon red. It goes last, after a
              separator, and what its <InlineCode>onSelect</InlineCode> runs is a confirmation, never the deletion
              itself: the menu does not ask on its own.
            </React.Fragment>
          )}
        />

        <Section
          title={'Groups and separators'}
          lead={(
            <React.Fragment>
              <InlineCode>Menu.Separator</InlineCode> divides items that belong apart.{' '}
              <InlineCode>Menu.Group</InlineCode> adds a small title, only when the groups act on different things,
              and the title says on what.
            </React.Fragment>
          )}
        >
          <Example of={groups} />
        </Section>

        <Section
          title={'View choices'}
          lead={(
            <React.Fragment>
              <InlineCode>Menu.RadioGroup</InlineCode> with its <InlineCode>Menu.RadioItem</InlineCode>s is one
              choice, <InlineCode>Menu.CheckboxItem</InlineCode> is an on or off. Both apply at once and keep the menu
              open, so several can be changed in one go. They suit a few view options; a value in a form is a Select
              or a Checkbox.
            </React.Fragment>
          )}
        >
          <Example of={choices} />
        </Section>

        <Section
          title={'Submenu'}
          lead={(
            <React.Fragment>
              One level only, and only for a fixed list: “Export as” then the formats. It opens on hover after a short
              wait, or with the right arrow. A list that comes from the data opens a dialog with a Select instead.
            </React.Fragment>
          )}
        >
          <Example of={submenu} />
        </Section>

        <Section
          title={'Links'}
          lead={(
            <React.Fragment>
              An item with a <InlineCode>to</InlineCode> is a real link, rendered as an anchor: the middle click and a
              new tab keep working, and a plain click calls <InlineCode>go()</InlineCode> once the menu has closed. A
              link item that is disabled loses its address and becomes a plain disabled item.
            </React.Fragment>
          )}
        >
          <Example of={links} />
        </Section>

        <Section
          title={'Placement'}
          lead={(
            <React.Fragment>
              Below the trigger by default, lined up with its right edge (<InlineCode>{'align={\'end\'}'}</InlineCode>),
              which is right for a ⋯ at the end of a row. A Button at the start of a bar wants{' '}
              <InlineCode>{'align={\'start\'}'}</InlineCode>. The menu flips on its own when there is no room, and
              closes when its trigger scrolls out of view.
            </React.Fragment>
          )}
        >
          <Example of={placement} />
        </Section>

        <Section
          title={'Radius'}
          lead={(
            <React.Fragment>
              <InlineCode>radius</InlineCode> sets the corner of the menu and of its submenus; the items sit 4px inside it
              and take its corner less those 4px, so the two stay concentric. <InlineCode>default</InlineCode> is the
              theme’s <InlineCode>--list-panel-radius</InlineCode>, the corner of every floating list of the package,
              the lists of Select and Combobox included.
            </React.Fragment>
          )}
        >
          <Example of={radius} />
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              A list of routes, each with its state and its ⋯. Every menu is named after its route, and the delete of
              a route in progress stays in the menu with the reason it cannot run.
            </React.Fragment>
          )}
        >
          <Example of={inContext} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Base UI’s <InlineCode>Menu</InlineCode> gives the panel the <InlineCode>menu</InlineCode> role and the
              items theirs, with <InlineCode>aria-checked</InlineCode> on the choices. The menu is not modal: the page
              still scrolls, and a click outside reaches what is under it. The arrows stop at the first and the last
              item rather than looping. Opened with the pointer it has no active item; opened with the keyboard, the
              first item is.
            </p>
            <p>
              The reason of an unavailable item is tied to it with <InlineCode>aria-describedby</InlineCode>, so it is
              read when the item is reached.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'On the trigger, opens the menu on its first item. On an item, runs it.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'On the trigger, opens the menu. On an item, runs it, or switches a choice.' ],
              [ <InlineCode key={'k'}>ArrowDown</InlineCode>, 'On the trigger, opens the menu. In the menu, moves to the next item, stopping at the last.' ],
              [ <InlineCode key={'k'}>ArrowUp</InlineCode>, 'On the trigger, opens the menu on its last item. In the menu, moves to the previous item, stopping at the first.' ],
              [ <InlineCode key={'k'}>Home</InlineCode>, 'Moves to the first item.' ],
              [ <InlineCode key={'k'}>End</InlineCode>, 'Moves to the last item.' ],
              [ <InlineCode key={'k'}>A letter</InlineCode>, 'Moves to the next item whose label starts with it.' ],
              [ <InlineCode key={'k'}>ArrowRight</InlineCode>, 'On a submenu, opens it and moves into it.' ],
              [ <InlineCode key={'k'}>ArrowLeft</InlineCode>, 'In a submenu, closes it and goes back to its item.' ],
              [ <InlineCode key={'k'}>Escape</InlineCode>, 'Closes the menu and gives the focus back to the trigger.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'menu', part: 'The panel', attributes: [ 'data-open', 'data-side', 'data-align' ] },
              { slot: 'menu-item', part: 'An action or a link', attributes: [ 'data-tone', 'data-highlighted', 'data-disabled' ] },
              { slot: 'menu-item-icon', part: 'The icon before the label' },
              { slot: 'menu-item-text', part: 'The label and the description' },
              { slot: 'menu-item-label', part: 'The label' },
              { slot: 'menu-item-description', part: 'The reason under the label' },
              { slot: 'menu-group', part: 'A group, or a radio group' },
              { slot: 'menu-group-label', part: 'The small title of a group' },
              { slot: 'menu-separator', part: 'The line between items' },
              { slot: 'menu-radio-item', part: 'A choice among several', attributes: [ 'data-checked', 'data-unchecked' ] },
              { slot: 'menu-radio-item-indicator', part: 'The tick of the chosen one' },
              { slot: 'menu-checkbox-item', part: 'An on or off', attributes: [ 'data-checked', 'data-unchecked' ] },
              { slot: 'menu-checkbox-item-indicator', part: 'The tick of an item on' },
              { slot: 'menu-submenu-trigger', part: 'The item that opens a submenu', attributes: [ 'data-popup-open' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Menu'} id={'api-menu'}>
            <PropsTable props={menuProps} />
          </SubSection>
          <SubSection title={'Menu.Item'} id={'api-menu-item'}>
            <PropsTable props={itemProps} />
          </SubSection>
          <SubSection title={'Menu.Group'} id={'api-menu-group'}>
            <PropsTable
              props={groupProps}
              rest={<React.Fragment><InlineCode>Menu.Separator</InlineCode> takes no props.</React.Fragment>}
            />
          </SubSection>
          <SubSection title={'Menu.RadioGroup'} id={'api-menu-radio-group'}>
            <PropsTable props={radioGroupProps} />
          </SubSection>
          <SubSection title={'Menu.RadioItem'} id={'api-menu-radio-item'}>
            <PropsTable props={radioItemProps} />
          </SubSection>
          <SubSection title={'Menu.CheckboxItem'} id={'api-menu-checkbox-item'}>
            <PropsTable props={checkboxItemProps} />
          </SubSection>
          <SubSection title={'Menu.Submenu'} id={'api-menu-submenu'}>
            <PropsTable props={submenuProps} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Name the menu after its object'}>
              “Actions on route R-14” tells a screen reader user which row they are in. “Actions”, twenty times down a
              list, tells them nothing.
            </Guidance>
            <Guidance kind={'dont'} title={'Disable an item without a reason'}>
              Give it a description that says why, or leave the item out. A grey line nobody can explain is noise.
            </Guidance>
            <Guidance kind={'do'} title={'Put the destructive item last'}>
              After a separator, in red, and opening a confirmation: the one item a hurried click should not land on.
            </Guidance>
            <Guidance kind={'dont'} title={'Nest a list that comes from the data'}>
              A submenu holds a fixed handful of entries. Thirty customers in a submenu are a dialog with a Select.
            </Guidance>
            <Guidance kind={'do'} title={'Icons on every item or on none'}>
              A column of icons with one gap in it reads as a missing icon, not as a choice.
            </Guidance>
            <Guidance kind={'dont'} title={'Navigate from onSelect'}>
              Give the item a <InlineCode>to</InlineCode>: a real link keeps the middle click and a new tab.
            </Guidance>
          </GuidanceGrid>
        </Section>
      </PageBody>
    </React.Fragment>
  );
}


/* --------
 * Route
 * -------- */

export const Route = createFileRoute('/ui/actions/menu')({
  component: MenuPage
});
