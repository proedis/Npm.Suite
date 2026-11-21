import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import labelProps from 'virtual:ui-props/StrictLabelProps';
import labeledContentProps from 'virtual:ui-props/StrictLabeledContentProps';
import themeDoc from 'virtual:ui-theme/display/labeled-content';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/display/labeled-content/basic.tsx?example';
import inItem from '@/examples/display/labeled-content/in-item.tsx?example';
import inline from '@/examples/display/labeled-content/inline.tsx?example';
import summary from '@/examples/display/labeled-content/summary.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/display/labeled-content');

/** The label part is a Label in its quiet emphasis: its emphasis is fixed, its description is not */
const LABEL_PROPS = labelProps.filter((prop) => prop.name !== 'emphasis');


/* --------
 * Page
 * -------- */

function LabeledContentPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A value with a label: the read only counterpart of a form field. The emphasis is the inverse of a Heading: a
            quiet name over a loud value, because here the value is the point.
          </React.Fragment>
        )}
        imports={tsx`
          import { LabeledContent } from '@proedis/ui/display/labeled-content';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Inline'}
          lead={(
            <React.Fragment>
              <InlineCode>inline</InlineCode> puts the label and the value on one line, the value pushed to the end: the
              shape of a settings row or a summary row. The label takes the room and wraps, the value never shrinks.
            </React.Fragment>
          )}
        >
          <Example of={inline} />
        </Section>

        <Section
          title={'A summary'}
          lead={(
            <React.Fragment>
              In a grid of columns, a block of facts about one record. <InlineCode>LabeledContent.Label</InlineCode> is a{' '}
              <InlineCode>Label</InlineCode>, so it takes a <InlineCode>description</InlineCode> for the unit or the source.
            </React.Fragment>
          )}
        >
          <Example of={summary} />
        </Section>

        <Section
          title={'In a row'}
          lead={(
            <React.Fragment>
              The icon and the row around the pair belong to <InlineCode>Item</InlineCode>, which grows a LabeledContent
              exactly as it grows a Heading: the value truncates before the actions move.
            </React.Fragment>
          )}
        >
          <Example of={inItem} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The label is a <InlineCode>span</InlineCode>, not a <InlineCode>{'<label>'}</InlineCode>: there is no control to
              point at. Label and value are read in order. For a long list of facts about one record, the{' '}
              <InlineCode>Detail</InlineCode> of the data section renders a description list, which announces each pair as a
              term and its definition.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'labeled-content', part: 'The pair', attributes: [ 'data-inline' ] },
              { slot: 'labeled-content-label', part: 'The label, a Label in its quiet emphasis', attributes: [ 'data-emphasis' ] },
              { slot: 'label-text', part: 'The name inside the label' },
              { slot: 'label-description', part: 'The second line of the label, with description' },
              { slot: 'labeled-content-value', part: 'The value' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'LabeledContent'} id={'api-labeled-content'}>
            <PropsTable props={labeledContentProps} rest={'Polymorphic, a div by default: every other prop goes to the element.'} />
          </SubSection>
          <SubSection title={'LabeledContent.Label'} id={'api-labeled-content-label'}>
            <PropsTable
              props={LABEL_PROPS}
              rest={(
                <React.Fragment>
                  The props of <InlineCode>Label</InlineCode>, rendered as a <InlineCode>span</InlineCode> in the{' '}
                  <InlineCode>quiet</InlineCode> emphasis.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'LabeledContent.Value'} id={'api-labeled-content-value'}>
            <Prose>
              <p>
                No props of its own beyond the shared ones. Polymorphic, a <InlineCode>div</InlineCode> by default, so a
                badge, a person or a link can be the value.
              </p>
            </Prose>
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Keep the value loud'}>
              The value is what the user came for. Restyle the label if you must, never the other way round.
            </Guidance>
            <Guidance kind={'dont'} title={'Use a Heading for a fact'}>
              A Heading has a loud title and a quiet description: used for a label and a value, it makes the label the
              point.
            </Guidance>
            <Guidance kind={'do'} title={'Say an empty value'}>
              A missing value is a word or a dash you choose, not an empty line that looks like a layout bug.
            </Guidance>
            <Guidance kind={'dont'} title={'Give it an icon of its own'}>
              The icon and the row are Item’s. A pair with an icon inside reinvents the row.
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

export const Route = createFileRoute('/display/labeled-content')({
  component: LabeledContentPage
});
