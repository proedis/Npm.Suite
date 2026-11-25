import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import copyButtonProps from 'virtual:ui-props/CopyButtonProps';
import labelsProps from 'virtual:ui-props/CopyButtonLabels';
import themeDoc from 'virtual:ui-theme/actions/copy-button';

import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { PropsTable } from '@/docs/Tables';
import basic from '@/examples/actions/copy-button/basic.tsx?example';
import field from '@/examples/actions/copy-button/field.tsx?example';
import onDemand from '@/examples/actions/copy-button/on-demand.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/actions/copy-button');


/* --------
 * Page
 * -------- */

function CopyButtonPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            An IconButton that copies a value to the clipboard, then shows a tick for a moment and says so. In a text
            field, <InlineCode>TextInput.Copy</InlineCode> is the same button in the look of a field action, and it stays
            in a read only field, the one people most often copy from.
          </React.Fragment>
        )}
        imports={tsx`
          import { CopyButton } from '@proedis/ui/actions/copy-button';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'In a field'}
          lead={(
            <React.Fragment>
              <InlineCode>TextInput.Copy</InlineCode> sits in <InlineCode>trailing</InlineCode> like an action, 24px square
              and 4px from the border. Without <InlineCode>value</InlineCode> it copies what the field holds at the moment
              of the press. Unlike <InlineCode>TextInput.Action</InlineCode> it is kept in a read only field, and hidden in
              a disabled one.
            </React.Fragment>
          )}
        >
          <Example of={field} />
        </Section>

        <Section
          title={'A value made on demand'}
          lead={(
            <React.Fragment>
              <InlineCode>value</InlineCode> may be a function, read at the press, and it may return a promise: a share
              link the server creates only when asked. <InlineCode>labels.failed</InlineCode> says when the browser
              refused; without it the button stays as it was. <InlineCode>onCopy</InlineCode> is told after each attempt
              whether it worked.
            </React.Fragment>
          )}
        >
          <Example of={onDemand} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The name, the tooltip and the icon change together while the tick lasts, 1.5 seconds by default
              (<InlineCode>resetAfter</InlineCode>). A change of name alone is not announced, so a status region says
              “Copied” once. The copy works where the Clipboard API is not offered too, an intranet served over plain
              http, through <InlineCode>useClipboard</InlineCode> of <InlineCode>@proedis/react</InlineCode>, and the focus
              stays on the button.
            </p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'copy-button', part: 'The button', attributes: [ 'data-status', 'data-icon-only' ] },
              { slot: 'copy-button-done', part: 'The tick, while it lasts' },
              { slot: 'copy-button-status', part: 'The status region, visually hidden' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'CopyButton'} id={'api-copy-button'}>
            <PropsTable
              props={copyButtonProps}
              rest={(
                <React.Fragment>
                  Plus the props of <InlineCode>IconButton</InlineCode> but <InlineCode>label</InlineCode>,{' '}
                  <InlineCode>icon</InlineCode> and <InlineCode>onClick</InlineCode>: <InlineCode>fill</InlineCode>,{' '}
                  <InlineCode>tone</InlineCode>, <InlineCode>size</InlineCode>, the ref.
                </React.Fragment>
              )}
            />
          </SubSection>
          <SubSection title={'CopyButtonLabels'} id={'api-copy-button-labels'}>
            <PropsTable props={labelsProps} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Name what is copied'}>
              “Copy the key” rather than “Copy”: the tooltip is the only text the button has.
            </Guidance>
            <Guidance kind={'dont'} title={'A copy that needs a selection'}>
              A value people copy whole, a code, a key, a link, deserves the button. Prose does not.
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

export const Route = createFileRoute('/actions/copy-button')({
  component: CopyButtonPage
});
