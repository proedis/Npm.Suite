import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import alertProps from 'virtual:ui-props/AlertProps';
import themeDoc from 'virtual:ui-theme/feedback/alert';

import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import actions from '@/examples/feedback/alert/actions.tsx?example';
import basic from '@/examples/feedback/alert/basic.tsx?example';
import dismiss from '@/examples/feedback/alert/dismiss.tsx?example';
import live from '@/examples/feedback/alert/live.tsx?example';
import sizes from '@/examples/feedback/alert/sizes.tsx?example';
import tones from '@/examples/feedback/alert/tones.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/feedback/alert');


/* --------
 * Page
 * -------- */

function AlertPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The page alert: a white card like the others, with a coloured box for the icon. It says a state that
            lasts, of the record or of the page, and what to do about it: “Signal closed · Reopen”. Four tones and
            two sizes. A message about something that just happened is a notification instead.
          </React.Fragment>
        )}
        imports={tsx`
          import { Alert } from '@proedis/ui/feedback/alert';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Tones'}
          lead={(
            <React.Fragment>
              The tone is in the box and, for <InlineCode>warning</InlineCode> and <InlineCode>destructive</InlineCode>,
              in the line around the card too; the text stays black and grey. The two severe tones always have a{' '}
              <InlineCode>title</InlineCode> and a <InlineCode>toneLabel</InlineCode>, by the type. The mild ones,{' '}
              <InlineCode>info</InlineCode> and <InlineCode>success</InlineCode>, may go without.
            </React.Fragment>
          )}
        >
          <Example of={tones} />
          <Prose>
            <p>
              <InlineCode>toneLabel</InlineCode>, “Warning” or “Error”, is read before the title and hidden from
              sight: the colour of the box is not the only way the tone reaches the user. The package writes no word
              of it, so it comes from your translations.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Action'}
          lead={(
            <React.Fragment>
              <InlineCode>action</InlineCode> is one small <InlineCode>secondary</InlineCode> Button, the one that solves
              it. From a 448 pixel container it sits beside the text, below that it goes under the text: the rule reads
              the width of the alert, not of the window, so the same alert is right in a page and in a drawer.
            </React.Fragment>
          )}
        >
          <Example of={actions} resizable />
          <Callout tone={'warning'}>
            Without the permission to solve it, leave the action out. A disabled action in an alert is a dead end the
            user can see and cannot use.
          </Callout>
        </Section>

        <Section
          title={'Dismissing'}
          lead={(
            <React.Fragment>
              Only <InlineCode>info</InlineCode> and <InlineCode>success</InlineCode> close: <InlineCode>onDismiss</InlineCode>{' '}
              and <InlineCode>dismissLabel</InlineCode>, the name and the tooltip of the x, travel together. Before{' '}
              <InlineCode>onDismiss</InlineCode> runs, the focus moves to the first element that follows the alert and
              can take it (a disabled button is skipped, one focusable while disabled is not), or to the{' '}
              <InlineCode>main</InlineCode>, so it is not lost with the alert. A warning and an error go away
              only once solved.
            </React.Fragment>
          )}
        >
          <Example of={dismiss} />
        </Section>

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              <InlineCode>md</InlineCode> on the page background, with a shadow; <InlineCode>sm</InlineCode> inside a
              card, a drawer or a dialog, with a line, where a shadow on a white surface would float.
            </React.Fragment>
          )}
        >
          <Example of={sizes} />
        </Section>

        <Section
          title={'Live alerts'}
          lead={(
            <React.Fragment>
              An alert known when the page opens renders with it and has no role: it is part of the page. One that
              appears later takes <InlineCode>live</InlineCode>, and is announced once, as a{' '}
              <InlineCode>status</InlineCode>, or as an <InlineCode>alert</InlineCode> when it is{' '}
              <InlineCode>destructive</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={live} />
          <Prose>
            <p>
              A live region born full is not read by every screen reader, so a live alert mounts empty and fills itself
              a moment later. The wait is a timer and not an animation frame: frames stop in a background tab, and the
              alert would stay empty there.
            </p>
          </Prose>
        </Section>

        <Section title={'Type safety'} lead={'A severe alert with no title or no tone label, and an x with no name, do not compile.'}>
          <CodeBlock
            snippet={tsx`
              // @ts-expect-error: a warning always has a title and a toneLabel
              <Alert tone={'warning'}>It is not emptied.</Alert>

              // @ts-expect-error: a destructive alert never closes
              <Alert tone={'destructive'} toneLabel={'Error'} title={'Failed'} onDismiss={close} dismissLabel={'Dismiss'}>…</Alert>

              // @ts-expect-error: onDismiss comes with dismissLabel
              <Alert tone={'info'} onDismiss={close}>…</Alert>
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The surface is not interactive: only the action and the x are. The icon is decorative, the tone is said
              by <InlineCode>toneLabel</InlineCode>, and the x is an IconButton whose name is{' '}
              <InlineCode>dismissLabel</InlineCode>.
            </p>
          </Prose>
          <DocTable
            head={[ 'Role', 'When' ]}
            rows={[
              [ 'none', 'An alert that renders with the page.' ],
              [ <InlineCode key={'r'}>status</InlineCode>, 'A live alert that is info, success or warning: announced politely, once.' ],
              [ <InlineCode key={'r'}>alert</InlineCode>, 'A live alert that is destructive: announced at once.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsTable
            rows={[
              { slot: 'alert', part: 'The card', attributes: [ 'data-tone', 'data-size' ] },
              { slot: 'alert-icon', part: 'The coloured box of the icon', attributes: [ 'data-tone', 'data-fill', 'data-size' ] },
              { slot: 'alert-body', part: 'The text and the action' },
              { slot: 'alert-title', part: 'The title' },
              { slot: 'alert-text', part: 'The text' },
              { slot: 'alert-action', part: 'The action' },
              { slot: 'alert-dismiss', part: 'The x', attributes: [ 'data-icon-only' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={alertProps}
            rest={(
              <React.Fragment>
                Every other prop goes to the root <InlineCode>{'<div>'}</InlineCode>, with the ref, except{' '}
                <InlineCode>role</InlineCode>, which the alert sets from <InlineCode>live</InlineCode> and the tone.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Say the consequence'}>
              “It is not emptied until it is assigned” tells the user why it matters. “Container with no contract”
              alone leaves them to work it out.
            </Guidance>
            <Guidance kind={'dont'} title={'An alert for something that just happened'}>
              “Saved” is a notification that leaves on its own. An alert stays because the state it describes stays.
            </Guidance>
            <Guidance kind={'do'} title={'One action, the one that solves it'}>
              “Assign”, “Reopen”. Two actions turn the alert into a form.
            </Guidance>
            <Guidance kind={'dont'} title={'Let an error be dismissed'}>
              A warning or an error goes away when it is solved. Closing it hides the problem, it does not solve it.
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

export const Route = createFileRoute('/feedback/alert')({
  component: AlertPage
});
