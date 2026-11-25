import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { cn } from '@proedis/ui/core';
import { Select } from '@proedis/ui/forms/select';
import { Textarea } from '@proedis/ui/forms/textarea';
import { Cluster, Stack } from '@proedis/ui/layout';
import { Label, ScrollArea } from '@proedis/ui/primitives';

import { CodeBlock } from './CodeBlock';
import { InlineCode } from './InlineCode';

import type { ExampleModule } from './exampleModule';
import type { SlotRow } from './Tables';


/* --------
 * Types Definition
 * -------- */

interface SlotsInspectorProps {
  /** The example the parts are found in: an example with every part on show and a way to change its state */
  of: ExampleModule;

  /** The parts, as the slots table of the page lists them */
  rows: readonly SlotRow[];

  /**
   * The example opens something modal (a dialog, a drawer): while it is open the page behind it is
   * inert, so the reader is told to set the rule first and open it after
   */
  modal?: boolean;
}

/** The `data-*` attributes found on the elements of one slot right now, each with the values seen */
type LiveAttributes = ReadonlyMap<string, readonly string[]>;

interface Box {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}


/* --------
 * Constants Definition
 * -------- */

const SELECT_LABELS = { search: 'Search', noResults: 'Nothing matches', clear: 'Clear' };

/** An example of declarations, shown until the reader writes their own: nothing applies until then */
const DECLARATIONS_PLACEHOLDER = 'font-weight: 700;\nborder-radius: 9999px;';

/** The id of the application root: anything rendered outside it is a portal, a menu or a tooltip */
const APP_ROOT = 'root';


/* --------
 * Helpers
 * -------- */

/** The elements of a slot: inside the preview, and in the portals the preview opened */
function partsOf(preview: HTMLElement | null, slot: string): HTMLElement[] {
  if (!preview) {
    return [];
  }

  const selector = `[data-slot="${CSS.escape(slot)}"]`;
  const portals = [ ...document.body.children ].filter((element) => element.id !== APP_ROOT && !element.matches('script, style'));

  return [
    ...(preview.matches(selector) ? [ preview ] : []),
    ...preview.querySelectorAll<HTMLElement>(selector),
    ...portals.flatMap((portal) => [ ...portal.querySelectorAll<HTMLElement>(selector) ])
  ];
}

/** Every `data-*` on the elements of a slot, but the slot itself, with the values it takes now */
function liveAttributesOf(parts: readonly HTMLElement[]): LiveAttributes {
  const found = new Map<string, Set<string>>();

  for (const part of parts) {
    for (const attribute of part.attributes) {
      if (attribute.name.startsWith('data-') && attribute.name !== 'data-slot') {
        found.set(attribute.name, (found.get(attribute.name) ?? new Set()).add(attribute.value));
      }
    }
  }

  return new Map([ ...found ].map(([ name, values ]) => [ name, [ ...values ] ]));
}

/** The declarations a reader typed, kept inside one rule: no brace can close it, no tag can end the style */
function cleanDeclarations(text: string): string {
  return text.replace(/[{}<>]/g, '');
}

/** The selector of a slot, narrowed to an attribute or to one of its values when one is chosen */
function selectorOf(slot: string, attribute: string | null): string {
  if (!attribute) {
    return `[data-slot='${slot}']`;
  }

  const [ name, value ] = attribute.split('=');
  return value === undefined ? `[data-slot='${slot}'][${name}]` : `[data-slot='${slot}'][${name}='${value}']`;
}


/* --------
 * Hooks
 * -------- */

/** What one slot is in the example right now: how many elements carry it, and their attributes */
interface LiveSlot {
  readonly count: number;
  readonly attributes: LiveAttributes;
}

/**
 * The parts of every slot, read from the DOM after each change of the preview or of the portals. The
 * slots arrive as one string so the effect does not restart on every render of a page that writes its
 * rows inline.
 */
