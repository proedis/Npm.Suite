import * as React from 'react';

import { Link } from '@tanstack/react-router';

import { Cluster, Stack } from '@proedis/ui/layout';
import { ScrollArea } from '@proedis/ui/primitives';

import { InlineCode } from './InlineCode';
import { Markdown } from './Markdown';

import type { PropDoc } from './propDoc';


/* --------
 * Table
 * -------- */

interface DocTableProps {
  /** The column titles */
  head: readonly React.ReactNode[];

  /** One array of cells per row, as many as the titles */
  rows: readonly (readonly React.ReactNode[])[];

  /** The first column at its content's width, the last one taking the rest */
  className?: string;
}

/** A reference table: hairlines between rows, a header in small capitals, a horizontal scroll on a phone */
export function DocTable(props: DocTableProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { head, rows } = props;


  // ----
  // Component Render
  // ----
  return (
    <div className={'overflow-hidden rounded-xl border border-border'}>
      <ScrollArea orientation={'horizontal'}>
        <table className={'w-full min-w-xl border-collapse text-start text-sm'}>
          <thead className={'bg-muted/50'}>
            <tr>
              {head.map((title, index) => (
                <th
                  key={index}
                  scope={'col'}
                  className={'border-b border-border px-4 py-2.5 text-start text-xs font-semibold tracking-wide text-muted-foreground uppercase'}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, rowIndex) => (
              <tr key={rowIndex} className={'border-b border-border last:border-b-0'}>
                {cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className={'px-4 py-3 align-top text-muted-foreground'}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );

}

DocTable.displayName = 'DocTable';


/* --------
 * Props
 * -------- */

interface PropsTableProps {
  /** From `virtual:ui-props/<Type>`: the props the package declares, read by the compiler */
  props: readonly PropDoc[];

  /** Where the rest of the props go: "Every other prop goes to Base UI's Button" */
  rest?: React.ReactNode;
}

/** The default, written as an application would: a string value in quotes, the rest as is */
function formatDefault(prop: PropDoc): string | undefined {
  if (prop.default === undefined) {
    return undefined;
  }

  const quoted = `'${prop.default}'`;

  return prop.values?.includes(quoted) || prop.type.split(' | ').includes(quoted) ? quoted : prop.default;
}

/**
 * The props of a component, generated from its type: the table cannot say something the types do
 * not. The shared props are named once under it rather than repeated on every page.
 */
export function PropsTable(props: PropsTableProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { props: docs, rest } = props;


  // ----
  // Memoized Data
  // ----
  const own = React.useMemo(() => docs.filter((prop) => !prop.shared), [ docs ]);
  const shared = React.useMemo(() => docs.filter((prop) => prop.shared), [ docs ]);


  // ----
  // Component Render
  // ----
  return (
    <Stack gap={3}>
      <DocTable
        head={[ 'Prop', 'Type', 'Default' ]}
        rows={own.map((prop) => [
          <Stack key={'name'} gap={2} className={'min-w-56 max-w-md'}>
            <Cluster gap={1.5}>
              <code className={'font-mono text-sm font-semibold text-foreground'}>{prop.name}</code>
              {prop.required && <span className={'text-xs font-medium text-destructive'}>required</span>}
              {prop.dataAttribute && (
                <code
                  title={`Reported on the element as ${prop.dataAttribute}, which a stylesheet can target`}
                  className={'rounded-sm bg-primary-soft px-1.5 py-0.5 font-mono text-2xs text-primary-soft-foreground'}
                >
                  {prop.dataAttribute}
                </code>
              )}
            </Cluster>
            {prop.description && <div className={'text-sm/6'}><Markdown text={prop.description} /></div>}
          </Stack>,
          <Stack key={'type'} gap={1.5} className={'min-w-40'}>
            <code className={'font-mono text-xs text-primary'}>{prop.type}</code>
            {prop.values && (
              <Cluster gap={1}>
                {prop.values.map((value) => <InlineCode key={value} className={'text-xs'}>{value}</InlineCode>)}
              </Cluster>
            )}
          </Stack>,
          formatDefault(prop)
            ? <code key={'default'} className={'font-mono text-xs whitespace-nowrap text-foreground'}>{formatDefault(prop)}</code>
            : <span key={'default'} aria-label={'none'}>–</span>
        ])}
      />

      {(rest || shared.length > 0) && (
        <Stack gap={1} className={'text-sm/6 text-muted-foreground'}>
          {shared.length > 0 && (
            <p>
              Also takes the shared props{' '}
              {shared.map((prop, index) => (
                <React.Fragment key={prop.name}>
                  {index > 0 && ' and '}
                  <InlineCode>{prop.name}</InlineCode>
                </React.Fragment>
              ))}
              , described in{' '}
              <Link to={'/foundations/shared-props' as never} className={'font-medium text-primary hover:underline'}>Shared props</Link>.
            </p>
          )}
          {rest && <p>{rest}</p>}
        </Stack>
      )}
    </Stack>
  );

}

PropsTable.displayName = 'PropsTable';


/* --------
 * Slots
 * -------- */

export interface SlotRow {
  /** The value of `data-slot` */
  readonly slot: string;

  /** What part of the component carries it */
  readonly part: React.ReactNode;

  /** The `data-*` it carries besides, when any */
  readonly attributes?: readonly string[];
}

/** The parts a stylesheet can reach, and the state each one reports */
export function SlotsTable(props: { rows: readonly SlotRow[] }): React.ReactNode {
  return (
    <DocTable
      head={[ 'data-slot', 'Part', 'Attributes' ]}
      rows={props.rows.map((row) => [
        <code key={'slot'} className={'font-mono text-sm whitespace-nowrap text-foreground'}>{row.slot}</code>,
        <span key={'part'} className={'block min-w-48'}>{row.part}</span>,
        row.attributes?.length
          ? (
            <Cluster key={'attributes'} gap={1} className={'min-w-40'}>
              {row.attributes.map((attribute) => <InlineCode key={attribute} className={'text-xs'}>{attribute}</InlineCode>)}
            </Cluster>
          )
          : <span key={'attributes'} aria-label={'none'}>–</span>
      ])}
    />
  );
}

SlotsTable.displayName = 'SlotsTable';
