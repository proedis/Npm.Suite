import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import actionProps from 'virtual:ui-props/EmptyStateAction';
import emptyStateProps from 'virtual:ui-props/EmptyStateProps';
import themeDoc from 'virtual:ui-theme/feedback/empty-state';

import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/feedback/empty-state/basic.tsx?example';
import focus from '@/examples/feedback/empty-state/focus.tsx?example';
import inContext from '@/examples/feedback/empty-state/in-context.tsx?example';
import kinds from '@/examples/feedback/empty-state/kinds.tsx?example';
import links from '@/examples/feedback/empty-state/links.tsx?example';
import sizes from '@/examples/feedback/empty-state/sizes.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/feedback/empty-state');


/* --------
 * Page
 * -------- */

function EmptyStatePage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            What shows when there is nothing to show: an area with no data on first use, a search with no results, a
            load that failed, an item that is not there. Three sizes and five cases, and the case decides the tone of
            the box and the look of the actions, so every empty screen of a product says the same thing the same way.
          </React.Fragment>
        )}
        imports={tsx`
          import { EmptyState } from '@proedis/ui/feedback/empty-state';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Cases'}
          lead={(
            <React.Fragment>
              <InlineCode>kind</InlineCode> is the case. <InlineCode>first-use</InlineCode> paints the box{' '}
              <InlineCode>primary</InlineCode>, <InlineCode>error</InlineCode> paints it{' '}
              <InlineCode>destructive</InlineCode>, the other three leave it muted. The icon says what the area is about,
              never what to do: the icon of the entity on a first use, a lens on a search.
            </React.Fragment>
          )}
        >
          <Example of={kinds} align={'stretch'} />
        </Section>

        <Section
          title={'Actions'}
          lead={(
            <React.Fragment>
              At most two, given as data: the type is a tuple of none, one or two, so a third does not compile. Each one
              says its <InlineCode>role</InlineCode> and the component picks its
              look, so no screen invents its own: <InlineCode>create</InlineCode> is a solid primary button on a page and
              a soft one in a panel, <InlineCode>clear</InlineCode> is plain destructive with an x when it brings no
              icon, <InlineCode>retry</InlineCode> and <InlineCode>back</InlineCode> are solid secondary.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Role', 'In a page', 'In a panel' ]}
            rows={[
              [ <InlineCode key={'r'}>create</InlineCode>, 'solid primary, md', 'soft primary, sm' ],
              [ <InlineCode key={'r'}>clear</InlineCode>, 'plain destructive, md, with the x', 'plain destructive, sm, with the x' ],
              [ <InlineCode key={'r'}>retry</InlineCode>, 'solid secondary, md', 'solid secondary, sm' ],
              [ <InlineCode key={'r'}>back</InlineCode>, 'solid secondary, md', 'solid secondary, sm' ]
            ]}
          />
          <SubSection
            title={'Links'}
            lead={(
              <React.Fragment>
                An action has either an <InlineCode>onClick</InlineCode> or a <InlineCode>target</InlineCode>. A target
                renders a real link, so “Back to the orders” keeps the middle click and a new tab.
              </React.Fragment>
            )}
          >
            <Example of={links} />
          </SubSection>
        </Section>

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              <InlineCode>page</InlineCode> fills a whole area, and its title is a heading of the page, so{' '}
              <InlineCode>headingLevel</InlineCode> is required with it. <InlineCode>panel</InlineCode>, the default,
              sits in a card, a tab or a list. <InlineCode>inline</InlineCode> is a line of text, its title the only
              text it has: in a field, under a list, in the panel of a select. An inline error is red, with the error
              circle.
            </React.Fragment>
          )}
        >
          <Example of={sizes} align={'stretch'} />
        </Section>

        <Section
          title={'Moving the focus'}
          lead={(
            <React.Fragment>
              The ref goes to the title, which can take the focus with <InlineCode>tabIndex</InlineCode> -1: when a load
              fails or an item is missing, move the focus there, as a dialog does, and the user hears what happened
              instead of losing the place.
            </React.Fragment>
          )}
        >
          <Example of={focus} />
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              A search with no results inside a card: the empty state takes the place of the list, says what was
              searched, and offers to clear it.
            </React.Fragment>
          )}
        >
          <Example of={inContext} />
        </Section>

        <Section title={'Type safety'} lead={'Each size takes the props that make sense for it, and nothing else, and no more than two actions.'}>
          <CodeBlock
            snippet={tsx`
              // @ts-expect-error: a page names the level of its heading
              <EmptyState size={'page'} kind={'first-use'} icon={<Truck />} title={'No vehicle yet'} />

              // @ts-expect-error: an inline empty state is a line of text, with no icon nor actions
              <EmptyState size={'inline'} kind={'no-results'} title={'No match'} icon={<Search />} />

              // @ts-expect-error: a panel has an icon
              <EmptyState kind={'no-results'} title={'No match'} />

              // @ts-expect-error: a third action
              <EmptyState kind={'error'} title={'Not loaded'} icon={<CloudOff />} actions={[ retry, back, help ]} />
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              An empty state has no role of its own: the container that shows it announces it, once. A{' '}
              <InlineCode>page</InlineCode> empty state has a real heading at the level you give it, so it is found by
              browsing the headings of the page; the other sizes use a plain block for the title. The actions are
              Buttons, and a target renders an anchor.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsTable
            rows={[
              { slot: 'empty-state', part: 'The root', attributes: [ 'data-size', 'data-kind' ] },
              { slot: 'empty-state-icon', part: 'The box of the icon', attributes: [ 'data-tone', 'data-fill', 'data-size' ] },
              { slot: 'empty-state-title', part: 'The title, which takes the focus' },
              { slot: 'empty-state-description', part: 'What to do, in one sentence' },
              { slot: 'empty-state-actions', part: 'The row of the actions' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'EmptyState'} id={'api-empty-state'}>
            <PropsTable
              props={emptyStateProps}
              rest={(
                <React.Fragment>
                  Every other prop goes to the root <InlineCode>{'<div>'}</InlineCode>; the ref goes to the title.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'EmptyStateAction'} id={'api-empty-state-action'}>
            <PropsTable props={actionProps} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Name the fact and the entity'}>
              “No contract for “rossy”” says what was searched and what was not found. “No results” makes the user
              scroll up to remember.
            </Guidance>
            <Guidance kind={'dont'} title={'An icon that says what to do'}>
              The icon is what the area is about: a truck for the vehicles, a lens for a search. The action says what to
              do.
            </Guidance>
            <Guidance kind={'do'} title={'Offer the way out'}>
              Clear the filters, try again, go back. An empty state with no action is right only when there is truly
              nothing to do.
            </Guidance>
            <Guidance kind={'dont'} title={'More than two actions'}>
              The type takes two at most, and a third does not compile. Three choices on an empty screen is a menu.
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

export const Route = createFileRoute('/feedback/empty-state')({
  component: EmptyStatePage
});
