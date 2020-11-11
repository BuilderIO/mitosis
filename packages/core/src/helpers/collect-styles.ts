import * as CSS from 'csstype';
import json5, { stringify } from 'json5';
import traverse from 'traverse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { dashCase } from './dash-case';
import { isJsxLiteNode } from './is-jsx-lite-node';

/**
 * e.g.:
 * {
 *  display: 'none',
 *  '@media (max-width: 500px)': {
 *    '& .sub-class': {
 *      display: 'block'
 *    }
 *  }
 * }
 */
type StyleMap = {
  [className: string]: CSS.Properties | StyleMap;
};

/**
 * { 'my-class': { display: 'block', '&.foo': { display: 'none' } }}
 */
type ClassStyleMap = { [key: string]: StyleMap };

type FlatClassStyleMap = { [key: string]: CSS.Properties };

export const collectStyles = (json: JSXLiteComponent): ClassStyleMap => {
  const styleMap: ClassStyleMap = {};

  const componentIndexes: { [className: string]: number | undefined } = {};

  traverse(json).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      if (typeof item.bindings.css === 'string') {
        const value = json5.parse(item.bindings.css);
        delete item.bindings.css;
        const componentName = dashCase(item.name || 'div');
        const index = (componentIndexes[componentName] =
          (componentIndexes[componentName] || 0) + 1);
        const className = `${componentName}-${index}`;
        item.properties.class = `${item.properties.class || ''} ${className}`
          .trim()
          .replace(/\s{2,}/g, ' ');

        styleMap[className] = value;
      }
    }
  });

  return styleMap;
};

export const collectCss = (json: JSXLiteComponent): string => {
  const styles = collectStyles(json);
  return classStyleMapToCss(styles);
};

const classStyleMapToCss = (map: ClassStyleMap): string => {
  let str = '';

  for (const key in map) {
    str += `.${key} { 
      ${styleMapToCss(map[key], `.${key}`)}
     }`;
  }
  return str;
};

// TODO: use this for recursion - aka flatten all nested selectors into one
// long one
const flattenClassStyleMap = (map: ClassStyleMap): FlatClassStyleMap => {
  const flattenedStyleMap: FlatClassStyleMap = {};
  return flattenedStyleMap;
};

export const styleMapToCss = (map: StyleMap, rootSelector = ''): string => {
  let str = '';

  for (const key in map) {
    const value = map[key];

    if (typeof value === 'string') {
      str += `\n${key.replace(/&/g, rootSelector)}: ${value};`;
    } else {
      // TODO: recursion
    }
  }

  return str;
};
