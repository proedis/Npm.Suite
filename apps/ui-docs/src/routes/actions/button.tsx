import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import buttonProps from 'virtual:ui-props/ButtonProps';
import iconButtonProps from 'virtual:ui-props/IconButtonProps';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { css, tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/actions/button/basic.tsx?example';
import block from '@/examples/actions/button/block.tsx?example';
import custom from '@/examples/actions/button/custom.tsx?example';
import disabled from '@/examples/actions/button/disabled.tsx?example';
import fills from '@/examples/actions/button/fills.tsx?example';
import iconButtonStates from '@/examples/actions/button/icon-button-states.tsx?example';
import iconButtonVariants from '@/examples/actions/button/icon-button-variants.tsx?example';
import iconButton from '@/examples/actions/button/icon-button.tsx?example';
import icons from '@/examples/actions/button/icons.tsx?example';
import inContext from '@/examples/actions/button/in-context.tsx?example';
import link from '@/examples/actions/button/link.tsx?example';
import loading from '@/examples/actions/button/loading.tsx?example';
import menuTrigger from '@/examples/actions/button/menu-trigger.tsx?example';
import sizes from '@/examples/actions/button/sizes.tsx?example';
import tones from '@/examples/actions/button/tones.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/actions/button');

/** IconButton's own props: the ones it inherits from Button are described there, with other defaults */
const ICON_BUTTON_OWN = iconButtonProps.filter((prop) => prop.from !== 'StrictButtonProps');


/* --------
 * Page
 * -------- */

function ButtonPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The button of every Proedis interface: three fills for the weight of an action, seven tones for its
            meaning, three sizes. And <InlineCode>IconButton</InlineCode>, the same button with an icon for a label
            and the tooltip it can never go without.
          </React.Fragment>
        )}
        imports={tsx`
          import { Button, IconButton } from '@proedis/ui/actions/button';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Fills'}
          lead={(
            <React.Fragment>
              The fill says how much the action weighs. <InlineCode>solid</InlineCode> is the action you want taken,
              {' '}<InlineCode>soft</InlineCode> the one beside it, <InlineCode>plain</InlineCode> the quiet one: a
              cancel, an action in a row, a link that looks like a button. One solid button per group is the rule
              that keeps a screen readable.
            </React.Fragment>
          )}
        >
          <Example of={fills} />
        </Section>

        <Section
          title={'Tones'}
          lead={(
            <React.Fragment>
              The tone says what the action means, and the names are the tokens of the theme, so a{' '}
              <InlineCode>success</InlineCode> button and a <InlineCode>success</InlineCode> badge on the same screen
              are the same green. Every fill takes every tone: the colour of each pair comes from one table that
              Badge and IconBox read too.
            </React.Fragment>
          )}
        >
          <Example of={tones} />
          <Callout>
            <InlineCode>primary</InlineCode> is the default and the right choice almost always.{' '}
            <InlineCode>destructive</InlineCode> is for an action that loses something, and that action asks for a
            confirmation anyway: the red tells the user to read, the dialog makes sure they did.
          </Callout>
        </Section>

        <Section
          title={'Sizes'}
          lead={(
            <React.Fragment>
              <InlineCode>sm</InlineCode> in a table row or a filter bar, <InlineCode>md</InlineCode> in forms and
              toolbars, <InlineCode>lg</InlineCode> where the button is the point of the screen: a sign in, an empty
              state. The heights come from the <InlineCode>--spacing-control-*</InlineCode> tokens, which grow one step
              on a touch screen, so a button is easy to hit with a finger without anyone asking for it.
            </React.Fragment>
          )}
        >
          <Example of={sizes} />
        </Section>

        <Section
          title={'With icons'}
          lead={(
            <React.Fragment>
              <InlineCode>leading</InlineCode> and <InlineCode>trailing</InlineCode> take a node: the package imports no
              icon library, so any one works. The button sizes the icon to its own size and tightens its padding on
              that side, so an icon never needs a class.
            </React.Fragment>
          )}
        >
          <Example of={icons} />
        </Section>

        <Section
          title={'Loading'}
          lead={(
            <React.Fragment>
              A loading button keeps its focus and its width, cannot be pressed a second time, and shows a spinner in
              place of its content. Press the first one.
            </React.Fragment>
          )}
        >
          <Example of={loading} />
          <Prose>
            <p>
              <InlineCode>loadingLabel</InlineCode> is required with <InlineCode>loading</InlineCode>, by the type: the
              spinner is a polite live region that says it, while the button is marked{' '}
              <InlineCode>aria-busy</InlineCode>. A button that turns into a spinner and says nothing is a button a
              screen reader user watches stop working.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Disabled'}
          lead={(
            <React.Fragment>
              A plain <InlineCode>disabled</InlineCode> button leaves the tab order, which is right when the reason is
              obvious from the screen. When it is not, keep it focusable with{' '}
              <InlineCode>focusableWhenDisabled</InlineCode> and say why in a tooltip: the button is then announced as{' '}
              <InlineCode>aria-disabled</InlineCode>, can be reached with the keyboard, and still does nothing when
              pressed.
            </React.Fragment>
          )}
        >
          <Example of={disabled} />
        </Section>

        <Section
          title={'As a link'}
          lead={(
            <React.Fragment>
              Navigation is a link, not a click handler. Give the button a <InlineCode>to</InlineCode> and it renders a
              real <InlineCode>{'<a href>'}</InlineCode>: the middle click, a new tab and the status bar keep working,
              and a plain click calls <InlineCode>go()</InlineCode> instead of loading the page again.
            </React.Fragment>
          )}
        >
          <Example of={link} />
          <Prose>
            <p>
              <InlineCode>LinkTarget</InlineCode> is a structural type, <InlineCode>{'{ href, go }'}</InlineCode>, so the
              package knows no router: whatever the application navigates with, it hands over an address and a
              function. Disabled or loading, the anchor loses its <InlineCode>href</InlineCode>, is announced as a
              disabled link, and neither your <InlineCode>onClick</InlineCode> nor <InlineCode>go()</InlineCode> runs.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Full width'}
          lead={(
            <React.Fragment>
              <InlineCode>block</InlineCode> takes the whole width of the container, and it takes one value per
              breakpoint too: the second button is full width on a phone and back to its own width from{' '}
              <InlineCode>sm</InlineCode>. Narrow the window to see it.
            </React.Fragment>
          )}
        >
          <Example of={block} />
        </Section>

        <Section
          title={'Opening a menu'}
          lead={(
            <React.Fragment>
              A button can be the trigger of a menu or a popover. It stays pressed while what it opened is open, from
              the <InlineCode>data-popup-open</InlineCode> attribute the menu writes on it, and a trailing chevron says
              that it opens something rather than doing something.
            </React.Fragment>
          )}
        >
          <Example of={menuTrigger} />
        </Section>

        <Section
          title={'IconButton'}
          lead={(
            <React.Fragment>
              An icon with no text keeps a toolbar light, and the price of that is a tooltip on every one. IconButton
              takes a single <InlineCode>label</InlineCode> that is both its accessible name and the text of its
              tooltip, so the two cannot disagree and neither can be forgotten. It is quiet by default,{' '}
              <InlineCode>plain</InlineCode> and <InlineCode>muted</InlineCode>, the register of a toolbar or a row.
            </React.Fragment>
          )}
        >
          <Example of={iconButton} />

          <SubSection
            title={'Fills, tones and sizes'}
            lead={'The same three fills, seven tones and three sizes as Button, square at the height of the size.'}
          >
            <Example of={iconButtonVariants} />
          </SubSection>

          <SubSection
            title={'Disabled and loading'}
            lead={(
              <React.Fragment>
                Disabled, an IconButton stays focusable by default, so its tooltip still says what it is, and{' '}
                <InlineCode>description</InlineCode> adds a second line saying why it is off. Loading, the spinner takes
                the place of the icon and the tooltip stays. Hover them, or reach them with Tab.
              </React.Fragment>
            )}
          >
            <Example of={iconButtonStates} />
          </SubSection>
        </Section>

        <Section
          title={'In context'}
          lead={(
            <React.Fragment>
              A card with its actions: the quiet ones in the header as icon buttons, the less used ones behind a menu,
              and a footer with one solid button, the action the card is for. The destructive action is plain and
              apart, at the other end of the footer.
            </React.Fragment>
          )}
        >
          <Example of={inContext} />
        </Section>

        <Section
          title={'Customizing'}
          lead={(
            <React.Fragment>
              <InlineCode>className</InlineCode> goes last and wins: the conflicts are resolved by{' '}
              <InlineCode>tailwind-merge</InlineCode>, so <InlineCode>rounded-full</InlineCode> replaces the radius of
              the button rather than fighting it.
            </React.Fragment>
          )}
        >
          <Example of={custom} />

          <SubSection
            title={'Styling every button of a product'}
            lead={(
              <React.Fragment>
                Changing one call site is a <InlineCode>className</InlineCode>. Changing every button of a product is a
                stylesheet: each button reports what it is on <InlineCode>data-*</InlineCode> attributes, and the
                package writes its own classes inside <InlineCode>@layer utilities</InlineCode>, so a plain rule of
                yours wins with no <InlineCode>!important</InlineCode>.
              </React.Fragment>
            )}
          >
            <CodeBlock
              title={'app.css'}
              snippet={css`
                /* Every large button of the product, round */
                [data-slot='button'][data-size='lg'] {
                  border-radius: 9999px;
                }

                /* The soft buttons, a touch heavier */
                [data-slot='button'][data-fill='soft'] {
                  font-weight: 600;
                }
              `}
            />
          </SubSection>
        </Section>

        <Section
          title={'Type safety'}
          lead={'The mistakes that would leave someone without a name for a control do not compile.'}
        >
          <CodeBlock
            snippet={tsx`
              // A spinner that says nothing
              // @ts-expect-error: loadingLabel is required with loading
              <Button loading>Save</Button>

              // An icon with no name and no tooltip
              // @ts-expect-error: label is required
              <IconButton icon={<Trash2 />} />

              // Both are fine
              <Button loading loadingLabel={'Saving'}>Save</Button>
              <IconButton label={'Delete'} icon={<Trash2 />} />
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The button is Base UI’s <InlineCode>Button</InlineCode> on a native <InlineCode>{'<button>'}</InlineCode>,
              so it is announced, focused and pressed the way a button is. <InlineCode>type</InlineCode> defaults to{' '}
              <InlineCode>button</InlineCode>: a submit is said out loud, <InlineCode>{'type={\'submit\'}'}</InlineCode>,
              never inherited by accident from a form around it.
            </p>
            <p>
              The focus ring shows for the keyboard only and follows the tone, a 2px outline 2px away with a halo
              around it. On <InlineCode>warning</InlineCode> it takes the darker ink of the tone, since amber on white
              does not reach the contrast a focus indicator needs.
            </p>
          </Prose>

          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'Moves the focus to the button, a disabled one included when it is focusable while disabled.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Presses the button, or follows the link of a button with a to.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Presses the button.' ]
            ]}
          />
        </Section>

        <Section
          title={'Slots and data attributes'}
          lead={'Every part a stylesheet can reach, and what each one reports.'}
        >
          <SlotsTable
            rows={[
              { slot: 'button', part: 'The button, or the anchor of a button with a to', attributes: [ 'data-fill', 'data-tone', 'data-size', 'data-block', 'data-loading', 'data-disabled', 'data-popup-open', 'data-icon-only' ] },
              { slot: 'button-content', part: 'The icons and the label, on one line' },
              { slot: 'button-leading', part: 'The icon before the label' },
              { slot: 'button-trailing', part: 'The icon after the label' },
              { slot: 'button-spinner', part: 'The spinner over the content, while loading' }
            ]}
          />
          <Prose>
            <p>
              <InlineCode>data-block</InlineCode> reports the value at the narrowest width when{' '}
              <InlineCode>block</InlineCode> changes per breakpoint, and <InlineCode>data-icon-only</InlineCode> is
              written by IconButton. A component built on Button can name its own part with a{' '}
              <InlineCode>data-slot</InlineCode> of its own, as the action of a text field does, and keeps every
              other attribute.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <SubSection title={'Button'} id={'api-button'}>
            <PropsTable
              props={buttonProps}
              rest={(
                <React.Fragment>
                  Every other prop goes to Base UI’s <InlineCode>Button</InlineCode>, with the attributes of a{' '}
                  <InlineCode>{'<button>'}</InlineCode>: <InlineCode>type</InlineCode>,{' '}
                  <InlineCode>disabled</InlineCode>, <InlineCode>focusableWhenDisabled</InlineCode>,{' '}
                  <InlineCode>render</InlineCode>, <InlineCode>onClick</InlineCode>, <InlineCode>ref</InlineCode>.
                </React.Fragment>
              )}
            />
          </SubSection>

          <SubSection title={'IconButton'} id={'api-icon-button'}>
            <PropsTable
              props={ICON_BUTTON_OWN}
              rest={(
                <React.Fragment>
                  It takes every prop of Button except <InlineCode>children</InlineCode>,{' '}
                  <InlineCode>leading</InlineCode>, <InlineCode>trailing</InlineCode>, <InlineCode>block</InlineCode>{' '}
                  and <InlineCode>aria-label</InlineCode>, with three defaults of its own:{' '}
                  <InlineCode>{'fill={\'plain\'}'}</InlineCode>, <InlineCode>{'tone={\'muted\'}'}</InlineCode> and{' '}
                  <InlineCode>focusableWhenDisabled</InlineCode>.
                </React.Fragment>
              )}
            />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'One solid button per group'}>
              The solid button is the answer to “what is this screen for”. Two of them side by side ask the user to
              choose before they have read anything.
            </Guidance>
            <Guidance kind={'dont'} title={'A Button with only an icon in it'}>
              It has no name and no tooltip. IconButton exists for that, and requires both.
            </Guidance>
            <Guidance kind={'do'} title={'Use to for navigation'}>
              A real link keeps the middle click, a new tab and the address in the status bar. A click handler that
              navigates throws all three away.
            </Guidance>
            <Guidance kind={'dont'} title={'Disable without saying why'}>
              When the reason is not on the screen, keep the button focusable and put the reason in its tooltip.
            </Guidance>
            <Guidance kind={'do'} title={'Keep the label, show the spinner'}>
              Pass loading and keep the label as it is: the width stays, nothing jumps, and loadingLabel says what is
              happening.
            </Guidance>
            <Guidance kind={'dont'} title={'Paint a destructive action solid red in a row'}>
              A row of red buttons is noise. In a list the destructive action is plain or behind a menu, and it always
              opens a confirmation.
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

export const Route = createFileRoute('/actions/button')({
  component: ButtonPage
});
