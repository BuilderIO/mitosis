import { babelTransformExpression } from '@/helpers/babel-transform';
import { stringifyContextValue } from '@/helpers/get-state-object-string';
import { Nullable } from '@/helpers/nullable';
import { stripGetter } from '@/helpers/patterns';
import {
  replaceIdentifiers,
  replacePropsIdentifier,
  replaceStateIdentifier,
} from '@/helpers/replace-identifiers';
import { isSlotProperty, replaceSlotsInString } from '@/helpers/slots';
import { ContextGetInfo, ContextSetInfo, MitosisComponent } from '@/types/mitosis-component';
import { MitosisNode } from '@/types/mitosis-node';
import { types } from '@babel/core';
import { flow, identity, pipe } from 'fp-ts/lib/function';
import { pickBy } from 'lodash';
import { VALID_HTML_TAGS } from '../../constants/html_tags';
import { ToVueOptions } from './types';

export const addPropertiesToJson =
  (properties: MitosisNode['properties']) =>
  (json: MitosisNode): MitosisNode => ({
    ...json,
    properties: {
      ...json.properties,
      ...properties,
    },
  });

export const addBindingsToJson =
  (bindings: MitosisNode['bindings']) =>
  (json: MitosisNode): MitosisNode => ({
    ...json,
    bindings: {
      ...json.bindings,
      ...bindings,
    },
  });

const ON_UPDATE_HOOK_NAME = 'onUpdateHook';

export const getOnUpdateHookName = (index: number) => ON_UPDATE_HOOK_NAME + `${index}`;

export const invertBooleanExpression = (expression: string) => `!Boolean(${expression})`;

