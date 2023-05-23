import traverse from 'traverse';
import { Plugin } from '..';
import { createSingleBinding } from '../helpers/bindings';
import { fastClone } from '../helpers/fast-clone';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { mergeOptions } from '../helpers/merge-options';
import { MitosisComponent } from '../types/mitosis-component';
import { TranspilerGenerator } from '../types/transpiler';
import { componentToReact, contextPropDrillingKey, ToReactOptions } from './react';

export type ToRscOptions = ToReactOptions;

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
          const isComponent = node.name.match(/[A-Z]/);
          if (isComponent) {
            // Drill context down, aka
            // function (props) { return <Component _context{props._context} /> }
            if (!node.bindings[contextPropDrillingKey]) {
              node.bindings[contextPropDrillingKey] = createSingleBinding({
                code: contextPropDrillingKey,
              });
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

const DEFAULT_OPTIONS: Partial<ToRscOptions> = {
  plugins: [RSC_TRANSFORM_PLUGIN],
};

export const componentToRsc: TranspilerGenerator<Partial<ToRscOptions>> =
  (_options = {}) =>
  ({ component, path }) => {
    const json = fastClone(component);

    const options = mergeOptions(DEFAULT_OPTIONS, _options, {
      stylesType: 'style-tag',
      stateType: 'variables',
      contextType: 'prop-drill',
    });

    return componentToReact(options)({ component: json, path });
  };
