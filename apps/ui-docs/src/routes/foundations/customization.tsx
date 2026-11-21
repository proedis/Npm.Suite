import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { Cluster } from '@proedis/ui/layout';

import allTheme from 'virtual:ui-theme/all';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { ThemeTable } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { css } from '@/docs/snippet';
import { DocTable } from '@/docs/Tables';
import { GROUP_LEADS, GROUP_TITLES } from '@/docs/themeVariables';
import defaults from '@/examples/foundations/customization/defaults.tsx?example';
import { pageAt, PAGES } from '@/nav';

import type { ThemeVariable, ThemeVariableGroup } from '@/docs/themeDoc';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/foundations/customization');

/** The import every customization comes after. A string, since a quote cannot be written in JSX text */
const IMPORT_LINE = "@import '@proedis/ui'";

/**
 * Every place a variable can be written in an application's CSS, with what happens there. Measured: each
 * one compiled with Tailwind, loaded in a page, and read back with getComputedStyle.
 */
const PLACEMENT: readonly (readonly [ string, string, string ])[] = [
  [ ':root { }', 'Every variable of this page, after the import of the stylesheet.', 'Every one changes, on every device.' ],
  [ '.dark { }', 'The dark value of a variable, after the import.', 'Changes in dark mode only.' ],
  [ '.toolbar { }, any selector', 'A region: a toolbar, a panel, one screen.', 'Changes inside that element only.' ],
  [ '@theme { }', 'Only the breakpoints, --breakpoint-*, and new values of the application’s own Tailwind theme.', 'For the variables of this page, half of them are ignored with no error: the colours, --space-*, --radius-scale, --z-*. A control height works on a desktop and is lost under a finger.' ],
  [ '@theme inline { }', 'Never, for a value: it maps a variable to a utility.', 'Same as @theme.' ],
  [ '@layer base { :root { } }', 'Never.', 'The colours, the scale and the radius stay the package’s: its defaults sit outside every layer, and CSS makes what is outside a layer win over what is inside one.' ]
];

/** The three places a customization can live, from the widest to the narrowest */
const LEVELS: readonly (readonly [ string, string, string ])[] = [
  [ 'A variable of the theme', ':root, .dark, or any element', 'Every instance that reads it: the whole application, dark mode only, or a region.' ],
  [ 'A rule on the data attributes', '[data-slot][data-size], [data-tone]…', 'One part or one variant, everywhere, with no prop changed at any call site.' ],
  [ 'A prop or a className', 'The call site', 'One instance. A className wins over the classes the component builds.' ]
];

/** What a group of variables is about, in the order the page reads them */
const GROUPS: readonly ThemeVariableGroup[] = [ 'Default', 'Spacing', 'Size', 'Shape', 'Colour', 'Layer' ];

/** The ids of the sections that hold the tables, so a title cannot collide with another section */
const GROUP_IDS: Readonly<Record<ThemeVariableGroup, string>> = {
  Default: 'component-defaults',
  Spacing: 'spacing-scale',
  Size   : 'sizes',
  Shape  : 'shape',
  Colour : 'colours',
  Layer  : 'layers'
};


/* --------
 * Helpers
 * -------- */

function inGroup(group: ThemeVariableGroup): ThemeVariable[] {
  return allTheme.variables.filter((variable) => variable.group === group);
}

