import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster, Stack } from '@proedis/ui/layout';

import { breakpointAt, FRAME_MAX_WIDTH, FRAME_MIN_WIDTH, PRESETS, PREVIEW_PREFIX, readHeightMessage } from './frame';


/* --------
 * Types Definition
 * -------- */

interface ResizableFrameProps {
  /** The id of the example module: the preview route loads it by this */
  id: string;

  /** The name of the file, for the title of the frame */
  file: string;

  /** Where the preview places the example */
  align: 'center' | 'start' | 'stretch';

  /** Classes for the preview pane inside the frame */
  previewClassName?: string;
}


/* --------
 * Constants Definition
 * -------- */

/** The room on the trailing edge where the handle lives, outside the frame */
const HANDLE_WIDTH = 16;

/** The height of the frame until its content reports one: the height of an empty preview pane */
const INITIAL_HEIGHT = 144;

const STEP = 16;

const LARGE_STEP = 64;


/* --------
 * Helpers
 * -------- */

function clamp(value: number): number {
  return Math.min(FRAME_MAX_WIDTH, Math.max(FRAME_MIN_WIDTH, Math.round(value)));
}


/* --------
 * Component Definition
 * -------- */

/**
 * An example inside a frame whose width the reader chooses, so its responsive classes answer to that
 * width and not to the window's. The frame is an iframe of the same site, on the preview route of the
 * example: Tailwind's breakpoints are media queries, and only a viewport of its own makes one of them
 * fire for a box narrower than the window.
 *
 * The width comes from the handle on the trailing edge (pointer or keyboard) or from a preset. A width
 * wider than the column is drawn scaled down, and the readout says so. The frame reports the height of
 * its content, so nothing scrolls inside it.
 */