function useLiveSlots(preview: React.RefObject<HTMLElement | null>, slotsKey: string): ReadonlyMap<string, LiveSlot> {
  const [ live, setLive ] = React.useState<ReadonlyMap<string, LiveSlot>>(new Map());

  React.useEffect(() => {
    const element = preview.current;

    if (!element) {
      return undefined;
    }

    const slots = slotsKey.split(' ');
    let frame = 0;
    let last = '';

    /** Read again, and set only what changed: the outline of the inspector moves on every frame too */
    const read = (): void => {
      const next = new Map(slots.map((slot) => {
        const parts = partsOf(element, slot);
        return [ slot, { count: parts.length, attributes: liveAttributesOf(parts) } ] as const;
      }));
      const signature = JSON.stringify([ ...next ].map(([ slot, value ]) => [ slot, value.count, [ ...value.attributes ] ]));

      if (signature !== last) {
        last = signature;
        setLive(next);
      }
    };

    const schedule = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(read);
    };

    /*
     * The preview, and the whole body for what the example opens in a portal (a menu, a dialog): its
     * attributes change inside the portal, not on the body. One read per frame at most.
     */
    const observer = new MutationObserver(schedule);
    observer.observe(element, { subtree: true, attributes: true, childList: true });
    observer.observe(document.body, { subtree: true, attributes: true, childList: true });
    schedule();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ preview, slotsKey ]);

  return live;
}


