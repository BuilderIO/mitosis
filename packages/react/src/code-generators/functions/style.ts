import { mapToCss } from './map-to-css';
import { StringMap } from '../interfaces/string-map';
import { BuilderToJsxOptions } from '../../builder-to-jsx';

export function style(
  map: Partial<CSSStyleDeclaration> & { [key: string]: Partial<CSSStyleDeclaration> },
  options: BuilderToJsxOptions
) {
  if (options.format === 'react') {
    return `css={${JSON.stringify(map)}}`;
  }
  return `style="${mapToCss(map as StringMap, 0)}"`;
}
