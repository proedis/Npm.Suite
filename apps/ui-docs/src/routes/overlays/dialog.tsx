import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import dialogLabelsProps from 'virtual:ui-props/DialogLabels';
import dialogProps from 'virtual:ui-props/DialogProps';
import sectionProps from 'virtual:ui-props/OverlaySection';
import themeDoc from 'virtual:ui-theme/overlays/dialog';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { css, tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/overlays/dialog/basic.tsx?example';
import detail from '@/examples/overlays/dialog/detail.tsx?example';
import dirty from '@/examples/overlays/dialog/dirty.tsx?example';
import errors from '@/examples/overlays/dialog/errors.tsx?example';
import header from '@/examples/overlays/dialog/header.tsx?example';
import inContext from '@/examples/overlays/dialog/in-context.tsx?example';
import loading from '@/examples/overlays/dialog/loading.tsx?example';
import nested from '@/examples/overlays/dialog/nested.tsx?example';
import radius from '@/examples/overlays/dialog/radius.tsx?example';
import returnFocus from '@/examples/overlays/dialog/return-focus.tsx?example';
import saving from '@/examples/overlays/dialog/saving.tsx?example';
import sections from '@/examples/overlays/dialog/sections.tsx?example';
import sizes from '@/examples/overlays/dialog/sizes.tsx?example';
import toolbar from '@/examples/overlays/dialog/toolbar.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/overlays/dialog');


/* --------
 * Page
 * -------- */

function DialogPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A modal panel over a veil, its top edge held 64px from the window so it grows downwards and the title
            never moves. For a form born from an action of the page, a choice from a long list, a detail with several
            sections. One gate for every way out, a discard prompt for unsaved changes, a waiting veil that answers at once
            and a save that cannot hang forever.
          </React.Fragment>
        )}
        imports={tsx`
          import { Dialog } from '@proedis/ui/overlays/dialog';
          import type {
            DialogBusy, DialogDiscard, DialogLabels, DialogRadius, DialogSection, DialogSize
          } from '@proedis/ui/overlays/dialog';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Anatomy'}
          lead={(
            <React.Fragment>
              A header with an optional icon box, the title, the description and the x; an optional toolbar; a body that
              scrolls between them; a footer with the actions on the right. No lines anywhere: an 8px inner shade
              appears at the top of the body once it has scrolled and at the bottom while there is more under it.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              The dialog is <strong>controlled only</strong>: <InlineCode>open</InlineCode> and{' '}
              <InlineCode>onOpenChange</InlineCode> are required, because the page has to know when it closes and,
              more often than not, ties it to the address. It renders no <InlineCode>{'<form>'}</InlineCode>: a{' '}
              <InlineCode>Form</InlineCode> in the body takes the id of the dialog, and{' '}
              <InlineCode>Dialog.Submit</InlineCode> in the footer points at it through the{' '}
              <InlineCode>form</InlineCode> attribute, so Enter in a field submits and the footer stays outside the
              scrolling body.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              Three widths, the same for every kind of content: <InlineCode>sm</InlineCode> 400px,{' '}
              <InlineCode>md</InlineCode> 560px, the default, and <InlineCode>lg</InlineCode> 800px. The height follows
              the content up to the window, and the body scrolls past that.
            </React.Fragment>
          )}
        >
          <Example of={sizes} />
        </Section>

        <Section
          title={'Radius'}
          lead={(
            <React.Fragment>
              Dialog, Drawer and AlertDialog share one corner, <InlineCode>--overlay-radius</InlineCode>,{' '}
              <InlineCode>lg</InlineCode> when undeclared: declared once on <InlineCode>:root</InlineCode>, every overlay
              of the application follows it. <InlineCode>--dialog-radius</InlineCode> lets the dialogs alone differ and
              falls back to it. <InlineCode>radius</InlineCode> sets the corner of one dialog, a step of the scale or{' '}
              <InlineCode>none</InlineCode>; <InlineCode>default</InlineCode>, the default, is the theme’s. The waiting
              veil follows the corner it covers.
            </React.Fragment>
          )}
        >
          <Example of={radius} />
          <CodeBlock
            title={'app.css'}
            snippet={css`
              :root {
                --overlay-radius: var(--radius-xl);   /* Dialog, Drawer and AlertDialog */
                --dialog-radius: var(--radius-2xl);   /* the dialogs alone */
              }
            `}
          />
        </Section>

        <Section
          title={'Header'}
          lead={(
            <React.Fragment>
              The title is required, wraps and is never cut. The description carries the context, and in a
              confirmation the consequence. The icon sits in a 32px box whose tone says what the dialog is for:{' '}
              <InlineCode>primary</InlineCode> to create or act, <InlineCode>muted</InlineCode> to read or choose.
              Never a status tone: a dialog that warns is an AlertDialog.
            </React.Fragment>
          )}
        >
          <Example of={header} />
        </Section>

        <Section
          title={'A detail to read'}
          lead={(
            <React.Fragment>
              With no footer the dialog is a detail. It is the only kind a click on the veil closes, since nothing can
              be lost, and the body takes the focus itself, so the arrows scroll it. Every other dialog jolts when the
              veil is pressed, to say it is still there.
            </React.Fragment>
          )}
        >
          <Example of={detail} />
        </Section>

        <Section
          title={'Footer'}
          lead={(
            <React.Fragment>
              <InlineCode>footer</InlineCode> holds the actions on the right, the exit first and the primary last:{' '}
              <InlineCode>Dialog.Cancel</InlineCode>, which goes through the same gate as the x, and{' '}
              <InlineCode>Dialog.Submit</InlineCode>, the submit of the form in the body.{' '}
              <InlineCode>footerStart</InlineCode> is the left end, for an option such as “Create another” or a short
              summary of the choice.
            </React.Fragment>
          )}
        >
          <Example of={toolbar} />
          <Prose>
            <p>
              <InlineCode>Dialog.Cancel</InlineCode> is a <InlineCode>secondary</InlineCode> solid button by default.
              Your <InlineCode>onClick</InlineCode> runs first, and a <InlineCode>preventDefault</InlineCode> in it keeps
              the dialog open. <InlineCode>Dialog.Submit</InlineCode> is a Button with{' '}
              <InlineCode>{'type={\'submit\'}'}</InlineCode> and the form of the dialog: every prop of Button works on it,
              <InlineCode>loading</InlineCode> included.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Toolbar'}
          lead={(
            <React.Fragment>
              <InlineCode>toolbar</InlineCode> sits between the header and the body and stays still while the body
              scrolls: a search, a “Select all”. A field there is the first one the dialog focuses, before any field of
              the body, which is what a selector wants. The example above has one: Esc in a search with text empties it
              first, and only the next Esc reaches the dialog.
            </React.Fragment>
          )}
        />

        <Section
          title={'Unsaved changes'}
          lead={(
            <React.Fragment>
              <InlineCode>dirty</InlineCode> says the form was changed. The x, Cancel and Esc then open the discard
              prompt instead of closing, and a click on the veil only jolts. <InlineCode>discard</InlineCode> carries the
              texts of the prompt, since the package writes none, and the type asks for it as soon as{' '}
              <InlineCode>dirty</InlineCode> can be true: <InlineCode>{'dirty={form.isDirty}'}</InlineCode> without it does
              not compile, while <InlineCode>{'dirty={false}'}</InlineCode>, or no <InlineCode>dirty</InlineCode>, needs
              none. The prompt is an AlertDialog in the warning tone, rendered inside the dialog so it sits above it.
            </React.Fragment>
          )}
        >
          <Example of={dirty} />
        </Section>

        <Section
          title={'Waiting'}
          lead={(
            <React.Fragment>
              <InlineCode>busy</InlineCode> makes the dialog inert at once, so a second click or a second Enter cannot
              send twice, and shows the veil at once, fading in over 150ms and held at least 400ms, so a fast answer does
              not blink and a press never looks unanswered. The
              veil says its label, <InlineCode>busySubmit</InlineCode> or <InlineCode>busyLoad</InlineCode>, and a save
              moves the focus onto it, so the keyboard has somewhere to stay while the rest is inert. When the wait ends
              with the dialog still open, a save that keeps it open for the next one, the focus goes back to the first
              field, unless an error arrived with the answer and took it.
            </React.Fragment>
          )}
        >
          <SubSection
            title={'Saving'}
            lead={(
              <React.Fragment>
                <InlineCode>{'busy={\'submit\'}'}</InlineCode> covers the whole panel and nothing closes it: not the x,
                not Esc, not the veil.
              </React.Fragment>
            )}
          >
            <Example of={saving} />
          </SubSection>

          <SubSection
            title={'Loading'}
            lead={(
              <React.Fragment>
                <InlineCode>{'busy={\'load\'}'}</InlineCode> covers the body while its data arrive, and the x and Esc
                still close: nothing can be lost yet. A dialog opened while loading gives the focus to the veil, since
                everything under it is inert, and when the data arrive the focus moves to the first field.
              </React.Fragment>
            )}
          >
            <Example of={loading} />
          </SubSection>
        </Section>

        <Section
          title={'Errors and the 15 second limit'}
          lead={(
            <React.Fragment>
              <InlineCode>error</InlineCode> shows at the top of the body, an error summary or the send error, and takes
              the focus each time it changes. A save that gets no answer in 15 seconds becomes a send error of its own,
              the <InlineCode>timeout</InlineCode> label, and <InlineCode>onSubmitTimeout</InlineCode> tells the page to
              cancel the request. The first button waits the full 15 seconds.
            </React.Fragment>
          )}
        >
          <Example of={errors} />
          <Callout tone={'warning'} title={'Leave busy as it is after the timeout'}>
            The message shows for as long as <InlineCode>busy</InlineCode> stays <InlineCode>{'\'submit\''}</InlineCode>, and
            the dialog is usable again meanwhile: the x, Cancel and Esc close it. Setting <InlineCode>busy</InlineCode>{' '}
            back to <InlineCode>false</InlineCode> in <InlineCode>onSubmitTimeout</InlineCode> erases the message the
            moment it appears. The limit belongs to one wait: once <InlineCode>busy</InlineCode> goes back to{' '}
            <InlineCode>false</InlineCode> it is forgotten, and the next save gets its full 15 seconds.
          </Callout>
        </Section>

        <Section
          title={'Sections'}
          lead={(
            <React.Fragment>
              A long form in an <InlineCode>lg</InlineCode> dialog can take an index beside the body:{' '}
              <InlineCode>sections</InlineCode>, from three to five, each with an <InlineCode>id</InlineCode> that a{' '}
              <InlineCode>Dialog.Section</InlineCode> of the body carries. The current one follows the scroll and is
              written in bold with a bar on its left, the others in the quiet ink; a click moves the focus to its title,
              and <InlineCode>errors</InlineCode> puts a count beside an item. The index shows once the content area is
              768px wide, a container query, so a narrow window keeps only the body.
            </React.Fragment>
          )}
        >
          <Example of={sections} />
        </Section>

        <Section
          title={'Nesting'}
          lead={(
            <React.Fragment>
              A dialog opened from inside another is rendered inside it, in its children. That is what places it 120px
              from the top over a lighter veil, so the first one reads as the place you came from. The depth is a context
              of the package rather than Base UI’s own marker, and the discard prompt of a nested dialog sits lower
              still, at 176px.
            </React.Fragment>
          )}
        >
          <Example of={nested} />
          <Callout tone={'warning'}>
            Opened as a sibling instead, the second dialog would sit exactly over the first, at the same height, over
            the same veil: two panels nobody can tell apart.
          </Callout>
        </Section>

        <Section
          title={'Where the focus goes'}
          lead={(
            <React.Fragment>
              On opening, to the first field, the toolbar’s before the body’s; with no field, to the primary of the
              footer, which in a confirmation is the action; with no footer, to the body; while the data load, to the
              veil. Never to the x, and never to a control under the veil. On closing,
              back to the control that opened it, or to <InlineCode>returnFocus</InlineCode> when that control is gone,
              or to the <InlineCode>h1</InlineCode> of the page.
            </React.Fragment>
          )}
        >
          <Example of={returnFocus} />
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              A creation with everything a real one needs: the primary icon, a form on the grid of six, the discard
              prompt once something is typed, the saving veil, and “Create another”, which keeps the dialog open on an
              empty form.
            </React.Fragment>
          )}
        >
          <Example of={inContext} />
        </Section>

        <Section
          title={'Type safety'}
          lead={'A dialog that can be dirty brings the texts of the prompt it opens, or it does not compile.'}
        >
          <CodeBlock
            snippet={tsx`
              // @ts-expect-error: dirty can be true and the prompt has nothing to say
              <Dialog open={open} onOpenChange={setOpen} title={'New vehicle'} labels={labels} dirty={form.isDirty} />

              // Both are fine
              <Dialog open={open} onOpenChange={setOpen} title={'New vehicle'} labels={labels} dirty={form.isDirty} discard={discard} />
              <Dialog open={open} onOpenChange={setOpen} title={'Vehicle'} labels={labels} dirty={false} />
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The panel is Base UI’s modal <InlineCode>Dialog</InlineCode>: it is announced as a dialog named by its
              title and described by its description, the page behind is inert, and the focus is kept inside. The x is
              an IconButton, so its name, <InlineCode>labels.close</InlineCode>, is also its tooltip.
            </p>
            <p>
              While it waits the content is <InlineCode>aria-busy</InlineCode> and inert; during a save the veil,
              focusable, holds the focus and says its label. An error takes the focus when it appears, so it is read at
              once.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves through the controls of the dialog, and from the last back to the first.' ],
              [ <InlineCode key={'k'}>Shift Tab</InlineCode>, 'Moves back, from the first to the last.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'In a field, submits the form through Dialog.Submit.' ],
              [ <InlineCode key={'k'}>Escape</InlineCode>, 'Goes through the gate: closes, opens the discard prompt when dirty, or does nothing while saving.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'} lead={'Every part a stylesheet can reach, and what each one reports.'}>
          <SlotsInspector modal of={basic}
            rows={[
              { slot: 'dialog', part: 'The panel', attributes: [ 'data-size', 'data-radius', 'data-open', 'data-nested' ] },
              { slot: 'dialog-backdrop', part: 'The veil behind it' },
              { slot: 'dialog-viewport', part: 'The fixed layer that places the panel' },
              { slot: 'dialog-header', part: 'The header' },
              { slot: 'dialog-icon', part: 'The icon box', attributes: [ 'data-tone' ] },
              { slot: 'dialog-heading', part: 'The title and the description' },
              { slot: 'dialog-title', part: 'The title' },
              { slot: 'dialog-description', part: 'The description' },
              { slot: 'dialog-header-end', part: 'The controls on the right of the header' },
              { slot: 'dialog-close', part: 'The x' },
              { slot: 'dialog-toolbar', part: 'The toolbar' },
              { slot: 'dialog-content', part: 'The index and the body, side by side', attributes: [ 'aria-busy' ] },
              { slot: 'dialog-index', part: 'The index of the sections' },
              { slot: 'dialog-index-item', part: 'An item of the index', attributes: [ 'aria-current', 'data-errors' ] },
              { slot: 'dialog-index-item-errors', part: 'The count of errors of an item' },
              { slot: 'dialog-scroll', part: 'The frame of the body and its shades' },
              { slot: 'dialog-shade', part: 'A scroll shade', attributes: [ 'data-edge', 'data-visible' ] },
              { slot: 'dialog-body', part: 'The body that scrolls' },
              { slot: 'dialog-body-content', part: 'The error and the content of the body' },
              { slot: 'overlay-section', part: 'A Dialog.Section', attributes: [ 'data-overlay-section' ] },
              { slot: 'dialog-error', part: 'The error box at the top of the body' },
              { slot: 'dialog-error-message', part: 'Its message' },
              { slot: 'dialog-footer', part: 'The footer' },
              { slot: 'dialog-footer-start', part: 'The left end of the footer' },
              { slot: 'dialog-footer-actions', part: 'The actions on the right' },
              { slot: 'dialog-veil', part: 'The waiting veil over the panel' }
            ]}
          />
          <Prose>
            <p>
              The backdrop takes <InlineCode>--overlay</InlineCode> on a first dialog and{' '}
              <InlineCode>--overlay-nested</InlineCode> on a nested one, and the whole layer stacks at{' '}
              <InlineCode>--z-dialog</InlineCode>, under lists and popovers (<InlineCode>--z-popover</InlineCode>) so a
              Select inside a dialog opens above it.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <SubSection title={'Dialog'} id={'api-dialog'}>
            <PropsTable
              props={dialogProps}
              rest={(
                <React.Fragment>
                  <InlineCode>busy</InlineCode> defaults to <InlineCode>false</InlineCode> and{' '}
                  <InlineCode>dirty</InlineCode> to <InlineCode>false</InlineCode>. The dialog takes no other prop: it
                  floats above the page, so the shared props of a layout do not apply to it.
                </React.Fragment>
              )}
            />
          </SubSection>

          <SubSection title={'DialogLabels'} id={'api-dialog-labels'}>
            <PropsTable props={dialogLabelsProps} />
          </SubSection>

          <SubSection title={'DialogDiscard'} id={'api-dialog-discard'}>
            <DocTable
              head={[ 'Prop', 'Type', 'What it is' ]}
              rows={[
                [ <InlineCode key={'p'}>title</InlineCode>, 'React.ReactNode', 'The question of the prompt: “Discard the changes?”' ],
                [ <InlineCode key={'p'}>description</InlineCode>, 'React.ReactNode', 'What is lost.' ],
                [ <InlineCode key={'p'}>action</InlineCode>, 'React.ReactNode', 'The label of the action that discards.' ],
                [ <InlineCode key={'p'}>cancel</InlineCode>, 'React.ReactNode', 'The label of the safe exit, which has the focus: “Keep editing”.' ],
                [ <InlineCode key={'p'}>icon</InlineCode>, 'React.ReactNode', 'The icon in the warning box, normally a triangle.' ]
              ]}
            />
          </SubSection>

          <SubSection title={'DialogSection'} id={'api-dialog-section'}>
            <PropsTable props={sectionProps} />
          </SubSection>

          <SubSection title={'Parts'} id={'api-dialog-parts'}>
            <DocTable
              head={[ 'Part', 'Props' ]}
              rows={[
                [ <InlineCode key={'p'}>Dialog.Submit</InlineCode>, 'Every prop of Button. It is always a submit, of the form of the dialog unless you pass form.' ],
                [ <InlineCode key={'p'}>Dialog.Cancel</InlineCode>, 'Every prop of Button, solid secondary by default. It goes through the gate of the dialog after your onClick.' ],
                [ <InlineCode key={'p'}>Dialog.Section</InlineCode>, 'id, the target of an item of sections; title, a heading of level 3; children.' ]
              ]}
            />
            <CodeBlock
              snippet={tsx`
                <Dialog.Section id={'billing'} title={'Billing'}>
                  <Field>…</Field>
                </Dialog.Section>
              `}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Tie open to the address when it can be shared'}>
              The dialog is controlled for that reason: a form a colleague can open from a link is a parameter of the URL.
            </Guidance>
            <Guidance kind={'dont'} title={'Open a dialog from a dialog as a sibling'}>
              Render the second one inside the first, or it covers it exactly and the way back is lost.
            </Guidance>
            <Guidance kind={'do'} title={'Pass dirty and discard on every form'}>
              A click outside, Esc or the x on a changed form is the most common way work gets lost.
            </Guidance>
            <Guidance kind={'dont'} title={'Use a dialog to warn'}>
              The icon box takes primary or muted only. A question before losing something is an AlertDialog.
            </Guidance>
            <Guidance kind={'do'} title={'Cancel the request on onSubmitTimeout'}>
              The dialog has already told the user the save may not have happened: the request must not land later.
            </Guidance>
            <Guidance kind={'dont'} title={'Put a list of records in the body to browse'}>
              A dialog is for one task. A list to browse belongs on a page; a choice from a list is a selector with a
              toolbar search.
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

export const Route = createFileRoute('/overlays/dialog')({
  component: DialogPage
});
