import { createSingleBinding } from '@/helpers/bindings';
import { fastClone } from '@/helpers/fast-clone';
import isChildren from '@/helpers/is-children';
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import { mergeOptions } from '@/helpers/merge-options';
import { ClassStyleMap } from '@/helpers/styles/helpers';
import { Dictionary } from '@/helpers/typescript';
import { MitosisComponent } from '@/types/mitosis-component';
import { BaseTranspilerOptions, TranspilerGenerator } from '@/types/transpiler';
import json5 from 'json5';
import { camelCase, size } from 'lodash';
import traverse from 'traverse';
import { MitosisNode, Plugin } from '../..';
import { VALID_HTML_TAGS } from '../../constants/html_tags';
import { componentToReact } from '../react';
import { sanitizeReactNativeBlockStyles } from './sanitize-react-native-block-styles';

export interface ToReactNativeOptions extends BaseTranspilerOptions {
  stylesType: 'emotion' | 'react-native';
  stateType: 'useState' | 'mobx' | 'valtio' | 'solid' | 'builder';
}

const stylePropertiesThatMustBeNumber = new Set(['lineHeight']);

const MEDIA_QUERY_KEY_REGEX = /^@media.*/;

const sanitizeStyle = (obj: any) => (key: string, value: string) => {
  const propertyValue = obj[key];

  if (key.match(MEDIA_QUERY_KEY_REGEX)) {
    console.warn('Unsupported: skipping media queries for react-native: ', key, propertyValue);
    delete obj[key];
    return;
  }
};

export const collectReactNativeStyles = (json: MitosisComponent): ClassStyleMap => {
  const styleMap: ClassStyleMap = {};

  const componentIndexes: Dictionary<number | undefined> = {};
  const getStyleSheetName = (item: MitosisNode) => {
    const componentName = camelCase(item.name || 'view');
    // If we have already seen this component name, we will increment the index. Otherwise, we will set the index to 1.
    const index = (componentIndexes[componentName] = (componentIndexes[componentName] || 0) + 1);
    return `${componentName}${index}`;
  };
  traverse(json).forEach(function (item) {
    if (!isMitosisNode(item)) {
      return;
    }
    let cssValue = json5.parse(item.bindings.css?.code || '{}');
    delete item.bindings.css;

    if (size(cssValue)) {
      // Style properties like `"20px"` need to be numbers like `20` for react native
      for (const key in cssValue) {
        sanitizeStyle(cssValue)(key, cssValue[key]);
        cssValue = sanitizeReactNativeBlockStyles(cssValue);
      }
    }

    try {
      let styleValue = json5.parse(item.bindings.style?.code || '{}');
      if (size(styleValue)) {
        // Style properties like `"20px"` need to be numbers like `20` for react native
        for (const key in styleValue) {
          sanitizeStyle(styleValue)(key, styleValue[key]);
          styleValue = sanitizeReactNativeBlockStyles(styleValue);
        }

        item.bindings.style!.code = json5.stringify(styleValue);
      }
    } catch (e) {}

    if (!size(cssValue)) {
      return;
    }

    const styleSheetName = getStyleSheetName(item);
    const styleSheetAccess = `styles.${styleSheetName}`;
    styleMap[styleSheetName] = cssValue;

    if (!item.bindings.style) {
      item.bindings.style = createSingleBinding({
        code: styleSheetAccess,
      });
      return;
    }
    try {
      // run the code below only if the style binding is a JSON object
      json5.parse(item.bindings.style.code || '{}');

      item.bindings.style = createSingleBinding({
        code:
          item.bindings.style?.code.replace(/}$/, `, ...${styleSheetAccess} }`) || styleSheetAccess,
      });
    } catch (e) {
      // if not a JSON, then it's a property, so we should spread it.
      item.bindings.style = createSingleBinding({
        code: `{
        ...${styleSheetAccess},
        ...${item.bindings.style.code}
        }`,
      });
    }
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
          if (isChildren({ node })) {
            node.name = '';
          } else if (node.name.toLowerCase() === node.name && VALID_HTML_TAGS.includes(node.name)) {
            if (node.name === 'input') {
              node.name = 'TextInput';
            } else if (node.name === 'img') {
              node.name = 'Image';
            } else if (node.name === 'a') {
              node.name = 'TouchableOpacity';
            } else if (node.name === 'button') {
              node.name = 'Button';
            }
            // if node is not button or a and still has onClick it needs to pressable
            else if (node.bindings.onClick) {
              node.name = 'Pressable';
            } else {
              node.name = 'View';
            }
          } else if (
            node.properties._text?.trim().length ||
            node.bindings._text?.code?.trim()?.length
          ) {
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

export const componentToReactNative: TranspilerGenerator<Partial<ToReactNativeOptions>> =
  (_options = {}) =>
  ({ component, path }) => {
    const json = fastClone(component);

    const options = mergeOptions(DEFAULT_OPTIONS, _options);

    return componentToReact({ ...options, type: 'native' })({ component: json, path });
  };
