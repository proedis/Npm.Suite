import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { css, tsx } from '@/docs/snippet';
import { DocTable } from '@/docs/Tables';
import controlHeights from '@/examples/foundations/theming/control-heights.tsx?example';
import darkScope from '@/examples/foundations/theming/dark-scope.tsx?example';
import radius from '@/examples/foundations/theming/radius.tsx?example';
import retune from '@/examples/foundations/theming/retune.tsx?example';
import softPalette from '@/examples/foundations/theming/soft-palette.tsx?example';
import spacing from '@/examples/foundations/theming/spacing.tsx?example';
import tokens from '@/examples/foundations/theming/tokens.tsx?example';
import tone from '@/examples/foundations/theming/tone.tsx?example';
import fonts from '@/examples/foundations/theming/fonts.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/foundations/theming');

/** The three ways to import the stylesheet. Strings, since a quote cannot be written in JSX text */
const SHEETS: readonly (readonly [ string, string ])[] = [
  [ "@import '@proedis/ui'", 'theme.css: every token, its defaults, the dark variant, every utility. The one to use.' ],
  [ "@import '@proedis/ui/theme.css'", 'The same file, named explicitly.' ],
  [ "@import '@proedis/ui/ui.css'", 'The layout tier only: background, foreground, muted, muted-foreground, border, the radius scale and the spacing scale.' ]
];

const SOURCE_DIRECTIVE = '@source ".";';

/** The four variables of a tone */
const TONE_ROWS: readonly (readonly [ string, string, string ])[] = [
  [ '--primary', 'The tone: a solid fill, the ink of a plain fill, the focus of a field of that tone', 'Required' ],
  [ '--primary-foreground', 'The ink on a solid fill. Pick it for contrast against the tone', 'Required' ],
  [ '--primary-soft', 'The tinted surface of a soft fill', 'Optional: a tenth of the tone (half of the surface for muted and secondary)' ],
  [ '--primary-soft-foreground', 'The ink on a soft fill', 'Optional: the tone itself (the foreground for muted and secondary)' ]
];

/** The three families of text */
const FONT_ROWS: readonly (readonly [ string, string, string, string ])[] = [
  [ 'Titles', '--font-heading', '--font-sans', 'Heading.Title, the title of an EmptyState, a Dialog, a Drawer, an AlertDialog, a Popover and an Alert' ],
  [ 'Text', '--font-sans', 'The system interface font', 'Everything else: the body, every control, every label. Inherited from the page' ],
  [ 'Fixed width', '--font-mono', 'The system monospace font', 'No component of the package: the code, the identifiers and the figures of the application, with font-mono' ]
];

/** The weights the package writes */
const WEIGHT_ROWS: readonly (readonly [ string, string, string ])[] = [
  [ '400', '--font-weight-normal', 'Body text, a description, a value of a field' ],
  [ '500', '--font-weight-medium', 'A label, a button, a tab, a badge, an eyebrow' ],
  [ '600', '--font-weight-semibold', 'Every title, a value that leads' ],
  [ '700', '--font-weight-bold', 'The largest title, a Heading of size xl' ]
];

/** The named steps of the spacing scale */
const SPACING_ROWS: readonly (readonly [ string, string, string ])[] = [
  [ 'xs', '1', '0.25rem' ],
  [ 'sm', '2', '0.5rem' ],
  [ 'md', '4', '1rem' ],
  [ 'lg', '6', '1.5rem' ],
  [ 'xl', '8', '2rem' ],
  [ '2xl', '12', '3rem' ]
];

/** Where a spacing prop starts when it is not declared */
const SPACING_DEFAULTS: readonly (readonly [ string, string ])[] = [
  [ 'Stack, Grid, Split: gap', 'md' ],
  [ 'Cluster: gap', 'sm' ],
  [ 'Sticky: offset', '0' ],
  [ 'Item: gap', '3, its own geometry: the leading visual and the text' ],
  [ 'Heading: gap', '0.5, its own geometry: the title and the line under it' ]
];

