import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import labelsProps from 'virtual:ui-props/NotificationsLabels';
import providerProps from 'virtual:ui-props/NotificationsProviderProps';
import undoOptions from 'virtual:ui-props/UndoOptions';
import themeDoc from 'virtual:ui-theme/feedback/notifications';

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
import confirmation from '@/examples/feedback/notifications/confirmation.tsx?example';
import AppShell from '@/examples/feedback/notifications/setup.tsx';
import setup from '@/examples/feedback/notifications/setup.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/feedback/notifications');


/* --------
 * Page
 * -------- */

function NotificationsPage(): React.ReactNode {
  return (
    /* The provider of the examples, mounted once around the page as an application mounts it in its shell */
    <AppShell>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            What the application says back after the user acted, and while long work runs. One store for both: the{' '}
            <strong>confirmation</strong> of an action, a small toast at the bottom that leaves on its own, drawn by the
            provider; and the <strong>jobs</strong>, drawn by <InlineCode>JobsPanel</InlineCode> and{' '}
            <InlineCode>JobsButton</InlineCode> of <InlineCode>@proedis/ui/feedback/jobs</InlineCode>, on a page of their
            own. A module calls <InlineCode>notify</InlineCode> and <InlineCode>jobs</InlineCode>; the provider announces
            both.
          </React.Fragment>
        )}
        imports={tsx`
          import { createNotifications, NotificationsProvider } from '@proedis/ui/feedback/notifications';
        `}
      />

      <PageBody>
        <Example of={confirmation} />

        <Section
          title={'Setup'}
          lead={(
            <React.Fragment>
              <InlineCode>createNotifications()</InlineCode> once, in a module of its own, so every page imports the
              same instance. <InlineCode>NotificationsProvider</InlineCode> once, in the shell of the application and
              above the router, so the jobs survive a change of page, with the <InlineCode>JobsPanel</InlineCode> inside
              it. Every text comes from <InlineCode>labels</InlineCode>: the package writes none, counts included.
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={setup} title={setup.file} maxHeight={480} />
          <Prose>
            <p>
              A module never calls the router: a destination arrives as a <InlineCode>LinkTarget</InlineCode>, and the
              row that offers it renders a real link.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Confirmations'}
          lead={(
            <React.Fragment>
              <InlineCode>notify.done</InlineCode> confirms an action: one at a time at the bottom, a new one replacing
              the last. It stays 4 seconds, 6 when its title wraps, 8 with “Undo”, and it is paused under the pointer,
              with the focus inside, and while the window is in the background. Try both buttons above.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              <InlineCode>undo</InlineCode> adds “Undo” to the toast, and to the row of the history while{' '}
              <InlineCode>until</InlineCode> has not passed. An undo runs once, from whichever place offers it: running
              it from the toast removes it from the history, and the other way round.
            </p>
          </Prose>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Neither the confirmation nor the jobs take the focus on their own. Only changes of state are announced,
              through two hidden live regions the provider keeps: a confirmation, a start and an outcome politely, an
              error once and urgently. A message equal to the previous one is still announced, because each one is a new
              node, and a job announces itself even with no panel on screen.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>F6</InlineCode>, 'Moves the focus to the confirmation, then to the jobs, then back where it was.' ],
              [ <InlineCode key={'k'}>Escape</InlineCode>, 'In the open panel, reduces it and gives the focus back.' ]
            ]}
          />
          <Callout>
            Both stand to the left of an open drawer and above dialogs, on the <InlineCode>z-toast</InlineCode> layer.
          </Callout>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsInspector of={confirmation}
            rows={[
              { slot: 'toast-viewport', part: 'The region of the confirmation' },
              { slot: 'toast-confirmation', part: 'The confirmation' }
            ]}
          />
          <Prose>
            <p>The slots of the jobs are on their page.</p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <SubSection title={'NotificationsProvider'} id={'api-notifications-provider'}>
            <PropsTable props={providerProps} />
          </SubSection>
          <SubSection title={'NotificationsLabels'} id={'api-notifications-labels'}>
            <PropsTable props={labelsProps} />
          </SubSection>
          <SubSection title={'UndoOptions'} id={'api-undo-options'}>
            <PropsTable props={undoOptions} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Confirm what the user just did'}>
              “Route R-14 saved”: the thing and what happened to it, in one line.
            </Guidance>
            <Guidance kind={'dont'} title={'A confirmation for an error'}>
              An error is a job that failed, or <InlineCode>jobs.error</InlineCode>: it stays in the panel until it is
              dismissed, and it is announced at once.
            </Guidance>
            <Guidance kind={'dont'} title={'Call the router from a module'}>
              Hand a <InlineCode>LinkTarget</InlineCode> to the action: the row renders a link, and the module stays
              free of the navigation.
            </Guidance>
          </GuidanceGrid>
        </Section>
      </PageBody>
    </AppShell>
  );
}


/* --------
 * Route
 * -------- */

export const Route = createFileRoute('/ui/feedback/notifications')({
  component: NotificationsPage
});
