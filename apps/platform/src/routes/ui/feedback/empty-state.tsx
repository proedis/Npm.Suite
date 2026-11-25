import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import emptyStateProps from 'virtual:ui-props/StrictEmptyStateProps';
import themeDoc from 'virtual:ui-theme/feedback/empty-state';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/feedback/empty-state/basic.tsx?example';
import cases from '@/examples/feedback/empty-state/cases.tsx?example';
import focus from '@/examples/feedback/empty-state/focus.tsx?example';
import inContext from '@/examples/feedback/empty-state/in-context.tsx?example';
import links from '@/examples/feedback/empty-state/links.tsx?example';
import sizes from '@/examples/feedback/empty-state/sizes.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/feedback/empty-state');


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
            load that failed, an item that is not there. A composition, like every other component: a size and a tone on
            the root, the icon, the title, the description and your buttons as parts.
          </React.Fragment>
        )}
        imports={tsx`
          import { EmptyState } from '@proedis/ui/feedback/empty-state';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Anatomy'}
          lead={(
            <React.Fragment>
              <InlineCode>EmptyState</InlineCode> holds the size and the tone; its parts take them from it.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Part', 'What it is' ]}
            rows={[
              [ <InlineCode key={'p'}>EmptyState.Icon</InlineCode>, 'An IconBox in the tone, sized by the empty state: what the area is about, never what to do' ],
              [ <InlineCode key={'p'}>EmptyState.Title</InlineCode>, 'The fact, with the entity. A div, as={\'h2\'} where it is a heading of the page; it takes the focus' ],
              [ <InlineCode key={'p'}>EmptyState.Description</InlineCode>, 'What to do, in one sentence' ],
              [ <InlineCode key={'p'}>EmptyState.Actions</InlineCode>, 'Your Buttons, centred and wrapping: one to fix it, one to go elsewhere' ]
            ]}
          />
        </Section>

        <Section
          title={'Cases'}
          lead={(
            <React.Fragment>
              The tone says what happened: <InlineCode>primary</InlineCode> for a first use,{' '}
              <InlineCode>muted</InlineCode> (the default) for a search with nothing or an item that is not there,{' '}
              <InlineCode>destructive</InlineCode> for a load that failed, <InlineCode>warning</InlineCode> for a view
              that cannot show anything yet. The actions are the Buttons the case needs. An application writes its own
              empty states once, as components of its own, and every screen reuses them.
            </React.Fragment>
          )}
        >
          <Example of={cases} align={'stretch'} />
          <DocTable
            head={[ 'Case', 'Tone', 'The action the package uses itself' ]}
            rows={[
              [ 'First use', <InlineCode key={'t'}>primary</InlineCode>, 'Create: soft primary in a panel, solid on a page' ],
              [ 'No results', <InlineCode key={'t'}>muted</InlineCode>, 'Clear the filters: plain destructive, with the x' ],
              [ 'Failed', <InlineCode key={'t'}>destructive</InlineCode>, 'Try again: solid muted' ],
              [ 'Not found', <InlineCode key={'t'}>muted</InlineCode>, 'Back: solid muted, a link' ],
              [ 'A view that needs more', <InlineCode key={'t'}>warning</InlineCode>, 'None, or the control that completes it' ]
            ]}
          />
        </Section>

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              <InlineCode>page</InlineCode> fills a whole area: a larger box and title, more room, and a title that is a
              heading of the page (<InlineCode>as</InlineCode> on the Title). <InlineCode>panel</InlineCode>, the default,
              sits in a card, a tab or a list. <InlineCode>inline</InlineCode> is a line of text in the ink of the tone,
              its icon and its title alone: the description and the actions are not drawn.
            </React.Fragment>
          )}
        >
          <Example of={sizes} align={'stretch'} />
        </Section>

        <Section
          title={'Actions that lead somewhere'}
          lead={(
            <React.Fragment>
              A Button with a <InlineCode>to</InlineCode> is a real link, so “Back to the orders” keeps the middle click
              and a new tab.
            </React.Fragment>
          )}
        >
          <Example of={links} />
        </Section>

        <Section
          title={'Moving the focus'}
          lead={(
            <React.Fragment>
              The title takes the focus with <InlineCode>tabIndex</InlineCode> -1, through its <InlineCode>ref</InlineCode>:
              when a load fails or an item is missing, move the focus there, as a dialog does, and the user hears what
              happened instead of losing the place.
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

        <Section title={'Writing your own'} lead={'The cases of a product are components of its own, written once.'}>
          <CodeBlock
            title={'NoResults.tsx'}
            snippet={tsx`
              export function NoResults(props: { query: string; onClear: () => void }): React.ReactNode {
                const t = useTranslations();

                return (
                  <EmptyState>
                    <EmptyState.Icon><Search /></EmptyState.Icon>
                    <EmptyState.Title>{t('noResultsFor', { query: props.query })}</EmptyState.Title>
                    <EmptyState.Description>{t('checkSpelling')}</EmptyState.Description>
                    <EmptyState.Actions>
                      <Button size={'sm'} fill={'plain'} tone={'destructive'} leading={<X />} onClick={props.onClear}>
                        {t('clearFilters')}
                      </Button>
                    </EmptyState.Actions>
                  </EmptyState>
                );
              }
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              An empty state has no role of its own: the container that shows it announces it, once. On a page, make the
              title a real heading with <InlineCode>as</InlineCode> at the level of the outline, so it is found by browsing
              the headings; elsewhere it is a plain block. The actions are Buttons, and one with a destination is an
              anchor.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'empty-state', part: 'The root', attributes: [ 'data-size', 'data-tone' ] },
              { slot: 'empty-state-icon', part: 'The box of the icon', attributes: [ 'data-tone', 'data-fill', 'data-size' ] },
              { slot: 'empty-state-title', part: 'The title, which takes the focus' },
              { slot: 'empty-state-description', part: 'What to do, in one sentence' },
              { slot: 'empty-state-actions', part: 'The row of the actions' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'EmptyState'} id={'api-empty-state'}>
            <PropsTable props={emptyStateProps} rest={'Every other prop goes to the root div.'} />
          </SubSection>
          <SubSection title={'The parts'} id={'api-empty-state-parts'}>
            <Prose>
              <p>
                <InlineCode>EmptyState.Icon</InlineCode> takes the props of an IconBox but its <InlineCode>size</InlineCode>,
                which is the empty state’s; its <InlineCode>tone</InlineCode> defaults to the empty state’s.{' '}
                <InlineCode>EmptyState.Title</InlineCode> is polymorphic, a <InlineCode>div</InlineCode> by default, its{' '}
                <InlineCode>ref</InlineCode> on the element. <InlineCode>EmptyState.Description</InlineCode> is a{' '}
                <InlineCode>p</InlineCode>, <InlineCode>EmptyState.Actions</InlineCode> a <InlineCode>div</InlineCode>.
              </p>
            </Prose>
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
              Three choices on an empty screen is a menu. One to fix it, one to go elsewhere.
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

export const Route = createFileRoute('/ui/feedback/empty-state')({
  component: EmptyStatePage
});
