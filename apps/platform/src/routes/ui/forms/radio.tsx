import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import radioGroupProps from 'virtual:ui-props/RadioGroupProps';
import radioProps from 'virtual:ui-props/RadioProps';
import themeDoc from 'virtual:ui-theme/forms/radio';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/radio/basic.tsx?example';
import cards from '@/examples/forms/radio/cards.tsx?example';
import controlled from '@/examples/forms/radio/controlled.tsx?example';
import orientation from '@/examples/forms/radio/orientation.tsx?example';
import states from '@/examples/forms/radio/states.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/forms/radio');


/* --------
 * Page
 * -------- */

function RadioPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            One choice among a few options, all in view: two to five short ones, or two to four cards when an option
            needs explaining. Read at a glance, chosen with one click, and never empty again once something is chosen.
          </React.Fragment>
        )}
        imports={tsx`
          import { Radio, RadioGroup } from '@proedis/ui/forms/radio';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Controlled and uncontrolled'}
          lead={(
            <React.Fragment>
              <InlineCode>value</InlineCode> and <InlineCode>onValueChange</InlineCode> on the group, or{' '}
              <InlineCode>defaultValue</InlineCode>. Each <InlineCode>Radio</InlineCode> has its{' '}
              <InlineCode>value</InlineCode>, required, and its label as content.
            </React.Fragment>
          )}
        >
          <Example of={controlled} />
        </Section>

        <Section
          title={'Cards'}
          lead={(
            <React.Fragment>
              <InlineCode>{'variant={\'card\'}'}</InlineCode> frames each option, when at least one needs a line of
              explanation. The whole card is the target, and it takes the colour of the choice and the focus ring of the
              radio inside it.
            </React.Fragment>
          )}
        >
          <Example of={cards} />
        </Section>

        <Section
          title={'Orientation'}
          lead={(
            <React.Fragment>
              <InlineCode>vertical</InlineCode> by default. In a row, at most three short options; one value per
              breakpoint keeps the row a column on a phone. Cards in a row share the width equally.
            </React.Fragment>
          )}
        >
          <Example of={orientation} resizable />
        </Section>

        <Section
          title={'States'}
          lead={(
            <React.Fragment>
              A disabled option says why in its description, which stays readable. Read only, the focus moves and the
              choice does not, and the value is still submitted. Invalid, inside a <InlineCode>Field</InlineCode> with an{' '}
              <InlineCode>error</InlineCode>, the circles turn red.
            </React.Fragment>
          )}
        >
          <Example of={states} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The group is a radiogroup named by the label of its <InlineCode>Field</InlineCode>, which is not clickable
              since it belongs to no single option. The group is one Tab stop: the chosen option, or the first.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Enters the group on the chosen option, and leaves it.' ],
              [ <InlineCode key={'k'}>Arrows</InlineCode>, 'Move and choose at once, skipping disabled options and wrapping around.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Chooses the focused option.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'radio-group', part: 'The group', attributes: [ 'data-variant', 'data-orientation', 'data-disabled', 'data-readonly', 'data-invalid' ] },
              { slot: 'radio', part: 'The row, or the card', attributes: [ 'data-variant', 'data-disabled', 'data-readonly', 'data-invalid' ] },
              { slot: 'radio-circle', part: 'The circle, which takes the focus', attributes: [ 'data-checked', 'data-unchecked' ] },
              { slot: 'radio-dot', part: 'The dot of the chosen one' },
              { slot: 'label', part: 'The text: a Label in the register of an option', attributes: [ 'data-emphasis' ] },
              { slot: 'label-text', part: 'The name of the control, and only that' },
              { slot: 'label-description', part: 'The description, outside the name of the control' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'RadioGroup'} id={'api-radio-group'}>
            <PropsTable
              props={radioGroupProps}
              rest={(
                <React.Fragment>
                  Every other prop goes to the group. Outside a <InlineCode>Field</InlineCode> it needs a name of its own,{' '}
                  <InlineCode>aria-label</InlineCode> or <InlineCode>aria-labelledby</InlineCode>.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'Radio'} id={'api-radio'}>
            <PropsTable
              props={radioProps}
              rest={'The row takes className and the shared props; every other prop, with the ref, reaches the circle, which takes the focus.'}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Radios for a few options in view'}>
              Two to five, read at a glance. More than that is a Select, which keeps the form short.
            </Guidance>
            <Guidance kind={'dont'} title={'A radio for yes or no'}>
              One option that is on or off is a Checkbox, or a Switch if it applies at once.
            </Guidance>
            <Guidance kind={'do'} title={'Cards when one option needs explaining'}>
              If one option needs a line, give every option a line, and frame them as cards.
            </Guidance>
            <Guidance kind={'dont'} title={'Expect to go back to nothing'}>
              Once chosen, a radio group stays chosen. When “none” is a real answer, make it an option.
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

export const Route = createFileRoute('/ui/forms/radio')({
  component: RadioPage
});
