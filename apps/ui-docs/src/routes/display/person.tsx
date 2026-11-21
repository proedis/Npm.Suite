import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import avatarGroupItemProps from 'virtual:ui-props/AvatarGroupItem';
import avatarProps from 'virtual:ui-props/AvatarProps';
import personProps from 'virtual:ui-props/StrictPersonProps';
import avatarGroupProps from 'virtual:ui-props/StrictAvatarGroupProps';
import themeDoc from 'virtual:ui-theme/display/person';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { css, tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import avatars from '@/examples/display/person/avatars.tsx?example';
import group from '@/examples/display/person/group.tsx?example';
import person from '@/examples/display/person/person.tsx?example';
import sizes from '@/examples/display/person/sizes.tsx?example';
import stacked from '@/examples/display/person/stacked.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/display/person');

/** kind and name are described with the identity, which the compiler cannot read through the union */
const AVATAR_PROPS = refineProps(avatarProps.filter((prop) => prop.from !== 'AvatarIdentity'), {
  size: { default: '24' }
});


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
            People in an interface: <InlineCode>Avatar</InlineCode>, the circle of a person, an organization or the system;{' '}
            <InlineCode>Person</InlineCode>, the avatar with the name, its state and a card on hover; and{' '}
            <InlineCode>AvatarGroup</InlineCode>, several people in the room of one.
          </React.Fragment>
        )}
        imports={tsx`
          import { Avatar, AvatarGroup, Person } from '@proedis/ui/display/person';
        `}
      />

      <PageBody>
        <Example of={person} align={'start'} />

        <Section
          title={'Avatar'}
          lead={(
            <React.Fragment>
              A photo or two initials, or the icon of what is not a person. No colour per person: the user of the
              application is <InlineCode>primary-soft</InlineCode>, an inactive one is dashed and grey, everyone else is
              the same quiet circle. Hover them, or reach them with Tab.
            </React.Fragment>
          )}
        >
          <Example of={avatars} />

          <SubSection
            title={'Identity'}
            lead={(
              <React.Fragment>
                Who the circle stands for is a union on <InlineCode>kind</InlineCode>, so a combination with no look, an
                organization with initials, does not compile.
              </React.Fragment>
            )}
          >
            <DocTable
              head={[ 'kind', 'Props', 'Draws' ]}
              rows={[
                [
                  <InlineCode key={'k'}>person</InlineCode>,
                  <span key={'p'}>
                    <InlineCode>name</InlineCode>, <InlineCode>initials</InlineCode>, <InlineCode>src</InlineCode>,{' '}
                    <InlineCode>current</InlineCode>, <InlineCode>inactive</InlineCode>
                  </span>,
                  'The photo, or the two initials the application computes. current is the user of the application; inactive wins over it.'
                ],
                [
                  <InlineCode key={'k'}>organization</InlineCode>,
                  <span key={'p'}><InlineCode>name</InlineCode>, <InlineCode>inactive</InlineCode></span>,
                  'A building'
                ],
                [ <InlineCode key={'k'}>system</InlineCode>, <InlineCode key={'p'}>name</InlineCode>, 'A gear: an import, a scheduled job' ],
                [
                  <InlineCode key={'k'}>unknown</InlineCode>,
                  <InlineCode key={'p'}>name</InlineCode>,
                  'A silhouette: the reference is there, the person cannot be read (deleted, of another tenant, not visible)'
                ]
              ]}
            />
            <Prose>
              <p>
                With a photo, the initials appear only after 600ms, so a fast photo never flashes letters; without one they
                appear at once. <InlineCode>src</InlineCode> must already be usable by an <InlineCode>{'<img>'}</InlineCode>: a
                URL that needs the token arrives as a blob URL.
              </p>
            </Prose>
          </SubSection>

          <SubSection title={'Sizes'} lead={'24 next to a name and in a table, 32 in a list, 40 in a card head, 56 on a profile.'}>
            <Example of={sizes} />
          </SubSection>
        </Section>

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

        <Section
          title={'AvatarGroup'}
          lead={(
            <React.Fragment>
              Several people in a cell: only circles, at most <InlineCode>max</InlineCode>, then the count. With four people
              and a maximum of three, all four show: the count appears only from two hidden up, since “+1” takes the room of
              the circle it replaces. On hover, or with Enter or Space from the keyboard, the list of everybody opens.
            </React.Fragment>
          )}
        >
          <Example of={group} align={'start'} />
          <Prose>
            <p>
              Past nine hidden the count is a pill, past 99 it says “99+”. One person is written as a{' '}
              <InlineCode>Person</InlineCode> and nobody as a dash of your choosing: the group is for two or more.
            </p>
          </Prose>
          <Callout>
            Each circle has a 2px ring in <InlineCode>--avatar-ring</InlineCode>, the colour of the card by default, so the
            circles read as separate on the surface under them. A table redefines it on a hovered or chosen row; do the same
            wherever the group sits on another colour.
          </Callout>
          <CodeBlock
            title={'app.css'}
            snippet={css`
              /* A group on a muted panel parts its circles with the colour of the panel */
              .crew-panel {
                --avatar-ring: var(--color-muted);
              }
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Alone, an avatar is an image with the name as its label, focusable and with a tooltip saying the same name and
              the <InlineCode>stateLabel</InlineCode>. Next to a written name, inside Person and AvatarGroup, it is decorative
              and hidden. The group is one button whose name is your <InlineCode>label</InlineCode>, with every name in it:
              “Operators: Rossi Mario, Bianchi Laura”.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Reaches an avatar alone, the name of a person with a page or a card, the button of a group.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Follows the name of a person with a page; opens the list of a group.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Opens the list of a group.' ],
              [ <InlineCode key={'k'}>Esc</InlineCode>, 'Closes the card of a person or the list of a group.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'avatar', part: 'The circle', attributes: [ 'data-kind', 'data-size', 'data-current', 'data-inactive', 'data-decorative' ] },
              { slot: 'avatar-image', part: 'The photo' },
              { slot: 'avatar-fallback', part: 'The initials or the icon' },
              { slot: 'person', part: 'The person', attributes: [ 'data-layout' ] },
              { slot: 'person-name-line', part: 'The name and the suffix' },
              { slot: 'person-name', part: 'The name: a link, a button or text' },
              { slot: 'person-suffix', part: 'The state after the name' },
              { slot: 'person-text', part: 'The two lines of a stacked person' },
              { slot: 'person-detail', part: 'The second line of a stacked person' },
              { slot: 'person-card', part: 'The card on hover' },
              { slot: 'person-card-header', part: 'The head of the card: avatar and name' },
              { slot: 'person-card-preview', part: 'The content of the card' },
              { slot: 'avatar-group', part: 'The button with the circles', attributes: [ 'data-size' ] },
              { slot: 'avatar-group-count', part: 'The count of the hidden people' },
              { slot: 'avatar-group-list', part: 'The popup with everybody' },
              { slot: 'avatar-group-items', part: 'The list inside it' },
              { slot: 'avatar-group-item', part: 'One person of the list' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Avatar'} id={'api-avatar'}>
            <PropsTable
              props={AVATAR_PROPS}
              rest={(
                <React.Fragment>
                  Plus the identity: <InlineCode>kind</InlineCode>, <InlineCode>name</InlineCode> and the props of its kind, in
                  the table above. The ref goes to the circle.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'Person'} id={'api-person'}>
            <PropsTable props={personProps} rest={'Every other prop and the ref go to the outer span.'} />
          </SubSection>
          <SubSection title={'AvatarGroup'} id={'api-avatar-group'}>
            <PropsTable props={avatarGroupProps} rest={'Every other prop and the ref go to the button that opens the list.'} />
          </SubSection>
          <SubSection title={'AvatarGroupItem'} id={'api-avatar-group-item'}>
            <PropsTable props={avatarGroupItemProps} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Compute the initials once'}>
              One helper of the application, first surname and first given name, so the same person has the same letters on
              every screen.
            </Guidance>
            <Guidance kind={'dont'} title={'Colour people'}>
              A colour per person means nothing and fights the tones. The only colours say who you are and who is inactive.
            </Guidance>
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

export const Route = createFileRoute('/display/person')({
  component: PersonPage
});
