import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import baseProps from 'virtual:ui-props/BaseProps';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable } from '@/docs/Tables';
import boxContents from '@/examples/foundations/shared-props/box-contents.tsx?example';
import displayKept from '@/examples/foundations/shared-props/display-kept.tsx?example';
import hide from '@/examples/foundations/shared-props/hide.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/foundations/shared-props');

/** The props of BaseProps are the subject here, so they are listed in the table rather than under it */
const BASE_PROPS = baseProps.map((prop) => ({ ...prop, shared: false }));

/** Who takes the shared props, by section of the package, read from the components that split them out */
const TAKERS: readonly (readonly [ string, string ])[] = [
  [ 'Layout', 'Every primitive: Box, Stack, Cluster, Grid, Center, Container, Split, Spacer, Sticky, AspectRatio, Bleed, SafeArea.' ],
  [ 'Primitives', 'Divider, Label, LoadingBar, ScrollArea, Skeleton, Spinner.' ],
  [ 'Display', 'Badge, BadgeCounter, Heading, IconBox, Item, LabeledContent, Person, Surface, and their parts.' ],
  [ 'Actions', 'Button and IconButton, CollapsibleSection, SegmentedControl, Tabs, Toggle.' ],
  [ 'Feedback', 'Alert, EmptyState, the jobs button of the notifications.' ],
  [ 'Forms', 'Form and its parts, Field, FieldShell, every control: TextInput and the inputs built on it, Textarea, NumberInput, Select, MultiSelect, Combobox, DatePicker, Checkbox, CheckboxGrid, Radio, Switch, FileUpload, AttachmentList.' ],
  [ 'Data', 'Table, FiltersBar, Detail, the field of ModalSelector.' ]
];


/* --------
 * Page
 * -------- */

function SharedPropsPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Two props every component with a root of its own accepts on top of its own:{' '}
            <InlineCode>hideBelow</InlineCode> and <InlineCode>hideFrom</InlineCode>, the two halves of a responsive
            layout. They live in one interface, <InlineCode>BaseProps</InlineCode>, so adding a third would be a change
            to one file rather than to every component.
          </React.Fragment>
        )}
        imports={tsx`
          import type { BaseProps } from '@proedis/ui/core';
        `}
      />

      <PageBody>
        <Example of={hide} />

        <Section
          title={'Showing and hiding by width'}
          lead={(
            <React.Fragment>
              <InlineCode>hideBelow</InlineCode> hides below a breakpoint, so the element shows from it up;{' '}
              <InlineCode>hideFrom</InlineCode> hides from a breakpoint up. Together they make the two halves of a
              layout that differs on a phone, with exactly one of them on screen at any width. Resize the window to
              watch the badges of the example appear one by one.
            </React.Fragment>
          )}
        >
          <PropsTable props={BASE_PROPS} />
          <Prose>
            <p>
              The breakpoints are the ones of Tailwind, <InlineCode>sm</InlineCode> to <InlineCode>2xl</InlineCode>.{' '}
              <InlineCode>base</InlineCode> is not accepted, since it has no media query: hiding below the narrowest
              width is not rendering the element.
            </p>
          </Prose>
        </Section>

        <Section
          title={'The display is never touched'}
          lead={(
            <React.Fragment>
              <InlineCode>hideBelow={'{\'md\'}'}</InlineCode> compiles to one class, <InlineCode>not-md:hidden</InlineCode>:
              <InlineCode>display: none</InlineCode> inside a negated media query. Above the breakpoint no rule matches
              at all, so the element keeps whatever display it has. The row below is a horizontal Stack with a gap, and
              from <InlineCode>md</InlineCode> on it is exactly that row; the line under it is its real class list.
            </React.Fragment>
          )}
        >
          <Example of={displayKept} />
          <Callout tone={'warning'} title={'Why not hidden lg:flex'}>
            The obvious implementation names the display to restore, and naming it wrong fails in silence. A stack{' '}
            <InlineCode>flex flex-col gap-4</InlineCode> given <InlineCode>hidden lg:contents</InlineCode> is{' '}
            <InlineCode>display: contents</InlineCode> from <InlineCode>lg</InlineCode> on, and the direction and the gap
            it still carries do nothing: a stack that loses its gap at one breakpoint, with nothing reported anywhere.{' '}
            <InlineCode>not-*</InlineCode> removes the argument that could be wrong.
          </Callout>
        </Section>

        <Section
          title={'Hiding a group inside a layout'}
          lead={(
            <React.Fragment>
              <InlineCode>Box</InlineCode> is an element with the shared props and nothing else; with the literal class{' '}
              <InlineCode>contents</InlineCode> it also leaves the layout, so its children become children of the row.
              Below, three buttons join the toolbar with its gap from <InlineCode>md</InlineCode>, and disappear on a
              phone.
            </React.Fragment>
          )}
        >
          <Example of={boxContents} />
          <Prose>
            <p>
              <InlineCode>contents</InlineCode> belongs on a Box, never on a primitive that owns a layout: there it would
              switch off the component’s own gap and alignment, for the reason above.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Hidden is still mounted'}
          lead={(
            <React.Fragment>
              Hiding is CSS: the element and its children stay in the tree, run their effects and fetch their data.
              That is right for a heading or a toolbar. For a subtree with a cost, a map or a chart, ask the hook and
              render nothing.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              import { useIsMobile } from '@proedis/ui/hooks';

              function Overview() {
                const isMobile = useIsMobile();

                // The map is never mounted on a phone, not only hidden
                return isMobile ? <RouteList /> : <RouteMap />;
              }
            `}
          />
        </Section>

        <Section
          title={'Which components take them'}
          lead={(
            <React.Fragment>
              Every component that renders a root of its own, through <InlineCode>splitBaseProps</InlineCode>, with its
              own classes first, the shared ones next and <InlineCode>className</InlineCode> last, so an override of
              yours still wins.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Section', 'Components' ]}
            rows={TAKERS.map(([ section, components ]) => [
              <span key={'s'} className={'font-medium text-foreground'}>{section}</span>,
              components
            ])}
          />
          <Prose>
            <p>
              Three kinds of component do not. <strong>VisuallyHidden</strong>, whose whole point is to stay in the
              accessibility tree: a prop that takes it out with <InlineCode>display: none</InlineCode> would contradict
              it. <strong>BusyVeil</strong>, the veil over a dialog or a drawer that is working: it covers its
              container and has no place of its own in a layout. And{' '}
              <strong>the overlays rendered in a portal</strong>, Dialog, AlertDialog, Drawer, Popover, Menu and Tooltip:
              hiding a panel that floats above the page hides nothing a layout placed, and a component that hides its
              trigger has the trigger to say so.
            </p>
          </Prose>
        </Section>

        <Section
          title={'What earns a place here'}
          lead={'BaseProps is closed on purpose, and the criterion is written rather than a list, because a list gets extended.'}
        >
          <Prose>
            <p>
              A prop joins only if a consumer <strong>could not write it as a literal class</strong>, because it is built
              from a value at runtime and needs a safelist entry, or if it{' '}
              <strong>needs knowledge the component has and the caller does not</strong>: its own axis, its own
              padding, its own display. <InlineCode>p</InlineCode>,{' '}
              <InlineCode>m</InlineCode>, <InlineCode>w</InlineCode> and <InlineCode>bg</InlineCode> fail both: they are
              already <InlineCode>className={'{\'p-4 lg:p-8\'}'}</InlineCode>, where Tailwind finds them for free.
            </p>
          </Prose>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Pair hideBelow and hideFrom at one breakpoint'}>
              Two halves at the same breakpoint guarantee exactly one is on screen, at every width.
            </Guidance>
            <Guidance kind={'dont'} title={'Hide a costly subtree with CSS'}>
              It still mounts, renders and fetches. Render nothing instead, with useIsMobile.
            </Guidance>
            <Guidance kind={'do'} title={'Use Box with contents to hide a group'}>
              The children keep the gap and the alignment of the layout around them.
            </Guidance>
            <Guidance kind={'dont'} title={'Write hidden lg:flex next to a primitive'}>
              It names a display to restore, and the day it is the wrong one nothing says so.
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

export const Route = createFileRoute('/foundations/shared-props')({
  component: SharedPropsPage
});