/** Every component page, with the variables it reads that are not colours, and how many colours */
function componentRows(): React.ReactNode[][] {
  const byPage = new Map<string, ThemeVariable[]>();

  for (const variable of allTheme.variables) {
    for (const page of variable.pages ?? []) {
      byPage.set(page, [ ...(byPage.get(page) ?? []), variable ]);
    }
  }

  return PAGES
    .filter((page) => /^\/(layout|primitives|actions|display|feedback|forms|overlays|data)\//.test(page.to))
    .map((page) => {
      const variables = byPage.get(page.to.slice(1)) ?? [];
      const named = variables.filter((variable) => variable.group !== 'Colour' && variable.group !== 'Spacing');
      const colours = variables.filter((variable) => variable.group === 'Colour').length;
      const spacing = variables.some((variable) => variable.group === 'Spacing');

      return [
        <Link key={'l'} to={page.to as never} className={'font-medium whitespace-nowrap text-foreground hover:underline'}>
          {page.title}
        </Link>,
        <Cluster key={'v'} gap={'xs'}>
          {named.map((variable) => (
            <code key={variable.variable} className={'font-mono text-xs text-foreground'}>{variable.variable}</code>
          ))}
          {spacing && <code className={'font-mono text-xs text-foreground'}>--space-*</code>}
          {!named.length && !spacing && <span className={'text-muted-foreground'}>{colours ? 'colours only' : 'none'}</span>}
        </Cluster>,
        colours ? String(colours) : '0'
      ];
    });
}


/* --------
 * Page
 * -------- */

function CustomizationPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Everything a product can change without touching a call site, in one place: the default of every
            spacing prop, the scales, the sizes, the corner language, every colour and the stacking order. Each is
            a variable of the theme, declared in CSS after the import of the stylesheet. The tables below are read
            from the source of the package, so they list every variable a component reads and nothing else; every
            component page repeats the rows that concern it.
          </React.Fragment>
        )}
        imports={css`
          @import 'tailwindcss';
          @import '@proedis/ui';

          :root {
            --stack-gap: var(--space-lg);   /* the default of every Stack */
            --space-md: 1.25rem;           /* every spacing named md */
            --radius-scale: 1.4;           /* every corner */
            --primary: oklch(0.55 0.2 264);
          }
        `}
      />

      <PageBody>
        <Section
          title={'Where a customization goes'}
          lead={(
            <React.Fragment>
              In plain CSS, in <InlineCode>:root {'{ }'}</InlineCode>, after <InlineCode>{IMPORT_LINE}</InlineCode>.
              That is the whole rule for every variable on this page and on every component page, colours, scales,
              sizes and defaults alike. The one exception is a breakpoint, which goes in{' '}
              <InlineCode>@theme {'{ }'}</InlineCode>.
            </React.Fragment>
          )}
        >
          <CodeBlock
            title={'app.css'}
            snippet={css`
              @import 'tailwindcss';
              @import '@proedis/ui';

              /* Every variable of the package: plain CSS, after the import */
              :root {
                --primary: oklch(0.55 0.2 264);
                --stack-gap: var(--space-lg);
                --space-md: 1.25rem;
                --spacing-control-md: 2.5rem;
                --radius-scale: 1.4;
              }

              /* Their dark values */
              .dark {
                --primary: oklch(0.7 0.15 264);
              }

              /* A region: only what is inside it */
              .toolbar {
                --space-md: 0.5rem;
              }

              /* Breakpoints only: Tailwind writes them into the media queries when it compiles */
              @theme {
                --breakpoint-md: 50rem;
              }
            `}
          />
          <DocTable
            head={[ 'Where', 'For', 'What happens' ]}
            rows={PLACEMENT.map(([ where, use, result ]) => [
              <code key={'w'} className={'font-mono text-xs whitespace-nowrap text-foreground'}>{where}</code>,
              use,
              result
            ])}
          />
          <Prose>
            <p>
              Why it works this way. The package declares its defaults in plain <InlineCode>:root</InlineCode>, outside
              any CSS layer, and its classes read the variable where the element is ({' '}
              <InlineCode>bg-primary</InlineCode> is <InlineCode>background-color: var(--primary)</InlineCode>). Two
              plain declarations of the same variable: the later one wins, so yours goes after the import, in the same
              file or in a stylesheet loaded after it. <InlineCode>@theme</InlineCode> and{' '}
              <InlineCode>@layer base</InlineCode> both end up inside a layer, and a layer loses against the package’s
              plain <InlineCode>:root</InlineCode> whatever the order. Some variables still seem to work from{' '}
              <InlineCode>@theme</InlineCode>, the ones the package does not declare on <InlineCode>:root</InlineCode>,
              and that is the trap: a theme half applied, with nothing to say which half.
            </p>
            <p>
              A breakpoint is the opposite case: Tailwind writes its width into each media query while compiling, and a
              media query cannot read a variable, so on <InlineCode>:root</InlineCode> it changes nothing. In{' '}
              <InlineCode>@theme</InlineCode> the classes and <InlineCode>useBreakpoint</InlineCode> both follow it.
            </p>
          </Prose>
          <SubSection
            title={'Theme, data attribute or prop'}
            lead={(
              <React.Fragment>
                Three levels, from the widest to the narrowest. Reach for the widest one that says what you mean: a
                decision of the product belongs in the theme, a decision about one screen belongs at its call site.
              </React.Fragment>
            )}
          >
            <DocTable
              head={[ 'Level', 'Where', 'What it reaches' ]}
              rows={LEVELS.map(([ level, where, reach ]) => [
                <span key={'l'} className={'font-medium whitespace-nowrap text-foreground'}>{level}</span>,
                <code key={'w'} className={'font-mono text-xs text-foreground'}>{where}</code>,
                reach
              ])}
            />
            <CodeBlock
              title={'app.css'}
              snippet={css`
                /* One variant, everywhere: a rule on the data attributes, plain CSS too */
                [data-slot='button'][data-size='sm'] {
                  font-weight: 600;
                }
              `}
            />
          </SubSection>
        </Section>

        <Section
          id={GROUP_IDS.Default}
          title={'Component defaults'}
          lead={GROUP_LEADS.Default}
        >
          <ThemeTable variables={inGroup('Default')} />
          <Example of={defaults} />
          <Prose>
            <p>
              The right column is the same markup in a wrapper that declares <InlineCode>--stack-gap</InlineCode> and{' '}
              <InlineCode>--cluster-gap</InlineCode>: every gap nobody declared tightens, and the Stack with{' '}
              <InlineCode>{"gap={'lg'}"}</InlineCode> keeps its gap, because a declared prop writes its own class and
              never reads the default.
            </p>
          </Prose>
          <Callout tone={'warning'} title={'A value on :root is resolved on :root'}>
            <InlineCode>--stack-gap: var(--space-lg)</InlineCode> on <InlineCode>:root</InlineCode> is the page’s{' '}
            <InlineCode>lg</InlineCode>, fixed there. A region that redeclares the scale has to redeclare{' '}
            <InlineCode>--stack-gap</InlineCode> as well. Left undeclared, the default falls back to its step where the
            component is, and follows the region on its own.
          </Callout>
        </Section>

        {GROUPS.filter((group) => group !== 'Default').map((group) => (
          <Section key={group} id={GROUP_IDS[group]} title={GROUP_TITLES[group]} lead={GROUP_LEADS[group]}>
            <ThemeTable variables={inGroup(group)} />
            {group === 'Size' && (
              <Prose>
                <p>
                  Under a coarse pointer the three control heights grow one step each. The step is declared in
                  Tailwind’s <InlineCode>theme</InlineCode> layer, so a product that redeclares the heights on{' '}
                  <InlineCode>:root</InlineCode> wins on every device, and redeclares them inside its own{' '}
                  <InlineCode>@media (pointer: coarse)</InlineCode> to keep a different step for touch.
                </p>
              </Prose>
            )}
            {group === 'Colour' && (
              <Prose>
                <p>
                  What each family is for, and how the soft register derives itself from a tone, is on the Theming
                  and Tones pages. A colour is shared: <InlineCode>--primary</InlineCode> is the primary of every
                  component at once, which is the point of a contract.
                </p>
              </Prose>
            )}
          </Section>
        ))}

        <Section
          title={'Breakpoints'}
          lead={(
            <React.Fragment>
              The breakpoints are Tailwind’s, <InlineCode>--breakpoint-sm</InlineCode> to{' '}
              <InlineCode>--breakpoint-2xl</InlineCode>, and the one customization that goes in{' '}
              <InlineCode>@theme {'{ }'}</InlineCode> rather than <InlineCode>:root</InlineCode>. Every responsive prop of the package and the <InlineCode>useBreakpoint</InlineCode> hook
              follow them: the stylesheet keeps the five variables in its output so the hook reads the same widths the
              classes switch at.
            </React.Fragment>
          )}
        >
          <CodeBlock
            title={'app.css'}
            snippet={css`
              @theme {
                --breakpoint-md: 50rem;   /* md switches at 800px, for the classes and for useBreakpoint */
              }
            `}
          />
        </Section>

        <Section
          title={'By component'}
          lead={(
            <React.Fragment>
              Every component, with the variables it reads besides the colours, and how many colours it paints with.
              Its page lists all of them, with their defaults, in its own Customization section.
            </React.Fragment>
          )}
        >
          <DocTable head={[ 'Component', 'Variables', 'Colours' ]} rows={componentRows()} />
        </Section>

        <Section
          title={'What the theme does not reach'}
          lead={(
            <React.Fragment>
              Some lengths are part of a component’s geometry and are written in its code, on purpose: they are not a
              decision of the product, and a variable for each would be a theme nobody can read.
            </React.Fragment>
          )}
        >
          <Prose>
            <ul className={'list-disc ps-5'}>
              <li>
                A spacing written as a number, <InlineCode>{'gap={3}'}</InlineCode>: a measure of that call site. A
                name follows the theme, a number does not.
              </li>
              <li>
                The inner geometry of a component: the padding of a control at each size, the size of its icon, the
                gap between its parts. They move with the control height and the scale they sit on, not on their
                own.
              </li>
              <li>
                The side padding of <InlineCode>Container</InlineCode>, which <InlineCode>Bleed</InlineCode> mirrors.
              </li>
            </ul>
            <p>
              For any of these, a rule on the data attributes changes one part or one variant everywhere, and a
              wrapper of the application gives a different default to its own call sites.
            </p>
          </Prose>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Change the default, not every call site'}>
              A product that wants roomier stacks declares <InlineCode>--stack-gap</InlineCode> once. A{' '}
              <InlineCode>gap</InlineCode> on every Stack is the same decision written at every call site.
            </Guidance>
            <Guidance kind={'dont'} title={'Retune a scale to fix one screen'}>
              <InlineCode>--space-md</InlineCode> on <InlineCode>:root</InlineCode> moves every md of the
              application. For one screen, declare it on the element that holds that screen.
            </Guidance>
            <Guidance kind={'do'} title={'Write names, not numbers'}>
              <InlineCode>{"gap={'md'}"}</InlineCode> follows the theme and a region;{' '}
              <InlineCode>{'gap={4}'}</InlineCode> does not.
            </Guidance>
            <Guidance kind={'dont'} title={'Override a class the component builds'}>
              A <InlineCode>className</InlineCode> that fights a height or a colour is a fork of the component in one
              place. If it should be different everywhere, it is a variable; if in one variant, a data attribute.
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

export const Route = createFileRoute('/foundations/customization')({
  component: CustomizationPage
});
