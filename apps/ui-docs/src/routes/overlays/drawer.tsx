import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import drawerLabelsProps from 'virtual:ui-props/DrawerLabels';
import drawerProps from 'virtual:ui-props/DrawerProps';
import { Callout } from '@/docs/Callout';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/overlays/drawer/basic.tsx?example';
import create from '@/examples/overlays/drawer/create.tsx?example';
import edit from '@/examples/overlays/drawer/edit.tsx?example';
import navigation from '@/examples/overlays/drawer/navigation.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/overlays/drawer');


/* --------
 * Page
 * -------- */

function DrawerPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The panel on the right for an item of a list: its detail, its edit in the same panel, the creation of a new
            one when it has many fields. It moves from one item to the next without closing, and it shares the anatomy,
            the gate and the waiting machinery of Dialog.
          </React.Fragment>
        )}
        imports={tsx`
          import { Drawer } from '@proedis/ui/overlays/drawer';
          import type { DrawerBusy, DrawerLabels, DrawerSection, DrawerSize } from '@proedis/ui/overlays/drawer';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Anatomy'}
          lead={(
            <React.Fragment>
              A modal panel the full height of the window, 8px from its edges and rounded on every corner, over a veil.
              The header, toolbar, body and footer of a Dialog, with no lines. On a phone it takes the whole width; from{' '}
              <InlineCode>sm</InlineCode> it keeps 56px of the page visible on its left, so the list it came from is
              still in sight.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              The drawer is controlled only, and the caller normally ties it to the address of the list: the id of the
              item in the URL opens it, and going back to the list closes it. It runs on Base UI’s{' '}
              <InlineCode>Dialog</InlineCode>, not its <InlineCode>Drawer</InlineCode>, which drags by default, even with
              a mouse. The widths are the Dialog’s, <InlineCode>sm</InlineCode> 400px, <InlineCode>md</InlineCode> 560px
              (the default) and <InlineCode>lg</InlineCode> 800px, and stay the same between the detail and its edit.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Detail'}
          lead={(
            <React.Fragment>
              <InlineCode>mode</InlineCode> defaults to <InlineCode>detail</InlineCode>: something to read. The body takes
              the focus, so the arrows scroll it, and a click on the veil closes the drawer. The title carries the
              identifier the list shows in its first column, and the description the state and context the body does not
              repeat.
            </React.Fragment>
          )}
        />

        <Section
          title={'Moving between items'}
          lead={(
            <React.Fragment>
              <InlineCode>onPrevious</InlineCode> and <InlineCode>onNext</InlineCode> put two arrows in the header, and{' '}
              <InlineCode>position</InlineCode> the “2 of 5” beside them, written by the caller. Alt ↑ and Alt ↓ do the
              same from anywhere in the panel. An arrow without its handler is shown off, so the pair never jumps; with
              neither handler there are no arrows. The new title is announced, since the panel itself does not move.
            </React.Fragment>
          )}
        >
          <Example of={navigation} />
          <Callout>
            With the arrows, <InlineCode>labels.previous</InlineCode> and <InlineCode>labels.next</InlineCode> are
            required by the type: they are the names and the tooltips of two icon buttons.
          </Callout>
        </Section>

        <Section
          title={'Editing in place'}
          lead={(
            <React.Fragment>
              The detail turns into its form in the same panel: <InlineCode>{'mode={\'form\'}'}</InlineCode>, the same
              size, the same title and description. With <InlineCode>onBack</InlineCode>, Cancel and Esc go back to the
              detail rather than closing, through the discard prompt when <InlineCode>dirty</InlineCode>; the x always
              closes the whole drawer. Into the form the focus goes to the first field, and back in the detail to its
              main action, the “Edit” that started it.
            </React.Fragment>
          )}
        >
          <Example of={edit} />
        </Section>

        <Section
          title={'Creating'}
          lead={(
            <React.Fragment>
              A creation is a form with no detail behind it: no <InlineCode>onBack</InlineCode>, so Cancel closes. It is
              the place for a long one, with an <InlineCode>lg</InlineCode> width and{' '}
              <InlineCode>sections</InlineCode> from three to five, exactly as in a Dialog, and “Create another” at the
              left of the footer.
            </React.Fragment>
          )}
        >
          <Example of={create} />
          <Prose>
            <p>
              On a form the veil only jolts the panel to the left, and so does a detail with unsaved changes or a save
              in progress. Everything else about waiting, errors and the 15 second limit is the Dialog’s:{' '}
              <InlineCode>busy</InlineCode>, <InlineCode>error</InlineCode>, <InlineCode>onSubmitTimeout</InlineCode>{' '}
              and the <InlineCode>timeout</InlineCode> label behave the same way, and the Dialog page shows each of them.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Toasts beside it'}
          lead={(
            <React.Fragment>
              While it is open the drawer writes the room it takes on the right of the window as{' '}
              <InlineCode>--drawer-inset</InlineCode> on the document, and removes it when it closes. The notifications
              read it, so a confirmation of the save shows on the left of the panel rather than under it.
            </React.Fragment>
          )}
        />

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The panel is a modal dialog named by its title and described by its description; the page behind is inert
              and the focus is kept inside. A status region, always mounted, says the new title when the item or the
              mode changes, so moving with the arrows is heard as well as seen. The arrows and the x are icon buttons,
              each with the name of its label as its tooltip.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Alt ArrowUp</InlineCode>, 'In a detail with onPrevious, moves to the previous item.' ],
              [ <InlineCode key={'k'}>Alt ArrowDown</InlineCode>, 'In a detail with onNext, moves to the next item.' ],
              [ <InlineCode key={'k'}>Escape</InlineCode>, 'In a detail, closes. In a form with onBack, goes back to the detail. Asks first when dirty, does nothing while saving.' ],
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves through the controls of the drawer, and stays inside it.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'In a field, submits the form through Drawer.Submit.' ]
            ]}
          />
        </Section>

        <Section
          title={'Slots and data attributes'}
          lead={(
            <React.Fragment>
              The parts of a Dialog with the <InlineCode>drawer-</InlineCode> prefix, plus the three of the navigation.
            </React.Fragment>
          )}
        >
          <SlotsTable
            rows={[
              { slot: 'drawer', part: 'The panel', attributes: [ 'data-size', 'data-mode', 'data-open' ] },
              { slot: 'drawer-backdrop', part: 'The veil behind it' },
              { slot: 'drawer-viewport', part: 'The fixed layer that places the panel' },
              { slot: 'drawer-header', part: 'The header' },
              { slot: 'drawer-icon', part: 'The icon box', attributes: [ 'data-tone' ] },
              { slot: 'drawer-heading', part: 'The title and the description' },
              { slot: 'drawer-title', part: 'The title' },
              { slot: 'drawer-description', part: 'The description' },
              { slot: 'drawer-header-end', part: 'The navigation and the x' },
              { slot: 'drawer-position', part: 'The “2 of 5”' },
              { slot: 'drawer-previous', part: 'The arrow to the previous item', attributes: [ 'data-disabled' ] },
              { slot: 'drawer-next', part: 'The arrow to the next item', attributes: [ 'data-disabled' ] },
              { slot: 'drawer-close', part: 'The x' },
              { slot: 'drawer-content', part: 'The index and the body', attributes: [ 'aria-busy' ] },
              { slot: 'drawer-index', part: 'The index of the sections' },
              { slot: 'drawer-index-item', part: 'An item of the index', attributes: [ 'aria-current', 'data-errors' ] },
              { slot: 'drawer-scroll', part: 'The frame of the body and its shades' },
              { slot: 'drawer-shade', part: 'A scroll shade', attributes: [ 'data-edge', 'data-visible' ] },
              { slot: 'drawer-body', part: 'The body that scrolls' },
              { slot: 'drawer-body-content', part: 'The error and the content of the body' },
              { slot: 'overlay-section', part: 'A Drawer.Section', attributes: [ 'data-overlay-section' ] },
              { slot: 'drawer-footer', part: 'The footer' },
              { slot: 'drawer-footer-start', part: 'The left end of the footer' },
              { slot: 'drawer-footer-actions', part: 'The actions on the right' },
              { slot: 'drawer-veil', part: 'The waiting veil over the panel' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <SubSection title={'Drawer'} id={'api-drawer'}>
            <PropsTable
              props={drawerProps}
              rest={(
                <React.Fragment>
                  <InlineCode>busy</InlineCode> and <InlineCode>dirty</InlineCode> default to{' '}
                  <InlineCode>false</InlineCode>. <InlineCode>discard</InlineCode> is a{' '}
                  <InlineCode>DialogDiscard</InlineCode>, imported from <InlineCode>@proedis/ui/overlays/dialog</InlineCode>,
                  and <InlineCode>sections</InlineCode> takes the same items as the Dialog’s.
                </React.Fragment>
              )}
            />
          </SubSection>

          <SubSection title={'DrawerLabels'} id={'api-drawer-labels'}>
            <PropsTable props={drawerLabelsProps} />
          </SubSection>

          <SubSection title={'Parts'} id={'api-drawer-parts'}>
            <DocTable
              head={[ 'Part', 'Props' ]}
              rows={[
                [ <InlineCode key={'p'}>Drawer.Submit</InlineCode>, 'Every prop of Button. It is always a submit, of the form of the drawer.' ],
                [ <InlineCode key={'p'}>Drawer.Cancel</InlineCode>, 'Every prop of Button, solid secondary by default. Back to the detail with onBack, otherwise closes; through the discard prompt when dirty.' ],
                [ <InlineCode key={'p'}>Drawer.Section</InlineCode>, 'id, title and children, as Dialog.Section.' ]
              ]}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Edit in the drawer the detail is in'}>
              Same panel, same width, same title: the user never loses the item they were looking at.
            </Guidance>
            <Guidance kind={'dont'} title={'Open a drawer from a drawer'}>
              A second panel on the right hides the first. Move inside it, with the arrows or a mode, or open a Dialog
              from it.
            </Guidance>
            <Guidance kind={'do'} title={'Write position yourself'}>
              Only the list knows the filtered count. “2 of 5” is the caller’s text, in its language.
            </Guidance>
            <Guidance kind={'dont'} title={'Use tabs and sections together'}>
              The index of the sections is the navigation of a long form; tabs in the body would be a second one.
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

export const Route = createFileRoute('/overlays/drawer')({
  component: DrawerPage
});
