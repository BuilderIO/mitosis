import { isBrowser } from './is-browser';
import { isReactNative } from './is-react-native';

export function track(event: string, properties: Record<string, any>) {
  if (!(isBrowser() || isReactNative())) {
    return;
  }

  return fetch(`http://example.com/api/track`, {
    method: 'POST',
    body: JSON.stringify({ events: [{ type: event, data: properties }] }),
    headers: {
      'content-type': 'application/json',
    },
    mode: 'cors',
  });
}
