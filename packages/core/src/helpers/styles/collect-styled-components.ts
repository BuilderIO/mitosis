import { camelCase } from 'lodash';
import traverse from 'neotraverse';
import hash from 'object-hash';
import { MitosisComponent } from '../../types/mitosis-component';
import { capitalize } from '../capitalize';
import { isMitosisNode } from '../is-mitosis-node';
import { isUpperCase } from '../is-upper-case';
import {
  getNestedSelectors,
  getStylesOnly,
  nodeHasCss,
  parseCssObject,
  styleMapToCss,
} from './helpers';

export const collectStyledComponents = (json: MitosisComponent): string => {
  let styledComponentsCode = '';

  const componentIndexes: { [className: string]: number | undefined } = {};
  const componentHashes: { [className: string]: string | undefined } = {};

  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      if (nodeHasCss(item)) {
        const value = parseCssObject(item.bindings.css?.code as string);
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
          const ${className} = ${prefix}${str}\`;
        `;
      }
      delete item.bindings.css;
    }
  });

  return styledComponentsCode;
};
