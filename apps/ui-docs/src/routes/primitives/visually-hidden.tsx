import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import visuallyHiddenProps from 'virtual:ui-props/StrictVisuallyHiddenProps';
import themeDoc from 'virtual:ui-theme/primitives/visually-hidden';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { PropsTable } from '@/docs/Tables';
import basic from '@/examples/primitives/visually-hidden/basic.tsx?example';
import skipLink from '@/examples/primitives/visually-hidden/skip-link.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Page
 * -------- */

const PAGE = pageAt('/primitives/visually-hidden');

function VisuallyHiddenPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Content for a screen reader and not for the eye: the unit of a number that the column makes obvious, the
            word “current” next to a highlighted step. Hidden from sight with Tailwind’s{' '}
            <InlineCode>sr-only</InlineCode> clipping, kept in the accessibility tree.
          </React.Fragment>
        )}
        imports={tsx`
          import { VisuallyHidden } from '@proedis/ui/primitives';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Hidden from sight, not from everyone'}
          lead={(
            <React.Fragment>
              <InlineCode>display: none</InlineCode> and <InlineCode>visibility: hidden</InlineCode> are what this is not:
              both take the content out of the accessibility tree, the opposite of the intent. To hide something from
              everyone at a width, use the shared <InlineCode>hideBelow</InlineCode> and <InlineCode>hideFrom</InlineCode>{' '}
              props of the other components.
            </React.Fragment>
          )}
        />

        <Section
          title={'A skip link'}
          lead={(
            <React.Fragment>
              <InlineCode>focusable</InlineCode> brings the content back into view while it has the focus: invisible until
              a keyboard user tabs to it, then an ordinary visible link. Rendered as an anchor with{' '}
              <InlineCode>as={'{\'a\'}'}</InlineCode>. Click into the preview and press Tab.
            </React.Fragment>
          )}
        >
          <Example of={skipLink} align={'start'} />
          <Prose>
            <p>
              It is hidden only while it has no focus (<InlineCode>not-focus:sr-only</InlineCode>), so once focused it is
              your classes and nothing else: the padding, the colours and a position such as{' '}
              <InlineCode>fixed</InlineCode> go on the component itself, as in the example.
            </p>
          </Prose>
          <Callout>
            The target of a skip link needs <InlineCode>tabIndex={'{-1}'}</InlineCode> when it is not focusable itself, or
            some browsers move the scroll and leave the focus behind.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The text is read in place, as part of the sentence around it: start it with the space or the comma the
              sentence needs, as the examples do, or the words run together. It takes no shared props: a prop that hides
              with <InlineCode>display: none</InlineCode> would undo the component.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'visually-hidden', part: 'The hidden element', attributes: [ 'data-focusable' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={visuallyHiddenProps}
            rest={(
              <React.Fragment>
                Polymorphic: <InlineCode>as</InlineCode> picks the element, a <InlineCode>span</InlineCode> by default, and
                every other prop goes to it.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Add what the eye gets from the layout'}>
              A unit given by a column header, a state given by a colour, a position given by a highlight.
            </Guidance>
            <Guidance kind={'dont'} title={'Name an icon button with it'}>
              IconButton takes a <InlineCode>label</InlineCode> that is its name and its tooltip. A hidden span inside a
              button gives the name and no tooltip.
            </Guidance>
            <Guidance kind={'do'} title={'Keep it short'}>
              A screen reader user hears every word. Add the missing word, not a paragraph.
            </Guidance>
            <Guidance kind={'dont'} title={'Hide content that sighted users need'}>
              If the information matters to understanding, it is visible to everyone.
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

export const Route = createFileRoute('/primitives/visually-hidden')({
  component: VisuallyHiddenPage
});
