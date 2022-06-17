import { useRef, useEffect } from 'react';

export function useEventListener<EventType extends Event = Event>(
  element: EventTarget,
  eventName: string,
  handler: (event: EventType) => void,
  listenerOptions?: AddEventListenerOptions,
) {
  const { once, passive } = listenerOptions || {};
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) => savedHandler.current(event as EventType);

    element.addEventListener(eventName, eventListener, { once, passive });

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element, once, passive]);
}