export function ResizableFrame(props: ResizableFrameProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { align, file, id, previewClassName } = props;


  // ----
  // Internal State
  // ----

  /** The chosen width, or `null` for the whole column, which follows the column as it changes */
  const [ chosenWidth, setChosenWidth ] = React.useState<number | null>(null);
  const [ columnWidth, setColumnWidth ] = React.useState<number | null>(null);
  const [ contentHeight, setContentHeight ] = React.useState(INITIAL_HEIGHT);
  const [ dragging, setDragging ] = React.useState(false);


  // ----
  // Internal Refs
  // ----
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef<HTMLIFrameElement | null>(null);
  const dragRef = React.useRef<{ startX: number; startWidth: number } | null>(null);


  // ----
  // Layout Computation
  // ----

  /** The widest the frame can be drawn at its real size: the column, less the room of the handle */
  const available = columnWidth === null ? null : Math.max(FRAME_MIN_WIDTH, columnWidth - HANDLE_WIDTH);
  const width = chosenWidth ?? available ?? FRAME_MIN_WIDTH;
  const scale = available !== null && width > available ? available / width : 1;
  const breakpoint = breakpointAt(width);


  // ----
  // Memoized Data
  // ----
  const src = React.useMemo(() => {
    const search = new URLSearchParams({ align });

    if (previewClassName) {
      search.set('class', previewClassName);
    }

    return `${PREVIEW_PREFIX}${id}?${search.toString()}`;
  }, [ align, id, previewClassName ]);


  // ----
  // Lifecycle Events
  // ----

  /**
   * The width of the column, which is the default width of the frame and the limit of its real size:
   * measured once before the first paint, so the frame never shows at another width, then followed
   */
  React.useLayoutEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return undefined;
    }

    setColumnWidth(stage.clientWidth);

    const observer = new ResizeObserver(([ entry ]) => setColumnWidth(Math.floor(entry.contentRect.width)));
    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  /** The height of the content, from the frame */
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) {
        return;
      }

      const height = readHeightMessage(event.data);

      if (height !== undefined) {
        setContentHeight(height);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);


  // ----
  // Handlers
  // ----
  const handlePointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startWidth: Math.min(width, available ?? width) };
    setDragging(true);
  }, [ available, width ]);

  /** A drag stays within the column: wider than that is a preset or the keyboard, drawn scaled */
  const handlePointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    setChosenWidth(Math.min(clamp(drag.startWidth + event.clientX - drag.startX), available ?? FRAME_MAX_WIDTH));
  }, [ available ]);

  const handlePointerUp = React.useCallback(() => {
    dragRef.current = null;
    setDragging(false);
  }, []);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? LARGE_STEP : STEP;
    const next = {
      ArrowLeft : width - step,
      ArrowDown : width - step,
      ArrowRight: width + step,
      ArrowUp   : width + step,
      Home      : FRAME_MIN_WIDTH,
      End       : FRAME_MAX_WIDTH
    }[event.key];

    if (next !== undefined) {
      event.preventDefault();
      setChosenWidth(clamp(next));
    }
  }, [ width ]);


  // ----
  // Component Render
  // ----
  return (
    <div data-slot={'example-frame'}>
      <Stack
        direction={'horizontal'}
        align={'center'}
        justify={'between'}
        wrap
        gap={2}
        className={'rounded-t-xl border border-b-0 border-border bg-muted/40 px-3 py-1.5'}
      >
        <Stack direction={'horizontal'} align={'baseline'} gap={2} className={'text-xs text-muted-foreground'} aria-live={'polite'}>
          <span className={'font-mono text-foreground tabular-nums'}>{width}px</span>
          <span className={'font-mono font-semibold text-primary'}>{breakpoint}</span>
          {scale < 1 && <span>shown at {Math.round(scale * 100)}%</span>}
        </Stack>

        <Cluster gap={1} role={'group'} aria-label={'Preview width'}>
          {PRESETS.map((preset) => (
            <Button
              key={preset.name}
              size={'sm'}
              fill={breakpoint === preset.name ? 'soft' : 'plain'}
              tone={breakpoint === preset.name ? 'primary' : 'muted'}
              className={'min-w-0 px-2 font-mono'}
              aria-label={`${preset.name}, ${preset.width} pixels`}
              onClick={() => setChosenWidth(preset.width)}
            >
              {preset.name}
            </Button>
          ))}
          <Button
            size={'sm'}
            fill={chosenWidth === null ? 'soft' : 'plain'}
            tone={chosenWidth === null ? 'primary' : 'muted'}
            className={'min-w-0 px-2'}
            onClick={() => setChosenWidth(null)}
          >
            Fit
          </Button>
        </Cluster>
      </Stack>

      <div
        ref={stageRef}
        data-slot={'example-frame-stage'}
        className={'relative overflow-hidden border-x border-t border-border bg-muted/50'}
        style={{ height: contentHeight * scale }}
      >
        <iframe
          ref={frameRef}
          src={src}
          title={`Example ${file}`}
          loading={'lazy'}
          className={'absolute start-0 top-0 block border-0 bg-background'}
          style={{
            width,
            height         : contentHeight,
            transform      : scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top left',
            pointerEvents  : dragging ? 'none' : undefined
          }}
        />

        <div
          role={'separator'}
          tabIndex={0}
          aria-orientation={'vertical'}
          aria-label={'Width of the preview'}
          aria-valuenow={width}
          aria-valuemin={FRAME_MIN_WIDTH}
          aria-valuemax={FRAME_MAX_WIDTH}
          aria-valuetext={`${width} pixels, ${breakpoint}`}
          data-slot={'example-frame-handle'}
          data-dragging={dragging || undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          className={[
            'group/handle absolute top-0 bottom-0 w-4 cursor-ew-resize touch-none border-s border-border bg-muted outline-none',
            'hover:bg-muted-foreground/15 focus-visible:bg-primary/15 data-dragging:bg-primary/15'
          ].join(' ')}
          style={{ insetInlineStart: Math.min(width, available ?? width) }}
        >
          <span
            aria-hidden
            className={'absolute top-1/2 left-1/2 h-8 w-1 -translate-1/2 rounded-full bg-muted-foreground/40 group-hover/handle:bg-muted-foreground/70'}
          />
        </div>
      </div>
    </div>
  );

}

ResizableFrame.displayName = 'ResizableFrame';
