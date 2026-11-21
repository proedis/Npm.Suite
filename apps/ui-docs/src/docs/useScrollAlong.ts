import * as React from 'react';


/* --------
 * Hook Definition
 * -------- */

/**
 * A sticky column taller than the window, moved by the scroll of the page instead of a scroll of its own.
 *
 * The column scrolls with the page until its far edge reaches the window, then stays there; turned the
 * other way, it scrolls back with the page until its top reaches `offset`, then stays there. The page is
 * the only scroll, so the wheel reaches every entry wherever the pointer is, and the column is never
 * left behind on a long page. A column shorter than the window simply sticks at `offset`.
 *
 * It works by moving the sticky `top`: between `offset` and the height of the window less the height of
 * the column, by the distance the page scrolled. A sticky box never rises above its place in the flow, so
 * at the top of the page the column always starts from its own top.
 *
 * @param ref    The sticky element
 * @param offset Its `top` while stuck to the top of the window, in pixels: the height of the bar above it
 */
export function useScrollAlong(ref: { readonly current: HTMLElement | null }, offset: number): void {

  React.useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    let top = offset;
    let lastY = window.scrollY;

    /** The lowest `top` can go: the far edge of the column on the far edge of the window */
    const floor = (): number => Math.min(offset, window.innerHeight - element.offsetHeight);

    const place = (next: number): void => {
      top = Math.min(offset, Math.max(floor(), next));
      element.style.top = `${top}px`;
    };

    const handleScroll = (): void => {
      const y = window.scrollY;
      place(top - (y - lastY));
      lastY = y;
    };

    /** A resize of the window or of the column keeps the offset, within the new bounds */
    const handleResize = (): void => place(top);

    place(top);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(handleResize);
    observer.observe(element);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      element.style.top = '';
    };
  }, [ ref, offset ]);

}
