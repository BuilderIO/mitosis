import traverse from 'traverse';
import { Plugin } from '..';
import { fastClone } from '../helpers/fast-clone';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { isUpperCase } from '../helpers/is-upper-case';
import { MitosisComponent } from '../types/mitosis-component';
import { BaseTranspilerOptions, TranspilerGenerator } from '../types/transpiler';
import { componentToReact, contextPropDrillingKey, ToReactOptions } from './react';

export interface ToRscOptions extends BaseTranspilerOptions {}

/**
 * Transform react to be RSC compatible, such as
 * - remove event listeners
 * - remove lifecycle hooks
 * - remove refs
 * - transform context to prop drilling
 */
const RSC_TRANSFORM_PLUGIN: Plugin = () => ({
  json: {
    pre: (json: MitosisComponent) => {
      if (json.hooks.onMount) {
        delete json.hooks.onMount;
      }
      if (json.hooks.onUnMount) {
        delete json.hooks.onUnMount;
      }
      if (json.hooks.onUpdate) {
        delete json.hooks.onUpdate;
      }

      if (json.refs) {
        json.refs = {};
      }

      traverse(json).forEach((node) => {
        if (isMitosisNode(node)) {
          if (isUpperCase(node.name[0])) {
            // Drill context down, aka
            // function (props) { return <Component _context{props._context} /> }
            if (!node.bindings[contextPropDrillingKey]) {
              node.bindings[contextPropDrillingKey] = {
                code: contextPropDrillingKey,
              };
            }
          }
          if (node.bindings.ref) {
            delete node.bindings.ref;
          }
          for (const key in node.bindings) {
            if (key.match(/^on[A-Z]/)) {
              delete node.bindings[key];
            }
          }
        }
      });
    },
  },
});

const DEFAULT_OPTIONS: ToRscOptions = {
  plugins: [RSC_TRANSFORM_PLUGIN],
};

export const componentToRsc: TranspilerGenerator<ToRscOptions> =
  (_options = {}) =>
  ({ component, path }) => {
    const json = fastClone(component);

    const options: ToReactOptions = {
      ...DEFAULT_OPTIONS,
      ..._options,
      plugins: [...(DEFAULT_OPTIONS.plugins || []), ...(_options.plugins || [])],
      stylesType: 'style-tag',
      stateType: 'variables',
      contextType: 'prop-drill',
    };

    return componentToReact(options)({ component: json, path });
  };
