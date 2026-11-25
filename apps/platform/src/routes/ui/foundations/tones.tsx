import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { ts } from '@/docs/snippet';
import { DocTable } from '@/docs/Tables';
import destructive from '@/examples/foundations/tones/destructive.tsx?example';
import matrix from '@/examples/foundations/tones/matrix.tsx?example';
import ownComponent from '@/examples/foundations/tones/own-component.tsx?example';
import surfaces from '@/examples/foundations/tones/surfaces.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/foundations/tones');

/** The seven tones, what each one means, and the tokens it reads */
const TONE_ROWS: readonly (readonly [ string, string, string ])[] = [
  [ 'primary', 'The voice of the application: the action you want taken, the selected thing. The default of Button. A colour of the product.', '--primary' ],
  [ 'secondary', 'A second colour of the product, for the support of its own interface. Neutral until the product gives it one.', '--secondary' ],
  [ 'muted', 'The neutral tone of the package: the quieter action, a draft, a toolbar. A grey surface with the standard ink, never a disabled look. The default of Badge and IconButton.', '--muted' ],
  [ 'success', 'Done, approved, in service.', '--success' ],
  [ 'warning', 'Needs attention, late, to be checked.', '--warning' ],
  [ 'destructive', 'Loses something, or went wrong: delete, an error, an invalid field.', '--destructive' ],
  [ 'info', 'Something to know, with no judgement attached.', '--info' ]
];

/** The three fills, with the classes each one writes */
const FILL_ROWS: readonly (readonly [ string, string, string ])[] = [
  [ 'solid', 'The tone is the surface: the strongest weight.', 'bg-{tone} text-{tone}-foreground' ],
  [ 'soft', 'A tinted surface with the tone as ink: present, not loud.', 'bg-{tone}-soft text-{tone}-soft-foreground' ],
  [ 'plain', 'No surface at all, the ink only: a quiet action, a word in a row.', 'text-{tone}-soft-foreground' ]
];


/* --------
 * Page
 * -------- */

function TonesPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Seven tones say what something means; three fills say how much it weighs. Every component that offers{' '}
            <InlineCode>tone</InlineCode> and <InlineCode>fill</InlineCode> paints them from one table in{' '}
            <InlineCode>core</InlineCode>, so a <InlineCode>success</InlineCode> button, a{' '}
            <InlineCode>success</InlineCode> badge and a <InlineCode>success</InlineCode> icon box are the same green
            at the same strength.
          </React.Fragment>
        )}
        imports={ts`
          import { TONE_CLASSES, TONES } from '@proedis/ui/core';
          import type { Tone, ToneFill } from '@proedis/ui/core';
        `}
      />

      <PageBody>
        <Example of={matrix} />

        <Section
          title={'Seven tones'}
          lead={(
            <React.Fragment>
              The names are the tokens of the theme on purpose. When a prop and the variable behind it share a name,{' '}
              <InlineCode>tone={'{\'destructive\'}'}</InlineCode> and <InlineCode>--destructive</InlineCode>, nobody
              keeps a translation table in their head: no <InlineCode>danger</InlineCode>, no{' '}
              <InlineCode>error</InlineCode>, no <InlineCode>neutral</InlineCode>.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Tone', 'What it means', 'Token' ]}
            rows={TONE_ROWS.map(([ tone, meaning, token ]) => [
              <InlineCode key={'t'}>{tone}</InlineCode>,
              meaning,
              <code key={'k'} className={'font-mono text-xs whitespace-nowrap text-foreground'}>{token}</code>
            ])}
          />
          <Callout>
            The four state colours are a convention, not a brand: red for damage, amber for attention, green for
            success, blue for information. That is why they have defaults at all, while the package ships no palette.
          </Callout>
        </Section>

        <Section
          title={'Three fills'}
          lead={(
            <React.Fragment>
              The fill is the weight. On a screen, the solid one is the answer to “what is this for”, the soft ones sit
              beside it, the plain ones stay out of the way. The soft and plain rows read the soft register of the theme,
              which falls back to a tenth of the tone when a product declares nothing.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Fill', 'What it is', 'What it writes' ]}
            rows={FILL_ROWS.map(([ fill, what, classes ]) => [
              <InlineCode key={'f'}>{fill}</InlineCode>,
              what,
              <code key={'c'} className={'font-mono text-xs whitespace-nowrap text-foreground'}>{classes}</code>
            ])}
          />
        </Section>

        <Section
          title={'Surfaces, not accents'}
          lead={(
            <React.Fragment>
              <InlineCode>muted</InlineCode> and <InlineCode>secondary</InlineCode> are already the quiet register, so
              a tenth of them would be invisible: their soft fill is their own surface at half strength. The ink of{' '}
              <InlineCode>muted</InlineCode> on a fill is the standard one, <InlineCode>--foreground</InlineCode>: grey
              on grey reads as a control that is off. The second row shows what the general rule would have given.
            </React.Fragment>
          )}
        >
          <Example of={surfaces} />
        </Section>

        <Section
          title={'One red'}
          lead={(
            <React.Fragment>
              The plain row has one exception: <InlineCode>destructive</InlineCode> writes with the tone itself, not
              with its soft ink. An error, a destructive action and the border of an invalid field are one red; the soft
              ink is darker, made to sit on its tinted fill, and would be a second red next to the first.
            </React.Fragment>
          )}
        >
          <Example of={destructive} />
        </Section>

        <Section
          title={'The table, in your components'}
          lead={(
            <React.Fragment>
              <InlineCode>TONE_CLASSES[fill][tone]</InlineCode> is public. A component of the application that offers a
              tone reads the same table, and its amber is the amber of every warning on the screen. The classes are
              literal strings in a file Tailwind scans, so nothing needs a safelist.
            </React.Fragment>
          )}
        >
          <Example of={ownComponent} />
          <CodeBlock
            snippet={ts`
              import { cva } from 'class-variance-authority';
              import { TONE_COMPOUNDS } from '@proedis/ui/core';

              // Every fill × tone pair, ready for a cva compound list: the shape Button, Badge and IconBox use
              const chip = cva('rounded-md px-2 py-1 text-xs', {
                variants: {
                  fill: { solid: '', soft: '', plain: '' },
                  tone: { muted: '', secondary: '', primary: '', success: '', warning: '', destructive: '', info: '' }
                },
                compoundVariants: [ ...TONE_COMPOUNDS ],
                defaultVariants : { fill: 'soft', tone: 'muted' }
              });
            `}
          />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              Colour is never the only cue. A tone comes with words, a badge says its state, an alert and a toast say
              their tone in text and with a mark of their own, and a disabled control is announced as such.
            </p>
            <p>
              Each solid tone has an ink chosen for contrast: <InlineCode>warning</InlineCode> carries dark ink, since
              white on amber fails in both themes. A button in <InlineCode>warning</InlineCode> also draws its focus ring
              with the darker soft ink, because amber on white does not reach the contrast a focus indicator needs.
            </p>
          </Prose>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Choose the fill first, then the tone'}>
              The fill is the weight in the hierarchy, the tone is the meaning. Most actions are primary; most states are
              soft.
            </Guidance>
            <Guidance kind={'dont'} title={'Use a tone as decoration'}>
              Green because it looks nice says “success” to everyone who reads it. Tones are meanings.
            </Guidance>
            <Guidance kind={'do'} title={'Paint your own components from TONE_CLASSES'}>
              One table keeps every success on the screen the same green, today and after the theme changes.
            </Guidance>
            <Guidance kind={'dont'} title={'Write bg-green-600 next to a success badge'}>
              It looks the same until a product redeclares <InlineCode>--success</InlineCode>, and then it does not.
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

export const Route = createFileRoute('/ui/foundations/tones')({
  component: TonesPage
});
