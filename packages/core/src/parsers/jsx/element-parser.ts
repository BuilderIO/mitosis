import * as babel from '@babel/core';
import generate from '@babel/generator';
import { pipe } from 'fp-ts/lib/function';
import { createSingleBinding } from '../../helpers/bindings';
import { createMitosisNode } from '../../helpers/create-mitosis-node';
import { checkIsDefined } from '../../helpers/nullable';
import { ForNode, MitosisNode } from '../../types/mitosis-node';
import { transformAttributeName } from './helpers';

const { types } = babel;

const getForArguments = (params: any[]): ForNode['scope'] => {
  const [forName, indexName, collectionName] = params
    .filter((param): param is babel.types.Identifier => types.isIdentifier(param))
    .map((param) => param.name)
    .filter(checkIsDefined);

  return {
    forName,
    collectionName,
    indexName,
  };
};

/**
 * Parses a JSX element into a MitosisNode.
 */
export const jsxElementToJson = (
  node:
    | babel.types.JSXElement
    | babel.types.JSXText
    | babel.types.JSXFragment
    | babel.types.JSXExpressionContainer
    | babel.types.JSXSpreadChild,
): MitosisNode | null => {
  if (types.isJSXText(node)) {
    return createMitosisNode({
      properties: {
        _text: node.value,
      },
    });
  }
  if (types.isJSXExpressionContainer(node)) {
    if (types.isJSXEmptyExpression(node.expression)) {
      return null;
    }
    // foo.map -> <For each={foo}>...</For>
    if (
      types.isCallExpression(node.expression) ||
      types.isOptionalCallExpression(node.expression)
    ) {
      const callback = node.expression.arguments[0];
      if (types.isArrowFunctionExpression(callback)) {
        if (types.isIdentifier(callback.params[0])) {
          const forArguments = getForArguments(callback.params);
          return createMitosisNode({
            name: 'For',
            bindings: {
              each: createSingleBinding({
                code: generate(node.expression.callee)
                  .code // Remove .map or potentially ?.map
                  .replace(/\??\.map$/, ''),
              }),
            },
            scope: forArguments,
            children: [jsxElementToJson(callback.body as any)!],
          });
        }
      }
    }

    // {foo && <div />} -> <Show when={foo}>...</Show>
    if (types.isLogicalExpression(node.expression)) {
      if (node.expression.operator === '&&') {
        return createMitosisNode({
          name: 'Show',
          bindings: {
            when: createSingleBinding({ code: generate(node.expression.left).code! }),
          },
          children: [jsxElementToJson(node.expression.right as any)!],
        });
      } else {
        // TODO: good warning system for unsupported operators
      }
    }

    // {foo ? <div /> : <span />} -> <Show when={foo} else={<span />}>...</Show>
    if (types.isConditionalExpression(node.expression)) {
      return createMitosisNode({
        name: 'Show',
        meta: {
          else: jsxElementToJson(node.expression.alternate as any)!,
        },
        bindings: {
          when: createSingleBinding({ code: generate(node.expression.test).code }),
        },
        children: [jsxElementToJson(node.expression.consequent as any)!],
      });
    }

    // TODO: support {foo ? bar : baz}

    return createMitosisNode({
      bindings: {
        _text: createSingleBinding({ code: generate(node.expression).code }),
      },
    });
  }

  if (types.isJSXFragment(node)) {
    return createMitosisNode({
      name: 'Fragment',
      children: node.children.map(jsxElementToJson).filter(checkIsDefined),
    });
  }

  // TODO: support spread attributes
  if (types.isJSXSpreadChild(node)) {
    return null;
  }

  const nodeName = generate(node.openingElement.name).code;

  if (nodeName === 'Show') {
    const whenAttr: babel.types.JSXAttribute | undefined = node.openingElement.attributes.find(
      (item) => types.isJSXAttribute(item) && item.name.name === 'when',
    ) as any;

    const elseAttr: babel.types.JSXAttribute | undefined = node.openingElement.attributes.find(
      (item) => types.isJSXAttribute(item) && item.name.name === 'else',
    ) as any;

    const whenValue =
      whenAttr && types.isJSXExpressionContainer(whenAttr.value)
        ? generate(whenAttr.value.expression).code
        : undefined;

    const elseValue =
      elseAttr &&
      types.isJSXExpressionContainer(elseAttr.value) &&
      jsxElementToJson(elseAttr.value.expression as any);

    return createMitosisNode({
      name: 'Show',
      meta: {
        else: elseValue || undefined,
      },
      bindings: {
        ...(whenValue ? { when: createSingleBinding({ code: whenValue }) } : {}),
      },
      children: node.children.map(jsxElementToJson).filter(checkIsDefined),
    });
  }

  // <For ...> control flow component
  if (nodeName === 'For') {
    const child = node.children.find((item): item is babel.types.JSXExpressionContainer =>
      types.isJSXExpressionContainer(item),
    );
    if (checkIsDefined(child)) {
      const childExpression = child.expression;

      if (types.isArrowFunctionExpression(childExpression)) {
        const forArguments = getForArguments(childExpression?.params);

        const forCode = pipe(node.openingElement.attributes[0], (attr) => {
          if (types.isJSXAttribute(attr) && types.isJSXExpressionContainer(attr.value)) {
            return generate(attr.value.expression).code;
          } else {
            // TO-DO: is an empty string valid here?
            return '';
          }
        });

        return createMitosisNode({
          name: 'For',
          bindings: {
            each: createSingleBinding({
              code: forCode,
            }),
          },
          scope: forArguments,
          children: [jsxElementToJson(childExpression.body as any)!],
        });
      }
    }
  }

  // const properties: MitosisNode['properties'] = {}
  // const bindings: MitosisNode['bindings'] = {}
  // const slots: MitosisNode['slots'] = {}

  const { bindings, properties, slots } = node.openingElement.attributes.reduce<{
    bindings: MitosisNode['bindings'];
    properties: MitosisNode['properties'];
    slots: MitosisNode['slots'];
  }>(
    (memo, item) => {
      if (types.isJSXAttribute(item)) {
        const key = transformAttributeName(item.name.name as string);
        const value = item.value;

        // <Foo myProp />
        if (value === null) {
          memo.bindings[key] = createSingleBinding({ code: 'true' });
          return memo;
        }

        // <Foo myProp="hello" />
        if (types.isStringLiteral(value)) {
          memo.properties[key] = value.value;
          return memo;
        }

        if (!types.isJSXExpressionContainer(value)) return memo;

        const { expression } = value;

        if (types.isStringLiteral(expression)) {
          // <Foo myProp={"hello"} />
          memo.properties[key] = expression.value;
        } else if (types.isArrowFunctionExpression(expression)) {
          // <Foo myProp={() => {}} />
          const args = key.startsWith('on')
            ? expression.params.map((node) => (node as babel.types.Identifier)?.name)
            : [];

          memo.bindings[key] = createSingleBinding({
            code: generate(expression.body).code,
            arguments: args.length ? args : undefined,
          });
        } else if (types.isJSXElement(expression)) {
          // <Foo myProp={<MoreMitosisNode><div /></MoreMitosisNode>} />
          const slotNode = jsxElementToJson(expression);
          if (!slotNode) return memo;

          memo.slots[key] = [slotNode];

          // Temporarily keep the slot as a binding until we migrate generators to use the slots.
          memo.bindings[key] = createSingleBinding({ code: generate(expression).code });
        } else {
          memo.bindings[key] = createSingleBinding({ code: generate(expression).code });
        }

        return memo;
      } else if (types.isJSXSpreadAttribute(item)) {
        // TODO: potentially like Vue store bindings and properties as array of key value pairs
        // too so can do this accurately when order matters. Also tempting to not support spread,
        // as some frameworks do not support it (e.g. Angular) tho Angular may be the only one

        const { code: key } = generate(item.argument);

        memo.bindings[key] = {
          code: types.stringLiteral(generate(item.argument).code).value,
          type: 'spread',
          spreadType: 'normal',
        };
      }
      return memo;
    },
    {
      bindings: {},
      properties: {},
      slots: {},
    },
  );

  return createMitosisNode({
    name: nodeName,
    properties,
    bindings,
    children: node.children.map(jsxElementToJson).filter(checkIsDefined),
    slots,
  });
};
