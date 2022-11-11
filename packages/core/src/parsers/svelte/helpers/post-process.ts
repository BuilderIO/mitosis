import type { MitosisNode } from '../../../types/mitosis-node';
import type { extendedHook, StateValue } from '../../../types/mitosis-component';

import { processBindings } from './bindings';

export function preventNameCollissions(
  json: SveltosisComponent,
  input: string,
  arguments_: string[],
  prepend = '',
  append = '_',
) {
  let output = input;
  const argumentsOutput = arguments_;

  const keys = [...Object.keys(json.props), ...Object.keys(json.state), ...Object.keys(json.refs)];

  for (const key of keys) {
    const regex = () => new RegExp(`(?<!=(?:\\s))${key}\\b`, 'g');
    let isInArguments = false;

    for (const [index, argument] of argumentsOutput.entries()) {
      if (regex().test(argument)) {
        isInArguments = true;
        argumentsOutput.splice(index, 1, argument.replace(regex(), `${prepend}${key}${append}`));
      }
    }

    const isInOutput = regex().test(output);

    if (isInArguments && isInOutput) {
      output = output.replace(regex(), `${prepend}${key}${append}`);
    }
  }

  return argumentsOutput?.length
    ? {
        code: output,
        arguments: argumentsOutput,
      }
    : { code: output };
}

function prependProperties(json: SveltosisComponent, input: string) {
  let output = input;

  const propertyKeys = Object.keys(json.props);

  for (const property of propertyKeys) {
    const regex = new RegExp(`(?<!(\\.|'|"|\`))\\b(props\\.)?${property}\\b`, 'g');
    if (regex.test(output)) {
      output = output.replace(regex, `props.${property}`);
    }
  }
  return output;
}

function prependState(json: SveltosisComponent, input: string) {
  let output = input;
  const stateKeys = Object.keys(json.state);
  for (const state of stateKeys) {
    const regex = new RegExp(
      `(?<!(\\.|'|"|\`|function ))\\b(state\\.)?${state}\\b(?!(\\s+)?\\()`,
      'g',
    );
    if (regex.test(output)) {
      output = output.replace(regex, `state.${state}`);
    }
  }
  return output;
}

function addPropertiesAndState(json: SveltosisComponent, input: string) {
  let output = input;
  output = prependProperties(json, output);
  output = prependState(json, output);
  return output;
}

function addPropertiesAndStateToNode(json: SveltosisComponent, node: MitosisNode) {
  for (const key of Object.keys(node.bindings)) {
    if (Object.prototype.hasOwnProperty.call(node.bindings, key)) {
      node.bindings[key] = {
        code: addPropertiesAndState(json, node.bindings[key]?.code ?? '').trim(),
        type: node.bindings[key]?.type,
      };
    }
  }
}

function postProcessState(json: SveltosisComponent) {
  for (const key of Object.keys(json.state)) {
    const item: StateValue & { arguments?: string[] } = json.state[key] as StateValue;

    if (item?.type !== 'property') {
      const output = preventNameCollissions(json, item.code, item?.arguments || []);

      output.code = addPropertiesAndState(json, output.code);

      json.state[key] = {
        ...item,
        ...output,
      };
    }
  }
}

function postProcessChildren(json: SveltosisComponent, children: MitosisNode[]) {
  for (const node of children) {
    addPropertiesAndStateToNode(json, node);
    processBindings(json, node);

    let children: MitosisNode[] = [];

    if (node.children?.length > 0) {
      children = node.children;
    }

    const metaValues = (Object.values(node.meta) || []) as Array<MitosisNode | MitosisNode['meta']>;

    if (metaValues.length > 0) {
      const metaChildren = metaValues.filter((item) => {
        return item?.['@type'] === '@builder.io/mitosis/node';
      }) as MitosisNode[];

      children = [...children, ...metaChildren];
    }

    postProcessChildren(json, children);
  }
}

function addPropertiesAndStateToHook(json: SveltosisComponent, hook: extendedHook): extendedHook {
  return {
    code: addPropertiesAndState(json, hook.code),
    deps: addPropertiesAndState(json, hook.deps || ''),
  };
}

function postProcessHooks(json: SveltosisComponent) {
  const hookKeys = Object.keys(json.hooks) as Array<keyof typeof json.hooks>;
  for (const key of hookKeys) {
    const hook = json.hooks[key];

    if (!hook) {
      continue;
    }

    if (key === 'onUpdate' && hook) {
      for (const [index, hookEntry] of (hook as extendedHook[]).entries()) {
        json.hooks[key]?.splice(index, 1, addPropertiesAndStateToHook(json, hookEntry));
      }
      continue;
    }

    (json.hooks[key] as extendedHook) = addPropertiesAndStateToHook(json, hook as extendedHook);
  }
}

function postProcessContext(json: SveltosisComponent) {
  for (const key of Object.keys(json.context.set)) {
    if (json.context.set[key]?.ref) {
      json.context.set[key].ref = addPropertiesAndState(json, json.context.set[key].ref as string);
    }
  }
}

export function postProcess(json: SveltosisComponent) {
  // Call preventNameCollissions here, before the rest (where it applies -- function arguments for now)
  // State (everything except type === 'property')
  postProcessState(json);

  // Children
  postProcessChildren(json, json.children);

  // Hooks
  postProcessHooks(json);

  // Context
  postProcessContext(json);
}
