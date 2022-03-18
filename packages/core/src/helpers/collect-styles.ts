import * as CSS from 'csstype';
import json5 from 'json5';
import { camelCase, pickBy } from 'lodash';
import { MitosisNode } from '../types/mitosis-node';
import traverse from 'traverse';
import { MitosisComponent } from '../types/mitosis-component';
import { capitalize } from './capitalize';
import { dashCase } from './dash-case';
import { isMitosisNode } from './is-mitosis-node';
import { isUpperCase } from './is-upper-case';
import hash from 'object-hash';

export const nodeHasStyles = (node: MitosisNode) => {
  return Boolean(
    typeof node.bindings.css === 'string' &&
      node.bindings.css.trim().length > 6,
  );
};

export const hasStyles = (component: MitosisComponent) => {
  let hasStyles = false;

  traverse(component).forEach(function(item) {
    if (isMitosisNode(item)) {
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

type CollectStyleOptions = {
  classProperty?: 'class' | 'className';
  prefix?: string;
};

export const collectStyledComponents = (json: MitosisComponent): string => {
  let styledComponentsCode = '';

  const componentIndexes: { [className: string]: number | undefined } = {};
  const componentHashes: { [className: string]: string | undefined } = {};

  traverse(json).forEach(function(item) {
    if (isMitosisNode(item)) {
      if (nodeHasStyles(item)) {
        const value = parseCssObject(item.bindings.css as string);
        delete item.bindings.css;

        const normalizedNameProperty = item.properties.$name
          ? capitalize(camelCase(item.properties.$name.replace(/[^a-z]/gi, '')))
          : null;

        const componentName = normalizedNameProperty
          ? normalizedNameProperty
          : /^h\d$/.test(item.name || '')
          ? item.name
          : capitalize(camelCase(item.name || 'div'));

        const index = (componentIndexes[componentName] =
          (componentIndexes[componentName] || 0) + 1);
        const className = `${componentName}${
          componentName !== item.name && index === 1 ? '' : index
        }`;

        let str = '';
        const styles = getStylesOnly(value);

        const stylesHash = hash(styles);
        if (stylesHash === componentHashes[componentName]) {
          return;
        }
        if (!componentHashes[componentName]) {
          componentHashes[componentName] = stylesHash;
        }
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

export const parseCssObject = (css: string) => {
  try {
    return json5.parse(css);
  } catch (e) {
    console.warn('Could not parse CSS object', css);
    throw e;
  }
};

export const collectStyles = (
  json: MitosisComponent,
  options: CollectStyleOptions = {},
): ClassStyleMap => {
  const styleMap: ClassStyleMap = {};

  const classProperty = options.classProperty || 'class';

  const componentIndexes: { [className: string]: number | undefined } = {};
  const componentHashes: { [className: string]: string | undefined } = {};

  traverse(json).forEach(function(item) {
    if (isMitosisNode(item)) {
      if (nodeHasStyles(item)) {
        const value = parseCssObject(item.bindings.css as string);
        delete item.bindings.css;
        const componentName = item.properties.$name
          ? dashCase(item.properties.$name)
          : /^h\d$/.test(item.name || '') // don't dashcase h1 into h-1
          ? item.name
          : dashCase(item.name || 'div');

        const stylesHash = hash(value);
        if (componentHashes[componentName] === stylesHash) {
          const className = `${componentName}${
            options.prefix ? `-${options.prefix}` : ''
          }`;
          item.properties[classProperty] = `${item.properties[classProperty] ||
            ''} ${className}`
            .trim()
            .replace(/\s{2,}/g, ' ');
          return;
        }

        if (!componentHashes[componentName]) {
          componentHashes[componentName] = stylesHash;
        }

        const index = (componentIndexes[componentName] =
          (componentIndexes[componentName] || 0) + 1);
        const className = `${componentName}${
          options.prefix ? `-${options.prefix}` : ''
        }${index === 1 ? '' : `-${index}`}`;

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
  json: MitosisComponent,
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
