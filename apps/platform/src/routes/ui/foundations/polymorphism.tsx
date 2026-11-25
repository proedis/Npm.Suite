import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable } from '@/docs/Tables';
import asElements from '@/examples/foundations/polymorphism/as-elements.tsx?example';
import ownComponent from '@/examples/foundations/polymorphism/own-component.tsx?example';
import routerLink from '@/examples/foundations/polymorphism/router-link.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/foundations/polymorphism');

/** The components that take `as`, by section, read from the types that use PolymorphicProps */
const POLYMORPHIC: readonly (readonly [ string, string ])[] = [
  [ 'Layout', 'Box, Stack, Cluster, Grid, Center, Container, Split, Spacer, Sticky, Bleed, SafeArea.' ],
  [ 'Primitives', 'Label, ScrollArea, Spinner, VisuallyHidden.' ],
  [ 'Display', 'Badge, Heading and its parts, IconBox, Item and its parts, LabeledContent, Surface and its parts.' ]
];


/* --------
 * Page
 * -------- */

function PolymorphismPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The layout primitives and the static components render as whatever element the page needs:{' '}
            <InlineCode>as={'{\'ul\'}'}</InlineCode>, <InlineCode>as={'{\'article\'}'}</InlineCode>, the link of your
            router. The element is a type parameter, so it also decides which attributes the component accepts.
          </React.Fragment>
        )}
        imports={tsx`
          import type { PolymorphicProps } from '@proedis/ui/core';
        `}
      />

      <PageBody>
        <Example of={asElements} />

        <Section
          title={'Semantics without a wrapper'}
          lead={(
            <React.Fragment>
              A card is an <InlineCode>article</InlineCode>, a list of rows is a <InlineCode>ul</InlineCode> of{' '}
              <InlineCode>li</InlineCode>, a title is an <InlineCode>h3</InlineCode>. With{' '}
              <InlineCode>as</InlineCode> the component is that element, with its own layout and look, and no extra
              element is added around it. The readout under the example is the markup the page really rendered.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Section', 'Components that take as' ]}
            rows={POLYMORPHIC.map(([ section, components ]) => [
              <span key={'s'} className={'font-medium text-foreground'}>{section}</span>,
              components
            ])}
          />
          <Prose>
            <p>
              The interactive components do not take <InlineCode>as</InlineCode>: their element is part of their
              behaviour. A Button that needs another element takes Base UI’s <InlineCode>render</InlineCode>, and one
              that leads somewhere takes <InlineCode>to</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section
          title={'The element decides the attributes'}
          lead={(
            <React.Fragment>
              The props of a polymorphic component are its own, plus everything the element accepts. So{' '}
              <InlineCode>as={'{\'a\'}'}</InlineCode> brings <InlineCode>href</InlineCode>,{' '}
              <InlineCode>target</InlineCode> and <InlineCode>download</InlineCode> along, and{' '}
              <InlineCode>as={'{\'span\'}'}</InlineCode> refuses them.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              <Stack as={'a'} href={'/fleet'}>Fleet</Stack>

              // @ts-expect-error: a span has no href
              <Stack as={'span'} href={'/fleet'}>Fleet</Stack>

              // A component of yours as the element: its own required props are required here too
              function Avatar(props: { src: string; alt: string }) { … }

              <Stack as={Avatar} src={'/anna.png'} alt={'Anna'} />

              // @ts-expect-error: src is required by Avatar
              <Stack as={Avatar} alt={'Anna'} />
            `}
          />
          <Prose>
            <p>
              When the component claims a name the element also has, the component wins: <InlineCode>Grid</InlineCode>’s
              own <InlineCode>fill</InlineCode> replaces the <InlineCode>fill</InlineCode> attribute of an{' '}
              <InlineCode>{'<svg>'}</InlineCode>, deterministically rather than as an error.
            </p>
          </Prose>
        </Section>

        <Section
          title={'The link of your router'}
          lead={(
            <React.Fragment>
              Any component can be the element, the router’s <InlineCode>Link</InlineCode> included: the row below is a
              real anchor with the navigation of the router on click, and the hover and the focus ring of an interactive
              Item.
            </React.Fragment>
          )}
        >
          <Example of={routerLink} />
          <Callout tone={'warning'} title={'The route is not checked through as'}>
            Through <InlineCode>as</InlineCode>, TypeScript does not check the route: <InlineCode>to</InlineCode>{' '}
            accepts any string, and a route that does not exist compiles. Where the route has to be checked, wrap the
            Item in the router’s own Link instead.
          </Callout>
        </Section>

        <Section
          title={'Typing a component of your own'}
          lead={(
            <React.Fragment>
              The same shape the package uses is public. Declare what the component understands, compose the element
              onto it with <InlineCode>PolymorphicProps</InlineCode>, sign the component generic and cast once at the
              destructure.
            </React.Fragment>
          )}
        >
          <Example of={ownComponent} />
          <Prose>
            <p>
              Two details of that shape are load-bearing. The <strong>default type argument</strong>,{' '}
              <InlineCode>{'E extends React.ElementType = \'p\''}</InlineCode>, keeps <InlineCode>NoteProps</InlineCode>{' '}
              usable with no argument, so a wrapper writing <InlineCode>StackProps</InlineCode> is unaffected. The{' '}
              <strong>one cast</strong> at the destructure, <InlineCode>{'props as NoteProps<\'p\'>'}</InlineCode>,
              exists because inside the body the element is unresolved and the body does not care: it reads its own
              props and forwards the rest. The call site is where the element is checked.
            </p>
          </Prose>
          <CodeBlock
            snippet={tsx`
              import type { StackProps } from '@proedis/ui/layout';

              // No type argument: the default, a div, applies
              function Toolbar(props: StackProps) {
                return <Stack direction={'horizontal'} gap={2} {...props} />;
              }
            `}
          />
        </Section>

        <Section title={'The shared props and as'}>
          <Prose>
            <p>
              Every polymorphic component takes the shared props but one: <strong>VisuallyHidden</strong>, which keeps
              its content in the accessibility tree, so a prop that hides it with <InlineCode>display: none</InlineCode>{' '}
              would contradict what it is for. Its type refuses them.
            </p>
          </Prose>
          <CodeBlock
            snippet={tsx`
              // @ts-expect-error: VisuallyHidden takes no shared props
              <VisuallyHidden hideBelow={'md'}>Total</VisuallyHidden>
            `}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Use as for meaning'}>
              A list is a <InlineCode>ul</InlineCode>, a card an <InlineCode>article</InlineCode>, a section title a
              heading of the right level: what a screen reader announces comes from the element.
            </Guidance>
            <Guidance kind={'dont'} title={'Put a click handler on a div'}>
              <InlineCode>as={'{\'button\'}'}</InlineCode> is a real button; a click handler on anything else is not
              reachable from a keyboard.
            </Guidance>
            <Guidance kind={'do'} title={'Type your own primitives the same way'}>
              Strict props plus <InlineCode>PolymorphicProps</InlineCode>, a default element, one cast.
            </Guidance>
            <Guidance kind={'dont'} title={'Wrap to change the element'}>
              A div around an Item to make it a list item adds an element and breaks the list. Pass{' '}
              <InlineCode>as={'{\'li\'}'}</InlineCode>.
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

export const Route = createFileRoute('/ui/foundations/polymorphism')({
  component: PolymorphismPage
});
