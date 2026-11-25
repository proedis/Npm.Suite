import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import headingDescriptionProps from 'virtual:ui-props/StrictHeadingDescriptionProps';
import headingEyebrowProps from 'virtual:ui-props/StrictHeadingEyebrowProps';
import headingProps from 'virtual:ui-props/StrictHeadingProps';
import headingTitleProps from 'virtual:ui-props/StrictHeadingTitleProps';
import themeDoc from 'virtual:ui-theme/display/heading';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/display/heading/basic.tsx?example';
import emptyState from '@/examples/display/heading/empty-state.tsx?example';
import lines from '@/examples/display/heading/lines.tsx?example';
import semantics from '@/examples/display/heading/semantics.tsx?example';
import sizes from '@/examples/display/heading/sizes.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/display/heading');

const LINES = { description: 'Clamp the part to that many lines, with an ellipsis on the last one.' };

const TITLE_PROPS = refineProps(headingTitleProps, { lines: LINES });

const DESCRIPTION_PROPS = refineProps(headingDescriptionProps, { lines: LINES });

const EYEBROW_PROPS = refineProps(headingEyebrowProps, { lines: LINES });


/* --------
 * Page
 * -------- */

function HeadingPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A title with an optional line above it and an optional line under it: the three text registers every row,
            every card header and every empty state is made of. A compound, reached through the dot:{' '}
            <InlineCode>Heading.Eyebrow</InlineCode>, <InlineCode>Heading.Title</InlineCode>,{' '}
            <InlineCode>Heading.Description</InlineCode>.
          </React.Fragment>
        )}
        imports={tsx`
          import { Heading } from '@proedis/ui/display/heading';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              <InlineCode>size</InlineCode> is the Heading’s, and it moves the eyebrow, the title and the description
              together, in proportion. The default is <InlineCode>sm</InlineCode>, measured rather than chosen: a list row
              is by far the most frequent heading, so the frequent case writes no prop and a card header says{' '}
              <InlineCode>size={'{\'lg\'}'}</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={sizes} />
          <DocTable
            head={[ 'Size', 'Eyebrow', 'Title', 'Description' ]}
            rows={[
              [ <InlineCode key={'s'}>sm</InlineCode>, '11px', '14px, semibold', '12px' ],
              [ <InlineCode key={'s'}>md</InlineCode>, '11px', '16px, semibold', '14px' ],
              [ <InlineCode key={'s'}>lg</InlineCode>, '12px', '18px, semibold', '14px' ],
              [ <InlineCode key={'s'}>xl</InlineCode>, '12px', '20px, bold', '16px' ]
            ]}
          />
          <Callout title={'One part out of the scale'}>
            The size travels as variables the root sets and each part reads, not as a context (the component stays
            renderable from a Server Component) nor as a class on the parent. So a size in the{' '}
            <InlineCode>className</InlineCode> of one part still replaces its own, for the rare title that has to step out
            of the scale: <InlineCode>{'<Heading.Title className={\'text-2xl\'}>'}</InlineCode>.
          </Callout>
        </Section>

        <Section
          title={'Clamping'}
          lead={(
            <React.Fragment>
              <InlineCode>lines</InlineCode> clamps a part to one, two or three lines, each part on its own. A title in a
              row usually takes one line, a description two.
            </React.Fragment>
          )}
        >
          <Example of={lines} />
        </Section>

        <Section
          title={'Semantics'}
          lead={(
            <React.Fragment>
              Every part renders a <InlineCode>div</InlineCode>: the package cannot know the level of a heading in your
              page. Give the title the element it is with <InlineCode>as</InlineCode>, <InlineCode>h2</InlineCode> for a
              card on a page, <InlineCode>h3</InlineCode> inside a section, and point the region at it.
            </React.Fragment>
          )}
        >
          <Example of={semantics} />
        </Section>

        <Section
          title={'Spacing'}
          lead={(
            <React.Fragment>
              <InlineCode>gap</InlineCode> sets the room between the parts, half a step by default: tight, because the three
              lines read as one block. An empty state opens it to <InlineCode>2</InlineCode>.
            </React.Fragment>
          )}
        >
          <Example of={emptyState} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A heading is text until you say otherwise: only <InlineCode>as</InlineCode> on the title puts it in the outline
              of the page, where screen reader users navigate by headings. The eyebrow is uppercase through CSS only, so it
              is read in the case it is written in.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'heading', part: 'The block', attributes: [ 'data-size', 'data-gap' ] },
              { slot: 'heading-eyebrow', part: 'The line above the title', attributes: [ 'data-lines' ] },
              { slot: 'heading-title', part: 'The title', attributes: [ 'data-lines' ] },
              { slot: 'heading-description', part: 'The line under the title', attributes: [ 'data-lines' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Heading'} id={'api-heading'}>
            <PropsTable props={headingProps} rest={'Polymorphic, a div by default: every other prop goes to the element.'} />
          </SubSection>
          <SubSection title={'Heading.Title'} id={'api-heading-title'}>
            <PropsTable props={TITLE_PROPS} rest={'Polymorphic, a div by default.'} />
          </SubSection>
          <SubSection title={'Heading.Description'} id={'api-heading-description'}>
            <PropsTable props={DESCRIPTION_PROPS} rest={'Polymorphic, a div by default.'} />
          </SubSection>
          <SubSection title={'Heading.Eyebrow'} id={'api-heading-eyebrow'}>
            <PropsTable props={EYEBROW_PROPS} rest={'Polymorphic, a div by default.'} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'State the size of a header'}>
              A card header writes <InlineCode>size={'{\'lg\'}'}</InlineCode>. Leaving it at the default makes a card
              title as small as a row.
            </Guidance>
            <Guidance kind={'dont'} title={'Rebuild the type scale by hand'}>
              A title written as <InlineCode>text-lg font-semibold</InlineCode> in one place and{' '}
              <InlineCode>text-base</InlineCode>
              {' '}in another is how two screens drift apart. The sizes of Heading are the scale.
            </Guidance>
            <Guidance kind={'do'} title={'Put it in an Item for a row'}>
              Item grows the heading and lets it truncate, so the actions at the end of the row stay in view.
            </Guidance>
            <Guidance kind={'dont'} title={'Use the eyebrow as a second title'}>
              It is a category or a state over the title, in small capitals: “In service”, “Rounds”.
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

export const Route = createFileRoute('/display/heading')({
  component: HeadingPage
});
