import * as CSS from 'csstype';
import json5 from 'json5';
import { pickBy } from 'lodash';
import traverse from 'neotraverse';
import { MitosisComponent } from '../../types/mitosis-component';
import { MitosisNode } from '../../types/mitosis-node';
import { dashCase } from '../dash-case';
import { isMitosisNode } from '../is-mitosis-node';
import { isUpperCase } from '../is-upper-case';

export const nodeHasCss = (node: MitosisNode) => {
  return Boolean(
    typeof node.bindings.css?.code === 'string' && node.bindings.css.code.trim().length > 6,
  );
};

export const nodeHasStyle = (node: MitosisNode) => {
  return (
    Boolean(typeof node.bindings.style?.code === 'string') ||
    Boolean(typeof node.properties.style === 'string')
  );
};

export const hasCss = (component: MitosisComponent) => {
  let hasStyles = !!component.style?.length;

  if (hasStyles) {
    return true;
  }

  traverse(component).forEach(function (item) {
    if (isMitosisNode(item)) {
      if (nodeHasCss(item)) {
        hasStyles = true;
        this.stop();
      }
    }
  });
  return hasStyles;
};

export const hasStyle = (component: MitosisComponent) => {
  let hasStyles = false;

  traverse(component).forEach(function (item) {
    if (isMitosisNode(item)) {
      if (nodeHasStyle(item)) {
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

export const getNestedSelectors = (map: StyleMap) => {
  return pickBy(map, (value) => typeof value === 'object');
};
export const getStylesOnly = (map: StyleMap) => {
  return pickBy(map, (value) => typeof value === 'string');
};

/**
 * { 'my-class': { display: 'block', '&.foo': { display: 'none' } }}
 */
export type ClassStyleMap = { [key: string]: StyleMap };

export const parseCssObject = (css: string) => {
  try {
    return json5.parse(css);
  } catch (e) {
    console.warn('Could not parse CSS object', css);
    throw e;
  }
};

const getCssPropertyName = (cssObjectKey: string) => {
  // Allow custom CSS properties
  if (cssObjectKey.startsWith('--')) {
    return cssObjectKey;
  }
  let str = dashCase(cssObjectKey);

  // Convert vendor prefixes like 'WebkitFoo' to '-webkit-foo'
  if (isUpperCase(cssObjectKey[0])) {
    str = `-${str}`;
  }
  return str;
};

export const styleMapToCss = (map: StyleMap): string => {
  return Object.entries(map)
    .filter(([key, value]) => typeof value === 'string')
    .map(([key, value]) => `  ${getCssPropertyName(key)}: ${value};`)
    .join('\n');
};
