/** Event definition type */
export type EventsDescription = Record<string, (...args: any[]) => void>;

/** Function that could be used to unsubscribe from an event */
export type EventUnsubscribe = () => void;
