import * as CSS from 'csstype';
import json5, { stringify } from 'json5';
import traverse from 'traverse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { dashCase } from './dash-case';
import { isJsxLiteNode } from './is-jsx-lite-node';

export const hasStyles = (component: JSXLiteComponent) => {
  let hasStyles = false;

  traverse(component).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      if (item.bindings.css) {
        hasStyles = true;
        this.stop();
      }
    }
  });
  return hasStyles;
};

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

type CollectStyleOptions = {
  classProperty?: 'class' | 'className';
};

export const collectStyles = (
  json: JSXLiteComponent,
  options: CollectStyleOptions = {},
): ClassStyleMap => {
  const styleMap: ClassStyleMap = {};

  const classProperty = options.classProperty || 'class';

  const componentIndexes: { [className: string]: number | undefined } = {};

  traverse(json).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      if (typeof item.bindings.css === 'string') {
        const value = json5.parse(item.bindings.css);
        delete item.bindings.css;
        const componentName = /^h\d$/.test(item.name || '') // don't dashcase h1 into h-1
          ? item.name
          : dashCase(item.name || 'div');

        const index = (componentIndexes[componentName] =
          (componentIndexes[componentName] || 0) + 1);
        const className = `${componentName}-${index}`;
        item.properties[classProperty] = `${
          item.properties[classProperty] || ''
        } ${className}`
          .trim()
          .replace(/\s{2,}/g, ' ');

        styleMap[className] = value;
      }
    }
  });

  return styleMap;
};

export const collectCss = (
  json: JSXLiteComponent,
  options: CollectStyleOptions = {},
): string => {
  const styles = collectStyles(json, options);
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
