import traverse from 'traverse';
import { Plugin } from '..';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { mergeOptions } from '../helpers/merge-options';
import { checkIsDefined } from '../helpers/nullable';
import { MitosisComponent } from '../types/mitosis-component';
import { TranspilerGenerator } from '../types/transpiler';
import { componentToReact, ToReactOptions } from './react';

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
      delete json.hooks.onMount;
      delete json.hooks.onUnMount;
      delete json.hooks.onUpdate;
      json.refs = {};

      json.context.get = {};
      json.context.set = {};

      traverse(json).forEach((node) => {
        if (isMitosisNode(node)) {
          const isComponent = node.name.match(/[A-Z]/);
          // if (isComponent) {
          //   // Drill context down, aka
          //   // function (props) { return <Component _context{props._context} /> }
          //   if (!node.bindings[contextPropDrillingKey]) {
          //     node.bindings[contextPropDrillingKey] = createSingleBinding({
          //       code: contextPropDrillingKey,
          //     });
          //   }
          // }
          if (node.bindings.ref) {
            delete node.bindings.ref;
          }
          // for (const key in node.bindings) {
          //   if (key.match(/^on[A-Z]/)) {
          //     delete node.bindings[key];
          //   }
          // }
        }
      });
    },
  },
});

const checkIfIsRsc = (json: MitosisComponent) => {
  if (json.hooks.onMount) return false;
  if (json.hooks.onUnMount) return false;
  if (json.hooks.onUpdate) return false;
  if (Object.keys(json.refs).length) return false;
  if (Object.keys(json.context.get).length) return false;
  if (Object.keys(json.context.set).length) return false;
  if (Object.values(json.state).filter((s) => s?.type === 'property').length) return false;

  return true;
};

const RscOptions: Partial<ToRscOptions> = {
  plugins: [RSC_TRANSFORM_PLUGIN],
  stateType: 'variables',
};

export const componentToRsc: TranspilerGenerator<Partial<ToRscOptions>> =
  (_options = {}) =>
  ({ component, path }) => {
    if (
      !checkIsDefined(component.meta.useMetadata?.rsc?.componentType) &&
      checkIfIsRsc(component)
    ) {
      console.log('comp type is not defined. setting as RSC: ', component.name);

      component.meta.useMetadata = {
        ...component.meta.useMetadata,
        rsc: {
          ...component.meta.useMetadata?.rsc,
          componentType: 'server',
        },
      };
    }
    const isRSC = component.meta.useMetadata?.rsc?.componentType === 'server';

    const options = mergeOptions<Partial<ToRscOptions>>(
      {
        rsc: true,
        ...(isRSC ? RscOptions : {}),
      },
      _options,
    );

    return componentToReact(options)({ component, path });
  };
