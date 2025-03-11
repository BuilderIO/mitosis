import { objectHasKey } from '@/helpers/typescript';

export const JSX_TO_HTML_ATTR = {
  for: 'htmlFor',
};

export const transformAttributeToJSX = (key: string) => {
  if (objectHasKey(JSX_TO_HTML_ATTR, key)) return JSX_TO_HTML_ATTR[key];
  return key;
};
