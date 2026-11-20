import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { cn } from '@proedis/ui/core';
import { Stack } from '@proedis/ui/layout';
import { Badge } from '@proedis/ui/display/badge';

import { CodeBlock } from '@/docs/CodeBlock';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { bash, css, tsx } from '@/docs/snippet';
import { NAV, pageAt } from '@/nav';

import type { NavItem } from '@/nav';


/* --------
 * Parts
 * -------- */

/** A component of the catalog: a link when its page is written, a grey card when it is not yet */
function CatalogCard(props: { item: NavItem }): React.ReactNode {
  const { item } = props;
  const Icon = item.icon;

  const content = (
    <React.Fragment>
      <Stack direction={'horizontal'} align={'center'} gap={2}>
        <Icon aria-hidden className={'size-4 shrink-0 text-muted-foreground group-hover:text-primary'} />
        <span className={'font-semibold text-foreground'}>{item.title}</span>
        {!item.ready && <Badge size={'sm'} fill={'soft'} tone={'muted'} className={'ms-auto'}>Soon</Badge>}
      </Stack>
      <p className={'text-sm/6 text-muted-foreground'}>{item.description}</p>
    </React.Fragment>
  );

  const classes = 'group h-full rounded-xl border border-border p-4';

  if (!item.ready) {
    return <Stack gap={1.5} className={cn(classes, 'opacity-70')}>{content}</Stack>;
  }

  return (
    <Stack
      as={Link}
      to={item.to as never}
      gap={1.5}
      className={cn(classes, 'outline-none transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:border-primary')}
    >
      {content}
    </Stack>
  );
}


/* --------
 * Page
 * -------- */

const PAGE = pageAt('/');

/** The groups of the catalog: the sections of the package, Getting started and Foundations aside */
const CATALOG = NAV.filter((group) => group.title !== 'Getting started');


function OverviewPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            <InlineCode>@proedis/ui</InlineCode> is the interface layer a Proedis frontend starts from: the layout
            primitives, the components that read one token contract, the interactive components on Base UI, and
            the stylesheet behind all of them. Every page of this site is built with it.
          </React.Fragment>
        )}
      />

      <PageBody>
        <Section title={'Quick start'}>
          <SubSection
            title={'Install'}
            lead={(
              <React.Fragment>
                React 19 and Tailwind CSS 4.1.5 or later are required. <InlineCode>@base-ui/react</InlineCode> is an
                optional peer: install it as soon as you use an interactive component, which is nearly always.
                The date components want <InlineCode>dayjs</InlineCode>, the table{' '}
                <InlineCode>@tanstack/react-table</InlineCode>, and each page says what it needs.
              </React.Fragment>
            )}
          >
            <CodeBlock
              snippet={bash`
                yarn add @proedis/ui @base-ui/react
              `}
            />
          </SubSection>

          <SubSection
            title={'Import the stylesheet'}
            lead={(
              <React.Fragment>
                One line after Tailwind, in the entry stylesheet of the application. It brings the tokens, their
                defaults, the dark variant, and tells Tailwind to scan the package for its classes, so nothing has to
                be listed in a configuration.
              </React.Fragment>
            )}
          >
            <CodeBlock
              title={'app.css'}
              snippet={css`
                @import 'tailwindcss';
                @import '@proedis/ui';
              `}
            />
          </SubSection>

          <SubSection
            title={'Use a component'}
            lead={(
              <React.Fragment>
                The layout primitives and the static components come from the package name. Every interactive
                component has a subpath of its own, so an application installs the peers of what it uses and nothing
                else.
              </React.Fragment>
            )}
          >
            <CodeBlock
              snippet={tsx`
                import { Stack } from '@proedis/ui';
                import { Button } from '@proedis/ui/actions/button';

                export function Toolbar() {
                  return (
                    <Stack direction={'horizontal'} gap={2}>
                      <Button fill={'plain'}>Cancel</Button>
                      <Button>Save</Button>
                    </Stack>
                  );
                }
              `}
            />
          </SubSection>
        </Section>

        <Section
          title={'How it is built'}
          lead={'A few rules hold across the whole package. Knowing them makes every page shorter.'}
        >
          <Prose>
            <p>
              <strong>Layout is a component.</strong> No component of the package writes{' '}
              <InlineCode>flex</InlineCode> or <InlineCode>gap</InlineCode> by hand: every container is a{' '}
              <InlineCode>Stack</InlineCode>, a <InlineCode>Cluster</InlineCode> or a <InlineCode>Grid</InlineCode>,
              and a lint rule keeps it that way. The same primitives are yours, with the same props.
            </p>
            <p>
              <strong>Tokens, not colours.</strong> Components read a contract of semantic tokens,{' '}
              <InlineCode>--primary</InlineCode>, <InlineCode>--muted</InlineCode>, <InlineCode>--border</InlineCode>{' '}
              and their family, with neutral defaults. A product declares its own values and every component follows.
            </p>
            <p>
              <strong>Every part has a name.</strong> Each part carries a <InlineCode>data-slot</InlineCode>, and each
              resolved variant and state a <InlineCode>data-*</InlineCode> attribute. That is the surface a product
              skins with plain CSS, without touching a call site.
            </p>
            <p>
              <strong>No visible string ships in a component.</strong> Every label, including the accessible ones,
              arrives as a prop, so the package has no language and no translation layer to fight.
            </p>
            <p>
              <strong>Peers you only pay for when you use them.</strong> Base UI, dayjs and TanStack Table are
              optional, and only the subpaths that need them import them.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Components'}
          lead={'Every section of the package, in the order they build on each other.'}
        >
          {CATALOG.map((group) => (
            <SubSection key={group.title} title={group.title} lead={group.description}>
              <Stack columns={{ base: 1, sm: 2, lg: 3 }} gap={3}>
                {group.items.map((item) => <CatalogCard key={item.to} item={item} />)}
              </Stack>
            </SubSection>
          ))}
        </Section>

        <p className={'text-sm text-muted-foreground'}>
          Start with{' '}
          <Link to={'/actions/button'} className={'font-medium text-primary hover:underline'}>Button</Link>
          , the reference page every other one follows.
        </p>
      </PageBody>
    </React.Fragment>
  );
}


/* --------
 * Route
 * -------- */

export const Route = createFileRoute('/')({
  component: OverviewPage
});
