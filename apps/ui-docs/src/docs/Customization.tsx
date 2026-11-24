import * as React from 'react';

import { Link } from '@tanstack/react-router';

import { CollapsibleSection } from '@proedis/ui/actions/collapsible';
import { Cluster, Stack } from '@proedis/ui/layout';

import { InlineCode } from './InlineCode';
import { Prose, Section } from './Page';
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


/** A colour family: a token and the variables that go with it, its ink, its soft pair, its hover */
interface ColourFamily {
  readonly name: string;
  readonly variables: readonly string[];
}

/** A number with its noun, singular or plural */
function count(value: number, one: string, many: string): string {
  return `${value} ${value === 1 ? one : many}`;
}

/** The base token of a colour variable: `--primary-soft-foreground` belongs to `primary` */
function familyOf(variable: string): string {
  return variable
    .replace(/^--/, '')
    .replace(/-(soft-foreground|soft|muted-foreground|foreground|hover|pressed|nested)$/, '');
}

/** The colours grouped by family, in the order they first appear */
function familiesOf(variables: readonly ThemeVariable[]): ColourFamily[] {
  const families = new Map<string, string[]>();

  for (const { variable } of variables) {
    const family = familyOf(variable);
    families.set(family, [ ...(families.get(family) ?? []), variable ]);
  }

  return [ ...families ].map(([ family, members ]) => ({ name: family, variables: members }));
}

/** One row per colour family, its variables as chips: the defaults are on the Foundations page */
function FamilyTable(props: { families: readonly ColourFamily[] }): React.ReactNode {
  return (
    <DocTable
      head={[ 'Family', 'Variables' ]}
      rows={props.families.map((family) => [
        <span key={'f'} className={'font-medium whitespace-nowrap text-foreground'}>{family.name}</span>,
        <Cluster key={'v'} gap={'xs'}>
          {family.variables.map((variable) => (
            <code key={variable} className={'font-mono text-xs text-foreground'}>{variable}</code>
          ))}
        </Cluster>
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
            ? `The variables of the theme ${name} reads, by group. `
            : `${name} reads no variable of the theme: it has no look of its own to tune. `}
          Plain CSS in <InlineCode>:root {'{ }'}</InlineCode> after the import, <InlineCode>.dark {'{ }'}</InlineCode>{' '}
          for dark mode, never <InlineCode>@theme</InlineCode>. Why, with every default:{' '}
          <Link to={'/foundations/customization'} className={'font-medium text-foreground underline underline-offset-2'}>Foundations, Customization</Link>.
        </React.Fragment>
      )}
    >
      {theme.variables.length > 0 && (
        <Stack gap={0} divided className={'rounded-xl border border-border px-4'}>
          {GROUPS.map((group) => {
            const variables = theme.variables.filter((variable) => variable.group === group);

            if (!variables.length) {
              return null;
            }

            const families = group === 'Colour' ? familiesOf(variables) : undefined;

            return (
              <CollapsibleSection
                key={group}
                title={GROUP_TITLES[group]}
                meta={families ? `${count(families.length, 'family', 'families')}, ${count(variables.length, 'variable', 'variables')}` : count(variables.length, 'variable', 'variables')}
                headingLevel={3}
              >
                <Stack gap={'sm'} className={'pb-4'}>
                  <p className={'text-sm text-muted-foreground'}>{GROUP_LEADS[group]}</p>
                  {families
                    ? <FamilyTable families={families} />
                    : <ThemeTable variables={variables} />}
                </Stack>
              </CollapsibleSection>
            );
          })}
        </Stack>
      )}
      {children && <Prose>{children}</Prose>}
    </Section>
  );

}

Customization.displayName = 'Customization';
