import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import labelProps from 'virtual:ui-props/StrictLabelProps';
import themeDoc from 'virtual:ui-theme/primitives/label';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { PropsTable } from '@/docs/Tables';
import basic from '@/examples/primitives/label/basic.tsx?example';
import data from '@/examples/primitives/label/data.tsx?example';
import emphasis from '@/examples/primitives/label/emphasis.tsx?example';
import marks from '@/examples/primitives/label/marks.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Page
 * -------- */

const PAGE = pageAt('/primitives/label');

function LabelPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The name of something: of a field, of an option, of a value. Every label of the package is this one, the
            label of a Field, the text of a checkbox, the name in a Detail. A <InlineCode>{'<label>'}</InlineCode> by
            default, because that element is what ties a name to a control: clicking the name focuses the field.
          </React.Fragment>
        )}
        imports={tsx`
          import { Label } from '@proedis/ui/primitives';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Emphasis'}
          lead={(
            <React.Fragment>
              Registers for opposite jobs. A <strong>form</strong> label is the loud half of its pair: the field under
              it is empty until someone types, so the label carries the meaning. A <strong>data</strong> label is the
              quiet half: the value next to it is the point. The text of an <strong>option</strong> sits between the
              two, at the weight of the body: <InlineCode>regular</InlineCode>, what Checkbox, Radio and Switch write.
            </React.Fragment>
          )}
        >
          <Example of={emphasis} />
          <Prose>
            <p>
              The first rows above are the four values; the two columns under them are the two jobs, a form label over
              an empty field and a data label over its value. <InlineCode>default</InlineCode> and{' '}
              <InlineCode>strong</InlineCode> draw the same today, and that is the point of having both. A label nobody had an opinion about reports <InlineCode>data-emphasis</InlineCode> as{' '}
              <InlineCode>default</InlineCode>,
              so a product can restyle exactly that set and leave alone the labels that asked for{' '}
              <InlineCode>strong</InlineCode> on purpose, whatever the package decides the default looks like later.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Required and optional'}
          lead={(
            <React.Fragment>
              <InlineCode>required</InlineCode> puts the asterisk after the name, hidden from a screen reader: the
              control says <InlineCode>aria-required</InlineCode> itself, and a Field does it for the control inside.{' '}
              <InlineCode>optional</InlineCode> takes the word of a form where almost everything is required, in the
              language of the page, and is not shown with <InlineCode>required</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={marks} />
        </Section>

        <Section
          title={'Without a control'}
          lead={(
            <React.Fragment>
              With nothing to point at, render a <InlineCode>span</InlineCode>: a summary, a key figure, a definition.{' '}
              <InlineCode>Label.Description</InlineCode> adds the unit, the format or the source on a second line.
            </React.Fragment>
          )}
        >
          <Example of={data} />
          <Callout>
            For a label over a value, <InlineCode>LabeledContent</InlineCode> is this pattern already assembled, with the
            value in its register. Inside a form, a Field renders this label and ties it to its control.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Rendered as a <InlineCode>{'<label>'}</InlineCode> with <InlineCode>htmlFor</InlineCode>, the text becomes the
              accessible name of the control. The description is a sibling and never a child: inside a label it would
              join the name, and a screen reader would read it at every focus, then once more as the description. Give
              it an <InlineCode>id</InlineCode> and point the control at it with <InlineCode>aria-describedby</InlineCode>.
            </p>
            <p>
              The asterisk is hidden from a screen reader, which hears <InlineCode>required</InlineCode> from the control
              instead: a mark read aloud as “star” says nothing.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'label', part: 'The label, or the element given with as', attributes: [ 'data-emphasis', 'data-required', 'data-optional' ] },
              { slot: 'label-required', part: 'The asterisk' },
              { slot: 'label-optional', part: 'The optional word' },
              { slot: 'label-description', part: 'Label.Description, the second line' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={labelProps}
            rest={(
              <React.Fragment>
                Polymorphic: <InlineCode>as</InlineCode> picks the element, <InlineCode>{'\'label\''}</InlineCode> by default,
                and every other prop goes to it, typed by it (<InlineCode>htmlFor</InlineCode> on a label).
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Point it at its control'}>
              A label with <InlineCode>htmlFor</InlineCode> makes the whole name a target for the pointer and the name
              of the field for a screen reader.
            </Guidance>
            <Guidance kind={'dont'} title={'Render a label with nothing to label'}>
              A <InlineCode>{'<label>'}</InlineCode> pointing nowhere is noise in the accessibility tree. Without a
              control, <InlineCode>as={'{\'span\'}'}</InlineCode>.
            </Guidance>
            <Guidance kind={'do'} title={'Quiet labels over data'}>
              Over a value, the label steps back and the value speaks. The loud register is for an empty field.
            </Guidance>
            <Guidance kind={'dont'} title={'Write the unit in the label and the value'}>
              “Weight (kg)” over “1,204 kg” says it twice. Put the unit in one place, the description if it is a format.
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

export const Route = createFileRoute('/primitives/label')({
  component: LabelPage
});
