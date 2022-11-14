// helper functions for strings
import { camelCase } from 'lodash';

export function uniqueName(existingItems: string[], reference: string) {
  let index = 0;
  let match = false;

  while (false === match) {
    if (!existingItems.includes(reference)) {
      match = true;
      break;
    }

    index++;
  }

  return camelCase(`${reference}${index}`);
}

export function insertAt(string_: string, sub: string, pos: number) {
  return `${string_.slice(0, pos)}${sub}${string_.slice(pos)}`;
}

export function stripQuotes(string_: string) {
  return string_.replace(/["']+/g, '');
}
