import { useEnhancedEffect } from './useEnhancedEffect';
import { useSyncedRef } from './useSyncedRef';


/** The default events name to listen to */
const DEFAULT_EVENTS: ReadonlyArray<keyof HTMLElementEventMap> = [
  'mousedown',
  'touchstart'
];


/**
 * Use this hook to fire an event every time a click occurs outside
 * the provided target element
 *
 * The target is typed as the minimal structural shape the hook actually reads instead of
 * 'React.RefObject<T> | React.MutableRefObject<T>'. Those aliases changed meaning between
 * @types/react 18 and 19: in 19 'useRef<T>(null)' yields 'RefObject<T | null>', which no
 * longer satisfies 'RefObject<T>' and made every call site fail to compile. The
 * implementation already null-checks 'current', so admitting it in the type costs nothing.
 *
 * @param target
 * @param callback
 * @param events
 */
export function useClickOutside<T extends HTMLElement>(
  target: { readonly current: T | null | undefined },
  callback: EventListener,
  events: ReadonlyArray<keyof HTMLElementEventMap> = DEFAULT_EVENTS
) {

  /** Wrap dependent data into synced ref to maintain immutable */
  const targetElement = useSyncedRef(target);
  const callbackFunction = useSyncedRef(callback);

  /** Use the Enhanced Effect to attach event listeners */
  useEnhancedEffect(
    () => {

      /**
       * Internal function used to check if the event
       * target received from the listener it is contained within the
       * requested target element provided within the hook
       *
       * @param event HTML Event received
       */
      function handler(this: HTMLElement, event: Event) {
        /** Assert the target element exists */
        if (!targetElement.current.current) {
          return;
        }

        /** Extract the event target */
        const { target: eventTarget } = event;
        const cb = callbackFunction.current;

        if (
          !eventTarget
          || (!!eventTarget && !targetElement.current.current.contains(eventTarget as Node))) {
          /** Call the callback */
          cb.call(this, event);
        }
      }

      /** Attach the events on all requested keys */
      events.forEach((eventName) => {
        /** List for event directly on document element */
        document.addEventListener(eventName, handler, { passive: true });
      });

      /** On effect clear, remove all events */
      return () => {
        events.forEach((eventName) => {
          /** List for event directly on document element */
          document.removeEventListener(eventName, handler);
        });
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ callbackFunction, targetElement, ...events ]
  );

}
