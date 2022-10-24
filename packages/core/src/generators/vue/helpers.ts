import { Nullable } from '../../helpers/nullable';
import { stringifyContextValue } from '../../helpers/get-state-object-string';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { ContextSetInfo, MitosisComponent } from '../../types/mitosis-component';
import { MitosisNode } from '../../types/mitosis-node';
import { ToVueOptions } from './types';
import { pipe } from 'fp-ts/lib/function';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { types } from '@babel/core';
import { pickBy } from 'lodash';

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

// Transform <FooBar> to <foo-bar> as Vue2 needs
export const renameMitosisComponentsToKebabCase = (str: string) =>
  str.replace(/<\/?\w+/g, (match) => match.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());

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

function processRefs(input: string, component: MitosisComponent, options: ToVueOptions) {
  const refs = options.api === 'options' ? getContextNames(component) : getAllRefs(component);

  return babelTransformExpression(input, {
    Identifier(path: babel.NodePath<babel.types.Identifier>) {
      const name = path.node.name;
      if (refs.includes(name) && shouldAppendValueToRef(path)) {
        const newValue = options.api === 'options' ? `this.${name}` : `${name}.value`;
        path.replaceWith(types.identifier(newValue));
      }
    },
  });
}

// TODO: migrate all stripStateAndPropsRefs to use this here
// to properly replace context refs
export const processBinding = ({
  code,
  options,
  json,
  includeProps = true,
}: {
  code: string;
  options: ToVueOptions;
  json: MitosisComponent;
  includeProps?: boolean;
}): string => {
  return pipe(
    stripStateAndPropsRefs(code, {
      includeState: true,
      includeProps,
      replaceWith: (name) => {
        switch (options.api) {
          case 'composition':
            return name;
          case 'options':
            if (name === 'children' || name.startsWith('children.')) {
              return 'this.$slots.default';
            }
            return `this.${name}`;
        }
      },
    }),
    (c) => processRefs(c, json, options),
  );
};

export const getContextValue =
  ({ options, json }: { options: ToVueOptions; json: MitosisComponent }) =>
  ({ name, ref, value }: ContextSetInfo): Nullable<string> => {
    const valueStr = value
      ? stringifyContextValue(value, {
          valueMapper: (code) => processBinding({ code, options, json }),
        })
      : ref
      ? processBinding({ code: ref, options, json })
      : null;

    return valueStr;
  };

export const getContextProvideString = (json: MitosisComponent, options: ToVueOptions) => {
  return `{
    ${Object.values(json.context.set)
      .map((setVal) => `${setVal.name}: ${getContextValue({ options, json })(setVal)}`)
      .join(',')}
  }`;
};
