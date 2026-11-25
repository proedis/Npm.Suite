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
import { SlotsInspector } from '@/docs/SlotsInspector';
import { PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/password-input/basic.tsx?example';
import newPassword from '@/examples/forms/password-input/new-password.tsx?example';
import rules from '@/examples/forms/password-input/rules.tsx?example';
import signIn from '@/examples/forms/password-input/sign-in.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/forms/password-input');

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
            A <Link to={'/ui/forms/text-input'} className={LINK}>TextInput</Link> for a password, with an action at its
            end that shows and hides the value. Everything else, the sizes, the states, the field around it, is the
            TextInput’s.
          </React.Fragment>
        )}
        imports={tsx`
          import { checkPassword, PasswordInput, passwordRules } from '@proedis/ui/forms/password-input';
          import type { PasswordInputLabels, PasswordRule, PasswordStrength } from '@proedis/ui/forms/password-input';
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
          title={'Rules and strength'}
          lead={(
            <React.Fragment>
              <InlineCode>rules</InlineCode> opens a checklist under the field when it takes the focus, ticks each rule as
              it is met, and stays open after the field while a rule still fails, so the reason of the error stays in
              sight; with an error on the field the missing rules turn to the destructive tone.{' '}
              <InlineCode>strength</InlineCode> draws a meter of as many segments as levels, from the destructive tone to
              the success one, with the word of the level beside it.
            </React.Fragment>
          )}
        >
          <Example of={rules} />
          <Prose>
            <p>
              Every text is yours. A rule carries its own label (<InlineCode>passwordRules.minLength(12, t(…))</InlineCode>
              {' '}and its siblings <InlineCode>uppercase</InlineCode>, <InlineCode>lowercase</InlineCode>,{' '}
              <InlineCode>digit</InlineCode>, <InlineCode>symbol</InlineCode>, <InlineCode>maxLength</InlineCode>,{' '}
              <InlineCode>notEqual</InlineCode>, or an object <InlineCode>{'{ id, label, test }'}</InlineCode> of your
              own); the levels of the meter are its words; <InlineCode>labels.met</InlineCode> and{' '}
              <InlineCode>labels.unmet</InlineCode>, required by the type as soon as there are rules, are what a screen
              reader says before each line. The meter scores the share of the rules that pass; give{' '}
              <InlineCode>strength.score</InlineCode> for an estimator of your own.
            </p>
          </Prose>
          <CodeBlock
            title={'schema.ts'}
            snippet={tsx`
              // The same rules validate the form: the checklist and the error cannot disagree
              const password = z.string().refine((value) => checkPassword(value, RULES).ok, { message: t('password.weak') });
            `}
          />
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
          <SlotsInspector of={basic}
            rows={[
              { slot: 'text-input', part: 'The frame', attributes: [ 'data-size', 'data-invalid', 'data-readonly', 'data-disabled' ] },
              { slot: 'text-input-control', part: 'The input, of type password or text' },
              { slot: 'text-input-trailing', part: 'Where the action sits' },
              { slot: 'text-input-action', part: 'The show and hide button' }
            ]}
          />
          <Prose>
            <p>
              With rules or a meter, the field sits in a column with them, and every part below has a slot.
            </p>
          </Prose>
          <SlotsInspector of={rules}
            rows={[
              { slot: 'password-input', part: 'The column of the field, the meter and the checklist' },
              { slot: 'password-input-meter', part: 'The meter and its word', attributes: [ 'data-level', 'data-tone' ] },
              { slot: 'password-input-meter-step', part: 'A segment', attributes: [ 'data-filled' ] },
              { slot: 'password-input-meter-label', part: 'The word of the level' },
              { slot: 'password-input-checklist', part: 'The checklist, which opens', attributes: [ 'data-open' ] },
              { slot: 'password-input-rule', part: 'A rule', attributes: [ 'data-rule', 'data-met' ] }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={OWN_PROPS}
            rest={(
              <React.Fragment>
                Every prop of <Link to={'/ui/forms/text-input'} className={LINK}>TextInput</Link> but{' '}
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

export const Route = createFileRoute('/ui/forms/password-input')({
  component: PasswordInputPage
});