/** The boxes of the parts of a slot, followed frame by frame while the slot is highlighted */
function useBoxes(preview: React.RefObject<HTMLElement | null>, slot: string | null): readonly Box[] {
  const [ boxes, setBoxes ] = React.useState<readonly Box[]>([]);

  React.useEffect(() => {
    if (!slot) {
      return undefined;
    }

    let frame = 0;
    const measure = (): void => {
      setBoxes(partsOf(preview.current, slot).map((part) => {
        const rect = part.getBoundingClientRect();
        return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
      }));
      frame = requestAnimationFrame(measure);
    };

    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [ preview, slot ]);

  /** The boxes of the last slot outlined are kept in state: nothing is drawn once no slot is */
  return slot ? boxes : [];
}


/* --------
 * Component Definition
 * -------- */

/**
 * The slots of a component, inspected on a live example: hovering or focusing a row outlines the
 * elements of that slot in the preview, each row shows the attributes its elements carry right now
 * (they change as the example is used), and a rule written below is applied to the preview alone, so
 * a reader sees what a selector on the data attributes reaches before writing it in a stylesheet.
 *
 * Everything is read from the DOM of the example, so it cannot drift from the component.
 */
export function SlotsInspector(props: SlotsInspectorProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { modal = false, of, rows } = props;
  const { Component } = of;


  // ----
  // Internal State
  // ----
  const [ hovered, setHovered ] = React.useState<string | null>(null);
  const [ focused, setFocused ] = React.useState<string | null>(null);
  const [ ruleSlot, setRuleSlot ] = React.useState<string>(rows[0]?.slot ?? '');
  const [ ruleAttribute, setRuleAttribute ] = React.useState<string | null>(null);
  const [ declarations, setDeclarations ] = React.useState('');
  const [ showCode, setShowCode ] = React.useState(false);

  /** The pointer wins over the focus, and leaving a row with the pointer gives the outline back to the focus */
  const highlighted = hovered ?? focused;


  // ----
  // Internal Refs
  // ----
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const scope = React.useId().replace(/[^\w-]/g, '');


  // ----
  // Live Data
  // ----
  const live = useLiveSlots(previewRef, rows.map((row) => row.slot).join(' '));
  const boxes = useBoxes(previewRef, highlighted);


  // ----
  // The rule
  // ----
  const ruleRow = rows.find((row) => row.slot === ruleSlot);
  const attributeOptions = React.useMemo(() => {
    const documented = ruleRow?.attributes ?? [];
    const seen = live.get(ruleSlot)?.attributes ?? new Map<string, readonly string[]>();
    const names = [ ...new Set([ ...documented, ...seen.keys() ]) ];

    return names.flatMap((name) => [
      { value: name, label: `[${name}], any value` },
      ...(seen.get(name) ?? []).filter((value) => value !== '').map((value) => ({ value: `${name}=${value}`, label: `[${name}='${value}']` }))
    ]);
  }, [ live, ruleRow, ruleSlot ]);

  const selector = selectorOf(ruleSlot, ruleAttribute);
  /*
   * The rule reaches the preview, and what the preview opens in a portal outside the app root: a dialog
   * or a menu of the example is drawn there, not inside the preview
   */
  const style = `[data-inspector='${scope}'] ${selector}, body > :not(#${APP_ROOT}) ${selector} { ${cleanDeclarations(declarations)} }`;


  // ----
  // Handlers
  // ----
  const handleRuleSlot = React.useCallback((value: string | null) => {
    setRuleSlot(value ?? rows[0]?.slot ?? '');
    setRuleAttribute(null);
  }, [ rows ]);

  const handleDeclarations = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDeclarations(event.currentTarget.value);
  }, []);


  // ----
  // Component Render
  // ----
  return (
    <Stack gap={'lg'} data-slot={'slots-inspector'}>
      <style>{style}</style>

      {/*
        The preview stays under the bar while the table and the rule below it scroll, so the part a row
        outlines is on screen whichever row the pointer is on
      */}
      <div className={'sticky top-14 z-10 -mx-1 bg-background px-1 pt-2 pb-1'}>
        <Stack
          ref={previewRef}
          gap={0}
          align={'center'}
          justify={'center'}
          data-slot={'example-preview'}
          data-inspector={scope}
          className={'min-h-28 overflow-x-auto rounded-xl border border-border bg-background p-5 shadow-sm'}
        >
          <Component />
        </Stack>
      </div>

      <Stack gap={'sm'}>
        <Stack direction={'horizontal'} justify={'between'} align={'start'}>
          <span className={'text-sm text-muted-foreground'}>
            Hover or focus a row to outline its part. The attributes are read from the example as it is now: use
            it, and a part that is not in the DOM appears once the example opens it.
            {modal && ' While it is open the page behind is inert: pick the part and write the rule first, then open it.'}
          </span>
          <Button size={'sm'} fill={'plain'} tone={'muted'} className={'shrink-0'} aria-expanded={showCode} onClick={() => setShowCode((value) => !value)}>
            {showCode ? 'Hide the code' : 'Show the code'}
          </Button>
        </Stack>
        {showCode && <CodeBlock snippet={of} title={of.file} maxHeight={320} />}
      </Stack>

      <div className={'overflow-hidden rounded-xl border border-border'}>
        <ScrollArea orientation={'horizontal'}>
          <table className={'w-full min-w-xl border-collapse text-start text-sm'}>
            <thead className={'bg-muted/50'}>
              <tr>
                {[ 'data-slot', 'Part', 'Attributes now' ].map((title) => (
                  <th
                    key={title}
                    scope={'col'}
                    className={'border-b border-border px-4 py-2.5 text-start text-xs font-semibold tracking-wide text-muted-foreground uppercase'}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const state = live.get(row.slot);
                const names = [ ...new Set([ ...(row.attributes ?? []), ...(state?.attributes.keys() ?? []) ]) ];

                return (
                  <tr
                    key={row.slot}
                    tabIndex={0}
                    aria-label={`${row.slot}: outline it in the example`}
                    data-active={highlighted === row.slot || undefined}
                    onMouseEnter={() => setHovered(row.slot)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setFocused(row.slot)}
                    onBlur={() => setFocused(null)}
                    className={'cursor-default border-b border-border outline-none last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40 data-active:bg-muted/40'}
                  >
                    <td className={'px-4 py-3 align-top'}>
                      <Stack gap={'xs'}>
                        <code className={'font-mono text-sm whitespace-nowrap text-foreground'}>{row.slot}</code>
                        <span className={'text-xs text-muted-foreground'}>
                          {state?.count ? `${state.count} in the example` : 'not in the DOM now'}
                        </span>
                      </Stack>
                    </td>
                    <td className={'px-4 py-3 align-top text-muted-foreground'}>
                      <span className={'block min-w-48'}>{row.part}</span>
                    </td>
                    <td className={'px-4 py-3 align-top'}>
                      {names.length ? (
                        <Cluster gap={'xs'} className={'min-w-48'}>
                          {names.map((name) => {
                            const values = state?.attributes.get(name);

                            return (
                              <code
                                key={name}
                                className={cn(
                                  'rounded-sm px-1.5 py-0.5 font-mono text-xs',
                                  values ? 'bg-primary-soft text-primary-soft-foreground' : 'bg-muted text-muted-foreground/70'
                                )}
                              >
                                {values ? `${name}=${values.map((value) => `"${value}"`).join(' | ')}` : name}
                              </code>
                            );
                          })}
                        </Cluster>
                      ) : <span aria-label={'none'} className={'text-muted-foreground'}>–</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      <Stack gap={'md'} className={'rounded-xl border border-border p-4 sm:p-5'}>
        <Stack gap={'xs'}>
          <span className={'text-sm font-semibold text-foreground'}>Try a rule</span>
          <span className={'text-sm text-muted-foreground'}>
            Pick a part and, if you like, a state; the declarations apply to the example above only, as the same
            rule in your stylesheet would apply to every one.
          </span>
        </Stack>
        <Stack columns={{ base: 1, md: 2 }} gap={'md'}>
          <Stack gap={'xs'}>
            <Label as={'span'} emphasis={'quiet'}>Part</Label>
            <Select
              aria-label={'Part'}
              options={rows.map((row) => ({ value: row.slot, label: row.slot }))}
              value={ruleSlot}
              onValueChange={handleRuleSlot}
              required
              labels={SELECT_LABELS}
            />
          </Stack>
          <Stack gap={'xs'}>
            <Label as={'span'} emphasis={'quiet'}>State</Label>
            <Select
              aria-label={'State'}
              options={attributeOptions}
              value={ruleAttribute}
              onValueChange={setRuleAttribute}
              placeholder={'Any state'}
              labels={SELECT_LABELS}
            />
          </Stack>
        </Stack>
        <Stack gap={'xs'}>
          <Label as={'span'} emphasis={'quiet'}>Declarations</Label>
          <Textarea
            aria-label={'Declarations'}
            value={declarations}
            onChange={handleDeclarations}
            placeholder={DECLARATIONS_PLACEHOLDER}
            rows={3}
            className={'font-mono'}
          />
        </Stack>
        <Stack gap={'xs'}>
          <Cluster justify={'between'}>
            <Label as={'span'} emphasis={'quiet'}>In your stylesheet</Label>
            <Button size={'sm'} fill={'plain'} tone={'muted'} disabled={!declarations} onClick={() => setDeclarations('')}>Clear</Button>
          </Cluster>
          <pre className={'overflow-x-auto rounded-md bg-muted/60 px-3 py-2 font-mono text-xs text-foreground'}>
            {`${selector} {\n  ${(cleanDeclarations(declarations).trim() || DECLARATIONS_PLACEHOLDER).split('\n').join('\n  ')}\n}`}
          </pre>
          <span className={'text-xs text-muted-foreground'}>
            Plain CSS, after the import of the stylesheet. It wins over the component’s classes with no{' '}
            <InlineCode>!important</InlineCode>: they sit in a layer, and a rule outside every layer beats them.
          </span>
        </Stack>
      </Stack>

      {boxes.length > 0 && (
        <div aria-hidden className={'pointer-events-none fixed inset-0 z-tooltip'}>
          {boxes.map((box, index) => (
            <div
              key={index}
              className={'absolute rounded-sm outline-2 outline-offset-1 outline-primary bg-primary/10'}
              style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
            >
              {index === 0 && (
                <span className={'absolute -top-6 left-0 rounded-sm bg-primary px-1.5 py-0.5 font-mono text-2xs whitespace-nowrap text-primary-foreground'}>
                  {highlighted}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Stack>
  );

}

SlotsInspector.displayName = 'SlotsInspector';
