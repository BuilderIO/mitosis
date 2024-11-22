import { ToReactNativeOptions } from '@/generators/react-native/types';
import { createSingleBinding } from '@/helpers/bindings';
import { fastClone } from '@/helpers/fast-clone';
import isChildren from '@/helpers/is-children';
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import { mergeOptions } from '@/helpers/merge-options';
import { ClassStyleMap } from '@/helpers/styles/helpers';
import { Dictionary } from '@/helpers/typescript';
import { MitosisComponent } from '@/types/mitosis-component';
import { TranspilerGenerator } from '@/types/transpiler';
import json5 from 'json5';
import { camelCase, size } from 'lodash';
import traverse from 'neotraverse/legacy';
import { MitosisNode, MitosisPlugin } from '../..';
import { VALID_HTML_TAGS } from '../../constants/html_tags';
import { ToReactOptions, componentToReact } from '../react';
import { sanitizeReactNativeBlockStyles } from './sanitize-react-native-block-styles';

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

export const collectReactNativeStyles = (
  json: MitosisComponent,
  options: ToReactOptions,
): ClassStyleMap => {
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
        cssValue = sanitizeReactNativeBlockStyles(cssValue, options);
      }
    }

    try {
      let styleValue = json5.parse(item.bindings.style?.code || '{}');
      if (size(styleValue)) {
        // Style properties like `"20px"` need to be numbers like `20` for react native
        for (const key in styleValue) {
          sanitizeStyle(styleValue)(key, styleValue[key]);
          styleValue = sanitizeReactNativeBlockStyles(styleValue, options);
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
 */
const PROCESS_REACT_NATIVE_PLUGIN: MitosisPlugin = () => ({
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
        }
      });
    },
  },
});

/**
 * Removes React Native className and class properties from the JSON
 */
const REMOVE_REACT_NATIVE_CLASSES_PLUGIN: MitosisPlugin = () => ({
  json: {
    pre: (json: MitosisComponent) => {
      traverse(json).forEach(function (node) {
        if (isMitosisNode(node)) {
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

/**
 * Converts class and className properties to twrnc style syntax
 */
const TWRNC_STYLES_PLUGIN: MitosisPlugin = () => ({
  json: {
    post: (json: MitosisComponent) => {
      traverse(json).forEach(function (node) {
        if (isMitosisNode(node)) {
          let staticClasses = [node.properties.class, node.properties.className]
            .filter(Boolean)
            .join(' ');

          let dynamicClasses = [node.bindings.class, node.bindings.className].filter(Boolean);

          if (staticClasses || dynamicClasses.length) {
            let styleCode = '';

            if (staticClasses) {
              styleCode = `tw\`${staticClasses}\``;
            }

            if (dynamicClasses.length) {
              let dynamicCode = dynamicClasses
                .map((dc) => (dc && dc.code ? dc.code : null))
                .filter(Boolean)
                .join(', ');

              if (dynamicCode) {
                if (styleCode) {
                  // If we have both static and dynamic classes
                  styleCode = `tw.style(${styleCode}, ${dynamicCode})`;
                } else if (dynamicClasses.length > 1) {
                  // If we have multiple dynamic classes
                  styleCode = `tw.style([${dynamicCode}])`;
                } else {
                  // If we have a single dynamic class
                  styleCode = `tw.style(${dynamicCode})`;
                }
              }
            }

            if (styleCode) {
              node.bindings.style = createSingleBinding({ code: styleCode });
            }
          }

          // Clean up original class and className properties/bindings
          delete node.properties.class;
          delete node.properties.className;
          delete node.bindings.class;
          delete node.bindings.className;
        }
      });
    },
  },
});

/**
 * Converts class and className properties to native-wind style syntax
 * Note: We only support the "with babel" setup: https://www.nativewind.dev/guides/babel
 */
const NATIVE_WIND_STYLES_PLUGIN: MitosisPlugin = () => ({
  json: {
    post: (json: MitosisComponent) => {
      traverse(json).forEach(function (node) {
        if (isMitosisNode(node)) {
          let combinedClasses = [
            node.properties.class,
            node.properties.className,
            node.bindings.class,
            node.bindings.className,
          ]
            .filter(Boolean)
            .join(' ');

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

          if (combinedClasses) {
            node.properties.className = combinedClasses;
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

    if (options.stylesType === 'twrnc') {
      options.plugins.push(TWRNC_STYLES_PLUGIN);
    } else if (options.stylesType === 'native-wind') {
      options.plugins.push(NATIVE_WIND_STYLES_PLUGIN);
    } else {
      options.plugins.push(REMOVE_REACT_NATIVE_CLASSES_PLUGIN);
    }

    return componentToReact({ ...options, type: 'native' })({ component: json, path });
  };
