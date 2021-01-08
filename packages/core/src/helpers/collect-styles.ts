import * as CSS from 'csstype';
import dedent from 'dedent';
import json5 from 'json5';
import { camelCase, pickBy } from 'lodash';
import { JSXLiteNode } from 'src/types/jsx-lite-node';
import traverse from 'traverse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { capitalize } from './capitalize';
import { dashCase } from './dash-case';
import { isJsxLiteNode } from './is-jsx-lite-node';
import { isUpperCase } from './is-upper-case';

export const nodeHasStyles = (node: JSXLiteNode) => {
  return Boolean(
    typeof node.bindings.css === 'string' &&
      node.bindings.css.trim().length > 6,
  );
};

export const hasStyles = (component: JSXLiteComponent) => {
  let hasStyles = false;

  traverse(component).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      if (nodeHasStyles(item)) {
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
export type StyleMap = {
  [className: string]: CSS.Properties | StyleMap;
};

/**
 * { 'my-class': { display: 'block', '&.foo': { display: 'none' } }}
 */
export type ClassStyleMap = { [key: string]: StyleMap };

type FlatClassStyleMap = { [key: string]: CSS.Properties };

type CollectStyleOptions = {
  classProperty?: 'class' | 'className';
};

export const collectStyledComponents = (json: JSXLiteComponent): string => {
  let styledComponentsCode = `import styled from 'styled-components';\n`;

  const componentIndexes: { [className: string]: number | undefined } = {};

  traverse(json).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      if (nodeHasStyles(item)) {
        const value = json5.parse(item.bindings.css as string);
        delete item.bindings.css;
        const componentName = /^h\d$/.test(item.name || '')
          ? item.name
          : capitalize(camelCase(item.name || 'div'));

        const index = (componentIndexes[componentName] =
          (componentIndexes[componentName] || 0) + 1);
        const className = `${componentName}${index}`;

        let str = '';
        const styles = getStylesOnly(value);
        str += `${styleMapToCss(styles)}\n`;
        const nestedSelectors = getNestedSelectors(value);
        for (const nestedSelector in nestedSelectors) {
          const value = nestedSelectors[nestedSelector] as any;
          str += `${nestedSelector} { ${styleMapToCss(value)} }`;
        }

        const prefix = isUpperCase(item.name[0])
          ? `styled(${item.name})\``
          : `styled.${item.name}\``;

        item.name = className;

        styledComponentsCode += `
          const ${className} = ${prefix}${str}\`
        `;
      }
      delete item.bindings.css;
    }
  });

  return styledComponentsCode;
};

export const collectStyles = (
  json: JSXLiteComponent,
  options: CollectStyleOptions = {},
): ClassStyleMap => {
  const styleMap: ClassStyleMap = {};

  const classProperty = options.classProperty || 'class';

  const componentIndexes: { [className: string]: number | undefined } = {};

  traverse(json).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      if (nodeHasStyles(item)) {
        const value = json5.parse(item.bindings.css as string);
        delete item.bindings.css;
        const componentName = /^h\d$/.test(item.name || '') // don't dashcase h1 into h-1
          ? item.name
          : dashCase(item.name || 'div');

        const index = (componentIndexes[componentName] =
          (componentIndexes[componentName] || 0) + 1);
        const className = `${componentName}-${index}`;
        item.properties[classProperty] = `${item.properties[classProperty] ||
          ''} ${className}`
          .trim()
          .replace(/\s{2,}/g, ' ');

        styleMap[className] = value;
      }
      delete item.bindings.css;
    }
  });

  return styleMap;
};

export const collectCss = (
  json: JSXLiteComponent,
  options: CollectStyleOptions = {},
): string => {
  const styles = collectStyles(json, options);
  // TODO create and use a root selector
  return classStyleMapToCss(styles);
};

const getNestedSelectors = (map: StyleMap) => {
  return pickBy(map, (value) => typeof value === 'object');
};
const getStylesOnly = (map: StyleMap) => {
  return pickBy(map, (value) => typeof value === 'string');
};

const classStyleMapToCss = (map: ClassStyleMap): string => {
  let str = '';

  for (const key in map) {
    const styles = getStylesOnly(map[key]);
    str += `.${key} { ${styleMapToCss(styles)} }`;
    const nestedSelectors = getNestedSelectors(map[key]);
    for (const nestedSelector in nestedSelectors) {
      const value = nestedSelectors[nestedSelector] as any;
      if (nestedSelector.startsWith('@')) {
        str += `${nestedSelector} { .${key} { ${styleMapToCss(value)} } }`;
      } else {
        const useSelector = nestedSelector.includes('&')
          ? nestedSelector.replace(/&/g, `.${key}`)
          : `.${key} ${nestedSelector}`;
        str += `${useSelector} { ${styleMapToCss(value)} }`;
      }
    }
  }

  return str;
};

export const styleMapToCss = (map: StyleMap): string => {
  let str = '';

  for (const key in map) {
    const value = map[key];

    if (typeof value === 'string') {
      str += `\n${dashCase(key)}: ${value};`;
    } else {
      // TODO: do nothing
    }
  }

  return str;
};
