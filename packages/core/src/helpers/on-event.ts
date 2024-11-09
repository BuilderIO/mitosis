import { MitosisComponent, MitosisNode, MitosisPlugin, OnEventHook } from '..';
import { createSingleBinding } from './bindings';
import { capitalize } from './capitalize';
import { traverseNodes } from './traverse-nodes';

const checkIsEventHandlerNode = (node: MitosisNode, hook: OnEventHook) => {
  return hook.refName === node.bindings.ref?.code;
};

const getBindingName = (hook: OnEventHook) => {
  return `on${capitalize(hook.eventName)}`;
};
export const getOnEventHandlerName = (hook: OnEventHook) => {
  return `${hook.refName}_${getBindingName(hook)}`;
};

export const getOnEventHooksForNode = ({
  node,
  component,
}: {
  node: MitosisNode;
  component: MitosisComponent;
}) => {
  return component.hooks.onEvent.filter((hook) => checkIsEventHandlerNode(node, hook));
};

/**
 * Adds event handlers from `onEvent` hooks to the appropriate node's bindings.
 * Only works with frameworks that support custom events in their templates.
 */
export const processOnEventHooksPlugin =
  (args: { setBindings?: boolean; includeRootEvents?: boolean } = {}): MitosisPlugin =>
  () => ({
    json: {
      pre: (component) => {
        const { setBindings = true, includeRootEvents = true } = args;

        traverseNodes(component, (node) => {
          getOnEventHooksForNode({ node, component }).forEach((hook) => {
            if (!includeRootEvents && hook.isRoot) return;

            const handlerName = getBindingName(hook);
            const fnName = getOnEventHandlerName(hook);
            component.state[fnName] = {
              code: `${fnName}(${hook.eventArgName}) { ${hook.code} }`,
              type: 'method',
            };

            if (setBindings) {
              node.bindings[handlerName] = createSingleBinding({
                code: `state.${fnName}(${hook.eventArgName})`,
                arguments: [hook.eventArgName],
                bindingType: 'function',
              });
            }
          });
        });
      },
    },
  });
