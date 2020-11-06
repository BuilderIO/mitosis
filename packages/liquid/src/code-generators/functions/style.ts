import { mapToCss } from './map-to-css';
import { StringMap } from '../interfaces/string-map';

export function style(map: Partial<CSSStyleDeclaration>) {
  return mapToCss(map as StringMap, 0);
}
