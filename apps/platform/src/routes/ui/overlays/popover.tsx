import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import popoverLabelsProps from 'virtual:ui-props/PopoverLabels';
import popoverProps from 'virtual:ui-props/PopoverProps';
import themeDoc from 'virtual:ui-theme/overlays/popover';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import busy from '@/examples/overlays/popover/busy.tsx?example';
import form from '@/examples/overlays/popover/form.tsx?example';
import help from '@/examples/overlays/popover/help.tsx?example';
import placement from '@/examples/overlays/popover/placement.tsx?example';
import preview from '@/examples/overlays/popover/preview.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/overlays/popover');


/* --------
 * Page
 * -------- */

function PopoverPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A small dialog attached to the control that opens it, with an arrow pointing at it: an explanation to read,
            a preview, a short form. A header with a title and an x when the title is needed, a footer with actions when
            there are some. Not for a list to pick from, a list of actions, or work to confirm.
          </React.Fragment>
        )}
        imports={tsx`
          import { Popover } from '@proedis/ui/overlays/popover';
          import type { PopoverLabels } from '@proedis/ui/overlays/popover';
        `}
      />

      <PageBody>
        <Example of={help} />

        <Section
          title={'Trigger and name'}
          lead={(
            <React.Fragment>
              <InlineCode>trigger</InlineCode> is the control that opens it: a real button, never a link, and one that
              forwards its ref, since the popover anchors to the element it renders. Button and IconButton both do. A
              popover with a <InlineCode>title</InlineCode> is named by it; without one,{' '}
              <InlineCode>aria-label</InlineCode> is required by the type, as in the help popover above.
            </React.Fragment>
          )}
        />

        <Section
          title={'Help'}
          lead={(
            <React.Fragment>
              With no title and no footer, the <InlineCode>description</InlineCode> is the whole content: it is what is
              read when the popover opens. The x sits at the top of the body, to the right of the text, and is never the
              first thing the focus lands on.
            </React.Fragment>
          )}
        />

        <Section
          title={'Title and content'}
          lead={(
            <React.Fragment>
              A <InlineCode>title</InlineCode> brings a header with the x, over a body that scrolls when it is taller
              than the room there is. The body takes anything: data, text, fields.
            </React.Fragment>
          )}
        >
          <Example of={preview} />
        </Section>

        <Section
          title={'A short form'}
          lead={(
            <React.Fragment>
              <InlineCode>footer</InlineCode> holds the actions, and its presence changes how the focus behaves: with a
              footer the popover runs Base UI’s focus trap (<InlineCode>{'modal={\'trap-focus\'}'}</InlineCode>), meant to
              keep a Tab from wandering off a half filled form, while the page behind still scrolls. Without one it is not
              modal at all. A <InlineCode>Form</InlineCode> in the body takes the id of the popover and{' '}
              <InlineCode>Popover.Submit</InlineCode> points at it, so Enter in a field submits and the popover renders no{' '}
              <InlineCode>{'<form>'}</InlineCode> of its own.
            </React.Fragment>
          )}
        >
          <Example of={form} />
          <Prose>
            <p>
              <InlineCode>open</InlineCode> and <InlineCode>onOpenChange</InlineCode> are optional: without them the
              popover keeps its own state. Pass them, as here, to close it after a save.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Placement and width'}
          lead={(
            <React.Fragment>
              <InlineCode>side</InlineCode> defaults to <InlineCode>bottom</InlineCode> and flips on its own when there
              is no room. <InlineCode>width</InlineCode> is <InlineCode>sm</InlineCode>, 280px, the default, for help and
              choices, or <InlineCode>md</InlineCode>, 320px, for previews and text fields. The height never passes the
              room left in the window.
            </React.Fragment>
          )}
        >
          <Example of={placement} />
        </Section>

        <Section
          title={'Loading'}
          lead={(
            <React.Fragment>
              <InlineCode>busy</InlineCode> marks the popover <InlineCode>aria-busy</InlineCode> and writes{' '}
              <InlineCode>data-busy</InlineCode> on it. It draws nothing: the placeholders are the caller’s, shaped like
              what is coming.
            </React.Fragment>
          )}
        >
          <Example of={busy} />
        </Section>

        <Section
          title={'Where the focus goes'}
          lead={(
            <React.Fragment>
              On opening, to the first control of the body, then of the footer, then to the popup itself; never to the
              x. On closing it depends on how: Esc and the x bring it back to the trigger, while a click outside leaves it
              where the click landed. Without a footer, Tab from the last control closes the popover and moves on. When
              the trigger scrolls out of view the popover closes, rather than floating over something else.
            </React.Fragment>
          )}
        >
          <Callout>
            Popovers stack at <InlineCode>--z-popover</InlineCode>, above dialogs, so one opened from inside a Dialog or a
            Drawer shows over it.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The popup is Base UI’s <InlineCode>Popover</InlineCode>: a dialog named by its title or its{' '}
              <InlineCode>aria-label</InlineCode>, described by its description, with the trigger reporting whether it is
              open. The x is an IconButton named by <InlineCode>labels.close</InlineCode>, which is also its tooltip.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'On the trigger, opens the popover. In a field, submits the form through Popover.Submit.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'On the trigger, opens the popover.' ],
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves through the popover. Without a footer, Tab from the last control moves on to the page and closes it.' ],
              [ <InlineCode key={'k'}>Shift Tab</InlineCode>, 'With a footer, from the first control wraps round to the last.' ],
              [ <InlineCode key={'k'}>Escape</InlineCode>, 'Closes it and gives the focus back to the trigger.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsInspector of={help}
            rows={[
              { slot: 'popover', part: 'The popup', attributes: [ 'data-width', 'data-side', 'data-align', 'data-open', 'data-busy' ] },
              { slot: 'popover-arrow', part: 'The arrow pointing at the trigger', attributes: [ 'data-side' ] },
              { slot: 'popover-header', part: 'The header, with a title' },
              { slot: 'popover-title', part: 'The title' },
              { slot: 'popover-close', part: 'The x' },
              { slot: 'popover-body', part: 'The body that scrolls' },
              { slot: 'popover-body-content', part: 'The description and the content' },
              { slot: 'popover-description', part: 'The description' },
              { slot: 'popover-footer', part: 'The footer with the actions' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Popover'} id={'api-popover'}>
            <PropsTable
              props={popoverProps}
              rest={(
                <React.Fragment>
                  <InlineCode>busy</InlineCode> defaults to <InlineCode>false</InlineCode>. Either{' '}
                  <InlineCode>title</InlineCode> or <InlineCode>aria-label</InlineCode> is required. The popover takes no
                  other prop: it floats above the page, so the shared props of a layout do not apply to it.
                </React.Fragment>
              )}
            />
          </SubSection>

          <SubSection title={'PopoverLabels'} id={'api-popover-labels'}>
            <PropsTable props={popoverLabelsProps} />
          </SubSection>

          <SubSection title={'Parts'} id={'api-popover-parts'}>
            <DocTable
              head={[ 'Part', 'Props' ]}
              rows={[
                [ <InlineCode key={'p'}>Popover.Submit</InlineCode>, 'Every prop of Button. It is always a submit, of the form of the popover.' ]
              ]}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Keep it to one small task'}>
              A setting, a note, a preview. Work that needs a title, sections and a confirmation is a Dialog.
            </Guidance>
            <Guidance kind={'dont'} title={'Use it as a list'}>
              A choice from options is a Select, a list of actions is a Menu: both come with the keyboard a list needs.
            </Guidance>
            <Guidance kind={'do'} title={'Give a help popover a name'}>
              With no title, aria-label is what a screen reader says when it opens: say what the help is about.
            </Guidance>
            <Guidance kind={'dont'} title={'Trigger it from a link'}>
              A link goes somewhere. The trigger is a button, and one that forwards its ref.
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

export const Route = createFileRoute('/ui/overlays/popover')({
  component: PopoverPage
});
