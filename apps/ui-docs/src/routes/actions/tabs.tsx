import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import tabItemProps from 'virtual:ui-props/TabItem';
import panelProps from 'virtual:ui-props/TabsPanelProps';
import tabsProps from 'virtual:ui-props/TabsProps';
import themeDoc from 'virtual:ui-theme/actions/tabs';

import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/actions/tabs/basic.tsx?example';
import counts from '@/examples/actions/tabs/counts.tsx?example';
import disabled from '@/examples/actions/tabs/disabled.tsx?example';
import inContext from '@/examples/actions/tabs/in-context.tsx?example';
import kept from '@/examples/actions/tabs/kept.tsx?example';
import overflow from '@/examples/actions/tabs/overflow.tsx?example';
import sizes from '@/examples/actions/tabs/sizes.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/actions/tabs');


/* --------
 * Page
 * -------- */

function TabsPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The sections of one thing, read one at a time: the data, the movements, the attachments of a container.
            A white rail raised like a card, with the tabs inside and the open one filled with{' '}
            <InlineCode>primary</InlineCode>. What does not fit goes into “More”, and a panel is mounted the first time
            it opens and kept from then on.
          </React.Fragment>
        )}
        imports={tsx`
          import { Tabs, type TabItem } from '@proedis/ui/actions/tabs';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Tabs as data'}
          lead={(
            <React.Fragment>
              The tabs are an array of <InlineCode>TabItem</InlineCode>s in <InlineCode>items</InlineCode>, and the
              panels are <InlineCode>Tabs.Panel</InlineCode> children matched by <InlineCode>value</InlineCode>. Data
              rather than children on purpose: to fit the row, the component measures the tabs, moves some of them
              into a menu and draws them again as menu items, which tabs wrapped in fragments or components would not
              allow.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              <InlineCode>value</InlineCode> and <InlineCode>onValueChange</InlineCode> hand the open tab to you;{' '}
              <InlineCode>defaultValue</InlineCode> leaves it to the component, and one of the two is required.{' '}
              <InlineCode>onValueChange</InlineCode> reports a choice of the user only, never a tab Base UI picked
              because another one went away. <InlineCode>labels.overflow</InlineCode> is the text of the “More” button,
              which the package does not write.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Icons and counts'}
          lead={(
            <React.Fragment>
              <InlineCode>leading</InlineCode> goes on every tab or on none. <InlineCode>count</InlineCode> goes only on
              the sections that are lists, zero included, and reads “999+” past 999; it comes with{' '}
              <InlineCode>countLabel</InlineCode>, what a screen reader hears after the name: “12 movements”.
            </React.Fragment>
          )}
        >
          <Example of={counts} />
        </Section>

        <Section
          title={'Disabled tabs'}
          lead={(
            <React.Fragment>
              A section that exists but is not needed now stays in the row, in the arrow cycle, with{' '}
              <InlineCode>disabledReason</InlineCode> in its tooltip. The open tab is never disabled.
            </React.Fragment>
          )}
        >
          <Example of={disabled} />
        </Section>

        <Section
          title={'Overflow'}
          lead={(
            <React.Fragment>
              The tabs that do not fit go into “More”, a menu after a divider, outside the tab list. A tab chosen there
              takes the last visible place, and the open tab is never in the menu. Drag the handle of the preview to watch
              the row give tabs up and take them back.
            </React.Fragment>
          )}
        >
          <Example of={overflow} resizable previewClassName={'min-h-80 justify-start'} />
          <Callout tone={'warning'}>
            Tabs fill the width of their container and measure that width. In a container that shrinks to its
            content, a centred column or an inline row, that width is only what the tabs already take, and they go
            into “More” with room to spare around them. Give them a width there: <InlineCode>w-full</InlineCode>, or
            a grid track.
          </Callout>
          <Prose>
            <p>
              The fit is measured on a hidden copy of every tab, whose tabs carry the <InlineCode>tabs-tab</InlineCode>{' '}
              slot too: a rule of a product that resizes the tabs resizes the copy, and the fit stays right. The gap
              and the padding of the rail are read from the page rather than assumed.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              <InlineCode>md</InlineCode> in a page, <InlineCode>sm</InlineCode> in a drawer or a card.
            </React.Fragment>
          )}
        >
          <Example of={sizes} />
        </Section>

        <Section
          title={'Panels'}
          lead={(
            <React.Fragment>
              A panel mounts the first time its tab opens, and is kept: its filters, what was typed in it and its
              scroll are still there when the user comes back. Type, switch to Map, and come back.
            </React.Fragment>
          )}
        >
          <Example of={kept} />
          <Callout>
            A panel whose tab sits in “More” takes its accessible name from that tab, since its tab is not in the list
            to name it.
          </Callout>
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              The detail of a vehicle. The tab list takes its name from the title of the page with{' '}
              <InlineCode>aria-labelledby</InlineCode>, and the sections that are lists carry their count.
            </React.Fragment>
          )}
        >
          <Example of={inContext} />
        </Section>

        <Section title={'Type safety'} lead={'A list of tabs with no name, or with no open tab, does not compile.'}>
          <CodeBlock
            snippet={tsx`
              // @ts-expect-error: aria-label or aria-labelledby is required
              <Tabs items={items} defaultValue={'data'} labels={labels} />

              // @ts-expect-error: value or defaultValue is required
              <Tabs aria-label={'Customer'} items={items} labels={labels} />
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Base UI’s <InlineCode>Tabs</InlineCode> give the list, the tabs and the panels their roles and tie each
              panel to its tab. The arrows move the focus and not the open tab, so a panel that loads does not start
              while the user passes over it: Enter or Space opens the tab with the focus. Tab enters the list on the
              open tab, and the next Tab leaves it.
            </p>
            <p>
              A disabled tab stays reachable with its reason in a tooltip. “More” is outside the tab list, a Menu of its
              own, so the list keeps announcing only the tabs it holds.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves the focus to the open tab, then to “More”, then into the panel.' ],
              [ <InlineCode key={'k'}>ArrowRight</InlineCode>, 'Moves to the next tab, and loops.' ],
              [ <InlineCode key={'k'}>ArrowLeft</InlineCode>, 'Moves to the previous tab, and loops.' ],
              [ <InlineCode key={'k'}>Home</InlineCode>, 'Moves to the first tab.' ],
              [ <InlineCode key={'k'}>End</InlineCode>, 'Moves to the last tab.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Opens the tab with the focus.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Opens the tab with the focus.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsInspector of={counts}
            rows={[
              { slot: 'tabs', part: 'The root, where className lands' },
              { slot: 'tabs-row', part: 'The row that measures what fits' },
              { slot: 'tabs-rail', part: 'The white rail', attributes: [ 'data-size' ] },
              { slot: 'tabs-list', part: 'The tab list' },
              { slot: 'tabs-indicator', part: 'The fill that slides under the open tab' },
              { slot: 'tabs-tab', part: 'A tab, and each tab of the hidden copy', attributes: [ 'data-active', 'data-disabled', 'data-orientation' ] },
              { slot: 'tabs-tab-content', part: 'The icon, the label and the count' },
              { slot: 'tabs-tab-leading', part: 'The icon' },
              { slot: 'tabs-tab-count', part: 'The count' },
              { slot: 'tabs-more', part: 'The “More” button, when tabs overflow', attributes: [ 'data-fill', 'data-tone', 'data-size' ] },
              { slot: 'tabs-more-label', part: 'The label of a tab inside “More”' },
              { slot: 'tabs-more-count', part: 'The count of a tab inside “More”' },
              { slot: 'tabs-panel', part: 'A panel, once its tab has opened', attributes: [ 'data-index', 'data-visited' ] },
              { slot: 'tabs-measure', part: 'The hidden copy every fit is measured on' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Tabs'} id={'api-tabs'}>
            <PropsTable
              props={tabsProps}
              rest={(
                <React.Fragment>
                  Every other prop goes to the root <InlineCode>{'<div>'}</InlineCode>, around the list and the panels;
                  the name goes to the list.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'TabItem'} id={'api-tab-item'}>
            <PropsTable props={tabItemProps} />
          </SubSection>
          <SubSection title={'Tabs.Panel'} id={'api-tabs-panel'}>
            <PropsTable
              props={panelProps}
              rest={<React.Fragment>Every other prop goes to the panel, a <InlineCode>{'<div>'}</InlineCode>.</React.Fragment>}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'The most read section first'}>
              The order is fixed and the first tab is the one most visits need. The overflow takes from the end, so the
              last tabs are the ones that may end up in “More”.
            </Guidance>
            <Guidance kind={'dont'} title={'Labels longer than two words'}>
              A tab never truncates nor wraps: a long label only sends its neighbours into “More” sooner.
            </Guidance>
            <Guidance kind={'do'} title={'Count what is a list'}>
              Movements, attachments, invoices. A count on “Data” means nothing, and a count without its label is a
              number a screen reader cannot explain.
            </Guidance>
            <Guidance kind={'dont'} title={'Switch views with tabs'}>
              Tabs are sections of one thing, each with its own panel. A different look of the same list is a
              SegmentedControl.
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

export const Route = createFileRoute('/actions/tabs')({
  component: TabsPage
});
