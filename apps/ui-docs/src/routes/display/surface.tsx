import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import surfaceFooterProps from 'virtual:ui-props/StrictSurfaceFooterProps';
import surfaceProps from 'virtual:ui-props/StrictSurfaceProps';
import surfaceSectionProps from 'virtual:ui-props/StrictSurfaceSectionProps';
import surfaceSeparatorProps from 'virtual:ui-props/StrictSurfaceSeparatorProps';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { css, tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/display/surface/basic.tsx?example';
import chrome from '@/examples/display/surface/chrome.tsx?example';
import flush from '@/examples/display/surface/flush.tsx?example';
import inContext from '@/examples/display/surface/in-context.tsx?example';
import loading from '@/examples/display/surface/loading.tsx?example';
import separators from '@/examples/display/surface/separators.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/display/surface');

const PROPS = refineProps(surfaceProps, {
  elevation: { description: 'The shadow. default draws the house shadow and reports itself as default, apart from an explicit soft.' },
  radius   : { description: 'The corners. default draws the house radius and reports itself as default, apart from an explicit 4xl.' }
});

const SEPARATOR_PROPS = refineProps(surfaceSeparatorProps, {
  space: { default: '6' }
});


/* --------
 * Page
 * -------- */

function SurfacePage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The card, the panel, the box: one anatomy that carries information, tables, forms and charts. A compound,
            reached through the dot: <InlineCode>Surface.Header</InlineCode>, <InlineCode>Surface.Section</InlineCode>,{' '}
            <InlineCode>Surface.Separator</InlineCode>, <InlineCode>Surface.Footer</InlineCode>.
          </React.Fragment>
        )}
        imports={tsx`
          import { Surface } from '@proedis/ui/display/surface';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'No padding of its own'}
          lead={(
            <React.Fragment>
              The surface draws the background, the corners and the shadow, and stops there. The room lives in the parts,
              each with the same padding, which is what lets one section go <InlineCode>flush</InlineCode> and give its
              edges to a table without fighting a padding one level up.
            </React.Fragment>
          )}
        />

        <Section
          title={'The header is an Item'}
          lead={(
            <React.Fragment>
              <InlineCode>Surface.Header</InlineCode> renders an <InlineCode>Item</InlineCode> with the padding of the card and
              takes every one of its props: a card header and a list row are the same three slots with the same truncation,
              and only the register of the title changes. So the header takes an <InlineCode>IconBox</InlineCode>, a{' '}
              <InlineCode>Heading</InlineCode> with <InlineCode>size={'{\'lg\'}'}</InlineCode> and an{' '}
              <InlineCode>Item.Actions</InlineCode>, as the card in context below does.
            </React.Fragment>
          )}
        />

        <Section
          title={'Separators'}
          lead={(
            <React.Fragment>
              What goes between two sections is a part, placed where it happens. <InlineCode>Surface.Separator</InlineCode>{' '}
              draws a hairline by default, a <InlineCode>Divider</InlineCode> with its separator role, or empty room with{' '}
              <InlineCode>type={'{\'gap\'}'}</InlineCode> and a <InlineCode>space</InlineCode> from the scale. A line where
              the content changes subject, room where it only takes a breath.
            </React.Fragment>
          )}
        >
          <Example of={separators} />
        </Section>

        <Section
          title={'Flush sections and the footer'}
          lead={(
            <React.Fragment>
              <InlineCode>flush</InlineCode> drops the padding of a section so a table or a map reaches the edges.{' '}
              <InlineCode>Surface.Footer</InlineCode> is the last row, its actions at the end by default;{' '}
              <InlineCode>muted</InlineCode> recesses it, for a row that carries a pagination or a total rather than an
              action.
            </React.Fragment>
          )}
        >
          <Example of={flush} />
        </Section>

        <Section
          title={'Elevation and radius'}
          lead={(
            <React.Fragment>
              Two chrome variants with a <InlineCode>default</InlineCode> of their own. A bare surface reports{' '}
              <InlineCode>data-elevation</InlineCode> and <InlineCode>data-radius</InlineCode> as{' '}
              <InlineCode>default</InlineCode>,
              not as the step it currently equals, so a product can restyle every card nobody had an opinion about and leave
              alone the ones that asked for a step on purpose.
            </React.Fragment>
          )}
        >
          <Example of={chrome} />
          <CodeBlock
            title={'app.css'}
            snippet={css`
              /* Our cards: flatter and less round, unless one asked otherwise */
              [data-slot='surface'][data-elevation='default'] {
                box-shadow: none;
                border: 1px solid var(--border);
              }

              [data-slot='surface'][data-radius='default'] {
                border-radius: var(--radius-xl);
              }
            `}
          />
        </Section>

        <Section
          title={'Loading'}
          lead={(
            <React.Fragment>
              <InlineCode>loading</InlineCode> dims the content, blocks its interactions and puts a spinner over it, with{' '}
              <InlineCode>loadingLabel</InlineCode> as the sentence under it. Refresh the card.
            </React.Fragment>
          )}
        >
          <Example of={loading} />
          <Callout>
            Without <InlineCode>loadingLabel</InlineCode> the overlay is silent to assistive technology. With it, the overlay is
            a polite status region and the spinner stays decorative, so the sentence is heard once.
          </Callout>
        </Section>

        <Section
          title={'In context'}
          lead={'A vehicle card: the header row with its state and a menu, a grid of facts, a muted footer with the time of the data and the one action of the card.'}
        >
          <Example of={inContext} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              A surface is a <InlineCode>div</InlineCode> and adds no role. When a card is a region of the page, render it as
              a <InlineCode>section</InlineCode> or an <InlineCode>article</InlineCode> with <InlineCode>as</InlineCode> and
              point it at its title with <InlineCode>aria-labelledby</InlineCode>, as the card in context does. The loading
              content is out of reach of the pointer; the keyboard is the caller’s to hold with{' '}
              <InlineCode>inert</InlineCode> when the wait matters.
            </p>
          </Prose>
        </Section>

        <Section title={'Slots and data attributes'}>
          <SlotsTable
            rows={[
              { slot: 'surface', part: 'The card', attributes: [ 'data-elevation', 'data-radius', 'data-loading' ] },
              { slot: 'surface-body', part: 'The column holding the parts, dimmed while loading' },
              { slot: 'surface-loading', part: 'The overlay while loading' },
              { slot: 'surface-header', part: 'The header, an Item' },
              { slot: 'surface-section', part: 'A section', attributes: [ 'data-flush' ] },
              { slot: 'surface-separator', part: 'A separator', attributes: [ 'data-type', 'data-orientation' ] },
              { slot: 'surface-footer', part: 'The footer', attributes: [ 'data-muted' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Surface'} id={'api-surface'}>
            <PropsTable props={PROPS} rest={'Polymorphic, a div by default: every other prop goes to the element.'} />
          </SubSection>
          <SubSection title={'Surface.Header'} id={'api-surface-header'}>
            <Prose>
              <p>
                The props of <InlineCode>Item</InlineCode>, documented on its page: <InlineCode>align</InlineCode>,{' '}
                <InlineCode>direction</InlineCode>, <InlineCode>gap</InlineCode>, <InlineCode>inset</InlineCode>,{' '}
                <InlineCode>interactive</InlineCode>, <InlineCode>as</InlineCode>. Only the slot and the padding are its own.
              </p>
            </Prose>
          </SubSection>
          <SubSection title={'Surface.Section'} id={'api-surface-section'}>
            <PropsTable props={surfaceSectionProps} rest={'Polymorphic, a div by default.'} />
          </SubSection>
          <SubSection title={'Surface.Separator'} id={'api-surface-separator'}>
            <PropsTable props={SEPARATOR_PROPS} rest={'Every other prop goes to the divider, or to the empty div of a gap.'} />
          </SubSection>
          <SubSection title={'Surface.Footer'} id={'api-surface-footer'}>
            <PropsTable props={surfaceFooterProps} rest={'Polymorphic, a div by default.'} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Compose a card from its parts'}>
              Header, sections, footer: each brings the padding, so the card reads the same everywhere without a class.
            </Guidance>
            <Guidance kind={'dont'} title={'Pad the surface itself'}>
              A padding on the card fights every flush section and doubles the padding of every part.
            </Guidance>
            <Guidance kind={'do'} title={'Decide each seam'}>
              A line between two subjects, room between two blocks of the same one, nothing between a header and a short
              body.
            </Guidance>
            <Guidance kind={'dont'} title={'Nest cards'}>
              A card inside a card is a section with a separator. Two shadows on top of each other read as a mistake.
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

export const Route = createFileRoute('/display/surface')({
  component: SurfacePage
});
