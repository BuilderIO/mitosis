import { JSON } from '../types/json';

export type JSXLiteContext = {
  '@type': '@jsx-lite/context';
  name: string;
  members: { [key: string]: JSON | undefined };
};