/** The control heights, at a fine pointer and under a finger */
const CONTROL_ROWS: readonly (readonly [ string, string, string ])[] = [
  [ 'sm', '2rem', '2.25rem' ],
  [ 'md', '2.25rem', '2.5rem' ],
  [ 'lg', '2.5rem', '2.75rem' ]
];

/** Every family of the contract, with what it is for */
const FAMILIES: readonly (readonly [ string, string, string ])[] = [
  [ 'Canvas', '--background, --foreground', 'The page and its ink. The application paints the canvas, and the package reads it in one place only, the hover of the drop zone of FileUpload: the pair is declared because an ink means nothing without what it sits on.' ],
  [ 'Quiet register', '--muted, --muted-foreground', 'The muted tone, the hover of an interactive Item, a recessed footer, a quiet label, the scrollbar thumb.' ],
  [ 'Line', '--border', 'Divider, the rules of a divided Stack, the frames of the controls by default.' ],
  [ 'Surfaces', '--card, --popover, --secondary, --accent', 'A card, what floats (a menu, a dialog), the quieter action, a highlighted item. Each with its -foreground.' ],
  [ 'Tones', '--primary, --success, --warning, --destructive, --info', 'The voice of the application and the four states. Each with its -foreground, the ink that reads on it.' ],
  [ 'Soft register', '--{tone}-soft, --{tone}-soft-foreground', 'A tinted surface and its ink, for each of the seven tones. Optional: the fallback is a tenth of the tone.' ],
  [ 'Controls', '--input, --input-hover, --placeholder, --switch-off, --ring', 'The border of a control and its hover, the example text, the track of a switch that is off, the focus ring.' ],
  [ 'States', '--state-hover, --state-pressed', 'The veil over a solid fill under the pointer and pressed.' ],
  [ 'Tooltip', '--tooltip, --tooltip-foreground, --tooltip-muted-foreground', 'The dark label over a control, and its quieter second line.' ],
  [ 'Veils', '--busy-veil, --overlay, --overlay-nested, --scroll-shade', 'What covers a working dialog, the veil under a dialog and under one opened from it, the shade at the edge of a scroll.' ],
  [ 'Stacking', '--z-dialog, --z-popover, --z-toast, --z-tooltip', '50, 55, 60 and 70: what opens from a dialog sits above it, a toast stays usable over it, a tooltip is above everything.' ],
  [ 'Shape and size', '--radius-scale, --space-*, --spacing-control-*, --container-8xl, --text-2xs', 'The corner language, the spacing scale by name, the three heights of a control, the widest page, the step below text-xs.' ]
];


/* --------
 * Page
 * -------- */

function ThemingPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Components read a contract of semantic tokens, never a colour. The package declares the contract and
            gives it neutral defaults, a greyscale interface with conventional state colours, so an application works
            before deciding anything. A product then redeclares the tokens it cares about, and every component follows.
          </React.Fragment>
        )}
        imports={css`
          @import 'tailwindcss';
          @import '@proedis/ui';
        `}
      />

      <PageBody>
        <Example of={tokens} />

        <Section
          title={'Two stylesheets'}
          lead={(
            <React.Fragment>
              The package publishes two stylesheets. <InlineCode>ui.css</InlineCode> is the layout tier: the five
              tokens the primitives read, the radius scale and the utilities. <InlineCode>theme.css</InlineCode>{' '}
              imports it and adds the whole vocabulary the components read. The package name alone resolves to the
              second one, through the <InlineCode>style</InlineCode> condition of its exports.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Import', 'What you get' ]}
            rows={SHEETS.map(([ line, what ]) => [ <InlineCode key={'i'}>{line}</InlineCode>, what ])}
          />
          <Callout tone={'warning'} title={'The narrow sheet is the one you ask for'}>
            With <InlineCode>ui.css</InlineCode> alone, every component that reads a tone writes classes with no CSS
            behind them: an IconBox in <InlineCode>success</InlineCode> is a box with no colour, and nothing reports
            it. That is why the package name resolves to the full sheet, and the layout tier is the opt-out.
          </Callout>
          <Prose>
            <p>
              Either sheet also registers the package as a source for Tailwind (<InlineCode>{SOURCE_DIRECTIVE}</InlineCode>,
              resolved against the stylesheet wherever it is installed) and declares the classes the components build
              from props at runtime, which no scanner can find. One import is the whole setup.
            </p>
          </Prose>
        </Section>

        <Section
          title={'The token contract'}
          lead={(
            <React.Fragment>
              Every colour family is a pair: a surface and the ink that is legible on it, both always declared. Half a
              pair is the token nobody can use, a <InlineCode>--warning</InlineCode> with no{' '}
              <InlineCode>--warning-foreground</InlineCode> that leaves every caller guessing.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Family', 'Tokens', 'What it is for' ]}
            rows={FAMILIES.map(([ family, names, purpose ]) => [
              <span key={'f'} className={'font-medium whitespace-nowrap text-foreground'}>{family}</span>,
              <code key={'t'} className={'font-mono text-xs text-foreground'}>{names}</code>,
              purpose
            ])}
          />
        </Section>

        <Section
          title={'Overriding the theme'}
          lead={(
            <React.Fragment>
              A theme is a stylesheet that redeclares tokens after the import, on <InlineCode>:root</InlineCode> for
              the light theme and on <InlineCode>.dark</InlineCode> for the dark one. The panel on the right redeclares
              four of them, scoped to its container: the primary, its ink, the ring and the radius scale.
            </React.Fragment>
          )}
        >
          <Example of={retune} />
          <CodeBlock
            title={'app.css'}
            snippet={css`
              @import 'tailwindcss';
              @import '@proedis/ui';

              :root {
                --primary: oklch(0.511 0.262 276.966);
                --primary-foreground: oklch(0.985 0 0);
                --ring: oklch(0.673 0.182 276.935);
                --radius-scale: 1.75;
              }

              .dark {
                --primary: oklch(0.673 0.182 276.935);
                --primary-foreground: oklch(0.21 0.006 285.885);
              }
            `}
          />
          <Prose>
            <p>
              It works because the contract is declared with <InlineCode>@theme inline</InlineCode>: the utility{' '}
              <InlineCode>bg-primary</InlineCode> is emitted as <InlineCode>background-color: var(--primary)</InlineCode>,
              reading the raw variable where the element is. A later declaration wins by cascade, and a declaration on
              a container wins for everything inside it, which is how the panel above is retuned without touching the
              rest of the page.
            </p>
          </Prose>

          <SubSection
            title={'Overriding versus adding'}
            lead={(
              <React.Fragment>
                The package uses two kinds of <InlineCode>@theme</InlineCode> on purpose.{' '}
                <InlineCode>@theme inline</InlineCode> is for the tokens a component reads, so an override follows. A
                plain <InlineCode>@theme</InlineCode> adds a step to a Tailwind scale and emits its variable, so the step
                can be retuned by name: the three control heights, <InlineCode>max-w-8xl</InlineCode> (96rem, the width
                of a Container <InlineCode>xl</InlineCode>) and <InlineCode>text-2xs</InlineCode>.
              </React.Fragment>
            )}
          >
            <Callout tone={'note'} title={'This is how the package is built, not where you write'}>
              Both kinds of <InlineCode>@theme</InlineCode> are the package’s own machinery. An application writes every
              value, a colour, a height or a step alike, in plain <InlineCode>:root</InlineCode> after the import, as
              below. Written in <InlineCode>@theme</InlineCode>, half of them are ignored with no error: the measured
              table is on the Customization page.
            </Callout>
            <CodeBlock
              title={'app.css'}
              snippet={css`
                /* A denser product: every control one step shorter, a narrower widest page */
                :root {
                  --spacing-control-sm: 1.75rem;
                  --spacing-control-md: 2rem;
                  --spacing-control-lg: 2.25rem;
                  --container-8xl: 88rem;
                }
              `}
            />
          </SubSection>
        </Section>

        <Section
          title={'The radius scale'}
          lead={(
            <React.Fragment>
              Every radius step is declared as Tailwind’s own value times <InlineCode>--radius-scale</InlineCode>. At{' '}
              <InlineCode>1</InlineCode>, the default, <InlineCode>rounded-md</InlineCode> is exactly the 0.375rem the
              Tailwind documentation states; one declaration moves the corner language of the whole interface.
            </React.Fragment>
          )}
        >
          <Example of={radius} />
          <Prose>
            <p>
              <InlineCode>rounded-full</InlineCode> and <InlineCode>rounded-none</InlineCode> are outside the scale by
              nature, which is why the badge keeps its pill at every value. ⚠️ The bare{' '}
              <InlineCode>rounded</InlineCode> is a legacy alias of Tailwind with a fixed 0.25rem and does not follow the
              scale: write <InlineCode>rounded-sm</InlineCode>, the same value, which does.
            </p>
          </Prose>
        </Section>

        <Section
          title={'The spacing scale'}
          lead={(
            <React.Fragment>
              Six steps by name, <InlineCode>xs</InlineCode> to <InlineCode>2xl</InlineCode>, that every spacing prop
              of the package takes: the <InlineCode>gap</InlineCode> of the layout primitives, the{' '}
              <InlineCode>space</InlineCode> of a separator, the <InlineCode>inset</InlineCode> of Bleed, the{' '}
              <InlineCode>offset</InlineCode> of Sticky. The defaults are Tailwind’s own steps, so{' '}
              <InlineCode>md</InlineCode> is <InlineCode>gap-4</InlineCode>, 1rem; each name is a variable of the
              theme, <InlineCode>--space-md</InlineCode>, written as a multiple of <InlineCode>--spacing</InlineCode>.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Name', 'Tailwind step', 'Default', 'Variable' ]}
            rows={SPACING_ROWS.map(([ name, step, length ]) => [
              <InlineCode key={'n'}>{name}</InlineCode>,
              step,
              length,
              <code key={'v'} className={'font-mono text-xs text-foreground'}>--space-{name}</code>
            ])}
          />
          <Prose>
            <p>
              The same names work in a class, on five families of utilities: <InlineCode>gap-md</InlineCode>,{' '}
              <InlineCode>p-md</InlineCode> and its sides, <InlineCode>m-md</InlineCode> and{' '}
              <InlineCode>-mx-md</InlineCode>, <InlineCode>top-md</InlineCode> and the other insets,{' '}
              <InlineCode>h-md</InlineCode>. A layout written with props and a padding written in a class speak one
              vocabulary, and a theme moves both.
            </p>
          </Prose>
          <CodeBlock
            snippet={tsx`
              <Stack gap={'md'}>…</Stack>                       // the default, written out
              <Stack gap={{ base: 'sm', lg: 'lg' }}>…</Stack>   // per breakpoint
              <section className={'px-lg py-md'}>…</section>     // the same scale in a class
            `}
          />
          <CodeBlock
            title={'app.css'}
            snippet={css`
              :root {
                --space-md: 1.25rem;   /* every gap, padding, inset named md */
              }
            `}
          />
          <Example of={spacing} />
          <Prose>
            <p>
              The class carries the variable itself, <InlineCode>gap: var(--space-md)</InlineCode>, so a region that
              redeclares the scale changes only what is inside it: the right column above is the same markup in a
              wrapper that declares a smaller <InlineCode>md</InlineCode> and <InlineCode>sm</InlineCode>. That is the
              mechanism of a denser area, a toolbar or a table panel, without a single prop changed in it.
            </p>
          </Prose>
          <DocTable
            head={[ 'Prop', 'Default' ]}
            rows={SPACING_DEFAULTS.map(([ prop, value ]) => [ prop, <InlineCode key={'d'}>{value}</InlineCode> ])}
          />
          <Prose>
            <p>
              A number is still accepted, a step of Tailwind’s scale (<InlineCode>{'gap={3}'}</InlineCode> is{' '}
              <InlineCode>gap-3</InlineCode>), for the length no name covers. It is a measure written in the code and
              it does not move with the theme: a page that mixes <InlineCode>{'gap={4}'}</InlineCode> and{' '}
              <InlineCode>{"gap={'md'}"}</InlineCode> follows a retuned <InlineCode>md</InlineCode> only halfway.
            </p>
          </Prose>
          <Callout tone={'warning'} title={'Why the names are not spacing tokens of Tailwind'}>
            The obvious way to name a step is <InlineCode>--spacing-md</InlineCode> in the theme, and it breaks
            Tailwind: the width utilities read <InlineCode>--spacing-*</InlineCode> before{' '}
            <InlineCode>--container-*</InlineCode>, so <InlineCode>max-w-md</InlineCode> would turn from 28rem into
            1rem, in the package and in the application. The scale is read through the keys of each property instead
            (<InlineCode>--gap-*</InlineCode>, <InlineCode>--padding-*</InlineCode> and the others), which nothing else
            reads: every utility Tailwind already had keeps its value.
          </Callout>
        </Section>

        <Section
          title={'The soft palette'}
          lead={(
            <React.Fragment>
              The <InlineCode>soft</InlineCode> fill of each tone reads <InlineCode>--{'{tone}'}-soft</InlineCode> and{' '}
              <InlineCode>--{'{tone}'}-soft-foreground</InlineCode>. Declare nothing and they fall back to a tenth of the
              tone with the tone as ink; declare the pair and the fallback steps aside.
            </React.Fragment>
          )}
        >
          <Example of={softPalette} />
          <Prose>
            <p>
              The fallback lives in the mapping, not on <InlineCode>:root</InlineCode>, and that is the point: it is
              resolved where the component is, so a subtree that redefines <InlineCode>--primary</InlineCode> gets soft
              colours derived from its own primary rather than from the page’s.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Changing a tone'}
          lead={(
            <React.Fragment>
              A tone is four variables, and a product retunes it by redeclaring them on <InlineCode>:root</InlineCode>{' '}
              after the import, and on <InlineCode>.dark</InlineCode> for the dark values. The value is any CSS colour:
              a colour of Tailwind’s palette through its variable, <InlineCode>oklch()</InlineCode>,{' '}
              <InlineCode>rgb()</InlineCode>, a hex. The same holds for the seven tones,{' '}
              <InlineCode>primary</InlineCode>, <InlineCode>secondary</InlineCode>, <InlineCode>muted</InlineCode>,{' '}
              <InlineCode>success</InlineCode>, <InlineCode>warning</InlineCode>, <InlineCode>destructive</InlineCode>{' '}
              and <InlineCode>info</InlineCode>.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Variable', 'What it is', 'Declare it' ]}
            rows={TONE_ROWS.map(([ variable, what, need ]) => [
              <code key={'v'} className={'font-mono text-xs whitespace-nowrap text-foreground'}>{variable}</code>,
              what,
              need
            ])}
          />
          <CodeBlock
            title={'app.css'}
            snippet={css`
              @import 'tailwindcss';
              @import '@proedis/ui';

              :root {
                /* A colour of Tailwind's palette, by its variable */
                --primary: var(--color-violet-600);
                --primary-foreground: var(--color-white);

                /* Any CSS colour: oklch, rgb, a hex */
                --success: oklch(0.55 0.17 160);
                --success-foreground: oklch(0.99 0 0);
                --destructive: rgb(217 70 39);
                --destructive-foreground: #ffffff;

                /* The soft register, only when the derived one does not suit */
                --destructive-soft: rgb(217 70 39 / 12%);
                --destructive-soft-foreground: rgb(160 45 20);
              }

              .dark {
                --primary: var(--color-violet-400);
                --primary-foreground: var(--color-zinc-950);
              }
            `}
          />
          <Example of={tone} />
          <Prose>
            <p>
              <InlineCode>var(--color-violet-600)</InlineCode> works because Tailwind keeps every colour of its palette
              that something reads as a variable: the reference is the reading. A soft fill derives itself from the tone
              where the component is, so a retuned primary brings a matching soft fill with no line of its own; declare
              the soft pair only when the derived tint does not read well, as the third panel does. The foreground is
              yours to choose for contrast: the package cannot know whether the tone is light or dark.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Fonts'}
          lead={(
            <React.Fragment>
              Three families, each a variable: the titles, the text, the fixed width. The text is Tailwind’s own{' '}
              <InlineCode>--font-sans</InlineCode>, inherited from the page by every component; the titles are{' '}
              <InlineCode>--font-heading</InlineCode>, which is the text family until a product gives them one of
              their own.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Role', 'Variable', 'Default', 'Read by' ]}
            rows={FONT_ROWS.map(([ role, variable, fallback, readers ]) => [
              <span key={'r'} className={'font-medium whitespace-nowrap text-foreground'}>{role}</span>,
              <code key={'v'} className={'font-mono text-xs whitespace-nowrap text-foreground'}>{variable}</code>,
              fallback,
              readers
            ])}
          />
          <SubSection
            title={'Weights'}
            lead={(
              <React.Fragment>
                The package writes four weights. A font that ships fewer makes the browser synthesise the missing ones,
                a smeared bold or a medium that reads as regular, so load these four, or one variable font from 400 to
                700. A weight variable changes what its name means everywhere.
              </React.Fragment>
            )}
          >
            <DocTable
              head={[ 'Weight', 'Variable', 'Where the package uses it' ]}
              rows={WEIGHT_ROWS.map(([ weight, variable, where ]) => [
                <code key={'w'} className={'font-mono text-xs text-foreground'}>{weight}</code>,
                <code key={'v'} className={'font-mono text-xs whitespace-nowrap text-foreground'}>{variable}</code>,
                where
              ])}
            />
          </SubSection>
          <CodeBlock
            title={'app.css'}
            snippet={css`
              /* A web font is loaded before everything else: an @import of CSS must come first */
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=JetBrains+Mono:wght@400;500&display=swap');
              @import 'tailwindcss';
              @import '@proedis/ui';

              :root {
                --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
                --font-mono: 'JetBrains Mono', ui-monospace, monospace;
                --font-heading: 'Inter', ui-sans-serif, system-ui, sans-serif;

                /* Only if the font calls 600 something else */
                --font-weight-semibold: 650;
              }
            `}
          />
          <Example of={fonts} />
          <Prose>
            <p>
              Write the families on <InlineCode>:root</InlineCode>: the page reads <InlineCode>--font-sans</InlineCode>{' '}
              there, and <InlineCode>--font-heading</InlineCode> follows it when it is not declared. The panel above
              redeclares them on a container, which is why it also sets <InlineCode>font-family</InlineCode> on itself:
              the text of a region inherits the family of the page, not the variable. Figures in a table or a field are
              set with <InlineCode>tabular-nums</InlineCode>, so the text font should carry tabular figures, as Inter
              does: without them the setting does nothing and the columns of a table stop lining up.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Control heights'}
          lead={(
            <React.Fragment>
              Two controls of the same size have the same height, whatever they are: a field, a select, a date
              picker, a segmented control, a toggle, an icon button and a button at <InlineCode>md</InlineCode> line up
              on both edges in a row. Every control takes the same three sizes, <InlineCode>sm</InlineCode>,{' '}
              <InlineCode>md</InlineCode> and <InlineCode>lg</InlineCode>, and each size is one height of the theme.
            </React.Fragment>
          )}
        >
          <Example of={controlHeights} />
          <DocTable
            head={[ 'Size', 'Height', 'Under a finger', 'Variable' ]}
            rows={CONTROL_ROWS.map(([ size, fine, coarse ]) => [
              <InlineCode key={'s'}>{size}</InlineCode>,
              fine,
              coarse,
              <code key={'v'} className={'font-mono text-xs text-foreground'}>--spacing-control-{size}</code>
            ])}
          />
          <Prose>
            <p>
              The rule holds by construction. Inside the package the height of a control is written in one place, and
              the lint of the repository rejects an <InlineCode>h-control-*</InlineCode> written anywhere else, so a
              new control cannot be one step off the others. The type of the three sizes is{' '}
              <InlineCode>ControlSize</InlineCode>, exported from <InlineCode>@proedis/ui/core</InlineCode> for the
              wrappers of an application; a control of the application takes the same height from the class{' '}
              <InlineCode>h-control-md</InlineCode>, or from <InlineCode>FieldShell</InlineCode>.
            </p>
            <p>
              Under a coarse pointer the three heights grow one step each, because the size of a control is a matter
              of the finger, not of the width of the window. The readout shows what this browser resolves: turn on
              touch emulation in the developer tools and reload. The coarse step is declared in Tailwind’s{' '}
              <InlineCode>theme</InlineCode> layer, so an application that redeclares the heights on{' '}
              <InlineCode>:root</InlineCode> wins on every device, and redeclares them inside its own{' '}
              <InlineCode>@media (pointer: coarse)</InlineCode> to keep a different step for touch.
            </p>
            <p>
              Two things are taller on purpose. The strip of <InlineCode>Tabs</InlineCode> is navigation, not a control
              in a row: its tabs read the same heights, and the strip adds its own padding around them. A read only{' '}
              <InlineCode>MultiSelect</InlineCode> shows every chip and grows by lines when they do not fit, since there
              is no list to open.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Dark mode'}
          lead={(
            <React.Fragment>
              Dark mode is a class: <InlineCode>.dark</InlineCode> on any ancestor redeclares the tokens for its subtree
              and switches on the <InlineCode>dark:</InlineCode> variant, declared as{' '}
              <InlineCode>@custom-variant dark (&:is(.dark *))</InlineCode>. On the root it themes the page; on a
              wrapper it themes a part of it.
            </React.Fragment>
          )}
        >
          <Example of={darkScope} />
          <Prose>
            <p>
              The dark values of the tokens are declared on the <InlineCode>.dark</InlineCode> selector, so the class is
              the strategy. A site that follows the system sets the class from{' '}
              <InlineCode>prefers-color-scheme</InlineCode>, before the first paint so a dark page never flashes white.
              This site does it with a few lines in its <InlineCode>index.html</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section
          title={'What the contract leaves out'}
          lead={'The defaults are anonymous by design, and the vocabulary is closed on purpose.'}
        >
          <Prose>
            <p>
              There is no <InlineCode>--chart-*</InlineCode> ramp: a categorical palette has no neutral default, and any
              value would be a brand. There is no <InlineCode>--sidebar-*</InlineCode>: those are the private slots of
              one component, not a vocabulary. There is no font and no type scale beyond{' '}
              <InlineCode>text-2xs</InlineCode>, the one step a component needed. A product declares its own tokens in its
              own stylesheet, next to the overrides.
            </p>
          </Prose>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Redeclare tokens, not classes'}>
              A product’s colour is a value of <InlineCode>--primary</InlineCode>, set once. A{' '}
              <InlineCode>className</InlineCode> on every button is a theme nobody can change.
            </Guidance>
            <Guidance kind={'dont'} title={'Import ui.css when you use components'}>
              The tones would have no CSS behind them, silently. The package name gives the full sheet.
            </Guidance>
            <Guidance kind={'do'} title={'Declare both halves of a pair'}>
              A surface without its ink, or an ink without its surface, is the token every caller has to guess about.
            </Guidance>
            <Guidance kind={'dont'} title={'Add a token nobody reads'}>
              A name declared for later is a promise the stylesheet cannot keep. Add it with the component that reads it.
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

export const Route = createFileRoute('/foundations/theming')({
  component: ThemingPage
});
