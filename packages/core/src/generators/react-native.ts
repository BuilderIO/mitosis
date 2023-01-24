import json5 from 'json5';
import { camelCase, size } from 'lodash';
import { fastClone } from '../helpers/fast-clone';
import traverse from 'traverse';
import { ClassStyleMap } from '../helpers/styles/helpers';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { MitosisComponent } from '../types/mitosis-component';
import { componentToReact, ToReactOptions } from './react';
import { BaseTranspilerOptions, TranspilerGenerator } from '../types/transpiler';
import { Plugin } from '..';
import { createSingleBinding } from '../helpers/bindings';

export interface ToReactNativeOptions extends BaseTranspilerOptions {
  stylesType?: 'emotion' | 'react-native';
  stateType?: 'useState' | 'mobx' | 'valtio' | 'solid' | 'builder';
}

const stylePropertiesThatMustBeNumber = new Set(['lineHeight']);

const MEDIA_QUERY_KEY_REGEX = /^@media.*/;

export const collectReactNativeStyles = (json: MitosisComponent): ClassStyleMap => {
  const styleMap: ClassStyleMap = {};

  const componentIndexes: { [className: string]: number | undefined } = {};

  traverse(json).forEach(function (item) {
    if (!isMitosisNode(item) || typeof item.bindings.css?.code !== 'string') {
      return;
    }
    const value = json5.parse(item.bindings.css.code);
    delete item.bindings.css;
    if (!size(value)) {
      return;
    }

    // Style properties like `"20px"` need to be numbers like `20` for react native
    for (const key in value) {
      const propertyValue = value[key];

      if (key.match(MEDIA_QUERY_KEY_REGEX)) {
        console.warn('Unsupported: skipping media queries for react-native: ', key, propertyValue);
        delete value[key];
        continue;
      }

      if (stylePropertiesThatMustBeNumber.has(key) && typeof propertyValue !== 'number') {
        console.warn(`Style key ${key} must be a number, but had value \`${propertyValue}\``);
        delete value[key];
        continue;
      }

      // convert strings to number if applicable
      if (typeof propertyValue === 'string' && propertyValue.match(/^\d/)) {
        const newValue = parseFloat(propertyValue);
        if (!isNaN(newValue)) {
          value[key] = newValue;
        }
      }
    }
    const componentName = camelCase(item.name || 'view');
    const index = (componentIndexes[componentName] = (componentIndexes[componentName] || 0) + 1);
    const className = `${componentName}${index}`;
    item.bindings.style = createSingleBinding({ code: `styles.${className}` });

    styleMap[className] = value;
  });

  return styleMap;
};

/**
 * Plugin that handles necessary transformations from React to React Native:
 * - Converts DOM tags to <View /> and <Text />
 * - Removes redundant `class`/`className` attributes
 */
const PROCESS_REACT_NATIVE_PLUGIN: Plugin = () => ({
  json: {
    pre: (json: MitosisComponent) => {
      traverse(json).forEach((node) => {
        if (isMitosisNode(node)) {
          // TODO: handle TextInput, Image, etc
          if (node.name.toLowerCase() === node.name) {
            node.name = 'View';
          }

          if (node.properties._text?.trim().length || node.bindings._text?.code?.trim()?.length) {
            node.name = 'Text';
          }

          if (node.properties.class) {
            delete node.properties.class;
          }
          if (node.properties.className) {
            delete node.properties.className;
          }
          if (node.bindings.class) {
            delete node.bindings.class;
          }
          if (node.bindings.className) {
            delete node.bindings.className;
          }
        }
      });
    },
  },
});

const DEFAULT_OPTIONS: ToReactNativeOptions = {
  stateType: 'useState',
  stylesType: 'react-native',
  plugins: [PROCESS_REACT_NATIVE_PLUGIN],
};

export const componentToReactNative: TranspilerGenerator<ToReactNativeOptions> =
  (_options = {}) =>
  ({ component, path }) => {
    const json = fastClone(component);

    const options: ToReactOptions = {
      ...DEFAULT_OPTIONS,
      ..._options,
      plugins: [...(DEFAULT_OPTIONS.plugins || []), ...(_options.plugins || [])],
      type: 'native',
    };

    return componentToReact(options)({ component: json, path });
  };
