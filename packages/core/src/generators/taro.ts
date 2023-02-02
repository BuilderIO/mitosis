import json5 from 'json5';
import { camelCase, size } from 'lodash';
import traverse from 'traverse';
import { fastClone } from '../helpers/fast-clone';
import { ClassStyleMap } from '../helpers/styles/helpers';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { MitosisComponent } from '../types/mitosis-component';
import { componentToReact, ToReactOptions } from './react';
import { BaseTranspilerOptions, TranspilerGenerator } from '../types/transpiler';
import { Plugin } from '..';
import { createSingleBinding } from '../helpers/bindings';

// @tarojs/components
export const DEFAULT_Component_SET = new Set<string>([
  'View',
  'Icon',
  'Progress',
  'RichText',
  'Text',
  'Button',
  'Checkbox',
  'CheckboxGroup',
  'Form',
  'Input',
  'Label',
  'Picker',
  'PickerView',
  'PickerViewColumn',
  'Radio',
  'RadioGroup',
  'Slider',
  'Switch',
  'CoverImage',
  'Textarea',
  'CoverView',
  'MovableArea',
  'MovableView',
  'ScrollView',
  'Swiper',
  'SwiperItem',
  'Navigator',
  'Audio',
  'Camera',
  'Image',
  'LivePlayer',
  'Video',
  'Canvas',
  'Ad',
  'WebView',
  'Block',
  'Map',
  'Slot',
  'SlotView',
  'Editor',
  'MatchMedia',
  'FunctionalPageNavigator',
  'LivePusher',
  'OfficialAccount',
  'OpenData',
  'NavigationBar',
  'PageMeta',
  'VoipRoom',
  'AdCustom',
]);

export interface ToTaroOptions extends BaseTranspilerOptions {
  stateType?: 'useState' | 'mobx' | 'valtio' | 'solid' | 'builder';
}

// TODO: px to 2 px
export const collectTaroStyles = (json: MitosisComponent): ClassStyleMap => {
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

    for (const key in value) {
      const propertyValue = value[key];
      // convert px to 2 * px, PX to PX
      if (typeof propertyValue === 'string' && propertyValue.match(/^\d/)) {
        let newValue = parseFloat(propertyValue);
        if (!isNaN(newValue)) {
          if (propertyValue.endsWith('px')) {
            newValue = 2 * newValue;
            value[key] = `${newValue}px`;
          } else {
            value[key] = newValue;
          }
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

export const TagMap: Record<string, string> = {
  span: 'Text',
  button: 'Button',
  input: 'Input',
  img: 'Image',
  form: 'Form',
  textarea: 'Textarea',
};

/**
 * Plugin that handles necessary transformations from React to React Native:
 * - Converts DOM tags to @tarojs/components
 * - Removes redundant `class`/`className` attributes
 */
const PROCESS_REACT_NATIVE_PLUGIN: Plugin = () => ({
  json: {
    pre: (json: MitosisComponent) => {
      traverse(json).forEach((node) => {
        if (isMitosisNode(node)) {
          // TODO: More dom tags convert to  @tarojs/components
          if (!!TagMap[node.name]) {
            node.name = TagMap[node.name];
          } else if (node.name.toLowerCase() === node.name) {
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
  components: {
    pre: (json: MitosisComponent) => {
      const componentsList:Set<string> = new Set()
      traverse(json).forEach((node) => {
        if (isMitosisNode(node)) {
          if (DEFAULT_Component_SET.has(node.name)) {
            componentsList.add(node.name)
          }
          if (node.properties._text?.trim().length || node.bindings._text?.code?.trim()?.length) {
            componentsList.add('Text');
          }
        }
      });
      const components: string[] = []
      componentsList.forEach((value) => components.push(value))
      return `import { ${components} } from '@tarojs/components';`
    }
  }
});

const DEFAULT_OPTIONS: ToTaroOptions = {
  stateType: 'useState',
  plugins: [PROCESS_REACT_NATIVE_PLUGIN],
};

export const componentToTaro: TranspilerGenerator<ToTaroOptions> =
  (_options = {}) =>
  ({ component, path }) => {
    const json = fastClone(component);

    const options: ToReactOptions = {
      ...DEFAULT_OPTIONS,
      ..._options,
      plugins: [...(DEFAULT_OPTIONS.plugins || []), ...(_options.plugins || [])],
      type: 'taro',
    };

    return componentToReact(options)({ component: json, path });
  };
