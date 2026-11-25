import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import surfaceFooterProps from 'virtual:ui-props/StrictSurfaceFooterProps';
import surfaceProps from 'virtual:ui-props/StrictSurfaceProps';
import surfaceSectionProps from 'virtual:ui-props/StrictSurfaceSectionProps';
import themeDoc from 'virtual:ui-theme/display/surface';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { css, tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { PropsTable } from '@/docs/Tables';
import basic from '@/examples/display/surface/basic.tsx?example';
import chrome from '@/examples/display/surface/chrome.tsx?example';
import flush from '@/examples/display/surface/flush.tsx?example';
import inContext from '@/examples/display/surface/in-context.tsx?example';
import loading from '@/examples/display/surface/loading.tsx?example';
import sectionGroup from '@/examples/display/surface/section-group.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/display/surface');

const PROPS = refineProps(surfaceProps, {
  elevation: { description: 'The shadow, a step of the scale. default is the theme’s --surface-shadow, none undeclared.' },
  radius   : { description: 'The corners, a step of the scale. default is the theme’s --surface-radius, lg undeclared.' }
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
            <InlineCode>Surface.SectionGroup</InlineCode>, <InlineCode>Surface.Footer</InlineCode>.
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
              The surface draws the background, the border, the corners and the shadow, and stops there. The room lives in
              the parts, each with the same padding, <InlineCode>--surface-padding</InlineCode> (the{' '}
              <InlineCode>lg</InlineCode> step, the room of a dialog and of the table’s card): that is what lets one
              section go <InlineCode>flush</InlineCode> and give its edges to a table without fighting a padding one level
              up. A section right under the header, or a footer of actions under a section, does not repeat its top
              padding: twice the room read as two cards.
            </React.Fragment>
          )}
        />

        <Section
          title={'The header is an Item'}
          lead={(
            <React.Fragment>
              <InlineCode>Surface.Header</InlineCode> renders an <InlineCode>Item</InlineCode> with the padding of the card and
              takes every one of its props: a card header and a list row are the same three slots with the same truncation,
              and only the register of the title changes. So the header takes an <InlineCode>Item.Icon</InlineCode>, an{' '}
              <InlineCode>Item.Heading</InlineCode> with <InlineCode>size={'{\'lg\'}'}</InlineCode> and an{' '}
              <InlineCode>Item.Actions</InlineCode>, as the card in context below does.
            </React.Fragment>
          )}
        />

        <Section
          title={'Section groups'}
          lead={(
            <React.Fragment>
              <InlineCode>Surface.SectionGroup</InlineCode> is a <InlineCode>Stack</InlineCode> with no gap: every prop of
              it, so a group of sections looks exactly like the same sections placed straight in the card.{' '}
              <InlineCode>divided</InlineCode> draws a line between them, with room on both sides;{' '}
              <InlineCode>direction={'{\'horizontal\'}'}</InlineCode> sets them side by side, the line between them
              vertical. A group can hold the header too, for a line under it, and another group.
            </React.Fragment>
          )}
        >
          <Example of={sectionGroup} />
        </Section>

        <Section
          title={'Flush sections and the footer'}
          lead={(
            <React.Fragment>
              <InlineCode>flush</InlineCode> drops the padding of a section so a table or a map reaches the edges.{' '}
              <InlineCode>Surface.Footer</InlineCode> is the last row, its actions at the end by default;{' '}
              <InlineCode>muted</InlineCode> recesses it, quieter in its surface and in its ink, for a row that carries a
              pagination or a total rather than an action.
            </React.Fragment>
          )}
        >
          <Example of={flush} />
        </Section>

        <Section
          title={'Border, elevation and radius'}
          lead={(
            <React.Fragment>
              Three props, each with a default the theme decides. A bare surface draws a line in{' '}
              <InlineCode>--surface-border-color</InlineCode> (<InlineCode>--border</InlineCode> undeclared), the shadow of{' '}
              <InlineCode>--surface-shadow</InlineCode> (none) and the corner of <InlineCode>--surface-radius</InlineCode>{' '}
              (<InlineCode>lg</InlineCode>). <InlineCode>border</InlineCode> turns the line on or off for one card,{' '}
              <InlineCode>elevation</InlineCode> and <InlineCode>radius</InlineCode> take a step of their scale. A bare
              surface reports <InlineCode>default</InlineCode> in each attribute, not the step it equals, so a rule can
              restyle the cards nobody had an opinion about.
            </React.Fragment>
          )}
        >
          <Example of={chrome} />
          <CodeBlock
            title={'app.css'}
            snippet={css`
              /* Our cards: no line, a soft shadow, a rounder corner, unless one asked otherwise */
              :root {
                --surface-border-color: transparent;
                --surface-shadow: var(--shadow-sm);
                --surface-radius: var(--radius-xl);
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

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'surface', part: 'The card', attributes: [ 'data-border', 'data-elevation', 'data-radius', 'data-loading' ] },
              { slot: 'surface-body', part: 'The column holding the parts, dimmed while loading' },
              { slot: 'surface-loading', part: 'The overlay while loading' },
              { slot: 'surface-header', part: 'The header, an Item' },
              { slot: 'surface-section-group', part: 'A group of sections', attributes: [ 'data-divided' ] },
              { slot: 'surface-section', part: 'A section', attributes: [ 'data-flush' ] },
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
          <SubSection title={'Surface.SectionGroup'} id={'api-surface-section-group'}>
            <Prose>
              <p>
                The props of <InlineCode>Stack</InlineCode>, documented on its page, with <InlineCode>gap</InlineCode> at{' '}
                <InlineCode>0</InlineCode> by default: <InlineCode>divided</InlineCode>, <InlineCode>direction</InlineCode>,{' '}
                <InlineCode>gap</InlineCode>, <InlineCode>align</InlineCode>, <InlineCode>as</InlineCode>.
              </p>
            </Prose>
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
            <Guidance kind={'do'} title={'Divide where the subject changes'}>
              A divided group between two subjects, sections straight in the card between two blocks of the same one,
              nothing between a header and a short body.
            </Guidance>
            <Guidance kind={'dont'} title={'Nest cards'}>
              A card inside a card is a section of a divided group. Two borders on top of each other read as a mistake.
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
