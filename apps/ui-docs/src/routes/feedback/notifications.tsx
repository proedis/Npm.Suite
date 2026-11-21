import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import errorOptions from 'virtual:ui-props/ErrorOptions';
import failOptions from 'virtual:ui-props/FailOptions';
import jobAction from 'virtual:ui-props/JobAction';
import jobsButtonLabels from 'virtual:ui-props/JobsButtonLabels';
import jobsButtonProps from 'virtual:ui-props/JobsButtonProps';
import labelsProps from 'virtual:ui-props/NotificationsLabels';
import providerProps from 'virtual:ui-props/NotificationsProviderProps';
import outcomeOptions from 'virtual:ui-props/OutcomeOptions';
import startOptions from 'virtual:ui-props/StartOptions';
import undoOptions from 'virtual:ui-props/UndoOptions';

import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import confirmation from '@/examples/feedback/notifications/confirmation.tsx?example';
import jobsButton from '@/examples/feedback/notifications/jobs-button.tsx?example';
import jobs from '@/examples/feedback/notifications/jobs.tsx?example';
import AppShell from '@/examples/feedback/notifications/setup.tsx';
import setup from '@/examples/feedback/notifications/setup.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/feedback/notifications');


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
            What the application says back after the user acted, and while long work runs. Two things in two
            places: the <strong>confirmation</strong> of an action, a small toast at the bottom that leaves on its own;
            and the <strong>jobs</strong>, a bar at the bottom right that opens into a panel of what runs, what is
            ready and what failed. A module calls <InlineCode>notify</InlineCode> and{' '}
            <InlineCode>jobs</InlineCode>; the provider and the button draw them.
          </React.Fragment>
        )}
        imports={tsx`
          import {
            createNotifications,
            JobsButton,
            NotificationsProvider
          } from '@proedis/ui/feedback/notifications';
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
              above the router, so the jobs survive a change of page. Every text comes from{' '}
              <InlineCode>labels</InlineCode>: the package writes none, counts included.
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

        <Section
          title={'Jobs'}
          lead={(
            <React.Fragment>
              <InlineCode>jobs.start</InlineCode> opens a row and returns its id. <InlineCode>progress</InlineCode>{' '}
              moves its bar, from 0 to 1; without any, the row shows a spinner. The outcome closes it:{' '}
              <InlineCode>succeed</InlineCode>, <InlineCode>warn</InlineCode> or <InlineCode>fail</InlineCode>, each with
              a title, a detail and an action. Press the four buttons and open the bar at the bottom right.
            </React.Fragment>
          )}
        >
          <Example of={jobs} />
          <DocTable
            head={[ 'Call', 'What it does' ]}
            rows={[
              [ <InlineCode key={'c'}>jobs.start(options)</InlineCode>, 'A running row, announced politely. Returns its id. onStop puts “Stop” on it.' ],
              [ <InlineCode key={'c'}>jobs.progress(id, {'{ value, detail }'})</InlineCode>, 'The bar, from 0 to 1, and the detail under the title. Not announced.' ],
              [ <InlineCode key={'c'}>jobs.succeed(id, options)</InlineCode>, 'Done, with an optional action: “Download”, “Open”.' ],
              [ <InlineCode key={'c'}>jobs.warn(id, options)</InlineCode>, 'Done with something to look at.' ],
              [ <InlineCode key={'c'}>jobs.fail(id, options)</InlineCode>, 'Failed: announced at once, and the panel opens. retry puts “Retry” on the row.' ],
              [ <InlineCode key={'c'}>jobs.error(options)</InlineCode>, 'An error with no job behind it and no place to appear. The same groupKey merges into one row with a count.' ],
              [ <InlineCode key={'c'}>notify.done(options)</InlineCode>, 'The confirmation of an action, with an optional undo.' ]
            ]}
          />
          <Callout>
            The jobs panel is a list of the package rather than a second Base UI toast viewport, whose rows would be
            dialogs that Esc closes, swipe away, and stop at three.
          </Callout>
        </Section>

        <Section
          title={'The panel'}
          lead={(
            <React.Fragment>
              Errors first, then what runs, then what is ready. A row that changes state holds still while the pointer
              or the focus is in the panel, so nothing moves under the click. The panel opens on a click on the bar, or
              on its own when an error arrives, and is reduced by Esc, by the first click in the page, or by its
              button. A concluded row has an x; “Clear the concluded” empties them at once.
            </React.Fragment>
          )}
        />

        <Section
          title={'JobsButton'}
          lead={(
            <React.Fragment>
              The button of the top bar, with the history of the session: every confirmation, job and error, the most
              recent first, the last 50. Its badge counts the errors and the concluded jobs nobody saw, red when one is
              an error; opening the history marks them as seen. It must sit inside the provider, and throws with its
              name when it does not.
            </React.Fragment>
          )}
        >
          <Example of={jobsButton} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Neither the confirmation nor the jobs take the focus on their own. Only changes of state are announced,
              through two hidden live regions: a start and an outcome politely, an error once and urgently. A message
              equal to the previous one is still announced, because each one is a new node. The badge of the button
              reaches a screen reader through the button’s description, so its name never changes with the count.
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

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsTable
            rows={[
              { slot: 'toast-viewport', part: 'The region of the confirmation' },
              { slot: 'toast-confirmation', part: 'The confirmation' },
              { slot: 'toast-jobs', part: 'The region of the jobs', attributes: [ 'data-expanded' ] },
              { slot: 'toast-jobs-bar', part: 'The reduced bar', attributes: [ 'data-status' ] },
              { slot: 'toast-jobs-panel', part: 'The open panel' },
              { slot: 'toast-jobs-header', part: 'Its header, with the counts' },
              { slot: 'toast-job', part: 'A row', attributes: [ 'data-status' ] },
              { slot: 'toast-job-actions', part: 'The actions of a row' },
              { slot: 'jobs', part: 'The wrapper of JobsButton and its badge' },
              { slot: 'jobs-button', part: 'The button' },
              { slot: 'jobs-history', part: 'The history' },
              { slot: 'jobs-history-row', part: 'A row of the history', attributes: [ 'data-unseen' ] },
              { slot: 'jobs-history-row-meta', part: 'The time of a row, and until when it can be undone' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'NotificationsProvider'} id={'api-notifications-provider'}>
            <PropsTable props={providerProps} />
          </SubSection>
          <SubSection title={'NotificationsLabels'} id={'api-notifications-labels'}>
            <PropsTable props={labelsProps} />
          </SubSection>
          <SubSection title={'JobsButton'} id={'api-jobs-button'}>
            <PropsTable props={jobsButtonProps} />
          </SubSection>
          <SubSection title={'JobsButtonLabels'} id={'api-jobs-button-labels'}>
            <PropsTable props={jobsButtonLabels} />
          </SubSection>
          <SubSection title={'StartOptions'} id={'api-start-options'}>
            <PropsTable props={startOptions} />
          </SubSection>
          <SubSection title={'OutcomeOptions'} id={'api-outcome-options'}>
            <PropsTable
              props={outcomeOptions}
              rest={<React.Fragment>What <InlineCode>jobs.succeed</InlineCode> takes.</React.Fragment>}
            />
          </SubSection>
          <SubSection title={'FailOptions'} id={'api-fail-options'}>
            <PropsTable
              props={failOptions}
              rest={(
                <React.Fragment>
                  What <InlineCode>jobs.warn</InlineCode> and <InlineCode>jobs.fail</InlineCode> take.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'ErrorOptions'} id={'api-error-options'}>
            <PropsTable props={errorOptions} />
          </SubSection>
          <SubSection title={'JobAction'} id={'api-job-action'}>
            <PropsTable props={jobAction} />
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
            <Guidance kind={'do'} title={'Give a failed job its retry'}>
              <InlineCode>retry</InlineCode> puts “Retry” on the row, which removes it and runs the same job again: the
              user does not have to find the button that started it.
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

export const Route = createFileRoute('/feedback/notifications')({
  component: NotificationsPage
});
