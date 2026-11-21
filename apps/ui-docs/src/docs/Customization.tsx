import * as React from 'react';

import { Link } from '@tanstack/react-router';

import { Stack } from '@proedis/ui/layout';

import { CodeBlock } from './CodeBlock';
import { InlineCode } from './InlineCode';
import { Prose, Section, SubSection } from './Page';
import { css } from './snippet';
import { DocTable } from './Tables';
import { describeVariable, GROUP_LEADS, GROUP_TITLES } from './themeVariables';

import type { ThemeDoc, ThemeVariable, ThemeVariableGroup } from './themeDoc';


/* --------
 * Types Definition
 * -------- */

interface CustomizationProps {
  /** The variables the component reads, from `virtual:ui-theme/<route>` */
  theme: ThemeDoc;

  /** The component, as the prose names it: `Stack`, `Select` */
  name: string;

  /** Anything the page adds: what the theme does not reach for this component, an example */
  children?: React.ReactNode;
}


/* --------
 * Parts
 * -------- */

const GROUPS: readonly ThemeVariableGroup[] = [ 'Default', 'Spacing', 'Size', 'Typography', 'Shape', 'Colour', 'Layer' ];

/** One value of the theme, light and dark when they differ */
export function ThemeValue(props: { variable: ThemeVariable }): React.ReactNode {
  const { variable } = props;

  if (!variable.default) {
    return null;
  }

  return (
    <Stack gap={'xs'}>
      <code className={'font-mono text-xs text-foreground'}>{variable.default}</code>
      {variable.dark && variable.dark !== variable.default && (
        <code className={'font-mono text-xs text-muted-foreground'}>dark: {variable.dark}</code>
      )}
    </Stack>
  );
}

/** The rows of one group: the variable, what it moves, its default */
export function ThemeTable(props: { variables: readonly ThemeVariable[] }): React.ReactNode {
  return (
    <DocTable
      head={[ 'Variable', 'What it moves', 'Default' ]}
      rows={props.variables.map((variable) => [
        <code key={'v'} className={'font-mono text-xs whitespace-nowrap text-foreground'}>{variable.variable}</code>,
        describeVariable(variable.variable),
        <ThemeValue key={'d'} variable={variable} />
      ])}
    />
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * The Customization section of a component page: every variable of the theme the component reads,
 * grouped, with what it moves and its default. The list comes from the source of the package through
 * the theme plugin, so it is complete by construction and cannot name a variable the component does not
 * read.
 */
export function Customization(props: CustomizationProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { children, name, theme } = props;


  // ----
  // Component Render
  // ----
  return (
    <Section
      title={'Customization'}
      lead={(
        <React.Fragment>
          {theme.variables.length
            ? `Every variable of the theme ${name} reads, with what it moves and its default. `
            : `${name} reads no variable of the theme: it has no look of its own to tune. `}
          Write them in plain CSS, in <InlineCode>:root {'{ }'}</InlineCode> after the import of the stylesheet, to
          change every {name} of the application; in <InlineCode>.dark {'{ }'}</InlineCode> for dark mode only; in any
          other selector for what is inside it. Never in <InlineCode>@theme</InlineCode> or{' '}
          <InlineCode>@layer base</InlineCode>: there half of them are ignored with no error. The reasons, measured, and
          every variable of every component are on the{' '}
          <Link to={'/foundations/customization'} className={'font-medium text-foreground underline underline-offset-2'}>Customization</Link>{' '}
          page of Foundations.
        </React.Fragment>
      )}
    >
      {theme.variables.length > 0 && (
        <CodeBlock
          title={'app.css'}
          snippet={css`
            @import 'tailwindcss';
            @import '@proedis/ui';

            :root {
              /* the variables below, for the whole application */
            }

            .dark {
              /* their dark values */
            }
          `}
        />
      )}
      {GROUPS.map((group) => {
        const variables = theme.variables.filter((variable) => variable.group === group);

        if (!variables.length) {
          return null;
        }

        return (
          <SubSection key={group} id={`customization-${group.toLowerCase()}`} title={GROUP_TITLES[group]} lead={GROUP_LEADS[group]}>
            <ThemeTable variables={variables} />
          </SubSection>
        );
      })}
      {children && <Prose>{children}</Prose>}
    </Section>
  );

}

Customization.displayName = 'Customization';
