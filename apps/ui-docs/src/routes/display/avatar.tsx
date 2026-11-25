import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import avatarGroupItemProps from 'virtual:ui-props/AvatarGroupItem';
import avatarProps from 'virtual:ui-props/AvatarProps';
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
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import group from '@/examples/display/avatar/group.tsx?example';
import indicator from '@/examples/display/avatar/indicator.tsx?example';
import kinds from '@/examples/display/avatar/kinds.tsx?example';
import radius from '@/examples/display/avatar/radius.tsx?example';
import sizes from '@/examples/display/avatar/sizes.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/display/avatar');

/** kind and name are described with the identity, which the compiler cannot read through the union */
const AVATAR_PROPS = refineProps(avatarProps.filter((prop) => prop.from !== 'AvatarIdentity'), {
  size: { default: '24' }
});

const LINK = 'font-medium text-foreground underline underline-offset-2';


/* --------
 * Page
 * -------- */

function AvatarPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The circle of a person, an organization or the system: a photo, two initials or an icon, in four sizes, with
            a mark of presence on its corner when it has one. <InlineCode>AvatarGroup</InlineCode> puts several people in
            the room of one.
          </React.Fragment>
        )}
        imports={tsx`
          import { Avatar, AvatarGroup } from '@proedis/ui/display/person';
        `}
      />

      <PageBody>
        <Example of={kinds} />

        <Section
          title={'Kinds'}
          lead={(
            <React.Fragment>
              Who the circle stands for is a union on <InlineCode>kind</InlineCode>, so a combination with no look, an
              organization with initials, does not compile. Hover them, or reach them with Tab.
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
                'The photo, or the two initials the application computes'
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
        </Section>

        <Section
          title={'Tones'}
          lead={(
            <React.Fragment>
              No colour per person, on purpose: a colour that means nothing fights the tones that mean something. Three
              looks, each a state.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'State', 'Look', 'Written' ]}
            rows={[
              [ 'Anybody', 'The quiet muted circle, the initials in the foreground', <InlineCode key={'w'}>{'kind="person"'}</InlineCode> ],
              [ 'The user of the application', 'primary-soft', <InlineCode key={'w'}>current</InlineCode> ],
              [ 'Inactive', 'Dashed, transparent, a grey photo. Wins over current', <InlineCode key={'w'}>inactive</InlineCode> ],
              [ 'Organization, system, unknown', 'The muted circle and its icon', <InlineCode key={'w'}>kind</InlineCode> ]
            ]}
          />
        </Section>

        <Section title={'Sizes'} lead={'24 next to a name and in a table, 32 in a list, 40 in a card head, 56 on a profile. 24 by default.'}>
          <Example of={sizes} />
        </Section>

        <Section
          title={'Radius'}
          lead={(
            <React.Fragment>
              A circle by default. <InlineCode>radius</InlineCode> takes a step of the scale, for a product that draws
              people square, or an organization that reads better as a tile; <InlineCode>default</InlineCode> is the
              theme’s <InlineCode>--avatar-radius</InlineCode>, so the whole application changes with one line.
            </React.Fragment>
          )}
        >
          <Example of={radius} />
        </Section>

        <Section
          title={'Presence'}
          lead={(
            <React.Fragment>
              <InlineCode>indicator</InlineCode> puts a mark on the bottom-end corner, over the circle: a{' '}
              <Link to={'/display/badge-dot'} className={LINK}>BadgeDot</Link> with <InlineCode>ring</InlineCode>, so it keeps
              its edge on a photo, and <InlineCode>pulse</InlineCode> for a presence that is live. The mark has no words:
              say the state in <InlineCode>stateLabel</InlineCode> too, which the tooltip and the name of the image read.
            </React.Fragment>
          )}
        >
          <Example of={indicator} />
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
              <Link to={'/display/person'} className={LINK}>Person</Link> and nobody as a dash of your choosing: the group is
              for two or more.
            </p>
          </Prose>
          <Callout>
            Each circle of a group has a 2px ring in <InlineCode>--avatar-ring</InlineCode>, the colour of the card by
            default, so the circles read as separate on the surface under them. A table redefines it on a hovered or chosen
            row; do the same wherever the group sits on another colour.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Alone, an avatar is an image with the name as its label, focusable and with a tooltip saying the same name and
              the <InlineCode>stateLabel</InlineCode>. Next to a written name, inside a Person and an AvatarGroup, it is
              decorative and hidden. The group is one button whose name is your <InlineCode>label</InlineCode>, with every
              name in it: “Operators: Rossi Mario, Bianchi Laura”.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title}>
          <p>
            Beyond the variables, every state is an attribute: <InlineCode>data-current</InlineCode>,{' '}
            <InlineCode>data-inactive</InlineCode>, <InlineCode>data-kind</InlineCode>, <InlineCode>data-size</InlineCode>,{' '}
            <InlineCode>data-radius</InlineCode>.
          </p>
        </Customization>

        <Section title={'Styling the states'} lead={'A product that wants its own look for the user of the application, or square people everywhere.'}>
          <CodeBlock
            title={'app.css'}
            snippet={css`
              :root {
                --avatar-radius: var(--radius-lg);
              }

              [data-slot='avatar'][data-current] {
                background-color: var(--primary);
                color: var(--primary-foreground);
              }

              /* A group on a muted panel parts its circles with the colour of the panel */
              .crew-panel {
                --avatar-ring: var(--color-muted);
              }
            `}
          />
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={indicator}
            rows={[
              {
                slot      : 'avatar',
                part      : 'The circle',
                attributes: [ 'data-kind', 'data-size', 'data-radius', 'data-current', 'data-inactive', 'data-decorative' ]
              },
              { slot: 'avatar-image', part: 'The photo' },
              { slot: 'avatar-fallback', part: 'The initials or the icon' },
              { slot: 'avatar-indicator-anchor', part: 'The box around the circle and its mark, with an indicator' },
              { slot: 'avatar-indicator', part: 'The corner that holds the mark' },
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
            <Guidance kind={'do'} title={'Say the presence in words'}>
              The dot on the corner is a hint: <InlineCode>stateLabel</InlineCode> says “online”.
            </Guidance>
            <Guidance kind={'dont'} title={'Pulse what is not live'}>
              A pulsing dot says “now”. On a state that does not change while the page is open, it is noise.
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

export const Route = createFileRoute('/display/avatar')({
  component: AvatarPage
});
