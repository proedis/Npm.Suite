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
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/primitives/label/basic.tsx?example';
import data from '@/examples/primitives/label/data.tsx?example';
import emphasis from '@/examples/primitives/label/emphasis.tsx?example';
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
            The name of something, with an optional line of detail under it. A <InlineCode>{'<label>'}</InlineCode> by
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
              Two registers for two opposite jobs. A <strong>form</strong> label is the loud half of its pair: the field
              under it is empty until someone types, so the label carries the meaning. A <strong>data</strong> label is
              the quiet half: the value next to it is the point. <InlineCode>quiet</InlineCode> is the second register.
            </React.Fragment>
          )}
        >
          <Example of={emphasis} />
          <Prose>
            <p>
              The first rows above are the three values; the two columns under them are the two jobs, a form label over
              an empty field and a data label over its value. <InlineCode>default</InlineCode> and{' '}
              <InlineCode>strong</InlineCode> draw the same today, and that is the point of having both. A label nobody had an opinion about reports <InlineCode>data-emphasis</InlineCode> as{' '}
              <InlineCode>default</InlineCode>,
              so a product can restyle exactly that set and leave alone the labels that asked for{' '}
              <InlineCode>strong</InlineCode> on purpose, whatever the package decides the default looks like later.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Without a control'}
          lead={(
            <React.Fragment>
              With nothing to point at, render a <InlineCode>span</InlineCode>: a summary, a key figure, a definition.
              <InlineCode>description</InlineCode> adds the unit, the format or the source on a second, quieter line.
            </React.Fragment>
          )}
        >
          <Example of={data} />
          <Callout>
            For a label over a value, <InlineCode>LabeledContent</InlineCode> is this pattern already assembled, with the
            value in its register. Inside a form, <InlineCode>Field.Label</InlineCode> adds the required mark and the
            optional word, which need the form layer.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Rendered as a <InlineCode>{'<label>'}</InlineCode> with <InlineCode>htmlFor</InlineCode>, the text becomes the
              accessible name of the control, and the description is part of that name. Every element inside is phrasing
              content, two spans laid out by a stack, so the label stays valid HTML even with a description.
            </p>
            <p>
              There is no <InlineCode>required</InlineCode> prop on purpose: the asterisk and its colour belong to the
              form layer, next to the error and the description it already owns.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'label', part: 'The label, or the element given with as', attributes: [ 'data-emphasis' ] },
              { slot: 'label-text', part: 'The name' },
              { slot: 'label-description', part: 'The second line' }
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
