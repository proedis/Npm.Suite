import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import passwordInputProps from 'virtual:ui-props/PasswordInputProps';
import themeDoc from 'virtual:ui-theme/forms/password-input';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { PropsTable, SlotsTable } from '@/docs/Tables';
import basic from '@/examples/forms/password-input/basic.tsx?example';
import newPassword from '@/examples/forms/password-input/new-password.tsx?example';
import signIn from '@/examples/forms/password-input/sign-in.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/password-input');

const LINK = 'font-medium text-primary hover:underline';

/** Its own props: the ones of TextInput are described there */
const OWN_PROPS = passwordInputProps.filter((prop) => prop.from !== 'StrictTextInputProps');


/* --------
 * Page
 * -------- */

function PasswordInputPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            A <Link to={'/forms/text-input'} className={LINK}>TextInput</Link> for a password, with an action at its
            end that shows and hides the value. Everything else, the sizes, the states, the field around it, is the
            TextInput’s.
          </React.Fragment>
        )}
        imports={tsx`
          import { PasswordInput } from '@proedis/ui/forms/password-input';
          import type { PasswordInputLabels, PasswordInputProps } from '@proedis/ui/forms/password-input';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'Show and hide'}
          lead={(
            <React.Fragment>
              The name of the action and its icon change together, so the button always says what it will do next:
              “Show the password”, then “Hide the password”. The two texts come in <InlineCode>labels</InlineCode>,
              required: the package writes no text.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              There is no <InlineCode>aria-pressed</InlineCode> on top: with a name that changes, a pressed state would
              say the same thing twice. The action is not rendered while the field is read only or disabled.
            </p>
          </Prose>
        </Section>

        <Section
          title={'autoComplete'}
          lead={(
            <React.Fragment>
              Required, and only the two values that mean something for a password:{' '}
              <InlineCode>current-password</InlineCode> where someone signs in, <InlineCode>new-password</InlineCode>{' '}
              where they choose one. The first lets the password manager fill it, the second lets it suggest a strong
              one and save it. Anything else does not compile.
            </React.Fragment>
          )}
        >
          <CodeBlock
            snippet={tsx`
              // @ts-expect-error: autoComplete is required
              <PasswordInput labels={labels} />

              // @ts-expect-error: 'off' means nothing a password manager would honour
              <PasswordInput labels={labels} autoComplete={'off'} />

              <PasswordInput labels={labels} autoComplete={'new-password'} />
            `}
          />
        </Section>

        <Section
          title={'Choosing a password'}
          lead={(
            <React.Fragment>
              A new password with its rule in the description, a counter that turns red below the minimum, and a second
              field to repeat it. The counter is hidden from assistive technology, the error is not.
            </React.Fragment>
          )}
        >
          <Example of={newPassword} />
        </Section>

        <Section
          title={'In context'}
          lead={'A sign in: the large size, a block button, and the password manager doing its part.'}
        >
          <Example of={signIn} />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <Prose>
            <p>
              The slots of a TextInput, since it is one. The show and hide button is the{' '}
              <InlineCode>text-input-action</InlineCode>.
            </p>
          </Prose>
          <SlotsTable
            rows={[
              { slot: 'text-input', part: 'The frame', attributes: [ 'data-size', 'data-invalid', 'data-readonly', 'data-disabled' ] },
              { slot: 'text-input-control', part: 'The input, of type password or text' },
              { slot: 'text-input-trailing', part: 'Where the action sits' },
              { slot: 'text-input-action', part: 'The show and hide button' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={OWN_PROPS}
            rest={(
              <React.Fragment>
                Every prop of <Link to={'/forms/text-input'} className={LINK}>TextInput</Link> but{' '}
                <InlineCode>type</InlineCode> and <InlineCode>trailing</InlineCode>, which the action owns.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'State the rule before it is broken'}>
              The minimum length, the characters asked for: in the description, read before typing.
            </Guidance>
            <Guidance kind={'dont'} title={'Switch the password manager off'}>
              The type allows only <InlineCode>current-password</InlineCode> and <InlineCode>new-password</InlineCode>:
              the manager fills the first and proposes the second, and both are what keeps a password strong.
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

export const Route = createFileRoute('/forms/password-input')({
  component: PasswordInputPage
});
