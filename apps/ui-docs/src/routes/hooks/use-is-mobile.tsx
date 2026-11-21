import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable } from '@/docs/Tables';
import actions from '@/examples/hooks/use-is-mobile/actions.tsx?example';
import readout from '@/examples/hooks/use-is-mobile/readout.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/hooks/use-is-mobile');


/* --------
 * Page
 * -------- */

function UseIsMobilePage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Whether the window is below a breakpoint, <InlineCode>md</InlineCode> unless you name another: the mirror of
            useBreakpoint, for the reading a mobile layout actually wants. It is that hook negated, with the same widths
            and the same options.
          </React.Fragment>
        )}
        imports={tsx`
          import { useIsMobile } from '@proedis/ui/hooks';
        `}
      />

      <PageBody>
        <Example of={readout} />

        <Section
          title={'Below a breakpoint'}
          lead={(
            <React.Fragment>
              <InlineCode>useIsMobile()</InlineCode> is <InlineCode>true</InlineCode> below 768px, the width where{' '}
              <InlineCode>md:</InlineCode> classes start; <InlineCode>{'useIsMobile(\'lg\')'}</InlineCode> below 1024px,
              for a layout that needs more room before it opens up. Resize the window to see both switch.
            </React.Fragment>
          )}
        />

        <Section
          title={'Collapsing actions'}
          lead={(
            <React.Fragment>
              The case it exists for: a part that is a different component on a phone, not the same one squeezed. Below{' '}
              <InlineCode>md</InlineCode> the secondary actions of the bar go behind a menu, and only one of the two is
              ever mounted.
            </React.Fragment>
          )}
        >
          <Example of={actions} />
        </Section>

        <Section
          title={'Server rendering'}
          lead={(
            <React.Fragment>
              On the server, and while a server rendered page hydrates, it answers <InlineCode>false</InlineCode>: it
              assumes a desktop, since it is useBreakpoint negated. The mobile layout arrives right after hydration, so
              where a flash of the desktop layout on a phone would matter, prefer the responsive classes.
            </React.Fragment>
          )}
        />

        <Section title={'API'}>
          <SubSection title={'useIsMobile'} id={'api-use-is-mobile'}>
            <DocTable
              head={[ 'Parameter', 'Type', 'What it is' ]}
              rows={[
                [ <InlineCode key={'p'}>below</InlineCode>, <code key={'t'} className={'font-mono text-xs text-primary'}>{'\'sm\' | \'md\' | \'lg\' | \'xl\' | \'2xl\''}</code>, 'The breakpoint to stay under. Defaults to md.' ],
                [ <InlineCode key={'p'}>options</InlineCode>, <code key={'t'} className={'font-mono text-xs text-primary'}>UseBreakpointOptions</code>, 'Optional: the widths, as for useBreakpoint.' ],
                [ 'Returns', <code key={'t'} className={'font-mono text-xs text-primary'}>boolean</code>, 'Whether the window is narrower than that breakpoint. False on the server and while hydrating.' ]
              ]}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Swap a component, not a style'}>
              A menu instead of a row of buttons, a sheet instead of a dialog: two subtrees, one mounted.
            </Guidance>
            <Guidance kind={'dont'} title={'Change a padding with it'}>
              That is a class. A hook re-renders on every resize across the breakpoint, a class costs nothing.
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

export const Route = createFileRoute('/hooks/use-is-mobile')({
  component: UseIsMobilePage
});
