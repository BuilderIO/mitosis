import json5 from 'json5';
import { MitosisNode } from '../..';
import { dashCase } from '../../helpers/dash-case';
import { INDENT, NL, SrcBuilder, UNINDENT, WS } from './src-generator';

export type CssStyles = {
  CLASS_NAME: string;
} & Record<string, string>;

export function collectStyles(
  children: MitosisNode[],
  styleMap: Map<string, CssStyles>,
): Map<string, CssStyles> {
  const nodes = [...children];
  while (nodes.length) {
    const child = nodes.shift()!;
    nodes.push(...child.children);
    const css = child.bindings.css;
    if (css && typeof css == 'string') {
      const value = { CLASS_NAME: 'c' + hashCode(css), ...json5.parse(css) };
      styleMap.set(css, value);
    }
  }
  return styleMap;
}

function hashCode(text: string) {
  var hash = 0,
    i,
    chr;
  if (text.length === 0) return hash;
  for (i = 0; i < text.length; i++) {
    chr = text.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Number(Math.abs(hash)).toString(36);
}

export function renderStyles(styles: Map<string, CssStyles>) {
  return function(this: SrcBuilder) {
    this.emit('`', NL, INDENT);
    const mediaStyles: (string | object)[] = [];
    styles.forEach((styles) => {
      this.emit('.', styles.CLASS_NAME, /*'.🏷️�', WS,*/ '{', NL, INDENT);
      for (const key in styles) {
        if (
          key !== 'CLASS_NAME' &&
          Object.prototype.hasOwnProperty.call(styles, key)
        ) {
          const value = styles[key];
          if (value && typeof value == 'object') {
            mediaStyles.push(styles.CLASS_NAME, key, value);
          } else {
            this.emit(dashCase(key), ':', WS, value, ';', NL);
          }
        }
      }
      this.emit(UNINDENT, '}', NL);
    });
    while (mediaStyles.length) {
      const className: string = mediaStyles.shift() as string;
      const mediaKey: string = mediaStyles.shift() as string;
      const mediaObj: Record<string, string> = mediaStyles.shift() as Record<
        string,
        string
      >;
      this.emit(mediaKey, WS, '{', INDENT, NL);
      this.emit('.', className, /*'.🏷️�', WS,*/ '{', NL, INDENT);
      for (const key in mediaObj) {
        if (Object.prototype.hasOwnProperty.call(mediaObj, key)) {
          const value = mediaObj[key];
          this.emit(dashCase(key), ':', WS, value, ';', NL);
        }
      }
      this.emit(UNINDENT, '}', NL);
      this.emit(UNINDENT, '}', NL);
    }
    this.emit(UNINDENT, '`');
  };
}
