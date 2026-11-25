import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import optionsProps from 'virtual:ui-props/UseBreakpointOptions';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable } from '@/docs/Tables';
import layout from '@/examples/hooks/use-breakpoint/layout.tsx?example';
import readout from '@/examples/hooks/use-breakpoint/readout.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/hooks/use-breakpoint');


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
        <Example of={readout} resizable />

        <Section
          title={'Mobile first'}
          lead={(
            <React.Fragment>
              <InlineCode>{'useBreakpoint(\'md\')'}</InlineCode> is <InlineCode>true</InlineCode> from 768px up, exactly
              where a <InlineCode>md:</InlineCode> class starts to apply. Drag the handle of the preview below: inside it the
              window is the frame, and the rows switch one by one at 640, 768, 1024, 1280 and 1536 pixels.{' '}
              <InlineCode>base</InlineCode> is not a breakpoint the hook takes, since it is true at every width.
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
          <Example of={layout} resizable align={'stretch'} />
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
          <Prose>
            <p>
              Tailwind writes a breakpoint straight into each media query and emits a <InlineCode>--breakpoint-*</InlineCode>{' '}
              variable only when something reads it. The stylesheet of the package reads all five, so they are always
              on the page, at the values of the project: a project that moves <InlineCode>md</InlineCode> to 50rem in its{' '}
              <InlineCode>@theme</InlineCode> gets <InlineCode>md:</InlineCode> classes and{' '}
              <InlineCode>{'useBreakpoint(\'md\')'}</InlineCode> switching at the same 800px, with nothing to pass.{' '}
              <InlineCode>widths</InlineCode> is for a scale that is not declared as those variables at all.
            </p>
          </Prose>
          <CodeBlock
            snippet={tsx`
              import { useBreakpoint } from '@proedis/ui/hooks';
              import type { UseBreakpointOptions } from '@proedis/ui/hooks';

              /** A scale the theme does not declare as --breakpoint-* variables, written once */
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
              On the server and while hydrating the hook says false. A phone layout shown for a frame on a desktop is
              invisible; the opposite is not.
            </Guidance>
            <Guidance kind={'dont'} title={'Hardcode 768 at a call site'}>
              The widths belong to the theme, and the hook reads them from it. A number written at a call site stops
              matching the classes the day the theme moves.
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

export const Route = createFileRoute('/ui/hooks/use-breakpoint')({
  component: UseBreakpointPage
});
