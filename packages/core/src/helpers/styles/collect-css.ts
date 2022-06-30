import traverse from 'traverse';
import { MitosisComponent } from '../../types/mitosis-component';
import { dashCase } from '../dash-case';
import { isMitosisNode } from '../is-mitosis-node';
import hash from 'object-hash';
import {
  ClassStyleMap,
  getNestedSelectors,
  getStylesOnly,
  nodeHasStyles,
  parseCssObject,
  styleMapToCss,
} from './helpers';

type CollectStyleOptions = {
  prefix?: string;
};
const collectStyles = (
  json: MitosisComponent,
  options: CollectStyleOptions = {},
): ClassStyleMap => {
  const styleMap: ClassStyleMap = {};

  const componentIndexes: { [className: string]: number | undefined } = {};
  const componentHashes: { [className: string]: string | undefined } = {};

  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      if (nodeHasStyles(item)) {
        const value = parseCssObject(item.bindings.css?.code as string);
        delete item.bindings.css;
        const componentName = item.properties.$name
          ? dashCase(item.properties.$name)
          : /^h\d$/.test(item.name || '') // don't dashcase h1 into h-1
          ? item.name
          : dashCase(item.name || 'div');

        const stylesHash = hash(value);
        if (componentHashes[componentName] === stylesHash) {
          const className = `${componentName}${options.prefix ? `-${options.prefix}` : ''}`;
          item.properties.class = `${item.properties.class || ''} ${className}`
            .trim()
            .replace(/\s{2,}/g, ' ');
          return;
        }

        if (!componentHashes[componentName]) {
          componentHashes[componentName] = stylesHash;
        }

        const index = (componentIndexes[componentName] =
          (componentIndexes[componentName] || 0) + 1);
        const className = `${componentName}${options.prefix ? `-${options.prefix}` : ''}${
          index === 1 ? '' : `-${index}`
        }`;

        item.properties.class = `${item.properties.class || ''} ${className}`
          .trim()
          .replace(/\s{2,}/g, ' ');

        styleMap[className] = value;
      }
      delete item.bindings.css;
    }
  });

  return styleMap;
};

export const collectCss = (json: MitosisComponent, options: CollectStyleOptions = {}): string => {
  const styles = collectStyles(json, options);
  // TODO create and use a root selector
  return classStyleMapToCss(styles);
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
