import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import numberInputProps from 'virtual:ui-props/NumberInputProps';
import themeDoc from 'virtual:ui-theme/forms/number-input';
import { Callout } from '@/docs/Callout';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { refineProps } from '@/docs/refineProps';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/number-input/basic.tsx?example';
import locales from '@/examples/forms/number-input/locales.tsx?example';
import range from '@/examples/forms/number-input/range.tsx?example';
import states from '@/examples/forms/number-input/states.tsx?example';
import widths from '@/examples/forms/number-input/widths.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/forms/number-input');

/** The defaults are written as plain words in the JSDoc, and `null` is part of the value's type */
const PROPS = refineProps(numberInputProps, {
  value       : { type: 'number | null' },
  defaultValue: { type: 'number | null', description: 'The starting value, when the field owns it.' },
  onValueChange: { description: 'Every committed change: the number, or `null` when the field is emptied.' },
  readOnly    : { description: 'The value stays reachable and selectable, and cannot change.' },
  disabled    : { description: 'Inside a disabled `Field` it is on already.' }
});


/* --------
 * Page
 * -------- */

function NumberInputPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The field for a quantity, a weight, an amount: a text field with the value on the right, next to its unit.
            No buttons: the value is typed, or moved with the arrow keys. On Base UI’s{' '}
            <InlineCode>NumberField</InlineCode>, with the rules a management application needs where Base UI is
            lenient on purpose.
          </React.Fragment>
        )}
        imports={tsx`
          import { NumberInput } from '@proedis/ui/forms/number-input';
          import type { NumberInputProps } from '@proedis/ui/forms/number-input';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'The value'}
          lead={(
            <React.Fragment>
              A number, or <InlineCode>null</InlineCode> for empty: empty is not zero, and a form must be able to tell a
              weight of nothing from a weight not written yet. <InlineCode>onValueChange</InlineCode> receives either.
            </React.Fragment>
          )}
        />

        <Section
          title={'Locale and format'}
          lead={(
            <React.Fragment>
              <InlineCode>locale</InlineCode> decides the separators, read from <InlineCode>Intl</InlineCode> rather than
              assumed, and should be the one the value is read with everywhere else. The format arrives on leaving the
              field or with Enter, never while typing, and it groups always: a four digit number too.
            </React.Fragment>
          )}
        >
          <Example of={locales} />
        </Section>

        <Section
          title={'What enters'}
          lead={'The field refuses, as they are typed, the characters that would not make a number.'}
        >
          <DocTable
            head={[ 'Typed or pasted', 'What happens' ]}
            rows={[
              [ 'The group separator', 'Refused: the field writes it on its own.' ],
              [ 'A second decimal separator', 'Refused.' ],
              [ 'A digit past decimals', 'Refused: nothing is rounded.' ],
              [ 'A minus', 'Refused unless min is below zero.' ],
              [ 'The decimal key of the numpad', 'Writes the decimal separator of the locale, not its own character.' ],
              [ 'A paste', 'Taken whole or not at all, after dropping spaces and the unit of the field.' ]
            ]}
          />
          <Callout>
            This is the one place the field is stricter than Base UI on purpose: Base UI strips every group separator,
            so in Italian a typed <InlineCode>1.5</InlineCode> would be 15, and a pasted{' '}
            <InlineCode>1,234.56</InlineCode> would be 1.23456.
          </Callout>
        </Section>

        <Section
          title={'Range and step'}
          lead={(
            <React.Fragment>
              <InlineCode>min</InlineCode> is 0 unless said otherwise: negatives are asked for.{' '}
              <InlineCode>max</InlineCode> is absent unless given. The arrows move by <InlineCode>step</InlineCode>, and
              by ten steps with Shift. A value out of range stays as it is, in error: it is never corrected in silence.
            </React.Fragment>
          )}
        >
          <Example of={range} />
          <Prose>
            <p>
              The error is the caller’s, as for every field: the first example checks the maximum itself and shows it
              as the <InlineCode>error</InlineCode> of its Field. The field keeps the 14 rather than turning it into a 12 nobody
              typed.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Width'}
          lead={(
            <React.Fragment>
              The field is as wide as the largest number it admits, from 96 to 160px, one step wider for a unit longer
              than two characters: half a number is another number, and a field that fills its column for two digits
              says the wrong thing. Without a maximum it takes the middle step.
            </React.Fragment>
          )}
        >
          <Example of={widths} />
        </Section>

        <Section
          title={'States and sizes'}
          lead={(
            <React.Fragment>
              The same three heights as a TextInput and the same states from the field. Loading, a spinner takes the
              place of the unit, with the <InlineCode>loadingLabel</InlineCode> it requires.
            </React.Fragment>
          )}
        >
          <Example of={states} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The input asks for the numeric keyboard on a phone, the decimal one when the field has decimals. Base UI
              names the kind of control “number field” in English, through{' '}
              <InlineCode>aria-roledescription</InlineCode>: <InlineCode>roleDescription</InlineCode> gives it in the
              language of the page, and without it the attribute is removed rather than left in the wrong language.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>ArrowUp</InlineCode>, 'Adds a step. With Shift, ten.' ],
              [ <InlineCode key={'k'}>ArrowDown</InlineCode>, 'Takes a step away. With Shift, ten.' ],
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'Formats and checks the value, as leaving the field does, then the form does what it does.' ],
              [ <InlineCode key={'k'}>Home</InlineCode>, 'Moves the caret to the start, never writes the minimum.' ],
              [ <InlineCode key={'k'}>End</InlineCode>, 'Moves the caret to the end, never writes the maximum.' ]
            ]}
          />
          <Prose>
            <p>The wheel does not change the value: a page scrolled over a form must not change its weights.</p>
          </Prose>
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={states}
            rows={[
              { slot: 'number-input', part: 'The frame', attributes: [ 'data-size', 'data-loading', 'data-invalid', 'data-readonly', 'data-disabled' ] },
              { slot: 'number-input-control', part: 'The text', attributes: [ 'data-field-control' ] },
              { slot: 'number-input-suffix', part: 'The unit' },
              { slot: 'number-input-spinner', part: 'The spinner, in place of the unit' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={PROPS}
            rest={(
              <React.Fragment>
                <InlineCode>className</InlineCode>, the shared props, <InlineCode>id</InlineCode> and{' '}
                <InlineCode>name</InlineCode> go to the frame; every other prop of an{' '}
                <InlineCode>{'<input>'}</InlineCode> goes to the text: <InlineCode>placeholder</InlineCode>,{' '}
                <InlineCode>aria-*</InlineCode>, <InlineCode>onBlur</InlineCode>, <InlineCode>autoFocus</InlineCode>,{' '}
                <InlineCode>ref</InlineCode>.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A NumberInput for every number'}>
              Its value is a number or null, not a string to convert on save, and its separators follow the locale.
            </Guidance>
            <Guidance kind={'dont'} title={'A TextInput with a number in it'}>
              Nor an <InlineCode>{'<input type="number">'}</InlineCode>: neither groups, neither knows the locale, and
              the wheel changes the second one.
            </Guidance>
            <Guidance kind={'do'} title={'Give the maximum'}>
              It sets the width the field needs, and it is the first thing the description should say.
            </Guidance>
            <Guidance kind={'dont'} title={'Fix an out of range value'}>
              Keep what was typed, show the error, and let the user decide: a value changed in silence is a value
              nobody checked.
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

export const Route = createFileRoute('/ui/forms/number-input')({
  component: NumberInputPage
});
