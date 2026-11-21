import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import alertDialogLabelsProps from 'virtual:ui-props/AlertDialogLabels';
import alertDialogProps from 'virtual:ui-props/AlertDialogProps';
import resultProps from 'virtual:ui-props/AlertDialogResult';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/overlays/alert-dialog/basic.tsx?example';
import confirmText from '@/examples/overlays/alert-dialog/confirm-text.tsx?example';
import consequences from '@/examples/overlays/alert-dialog/consequences.tsx?example';
import labels from '@/examples/overlays/alert-dialog/labels.ts?source';
import outcome from '@/examples/overlays/alert-dialog/outcome.tsx?example';
import warning from '@/examples/overlays/alert-dialog/warning.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/overlays/alert-dialog');


/* --------
 * Page
 * -------- */

function AlertDialogPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The dialog that stops before losing something: deleting a saved item, discarding unsaved work. The Dialog’s
            anatomy at 400px, with no x, a box in the tone of the risk, and two actions: the safe exit, which has the
            focus, and the one that loses. Three grades, from a plain question to a name to type.
          </React.Fragment>
        )}
        imports={tsx`
          import { AlertDialog } from '@proedis/ui/overlays/alert-dialog';
          import type { AlertDialogLabels, AlertDialogResult } from '@proedis/ui/overlays/alert-dialog';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Anatomy'}
          lead={(
            <React.Fragment>
              The title asks the question with its verb and its object, “Delete route R-14?”, and the description says
              whether it can be recovered and what stays out. The action repeats the verb and the object rather than
              saying “OK”: someone who reads only the button knows what it does.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              There is no x, and a click outside never closes it: the panel jolts instead. Esc and the safe exit close
              it. The focus opens on the safe exit, so a reflexive Enter keeps what was there.
            </p>
            <p>
              The action is a <strong>solid destructive</strong> button. That is a declared exception: elsewhere a
              destructive action inside a dialog takes the soft fill, but here the action is the whole point of the
              dialog, and the red is what tells the user to read before pressing.
            </p>
          </Prose>
          <SubSection
            title={'Labels'}
            lead={(
              <React.Fragment>
                The package writes no visible string, so the veils, the “Close” of an outcome and the uncertain outcome
                arrive as <InlineCode>labels</InlineCode>. An application defines them once, normally through its
                translations, and every example on this page shares this file.
              </React.Fragment>
            )}
          >
            <CodeBlock snippet={labels} title={labels.file} />
          </SubSection>
        </Section>

        <Section
          title={'Warning'}
          lead={(
            <React.Fragment>
              <InlineCode>tone</InlineCode> defaults to <InlineCode>destructive</InlineCode>.{' '}
              <InlineCode>warning</InlineCode> is for one case only: discarding work that was never saved. Deleting
              anything saved is destructive, however small. The discard prompt of Dialog and Drawer is this dialog, in
              this tone.
            </React.Fragment>
          )}
        >
          <Example of={warning} />
        </Section>

        <Section
          title={'Consequences'}
          lead={(
            <React.Fragment>
              The second grade: <InlineCode>consequences</InlineCode> lists the effects on other items, to read before
              choosing. When they come from the server, <InlineCode>{'busy={\'load\'}'}</InlineCode> covers them with a
              veil and keeps the action off; Esc and the safe exit still close. They are part of the description of the
              dialog, so they are read when it opens.
            </React.Fragment>
          )}
        >
          <Example of={consequences} />
        </Section>

        <Section
          title={'A name to type'}
          lead={(
            <React.Fragment>
              The third grade, for what cannot be undone and takes a lot with it: <InlineCode>confirmText</InlineCode>{' '}
              is the text to type, always together with <InlineCode>consequences</InlineCode>. The focus opens on the
              field. The action stays reachable but off until the text matches; pressing it, or Enter in the field, while
              it is off shows the field error and brings the focus back to the field.
            </React.Fragment>
          )}
        >
          <Example of={confirmText} />
          <Prose>
            <p>
              The comparison forgives what nobody should be failed for: case, repeated spaces, typographic apostrophes
              and quotes, and the thousands dots of a number. Every opening starts from an empty field, even when the
              dialog was closed by the page after a successful action rather than by the user.
            </p>
          </Prose>
          <Callout>
            With <InlineCode>confirmText</InlineCode> the type makes <InlineCode>confirmField</InlineCode>,{' '}
            <InlineCode>confirmHint</InlineCode> and <InlineCode>confirmMismatch</InlineCode> required in{' '}
            <InlineCode>labels</InlineCode>: a field with no name in front of the one action that asks for care does not
            compile.
          </Callout>
        </Section>

        <Section
          title={'Running, failing, and the uncertain outcome'}
          lead={(
            <React.Fragment>
              <InlineCode>{'busy={\'action\'}'}</InlineCode> makes the dialog inert while the action runs, with a veil
              after 300ms, and nothing closes it. An <InlineCode>error</InlineCode> worth retrying shows at the top of the
              body and takes the focus. <InlineCode>result</InlineCode> turns the dialog into an outcome, partly done or
              impossible, where only the exit stays, renamed with <InlineCode>labels.close</InlineCode>, and the focus
              moves from the veil to that exit, so Enter closes it. After{' '}
              <InlineCode>timeoutMs</InlineCode>, 15 seconds by default and 4 in this example, the outcome becomes
              uncertain: the server may have done it anyway, and <InlineCode>onTimeout</InlineCode> tells the page to
              reload what it shows.
            </React.Fragment>
          )}
        >
          <Example of={outcome} />
          <Callout tone={'warning'}>
            As in Dialog, leave <InlineCode>busy</InlineCode> on <InlineCode>{'\'action\''}</InlineCode> after the timeout: the
            uncertain outcome shows for as long as it stays there, and the exit closes the dialog meanwhile.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The panel is Base UI’s <InlineCode>AlertDialog</InlineCode>, announced as an <InlineCode>alertdialog</InlineCode>{' '}
              named by its title. Its description points at the description and, in the second and third grade, at the
              consequences too, so both are read before the actions. An outcome replaces the title and the description
              in place, so it is read the same way.
            </p>
            <p>
              The action that is off is <InlineCode>aria-disabled</InlineCode>, not <InlineCode>disabled</InlineCode>: it
              stays in the tab order and says why it does nothing when pressed. The hint of the field is a polite live
              region, so “The name matches” is heard when it does.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves between the field, the safe exit and the action, and stays inside.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'On a button, presses it. In the field of the third grade, runs the action, or shows the error while the text does not match.' ],
              [ <InlineCode key={'k'}>Escape</InlineCode>, 'Closes, except while the action runs.' ]
            ]}
          />
        </Section>

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsTable
            rows={[
              { slot: 'alert-dialog', part: 'The panel', attributes: [ 'data-tone', 'data-size', 'data-open' ] },
              { slot: 'alert-dialog-backdrop', part: 'The veil behind it' },
              { slot: 'alert-dialog-viewport', part: 'The fixed layer that places the panel' },
              { slot: 'alert-dialog-header', part: 'The header' },
              { slot: 'alert-dialog-icon', part: 'The box in the tone of the risk', attributes: [ 'data-tone' ] },
              { slot: 'alert-dialog-heading', part: 'The title and the description' },
              { slot: 'alert-dialog-title', part: 'The question, or the title of an outcome' },
              { slot: 'alert-dialog-description', part: 'What is lost, or the description of an outcome' },
              { slot: 'alert-dialog-content', part: 'The body and its frame', attributes: [ 'aria-busy' ] },
              { slot: 'alert-dialog-scroll', part: 'The frame of the body and its shades' },
              { slot: 'alert-dialog-shade', part: 'A scroll shade', attributes: [ 'data-edge', 'data-visible' ] },
              { slot: 'alert-dialog-body', part: 'The body, indented to the title' },
              { slot: 'alert-dialog-body-content', part: 'The error, the consequences and the field' },
              { slot: 'alert-dialog-consequences', part: 'The consequences', attributes: [ 'aria-busy' ] },
              { slot: 'alert-dialog-error', part: 'The error to retry' },
              { slot: 'alert-dialog-error-message', part: 'Its message' },
              { slot: 'alert-dialog-footer', part: 'The footer' },
              { slot: 'alert-dialog-footer-actions', part: 'The two actions' },
              { slot: 'alert-dialog-cancel', part: 'The safe exit, or Close after an outcome' },
              { slot: 'alert-dialog-action', part: 'The action', attributes: [ 'aria-disabled' ] },
              { slot: 'alert-dialog-veil', part: 'The veil while the action runs' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'AlertDialog'} id={'api-alert-dialog'}>
            <PropsTable
              props={alertDialogProps}
              rest={(
                <React.Fragment>
                  <InlineCode>busy</InlineCode> defaults to <InlineCode>false</InlineCode> and{' '}
                  <InlineCode>timeoutMs</InlineCode> to <InlineCode>15000</InlineCode>. With{' '}
                  <InlineCode>confirmText</InlineCode>, <InlineCode>labels</InlineCode> must also carry{' '}
                  <InlineCode>confirmField</InlineCode>, <InlineCode>confirmHint</InlineCode> and{' '}
                  <InlineCode>confirmMismatch</InlineCode>.
                </React.Fragment>
              )}
            />
          </SubSection>

          <SubSection title={'AlertDialogLabels'} id={'api-alert-dialog-labels'}>
            <PropsTable props={alertDialogLabelsProps} />
          </SubSection>

          <SubSection title={'AlertDialogResult'} id={'api-alert-dialog-result'}>
            <PropsTable props={resultProps} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Name the verb and the object, in the title and on the action'}>
              “Delete route R-14?” and “Delete route”. Someone who reads only the button still knows what it does.
            </Guidance>
            <Guidance kind={'dont'} title={'Confirm with it what loses nothing'}>
              A confirmation that loses nothing is a Dialog, with a primary action. The red box is kept for the moments
              something is about to be lost, or it stops being read.
            </Guidance>
            <Guidance kind={'do'} title={'Pick the grade from what is lost'}>
              One item: the question. Effects on other items: the consequences. A whole district with its history: a
              name to type.
            </Guidance>
            <Guidance kind={'dont'} title={'Use warning to delete'}>
              Warning is for work never saved. Anything saved, however small, is destructive.
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

export const Route = createFileRoute('/overlays/alert-dialog')({
  component: AlertDialogPage
});
