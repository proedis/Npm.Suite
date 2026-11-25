import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import personProps from 'virtual:ui-props/StrictPersonProps';
import themeDoc from 'virtual:ui-theme/display/person';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import person from '@/examples/display/person/person.tsx?example';
import stacked from '@/examples/display/person/stacked.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/display/person');

/* --------
 * Page
 * -------- */

function PersonPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A person with a name: the avatar, the written name, a state that never truncates, and a card on hover. The
            circle alone, its kinds, sizes and presence, and a group of people, are on the{' '}
            <Link to={'/ui/display/avatar'} className={'font-medium text-foreground underline underline-offset-2'}>Avatar</Link>{' '}
            page.
          </React.Fragment>
        )}
        imports={tsx`
          import { Person } from '@proedis/ui/display/person';
        `}
      />

      <PageBody>
        <Example of={person} align={'start'} />

        <Section
          title={'Person'}
          lead={(
            <React.Fragment>
              The avatar, the written name and a state that never truncates. The name is a link when the person has a page
              (<InlineCode>target</InlineCode>), a button that looks like text when there is only the card (
              <InlineCode>preview</InlineCode>), plain text otherwise. Rest the pointer on the first two names, or Tab to
              them.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              The card opens after 600ms and closes after 300, so crossing a column of names does not open one card after the
              other. It is a preview: nothing in it is a Tab stop, Esc closes it, and the page is reached by following the
              name. The system and an unknown reference are muted: no link and no card, even when given.
            </p>
          </Prose>

          <SubSection
            title={'Stacked'}
            lead={(
              <React.Fragment>
                <InlineCode>layout={'{\'stacked\'}'}</InlineCode> puts the name above and the <InlineCode>children</InlineCode>{' '}
                under it, in a quieter ink: the shape of a history, who did what.
              </React.Fragment>
            )}
          >
            <Example of={stacked} />
          </SubSection>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Next to the written name the avatar is decorative and hidden: the name is what is read. It is a link when the
              person has a page, a button when there is only the card, which opens on hover and on focus and closes with Esc.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Reaches the name of a person with a page or a card.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Follows the name of a person with a page.' ],
              [ <InlineCode key={'k'}>Esc</InlineCode>, 'Closes the card.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={stacked}
            rows={[
              { slot: 'avatar', part: 'The circle, decorative here', attributes: [ 'data-kind', 'data-size', 'data-radius' ] },
              { slot: 'person', part: 'The person', attributes: [ 'data-layout' ] },
              { slot: 'person-name-line', part: 'The name and the suffix' },
              { slot: 'person-name', part: 'The name: a link, a button or text' },
              { slot: 'person-suffix', part: 'The state after the name' },
              { slot: 'person-text', part: 'The two lines of a stacked person' },
              { slot: 'person-detail', part: 'The second line of a stacked person' },
              { slot: 'person-card', part: 'The card on hover' },
              { slot: 'person-card-header', part: 'The head of the card: avatar and name' },
              { slot: 'person-card-preview', part: 'The content of the card' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Person'} id={'api-person'}>
            <PropsTable props={personProps} rest={'Every other prop and the ref go to the outer span.'} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Say the state in words'}>
              A dashed circle is a hint. <InlineCode>suffix</InlineCode> or <InlineCode>stateLabel</InlineCode> says “account
              disabled”.
            </Guidance>
            <Guidance kind={'dont'} title={'Put actions in the card'}>
              The card is a preview, read and gone. Anything to do with the person is on their page or in a menu of the row.
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

export const Route = createFileRoute('/ui/display/person')({
  component: PersonPage
});
