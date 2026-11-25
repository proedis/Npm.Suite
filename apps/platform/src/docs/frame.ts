/* --------
 * Constants Definition
 * -------- */

/** The message a preview frame sends to the page around it, with the height of its content */
export const FRAME_HEIGHT_MESSAGE = 'platform:frame-height';

/** Where the preview of an example is served: `/preview/<id>`, with the id of its module */
export const PREVIEW_PREFIX = '/preview/';

/** The narrowest and widest a frame can be made, in CSS pixels */
export const FRAME_MIN_WIDTH = 320;

export const FRAME_MAX_WIDTH = 1600;

/** The breakpoints of Tailwind the package declares, with the width each one starts at */
export const BREAKPOINTS = [
  { name: 'sm', width: 640 },
  { name: 'md', width: 768 },
  { name: 'lg', width: 1024 },
  { name: 'xl', width: 1280 },
  { name: '2xl', width: 1536 }
] as const;

/** The presets of a frame: a phone for `base`, then each breakpoint where it starts */
export const PRESETS: readonly { readonly name: string; readonly width: number }[] = [
  { name: 'base', width: 375 },
  ...BREAKPOINTS
];


/* --------
 * Helpers
 * -------- */

/** The breakpoint active at a width: the widest one it reaches, or `base` */
export function breakpointAt(width: number): string {
  return [ ...BREAKPOINTS ].reverse().find((breakpoint) => width >= breakpoint.width)?.name ?? 'base';
}

/** The message a frame posts, or nothing when the data is something else */
export function readHeightMessage(data: unknown): number | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }

  const { height, type } = data as { type?: unknown; height?: unknown };
  return type === FRAME_HEIGHT_MESSAGE && typeof height === 'number' ? height : undefined;
}