export function encodeQuotes(string: string) {
  return string.replace(/"/g, '&quot;');
}

export const mapMitosisComponentToKebabCase = (componentName: string) =>
  componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

// Transform <FooBar> to <foo-bar> as Vue2 needs
export const renameMitosisComponentsToKebabCase = (str: string) =>
  str.replace(/<\/?\w+/g, (match) => {
    const tagName = match.replaceAll('<', '').replaceAll('/', '');
    if (VALID_HTML_TAGS.includes(tagName)) {
      return match;
    } else {
      return mapMitosisComponentToKebabCase(match);
    }
  });

export function getContextNames(json: MitosisComponent) {
  return Object.keys(json.context.get);
}

function shouldAppendValueToRef(path: babel.NodePath<babel.types.Identifier>) {
  const { parent, node } = path;

  if (types.isFunctionDeclaration(parent) && parent.id === node) {
    return false;
  }

  if (types.isCallExpression(parent)) {
    return false;
  }

  const isMemberExpression = types.isMemberExpression(parent);

  if (
    isMemberExpression &&
    types.isThisExpression(parent.object) &&
    types.isProgram(path.scope.block) &&
    path.scope.hasReference(node.name)
  ) {
    return false;
  }

  if (
    isMemberExpression &&
    types.isIdentifier(parent.object) &&
    types.isIdentifier(parent.property) &&
    parent.property.name === node.name
  ) {
    return false;
  }

  if (Object.keys(path.scope.bindings).includes(path.node.name)) {
    return false;
  }

  if (path.parentPath.listKey === 'arguments' || path.parentPath.listKey === 'params') {
    return false;
  }

  return true;
}
const getAllRefs = (component: MitosisComponent) => {
  const refKeys = Object.keys(component.refs);
  const stateKeys = Object.keys(pickBy(component.state, (i) => i?.type === 'property'));
  const allKeys = [...refKeys, ...stateKeys];

  return allKeys;
};

function processRefs({
  input,
  component,
  options,
  thisPrefix,
}: {
  input: string;
  component: MitosisComponent;
  options: ToVueOptions;
  thisPrefix: ProcessBinding['thisPrefix'];
}) {
  const { api } = options;
  const refs = api === 'options' ? getContextNames(component) : getAllRefs(component);

  return babelTransformExpression(input, {
    Identifier(path: babel.NodePath<babel.types.Identifier>) {
      const name = path.node.name;
      // Composition api should use .value all the time
      if (refs.includes(name) && (api === 'composition' || shouldAppendValueToRef(path))) {
        const newValue = api === 'options' ? `${thisPrefix}.${name}` : `${name}.value`;
        path.replaceWith(types.identifier(newValue));
      }
    },
  });
}

function prefixMethodsWithThis(input: string, component: MitosisComponent, options: ToVueOptions) {
  if (options.api === 'options') {
    const allMethodNames = Object.entries(component.state)
      .filter(([_key, value]) => value?.type === 'function')
      .map(([key]) => key);

    if (!allMethodNames.length) return input;

    return replaceIdentifiers({ code: input, from: allMethodNames, to: (name) => `this.${name}` });
  } else {
    return input;
  }
}

function optionsApiStateAndPropsReplace(
  name: string,
  thisPrefix: string,
  codeType: ProcessBinding['codeType'],
) {
  const prefixToUse = codeType === 'bindings' ? '' : thisPrefix + '.';

  if (name === 'children' || name.startsWith('children.')) {
    return `${prefixToUse}$slots.default`;
  }
  return isSlotProperty(name)
    ? replaceSlotsInString(name, (x) => `${prefixToUse}$slots.${x}`)
    : `${prefixToUse}${name}`;
}

type ProcessBinding = {
  code: string;
  options: ToVueOptions;
  json: MitosisComponent;
  preserveGetter?: boolean;
  thisPrefix?: 'this' | '_this';
  codeType?: 'state' | 'hooks' | 'bindings' | 'hooks-deps' | 'properties';
};

// TODO: migrate all stripStateAndPropsRefs to use this here
// to properly replace context refs
export const processBinding = ({
  code,
  options,
  json,
  preserveGetter = false,
  thisPrefix = 'this',
  codeType,
}: ProcessBinding): string => {
  try {
    return pipe(
      code,
      replacePropsIdentifier((name) => {
        switch (options.api) {
          // keep pointing to `props.${value}`
          case 'composition':
            const slotPrefix = codeType === 'bindings' ? '$slots' : 'useSlots()';

            if (name === 'children' || name.startsWith('children.')) {
              return `${slotPrefix}.default`;
            }
            return isSlotProperty(name)
              ? replaceSlotsInString(name, (x) => `${slotPrefix}.${x}`)
              : codeType === 'bindings'
              ? name
              : `props.${name}`;

          case 'options':
            return optionsApiStateAndPropsReplace(name, thisPrefix, codeType);
        }
      }),
      replaceStateIdentifier((name) => {
        switch (options.api) {
          case 'composition':
            return name;
          case 'options':
            return optionsApiStateAndPropsReplace(name, thisPrefix, codeType);
        }
      }),
      codeType === 'bindings'
        ? identity
        : flow(
            (x) => processRefs({ input: x, component: json, options, thisPrefix }),
            (x) => prefixMethodsWithThis(x, json, options),
          ),
      preserveGetter === false ? stripGetter : identity,
    );
  } catch (e) {
    console.error('could not process bindings in ', { code });
    throw e;
  }
};

export const getContextValue = ({ name, ref, value }: ContextSetInfo): Nullable<string> => {
  const valueStr = value ? stringifyContextValue(value) : ref;

  return valueStr;
};

export const checkIfContextHasStrName = (context: ContextGetInfo | ContextSetInfo) => {
  // check if the name is wrapped in single or double quotes
  const isStrName = context.name.startsWith("'") || context.name.startsWith('"');
  return isStrName;
};

export const getContextKey = (context: ContextGetInfo | ContextSetInfo) => {
  const isStrName = checkIfContextHasStrName(context);
  const key = isStrName ? context.name : `${context.name}.key`;
  return key;
};
