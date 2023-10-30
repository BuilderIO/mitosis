import generate from '@babel/generator';
import * as parser from '@babel/parser';
import * as types from '@babel/types';
import { replaceIdentifiers, replaceNodes } from '../../../helpers/replace-identifiers';
import type { BaseHook, StateValue } from '../../../types/mitosis-component';
import type { MitosisNode } from '../../../types/mitosis-node';
import type { SveltosisComponent } from '../types';
import { processBindings } from './bindings';

type SveltosisStateValue = StateValue & { arguments?: string[]; type: string };

const getArgs = (code: string) => {
  try {
    let parsed = parser.parse(code);
    let body = parsed.program.body[0];
    if (types.isFunctionDeclaration(body)) {
      return body.params.map((p) => generate(p).code);
    }
  } catch (e) {}

  return [];
};

export function preventNameCollissions(json: SveltosisComponent, item: SveltosisStateValue) {
  let output = item.code;
  const argumentsOutput = getArgs(output);

  output = replaceNodes({
    code: output,
    nodeMaps: argumentsOutput.map((arg) => ({
      from: types.identifier(arg),
      to: types.identifier(`${arg}_`),
    })),
  });

  return argumentsOutput?.length
    ? {
        ...item,
        code: output,
        arguments: getArgs(output),
      }
    : { ...item, code: output };
}

function prependProperties(json: SveltosisComponent, code: string) {
  return replaceNodes({
    code,
    nodeMaps: Object.keys(json.props).map((property) => ({
      from: types.identifier(property),
      to: types.memberExpression(types.identifier('props'), types.identifier(property)),
    })),
  });
}

function prependState(json: SveltosisComponent, input: string) {
  let output = input;
  for (const stateKey of Object.keys(json.state)) {
    output = replaceIdentifiers({
      code: output,
      from: stateKey,
      to: `state.${stateKey}`,
    });
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
      const value = node.bindings[key]!;
      node.bindings[key]!.code = addPropertiesAndState(json, value?.code ?? '').trim();
    }
  }
}

function postProcessState(json: SveltosisComponent) {
  for (const key of Object.keys(json.state)) {
    const item = json.state[key] as SveltosisStateValue;

    if (item?.type !== 'property') {
      const output = preventNameCollissions(json, item);

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

function addPropertiesAndStateToHook(json: SveltosisComponent, hook: BaseHook): BaseHook {
  return {
    code: addPropertiesAndState(json, hook.code),
    deps: addPropertiesAndState(json, hook.deps || ''),
  };
}

function postProcessHooks(json: SveltosisComponent) {
  const hookKeys = Object.keys(json.hooks) as Array<keyof typeof json.hooks>;
  for (const key of hookKeys) {
    let hook = json.hooks[key];
    if (!hook) {
      continue;
    }

    if (Array.isArray(hook)) {
      hook.forEach((item, index) => {
        (hook as Array<any>)!.splice(index, 1, addPropertiesAndStateToHook(json, item));
      });
    } else {
      hook = addPropertiesAndStateToHook(json, hook as BaseHook);
    }
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
