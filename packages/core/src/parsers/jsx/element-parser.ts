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
  node: babel.types.Expression | babel.types.JSX,
): MitosisNode | null => {
  if (types.isJSXText(node)) {
    return createMitosisNode({
      properties: {
        _text: node.value,
      },
    });
  }

  if (types.isJSXEmptyExpression(node)) {
    return null;
  }

  if (types.isJSXExpressionContainer(node)) {
    return jsxElementToJson(node.expression as any);
  }

  if (types.isCallExpression(node) || types.isOptionalCallExpression(node)) {
    const callback = node.arguments[0];
    if (types.isArrowFunctionExpression(callback)) {
      if (types.isIdentifier(callback.params[0])) {
        const forArguments = getForArguments(callback.params);
        return createMitosisNode({
          name: 'For',
          bindings: {
            each: createSingleBinding({
              code: generate(node.callee)
                .code // Remove .map or potentially ?.map
                .replace(/\??\.map$/, ''),
            }),
          },
          scope: forArguments,
          children: [jsxElementToJson(callback.body as any)!],
        });
      }
    }
  } else if (types.isLogicalExpression(node)) {
    // {foo && <div />} -> <Show when={foo}>...</Show>
    if (node.operator === '&&') {
      return createMitosisNode({
        name: 'Show',
        bindings: {
          when: createSingleBinding({ code: generate(node.left).code! }),
        },
        children: [jsxElementToJson(node.right as any)!],
      });
    } else {
      // TODO: good warning system for unsupported operators
    }
  } else if (types.isConditionalExpression(node)) {
    // {foo ? <div /> : <span />} -> <Show when={foo} else={<span />}>...</Show>
    const child = jsxElementToJson(node.consequent as any);
    return createMitosisNode({
      name: 'Show',
      meta: {
        else: jsxElementToJson(node.alternate as any),
      },
      bindings: {
        when: createSingleBinding({ code: generate(node.test).code }),
      },
      children: child === null ? [] : [child],
    });
  } else if (types.isJSXFragment(node)) {
    return createMitosisNode({
      name: 'Fragment',
      children: node.children.map(jsxElementToJson).filter(checkIsDefined),
    });
  } else if (types.isJSXSpreadChild(node)) {
    // TODO: support spread attributes
    return null;
  } else if (types.isNullLiteral(node) || types.isBooleanLiteral(node)) {
    return null;
  } else if (types.isNumericLiteral(node)) {
    return createMitosisNode({
      properties: {
        _text: String(node.value),
      },
    });
  } else if (types.isStringLiteral(node)) {
    return createMitosisNode({
      properties: {
        _text: node.value,
      },
    });
  }
  if (!types.isJSXElement(node)) {
    return createMitosisNode({
      bindings: {
        _text: createSingleBinding({ code: generate(node).code }),
      },
    });
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
    slots: {} & MitosisNode['slots'];
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
    slots: Object.keys(slots).length > 0 ? slots : undefined,
  });
};
