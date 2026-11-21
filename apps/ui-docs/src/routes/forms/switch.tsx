import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import switchProps from 'virtual:ui-props/SwitchProps';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/forms/switch/basic.tsx?example';
import description from '@/examples/forms/switch/description.tsx?example';
import inContext from '@/examples/forms/switch/in-context.tsx?example';
import pending from '@/examples/forms/switch/pending.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/switch');


/* --------
 * Page
 * -------- */

function SwitchPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Turns something on or off at once, with no Save and no confirmation: a setting, a view, a notification. It
            is not a field of a form; an option saved with a button is a Checkbox.
          </React.Fragment>
        )}
        imports={tsx`
          import { Switch } from '@proedis/ui/forms/switch';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Label and description'}
          lead={(
            <React.Fragment>
              The label says what is on, and does not change between on and off. The description is a line under it,
              and the place for the reason a switch is read only or disabled. Read only is grey at full opacity and
              reachable; disabled is half opacity and out of the Tab order.
            </React.Fragment>
          )}
        >
          <Example of={description} />
        </Section>

        <Section
          title={'Saving at once'}
          lead={(
            <React.Fragment>
              The thumb moves on the click without waiting for the server. While the change travels,{' '}
              <InlineCode>pending</InlineCode> ignores further clicks and changes nothing in the look. If it fails, the
              caller puts <InlineCode>checked</InlineCode> back and says so. Turn the failure on and try.
            </React.Fragment>
          )}
        >
          <Example of={pending} />
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              A list of notification settings, each a row with its switch at the end. The switch has no label of its
              own here: <InlineCode>aria-labelledby</InlineCode> points to the title of its row.
            </React.Fragment>
          )}
        >
          <Example of={inContext} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The track is a switch, announced as on or off with its label and its description. On and off differ by the
              position of the thumb and the colour of the track, never by colour alone.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Toggles it.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Toggles it too: a switch is not part of a form submit.' ]
            ]}
          />
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'switch', part: 'The row', attributes: [ 'data-disabled', 'data-readonly' ] },
              { slot: 'switch-track', part: 'The track, which takes the focus', attributes: [ 'data-checked', 'data-unchecked' ] },
              { slot: 'switch-thumb', part: 'The thumb', attributes: [ 'data-checked', 'data-unchecked' ] },
              { slot: 'switch-text', part: 'The label and the description' },
              { slot: 'switch-label', part: 'The label' },
              { slot: 'switch-description', part: 'The description' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={switchProps}
            rest={'The row takes className and the shared props; every other prop, with the ref, reaches the track, which takes the focus.'}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A Switch for what applies at once'}>
              The user expects the change to happen when the thumb moves. Save it then, and say so if it fails.
            </Guidance>
            <Guidance kind={'dont'} title={'A Switch in a form with a Save'}>
              Nothing happens until the Save, and the switch lied. Use a Checkbox.
            </Guidance>
            <Guidance kind={'do'} title={'A label that names the thing'}>
              “Overfull bin alerts”, the same when on and off. The track says the state.
            </Guidance>
            <Guidance kind={'dont'} title={'Ask for a confirmation'}>
              A switch that opens a dialog is a button in disguise. What needs confirming is not a switch.
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

export const Route = createFileRoute('/forms/switch')({
  component: SwitchPage
});
