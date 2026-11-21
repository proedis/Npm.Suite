import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import badgeProps from 'virtual:ui-props/StrictBadgeProps';
import themeDoc from 'virtual:ui-theme/display/badge';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { css, tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/display/badge/basic.tsx?example';
import content from '@/examples/display/badge/content.tsx?example';
import link from '@/examples/display/badge/link.tsx?example';
import sizes from '@/examples/display/badge/sizes.tsx?example';
import tones from '@/examples/display/badge/tones.tsx?example';
import truncation from '@/examples/display/badge/truncation.tsx?example';
import withTitle from '@/examples/display/badge/with-title.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/display/badge');

const PROPS = refineProps(badgeProps, {
  fill: { description: 'How the tone is painted: a tenth of it behind its ink, the full colour, or the ink alone.' },
  tone: { description: 'Which of the seven tones, from the same table Button and IconBox read.' },
  size: { description: '20, 24 or 28 pixels tall, from the declared scale.' }
});


/* --------
 * Page
 * -------- */

function BadgePage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A compact label for a state, a category or a count. Static by nature: a badge says something, it is not
            pressed. Three fills, seven tones and three sizes, painted from the one table every toned component of the
            package reads.
          </React.Fragment>
        )}
        imports={tsx`
          import { Badge } from '@proedis/ui/display/badge';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Tones and fills'}
          lead={(
            <React.Fragment>
              <InlineCode>soft</InlineCode> is the default and the register of a list: a tenth of the tone behind its ink.{' '}
              <InlineCode>solid</InlineCode> is the full colour, for the one state that must catch the eye.{' '}
              <InlineCode>plain</InlineCode> is the ink alone, with no surface and no padding of its own. A{' '}
              <InlineCode>success</InlineCode> badge and a <InlineCode>success</InlineCode> button on the same screen are the
              same green.
            </React.Fragment>
          )}
        >
          <Example of={tones} />
        </Section>

        <Section title={'Sizes'} lead={'sm in a dense table row, md everywhere else, lg next to a large title.'}>
          <Example of={sizes} />
        </Section>

        <Section
          title={'Dot and icons'}
          lead={(
            <React.Fragment>
              <InlineCode>dot</InlineCode> puts a dot in the ink of the badge before the label, for a state whose colour is
              its first cue. An icon goes in as a child and is sized for you. Digits are tabular, so a count that ticks
              never moves by a pixel.
            </React.Fragment>
          )}
        >
          <Example of={content} />
        </Section>

        <Section
          title={'Next to a title'}
          lead={(
            <React.Fragment>
              The case the badge was designed for. Put title and badge in a horizontal <InlineCode>Stack</InlineCode>, not a{' '}
              <InlineCode>Cluster</InlineCode>: a cluster wraps, and a long title would push the badge to a second line. The
              badge never shrinks, the title has <InlineCode>min-w-0</InlineCode>, so the pressure lands on the title, which
              truncates.
            </React.Fragment>
          )}
        >
          <Example of={withTitle} />
        </Section>

        <Section
          title={'Long text'}
          lead={(
            <React.Fragment>
              A badge is at most as wide as its container. A text label truncates with an ellipsis and the dot stays.
              That is a safety net: a truncated badge is a column too narrow, or a label too long.
            </React.Fragment>
          )}
        >
          <Example of={truncation} />
        </Section>

        <Section
          title={'As a link'}
          lead={(
            <React.Fragment>
              <InlineCode>as={'{\'a\'}'}</InlineCode> renders an anchor for a badge that navigates, a tag that opens the
              list of its items. The element is yours, and so are its semantics and its focus.
            </React.Fragment>
          )}
        >
          <Example of={link} />
          <Callout tone={'warning'} title={'No × inside a badge'}>
            A removable chip is a control inside a label: it needs a name, a focus ring and a keyboard path of its own,
            and the label must not be a control itself. That is a button with a badge in it, not a badge with a button.
          </Callout>
        </Section>

        <Section
          title={'Theming'}
          lead={'Every badge reports its resolved fill, tone and size. A plain rule of yours beats the classes of the package, which live in a layer.'}
        >
          <CodeBlock
            title={'app.css'}
            snippet={css`
              /* Square badges across the product */
              [data-slot='badge'] {
                border-radius: var(--radius-sm);
              }

              /* The late ones, a little louder */
              [data-slot='badge'][data-tone='warning'][data-fill='soft'] {
                font-weight: 600;
              }
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A badge is text, read where it stands. The colour is never the only cue: the label says the state, and the
              dot is <InlineCode>aria-hidden</InlineCode>. Printed, a soft badge becomes white with a line in its ink, since
              browsers drop backgrounds by default; with forced colours the fills disappear and a one pixel frame stays.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'badge', part: 'The badge', attributes: [ 'data-fill', 'data-tone', 'data-size', 'data-dot' ] },
              { slot: 'badge-dot', part: 'The dot before the label' },
              { slot: 'badge-label', part: 'The label, when the children are text or a number' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={PROPS}
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
            <Guidance kind={'do'} title={'One word or two'}>
              “Late”, “Collected”, “Draft”. A sentence is a description, not a badge.
            </Guidance>
            <Guidance kind={'dont'} title={'Make it clickable with an onClick'}>
              A badge is not a control. A tag that navigates is an anchor with <InlineCode>as</InlineCode>; an action is a
              button.
            </Guidance>
            <Guidance kind={'do'} title={'Soft in lists, solid for the exception'}>
              A column of solid badges shouts on every row. Keep solid for the one state the row must not miss.
            </Guidance>
            <Guidance kind={'dont'} title={'Rely on the colour alone'}>
              Red and green look alike to many people. The label carries the meaning, the tone reinforces it.
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

export const Route = createFileRoute('/display/badge')({
  component: BadgePage
});
