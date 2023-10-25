import { MitosisComponent, MitosisNode, OnEventHook, Plugin } from '..';
import { capitalize } from './capitalize';
import { traverseNodes } from './traverse-nodes';

const checkIsEventHandlerNode = (node: MitosisNode, hook: OnEventHook) => {
  return hook.refName === node.bindings.ref?.code;
};

export const getOnEventHooksForNode = ({
  node,
  component,
}: {
  node: MitosisNode;
  component: MitosisComponent;
}) => {
  return component.hooks.onEvent?.filter((hook) => checkIsEventHandlerNode(node, hook));
};

const processOnEventHooks = (component: MitosisComponent) => {
  traverseNodes(component, (node) => {
    getOnEventHooksForNode({ node, component })?.forEach((hook) => {
      const handlerName = 'on' + capitalize(hook.eventName);
      const fnName = `${hook.refName}_${handlerName}`;
      component.state[fnName] = {
        code: `${fnName}() { ${hook.code} }`,
        type: 'method',
      };

      node.bindings[handlerName] = {
        code: `state.${fnName}()`,
        type: 'single',
      };
    });
  });
};

/**
 * Adds event handlers from `onEvent` hooks to the appropriate node's bindings.
 * Only works with frameworks that support custom events in their templates.
 */
export const processOnEventHooksPlugin: Plugin = () => ({
  json: {
    pre: processOnEventHooks,
  },
});
