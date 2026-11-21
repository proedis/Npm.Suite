import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import textInputActionProps from 'virtual:ui-props/TextInputActionProps';
import textInputProps from 'virtual:ui-props/TextInputProps';
import { Callout } from '@/docs/Callout';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import action from '@/examples/forms/text-input/action.tsx?example';
import adornments from '@/examples/forms/text-input/adornments.tsx?example';
import basic from '@/examples/forms/text-input/basic.tsx?example';
import loading from '@/examples/forms/text-input/loading.tsx?example';
import searchBar from '@/examples/forms/text-input/search-bar.tsx?example';
import sizes from '@/examples/forms/text-input/sizes.tsx?example';
import states from '@/examples/forms/text-input/states.tsx?example';
import width from '@/examples/forms/text-input/width.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/text-input');

const LINK = 'font-medium text-primary hover:underline';


/** The action's own props: what it inherits from Button is fixed by the field */
const ACTION_PROPS = textInputActionProps.filter((prop) => prop.from !== 'StrictButtonProps');


/* --------
 * Page
 * -------- */

function TextInputPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The single line text field: a full border on the card surface, three sizes, an icon or a fixed text on
            either side, and actions inside. The control alone: its label and its messages are the{' '}
            <Link to={'/forms/field'} className={LINK}>Field</Link>’s, so the same control works in a form, a filter
            bar and a table row.
          </React.Fragment>
        )}
        imports={tsx`
          import { TextInput } from '@proedis/ui/forms/text-input';
          import type { TextInputProps, TextInputSize, TextInputWidth } from '@proedis/ui/forms/text-input';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              <InlineCode>sm</InlineCode> in a table row or a filter bar, <InlineCode>md</InlineCode> in forms,{' '}
              <InlineCode>lg</InlineCode> for a sign in or an empty state. One value, never one per breakpoint: the
              height of a control is a matter of the pointer, not of the width, and on a touch screen every height grows
              one step on its own.
            </React.Fragment>
          )}
        >
          <Example of={sizes} />
        </Section>

        <Section
          title={'Icons, prefix and suffix'}
          lead={(
            <React.Fragment>
              <InlineCode>leading</InlineCode> and <InlineCode>trailing</InlineCode> take an icon, not clickable.{' '}
              <InlineCode>prefix</InlineCode> and <InlineCode>suffix</InlineCode> take a fixed text that is not part of
              the value: a code prefix the application adds on save, a unit.
            </React.Fragment>
          )}
        >
          <Example of={adornments} />
          <Callout>
            The prefix and the suffix are plain text beside the input, not in its value and not in its name. When the
            unit matters to understand the value, say it in the label or in the description too.
          </Callout>
        </Section>

        <Section
          title={'Actions'}
          lead={(
            <React.Fragment>
              <InlineCode>TextInput.Action</InlineCode> is a button inside the field, in <InlineCode>trailing</InlineCode>:
              generate a value, copy it, clear a search. An IconButton, so its <InlineCode>label</InlineCode> is both its
              name and its tooltip; quiet, 24px square in every size, 4px from the border.
            </React.Fragment>
          )}
        >
          <Example of={action} />
          <Prose>
            <p>
              The action is not rendered while the field is disabled or read only, where it would act on a value that
              cannot change. Its focus is an inner ring with no halo, and it never lights the frame: the frame lights
              only from the text.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Width'}
          lead={(
            <React.Fragment>
              <InlineCode>width</InlineCode> says what kind of value the field holds, and the field’s{' '}
              <InlineCode>span</InlineCode> says how many of the six columns of a section it takes: the two go together,
              as the keys of <InlineCode>FIELD_SPAN</InlineCode> suggest. The control itself fills its cell.
            </React.Fragment>
          )}
        >
          <Example of={width} previewClassName={'p-4 sm:p-6'} />
          <Prose>
            <p>
              <InlineCode>width</InlineCode> sets the minimum width of the frame, 16 steps of the spacing scale for{' '}
              <InlineCode>short</InlineCode> and 24 for the others, and reports itself as{' '}
              <InlineCode>data-width</InlineCode>. It does not choose the span: that is the{' '}
              <InlineCode>span</InlineCode> of the Field around it.
            </p>
          </Prose>
        </Section>

        <Section
          title={'States'}
          lead={(
            <React.Fragment>
              Inside a field the control reads <InlineCode>required</InlineCode>, <InlineCode>invalid</InlineCode> and{' '}
              <InlineCode>disabled</InlineCode> from it; outside one, <InlineCode>invalid</InlineCode> and{' '}
              <InlineCode>disabled</InlineCode> are props. Read only and disabled are two different states: read only
              stays reachable, selectable and submitted, and both hide the placeholder.
            </React.Fragment>
          )}
        >
          <Example of={states} />
        </Section>

        <Section
          title={'Loading'}
          lead={(
            <React.Fragment>
              <InlineCode>loading</InlineCode> puts a spinner in place of what <InlineCode>trailing</InlineCode> holds,
              while a value is checked against the server. <InlineCode>loadingLabel</InlineCode> is required with it, by
              the type. Type a plate of seven characters.
            </React.Fragment>
          )}
        >
          <Example of={loading} />
        </Section>

        <Section
          title={'Outside a form'}
          lead={(
            <React.Fragment>
              In a toolbar or a filter bar there is no Field and no visible label: the control needs a name of its own,
              with <InlineCode>aria-label</InlineCode>. For a search, the{' '}
              <Link to={'/forms/search-input'} className={LINK}>SearchInput</Link> adds the clear action and Esc.
            </React.Fragment>
          )}
        >
          <Example of={searchBar} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The control is Base UI’s <InlineCode>Input</InlineCode> on a native <InlineCode>{'<input>'}</InlineCode>,
              tied to the label of its field. It says <InlineCode>aria-required</InlineCode> and{' '}
              <InlineCode>aria-invalid</InlineCode> from the field, never the native <InlineCode>required</InlineCode>.
              The ref is the input, which is also what a Tooltip around the control anchors to. The placeholder darkens
              when the system asks for more contrast.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves into the text, then to each action inside the field, then out.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Submits the form around it, as a native input does.' ]
            ]}
          />
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'text-input', part: 'The frame', attributes: [ 'data-size', 'data-width', 'data-loading', 'data-invalid', 'data-readonly', 'data-disabled' ] },
              { slot: 'text-input-control', part: 'The input', attributes: [ 'data-field-control' ] },
              { slot: 'text-input-leading', part: 'The icon before the value' },
              { slot: 'text-input-prefix', part: 'The fixed text before the value' },
              { slot: 'text-input-suffix', part: 'The fixed text after the value' },
              { slot: 'text-input-trailing', part: 'The icon or the actions after the value' },
              { slot: 'text-input-spinner', part: 'The spinner, in place of trailing' },
              { slot: 'text-input-action', part: 'An action, the IconButton itself', attributes: [ 'data-icon-only' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'TextInput'} id={'api-text-input'}>
            <PropsTable
              props={textInputProps}
              rest={(
                <React.Fragment>
                  Every other prop goes to the <InlineCode>{'<input>'}</InlineCode>: <InlineCode>value</InlineCode>,{' '}
                  <InlineCode>onChange</InlineCode>, <InlineCode>name</InlineCode>, <InlineCode>type</InlineCode>,{' '}
                  <InlineCode>readOnly</InlineCode>, <InlineCode>disabled</InlineCode>, <InlineCode>placeholder</InlineCode>,{' '}
                  <InlineCode>aria-*</InlineCode>, <InlineCode>ref</InlineCode>. <InlineCode>className</InlineCode> and the
                  shared props go to the frame.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'TextInput.Action'} id={'api-text-input-action'}>
            <PropsTable
              props={ACTION_PROPS}
              rest={(
                <React.Fragment>
                  The props of an <Link to={'/actions/button'} className={LINK}>IconButton</Link> but{' '}
                  <InlineCode>size</InlineCode>, <InlineCode>fill</InlineCode>, <InlineCode>tone</InlineCode> and{' '}
                  <InlineCode>loading</InlineCode>, which the field decides: <InlineCode>plain</InlineCode>,{' '}
                  <InlineCode>muted</InlineCode>, 24px square.
                </React.Fragment>
              )}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Put it in a Field'}>
              Label, description and error come from the field, and the control follows its state. Outside a form, give
              it an <InlineCode>aria-label</InlineCode>.
            </Guidance>
            <Guidance kind={'dont'} title={'A placeholder for the label'}>
              The placeholder is an example of the value (“E.g. Chieri”), and it goes away when the user types.
            </Guidance>
            <Guidance kind={'do'} title={'A NumberInput for a number'}>
              Weights, amounts and quantities have their separators, their unit and their keys. A TextInput with a
              conversion on save gets all three wrong.
            </Guidance>
            <Guidance kind={'dont'} title={'An identifier typed by hand'}>
              A field that points at another record is a choice among the real records, never a text where someone
              types an id.
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

export const Route = createFileRoute('/forms/text-input')({
  component: TextInputPage
});
