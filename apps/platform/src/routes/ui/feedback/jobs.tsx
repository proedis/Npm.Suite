import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import errorOptions from 'virtual:ui-props/ErrorOptions';
import failOptions from 'virtual:ui-props/FailOptions';
import jobAction from 'virtual:ui-props/JobAction';
import jobsButtonLabels from 'virtual:ui-props/JobsButtonLabels';
import jobsButtonProps from 'virtual:ui-props/JobsButtonProps';
import jobsPanelLabels from 'virtual:ui-props/JobsPanelLabels';
import outcomeOptions from 'virtual:ui-props/OutcomeOptions';
import startOptions from 'virtual:ui-props/StartOptions';
import themeDoc from 'virtual:ui-theme/feedback/jobs';

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
import jobsButton from '@/examples/feedback/jobs/jobs-button.tsx?example';
import run from '@/examples/feedback/jobs/run.tsx?example';
import AppShell from '@/examples/feedback/notifications/setup.tsx';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/feedback/jobs');


/* --------
 * Page
 * -------- */

function JobsPage(): React.ReactNode {
  return (
    /* The provider and the panel of the examples, mounted once around the page as an application mounts them in its shell */
    <AppShell>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The work that runs in the background: an export, an import, a batch of messages. A bar at the bottom right
            that opens into a panel of what runs, what is ready and what failed, and a button for the top bar with the
            history of the session. Both read the store of the notifications: one store, so a module starts a job and
            confirms an action with the same instance.
          </React.Fragment>
        )}
        imports={tsx`
          import { JobsButton, JobsPanel } from '@proedis/ui/feedback/jobs';
          import type { JobsButtonLabels, JobsPanelLabels } from '@proedis/ui/feedback/jobs';
        `}
      />

      <PageBody>
        <Example of={run} />

        <Section
          title={'Setup'}
          lead={(
            <React.Fragment>
              <InlineCode>JobsPanel</InlineCode> once, inside the <InlineCode>NotificationsProvider</InlineCode> of the
              shell, where the application wants it; it reads the provider’s store and throws with its name outside one.
              Its texts are <InlineCode>JobsPanelLabels</InlineCode>, counts included.
            </React.Fragment>
          )}
        >
          <CodeBlock
            title={'AppShell.tsx'}
            snippet={tsx`
              <NotificationsProvider notifications={notifications} labels={labels}>
                <Router />
                <JobsPanel labels={jobsLabels} />
              </NotificationsProvider>
            `}
          />
        </Section>

        <Section
          title={'Running a job'}
          lead={(
            <React.Fragment>
              <InlineCode>jobs.start</InlineCode> opens a row and returns its id. <InlineCode>progress</InlineCode> moves
              its bar, from 0 to 1; without any, the row shows a spinner. The outcome closes it:{' '}
              <InlineCode>succeed</InlineCode>, <InlineCode>warn</InlineCode> or <InlineCode>fail</InlineCode>, each with a
              title, a detail and an action. Press the four buttons above and open the bar at the bottom right.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Call', 'What it does' ]}
            rows={[
              [ <InlineCode key={'c'}>jobs.start(options)</InlineCode>, 'A running row, announced politely. Returns its id. onStop puts “Stop” on it.' ],
              [ <InlineCode key={'c'}>jobs.progress(id, {'{ value, detail }'})</InlineCode>, 'The bar, from 0 to 1, and the detail under the title. Not announced.' ],
              [ <InlineCode key={'c'}>jobs.succeed(id, options)</InlineCode>, 'Done, with an optional action: “Download”, “Open”.' ],
              [ <InlineCode key={'c'}>jobs.warn(id, options)</InlineCode>, 'Done with something to look at.' ],
              [ <InlineCode key={'c'}>jobs.fail(id, options)</InlineCode>, 'Failed: announced at once, and the panel opens. retry puts “Retry” on the row.' ],
              [ <InlineCode key={'c'}>jobs.error(options)</InlineCode>, 'An error with no job behind it and no place to appear. The same groupKey merges into one row with a count.' ]
            ]}
          />
        </Section>

        <Section
          title={'The panel'}
          lead={(
            <React.Fragment>
              Errors first, then what runs, then what is ready. A row that changes state holds still while the pointer or
              the focus is in the panel, so nothing moves under the click. The panel opens on a click on the bar, or on
              its own when an error arrives, and is reduced by Esc, by the first click in the page, or by its button. A
              concluded row has an x; “Clear the concluded” empties them at once.
            </React.Fragment>
          )}
        >
          <Callout>
            The panel is a list of the package rather than a second Base UI toast viewport, whose rows would be dialogs
            that Esc closes, swipe away, and stop at three. It stands to the left of an open drawer, on the{' '}
            <InlineCode>z-toast</InlineCode> layer.
          </Callout>
        </Section>

        <Section
          title={'JobsButton'}
          lead={(
            <React.Fragment>
              The button of the top bar, with the history of the session: every confirmation, job and error, the most
              recent first, the last 50. Its badge counts the errors and the concluded jobs nobody saw, red when one is an
              error; opening the history marks them as seen. It sits inside the provider too.
            </React.Fragment>
          )}
        >
          <Example of={jobsButton} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The jobs never take the focus on their own. The provider announces their changes of state: a start and an
              outcome politely, a failure once and urgently. The badge of the button reaches a screen reader through the
              button’s description, so its name never changes with the count.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>F6</InlineCode>, 'Moves the focus to the confirmation, then to the jobs, then back where it was.' ],
              [ <InlineCode key={'k'}>Escape</InlineCode>, 'In the open panel, reduces it and gives the focus back.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsInspector of={jobsButton}
            rows={[
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
          <SubSection title={'JobsPanelLabels'} id={'api-jobs-panel-labels'}>
            <PropsTable props={jobsPanelLabels} />
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
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Give a failed job its retry'}>
              <InlineCode>retry</InlineCode> puts “Retry” on the row, which removes it and runs the same job again: the
              user does not have to find the button that started it.
            </Guidance>
            <Guidance kind={'dont'} title={'A job for an instant'}>
              A save that answers in a second is a confirmation. A job is work the user can leave running and come back
              to.
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

export const Route = createFileRoute('/ui/feedback/jobs')({
  component: JobsPage
});
