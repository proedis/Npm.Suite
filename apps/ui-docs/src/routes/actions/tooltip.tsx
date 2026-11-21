import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import providerProps from 'virtual:ui-props/TooltipProviderProps';
import tooltipProps from 'virtual:ui-props/TooltipProps';

import { Callout } from '@/docs/Callout';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/actions/tooltip/basic.tsx?example';
import description from '@/examples/actions/tooltip/description.tsx?example';
import list from '@/examples/actions/tooltip/list.tsx?example';
import provider from '@/examples/actions/tooltip/provider.tsx?example';
import sides from '@/examples/actions/tooltip/sides.tsx?example';
import truncated from '@/examples/actions/tooltip/truncated.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/actions/tooltip');


/* --------
 * Page
 * -------- */

function TooltipPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The dark label over a control: the name of an icon button, the whole of a truncated value, the reason a
            control is disabled. It repeats or completes what the control already says and never more; an
            explanation that exists nowhere else belongs in a Popover.
          </React.Fragment>
        )}
        imports={tsx`
          import { Tooltip, TooltipProvider } from '@proedis/ui/actions/tooltip';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'The control'}
          lead={(
            <React.Fragment>
              The child is the control itself, a single element. It is cloned with the props of the trigger rather
              than wrapped, so a row laid out by a Stack does not gain a child, and it has to forward its ref, or the
              tooltip has nothing to anchor to. The components of the package that can be a trigger do.
            </React.Fragment>
          )}
        >
          <Callout>
            IconButton, an icon only Toggle and an icon only SegmentedControl item already carry their tooltip. Wrap a
            control in one only when it has none of its own.
          </Callout>
        </Section>

        <Section
          title={'Description'}
          lead={(
            <React.Fragment>
              <InlineCode>description</InlineCode> is a second, quieter line, normally the reason a control is
              disabled. It is the one thing a tooltip says that the control does not, so it is also rendered as hidden
              text and joined to the control’s <InlineCode>aria-describedby</InlineCode>. A disabled button keeps its
              focus with <InlineCode>focusableWhenDisabled</InlineCode>, and a click on it leaves the tooltip open,
              since that is when the reason is wanted.
            </React.Fragment>
          )}
        >
          <Example of={description} />
        </Section>

        <Section
          title={'Sides'}
          lead={(
            <React.Fragment>
              <InlineCode>side</InlineCode> is where the tooltip prefers to open, <InlineCode>top</InlineCode> by
              default. It flips on its own when there is no room, and keeps clear of the focus halo of the control and
              of the edge of a scrolling box.
            </React.Fragment>
          )}
        >
          <Example of={sides} />
        </Section>

        <Section
          title={'Truncated values'}
          lead={(
            <React.Fragment>
              <InlineCode>truncatedOnly</InlineCode> opens the tooltip only when the text does not fit, measured at the
              moment it would open, and <InlineCode>{'align={\'start\'}'}</InlineCode> lines its text up with the text
              of the control. Hover the three names: only the long one opens.
            </React.Fragment>
          )}
        >
          <Example of={truncated} />
          <Prose>
            <p>
              The element measured is the first descendant marked <InlineCode>data-truncate</InlineCode>, or the
              control itself: the box that overflows is rarely the control, since a button clips its label and not
              itself.
            </p>
          </Prose>
        </Section>

        <Section
          title={'A list of values'}
          lead={(
            <React.Fragment>
              <InlineCode>content</InlineCode> takes any node, so a list of values reads one per line: the values a
              “+3” hides, the members of a group. The tooltip is at most 280 pixels wide and wraps a long word anywhere
              rather than spilling out.
            </React.Fragment>
          )}
        >
          <Example of={list} />
        </Section>

        <Section
          title={'TooltipProvider'}
          lead={(
            <React.Fragment>
              Mounted once, above everything that can show a tooltip. The first tooltip waits{' '}
              <InlineCode>delay</InlineCode>, 400 milliseconds; once one has closed, its neighbours open at once for{' '}
              <InlineCode>timeout</InlineCode>, 600 milliseconds, so a row of icon buttons reads as one gesture. A
              table mounts a second provider with a timeout of 0, so scrolling down a column does not leave a trail
              of labels over the rows being read.
            </React.Fragment>
          )}
        >
          <Example of={provider} />
        </Section>

        <Section title={'Behaviour'}>
          <Prose>
            <p>What the tooltip decides on its own, so no call site has to:</p>
            <ul className={'list-disc space-y-1 ps-5'}>
              <li>the pointer can move onto it without closing it, and its text can be selected;</li>
              <li>
                the focus on a button opens it at once, the focus in a field that takes text does not, since there it
                would cover what is being typed: a field opens it on hover only;
              </li>
              <li>
                it stays closed while a menu or a popover opened by the same control is open, and when the focus comes
                back to the control from a layer that just closed;
              </li>
              <li>it fades in, and does not fade out, nor between neighbours, nor at all with reduced motion;</li>
              <li>an empty <InlineCode>content</InlineCode> renders the control alone, with no empty box on hover;</li>
              <li>there is no tooltip on touch: the products it was designed for are desktop ones.</li>
            </ul>
          </Prose>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The popup is <InlineCode>aria-hidden</InlineCode>: the name belongs to the control, and a tooltip that a
              screen reader read too would say it twice. What it adds, the description, reaches assistive technology
              through hidden text tied to the control, so it is read whether the tooltip is open or not.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'The focus on a control that is pressed opens its tooltip at once.' ],
              [ <InlineCode key={'k'}>Escape</InlineCode>, 'Closes the tooltip.' ]
            ]}
          />
        </Section>

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsTable
            rows={[
              { slot: 'tooltip', part: 'The popup', attributes: [ 'data-side', 'data-align', 'data-open', 'data-instant' ] },
              { slot: 'tooltip-description', part: 'Its second line' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Tooltip'} id={'api-tooltip'}>
            <PropsTable props={tooltipProps} />
          </SubSection>
          <SubSection title={'TooltipProvider'} id={'api-tooltip-provider'}>
            <PropsTable props={providerProps} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Repeat or complete the control'}>
              The name of an icon, the whole of a clipped value, the reason a button is off. Nothing the user needs to
              read in order to act.
            </Guidance>
            <Guidance kind={'dont'} title={'Put the only explanation in a tooltip'}>
              It opens on hover, never on touch, and disappears when the pointer leaves. An explanation that exists
              nowhere else is a Popover.
            </Guidance>
            <Guidance kind={'do'} title={'Keep a disabled control focusable'}>
              With <InlineCode>focusableWhenDisabled</InlineCode> the reason can be read with the keyboard, not only
              with a mouse.
            </Guidance>
            <Guidance kind={'dont'} title={'A tooltip on a text field'}>
              It would cover what is being typed, so it does not open on focus there. What a field needs to say is its
              description, under it.
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

export const Route = createFileRoute('/actions/tooltip')({
  component: TooltipPage
});
