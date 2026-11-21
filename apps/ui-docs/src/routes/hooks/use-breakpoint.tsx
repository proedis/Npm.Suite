import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import optionsProps from 'virtual:ui-props/UseBreakpointOptions';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable } from '@/docs/Tables';
import layout from '@/examples/hooks/use-breakpoint/layout.tsx?example';
import readout from '@/examples/hooks/use-breakpoint/readout.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/hooks/use-breakpoint');


/* --------
 * Page
 * -------- */

function UseBreakpointPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Whether the window is at least a breakpoint wide, with the meaning the <InlineCode>sm:</InlineCode> and{' '}
            <InlineCode>md:</InlineCode> prefixes have in a class, so the JavaScript and the stylesheet speak the same
            language. Client only, and kept in sync with the window.
          </React.Fragment>
        )}
        imports={tsx`
          import { useBreakpoint } from '@proedis/ui/hooks';
          import type { UseBreakpointOptions } from '@proedis/ui/hooks';
        `}
      />

      <PageBody>
        <Example of={readout} />

        <Section
          title={'Mobile first'}
          lead={(
            <React.Fragment>
              <InlineCode>{'useBreakpoint(\'md\')'}</InlineCode> is <InlineCode>true</InlineCode> from 768px up, exactly
              where a <InlineCode>md:</InlineCode> class starts to apply. Resize the window: the rows switch one by one at
              640, 768, 1024, 1280 and 1536 pixels. <InlineCode>base</InlineCode> is not a breakpoint the hook takes, since
              it is true at every width.
            </React.Fragment>
          )}
        />

        <Section
          title={'Two trees, not one hidden'}
          lead={(
            <React.Fragment>
              Reach for the hook only where CSS cannot do the job: when the narrow and the wide layout are different
              trees, not the same tree arranged differently. Hiding with a class keeps both mounted, with their state and
              their requests; the hook renders one. Here the wide window shows a list beside its detail, the narrow one
              the list alone.
            </React.Fragment>
          )}
        >
          <Example of={layout} align={'stretch'} />
          <Callout>
            A different padding, a column that becomes a row, a part that disappears: those are classes, or the
            responsive props of the layout primitives and <InlineCode>hideBelow</InlineCode> /{' '}
            <InlineCode>hideFrom</InlineCode>. They cost nothing at runtime and never flash.
          </Callout>
        </Section>

        <Section
          title={'Server rendering'}
          lead={(
            <React.Fragment>
              On the server there is no window, so the hook answers <InlineCode>false</InlineCode>, and it keeps that
              answer while a server rendered page hydrates, so the markup matches. The wide layout arrives right after.
              Render what a phone should see first, and let the wide layout come in: the opposite flashes a desktop
              layout on every phone.
            </React.Fragment>
          )}
        />

        <Section
          title={'The widths'}
          lead={(
            <React.Fragment>
              The hook first reads the widths Tailwind 4 declares as <InlineCode>--breakpoint-*</InlineCode> on the
              root, and falls back to Tailwind’s default scale, 640, 768, 1024, 1280 and 1536 pixels, for any it cannot
              read.
            </React.Fragment>
          )}
        >
          <Callout tone={'warning'} title={'Tailwind emits only the variables something uses'}>
            A breakpoint variable reaches the page only when a utility reads it, and the <InlineCode>md:</InlineCode>{' '}
            prefix does not: on this site only <InlineCode>--breakpoint-sm</InlineCode> and{' '}
            <InlineCode>--breakpoint-lg</InlineCode> are there. A project that moves its scale cannot count on the
            variables, so it passes the widths it uses, once, to every call. A variable that is there still wins over{' '}
            <InlineCode>widths</InlineCode>, and both describe the same theme, so they never disagree.
          </Callout>
          <CodeBlock
            snippet={tsx`
              import { useBreakpoint } from '@proedis/ui/hooks';
              import type { UseBreakpointOptions } from '@proedis/ui/hooks';

              /** The scale of the theme, written once where the application keeps its constants */
              export const BREAKPOINTS: UseBreakpointOptions = {
                widths: { sm: 640, md: 800, lg: 1200, xl: 1440, '2xl': 1680 }
              };

              const isWide = useBreakpoint('lg', BREAKPOINTS);
            `}
          />
        </Section>

        <Section
          title={'Any other media query'}
          lead={(
            <React.Fragment>
              The subscription itself is <InlineCode>useMediaQuery</InlineCode>, in{' '}
              <InlineCode>@proedis/react</InlineCode>: this hook is the vocabulary of the breakpoints on top of it. Every
              other question goes there: a reduced motion preference, a coarse pointer, the orientation, print.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              import { useMediaQuery } from '@proedis/react';

              const canHover = useMediaQuery('(hover: hover)');
              const isLandscape = useMediaQuery('(orientation: landscape)');
            `}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'useBreakpoint'} id={'api-use-breakpoint'}>
            <DocTable
              head={[ 'Parameter', 'Type', 'What it is' ]}
              rows={[
                [ <InlineCode key={'p'}>breakpoint</InlineCode>, <code key={'t'} className={'font-mono text-xs text-primary'}>{'\'sm\' | \'md\' | \'lg\' | \'xl\' | \'2xl\''}</code>, 'The breakpoint to be at or above.' ],
                [ <InlineCode key={'p'}>options</InlineCode>, <code key={'t'} className={'font-mono text-xs text-primary'}>UseBreakpointOptions</code>, 'Optional. See below.' ],
                [ 'Returns', <code key={'t'} className={'font-mono text-xs text-primary'}>boolean</code>, 'Whether the window is at least that wide. False on the server and while hydrating.' ]
              ]}
            />
          </SubSection>

          <SubSection title={'UseBreakpointOptions'} id={'api-use-breakpoint-options'}>
            <PropsTable props={optionsProps} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Use it to choose between two subtrees'}>
              A list with its detail beside it, or the list alone; a dialog, or a page of its own.
            </Guidance>
            <Guidance kind={'dont'} title={'Use it for what a class does'}>
              A width, a padding, a direction: classes and responsive props never flash and cost nothing.
            </Guidance>
            <Guidance kind={'do'} title={'Render the narrow layout first'}>
              The hook says false before it knows. A phone layout shown for a frame on a desktop is invisible; the
              opposite is not.
            </Guidance>
            <Guidance kind={'dont'} title={'Hardcode 768 at a call site'}>
              The widths belong to the theme. When the theme moves them, pass them once through widths rather than
              writing a number in every component.
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

export const Route = createFileRoute('/hooks/use-breakpoint')({
  component: UseBreakpointPage
});
