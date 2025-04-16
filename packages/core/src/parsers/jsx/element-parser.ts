import * as babel from '@babel/core';
import generate from '@babel/generator';
import { pipe } from 'fp-ts/lib/function';
import json5 from 'json5';
import { createSingleBinding } from '../../helpers/bindings';
import { createMitosisNode } from '../../helpers/create-mitosis-node';
import { checkIsDefined } from '../../helpers/nullable';
import { ForNode, MitosisNode } from '../../types/mitosis-node';
import { babelDefaultTransform, transformAttributeName } from './helpers';
const { types } = babel;

const getBodyExpression = (node: babel.types.Node) => {
  if (types.isArrowFunctionExpression(node) || types.isFunctionExpression(node)) {
    const callback = node.body;
    if (callback.type === 'BlockStatement') {
      for (const statement of callback.body) {
        if (statement.type === 'ReturnStatement') {
          return statement.argument;
        }
      }
    } else {
      return callback;
    }
  }
  return undefined;
};

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
    const value = typeof node.extra?.raw === 'string' ? node.extra.raw : node.value;
    return createMitosisNode({
      properties: {
        _text: value,
      },
    });
  }

  if (types.isJSXEmptyExpression(node)) {
    return null;
  }

  if (types.isJSXExpressionContainer(node)) {
    return jsxElementToJson(node.expression as any);
  }

  if (
    (types.isCallExpression(node) || types.isOptionalCallExpression(node)) &&
    (node.callee.type === 'MemberExpression' || node.callee.type === 'OptionalMemberExpression')
  ) {
    const isMap = node.callee.property.type === 'Identifier' && node.callee.property.name === 'map';
    const isArrayFrom =
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'from' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.object.name === 'Array';
    if (isMap) {
      const callback = node.arguments[0];
      const bodyExpression = getBodyExpression(callback);
      if (bodyExpression) {
        const forArguments = getForArguments(
          (callback as babel.types.ArrowFunctionExpression | babel.types.FunctionExpression).params,
        );
        return createMitosisNode({
          name: 'For',
          bindings: {
            each: createSingleBinding({
              code: generate(node.callee.object, {
                compact: true,
              }).code,
            }),
          },
          scope: forArguments,
          children: [jsxElementToJson(bodyExpression)!].filter(checkIsDefined),
        });
      }
    } else if (isArrayFrom) {
      // Array.from
      const each = node.arguments[0];
      const callback = node.arguments[1];
      const bodyExpression = getBodyExpression(callback);
      if (bodyExpression) {
        const forArguments = getForArguments(
          (callback as babel.types.ArrowFunctionExpression | babel.types.FunctionExpression).params,
        );

        return createMitosisNode({
          name: 'For',
          bindings: {
            each: createSingleBinding({
              code: generate(
                {
                  ...node,
                  arguments: [each],
                },
                {
                  compact: true,
                },
              ).code,
            }),
          },
          scope: forArguments,
          children: [jsxElementToJson(bodyExpression)!],
        });
      }
    }
  } else if (types.isLogicalExpression(node)) {
    // {foo && <div />} -> <Show when={foo}>...</Show>
    if (node.operator === '&&') {
      return createMitosisNode({
        name: 'Show',
        bindings: {
          when: createSingleBinding({
            code: generate(node.left, {
              compact: true,
            }).code!,
          }),
        },
        children: [jsxElementToJson(node.right as any)!].filter(checkIsDefined),
      });
    } else {
      // TODO: good warning system for unsupported operators
    }
  } else if (types.isConditionalExpression(node)) {
    // {foo ? <div /> : <span />} -> <Show when={foo} else={<span />}>...</Show>
    const child = jsxElementToJson(node.consequent as any);
    const elseCase = jsxElementToJson(node.alternate as any);

    return createMitosisNode({
      name: 'Show',
      meta: {
        ...(checkIsDefined(elseCase) ? { else: elseCase } : undefined),
      },
      bindings: {
        when: createSingleBinding({ code: generate(node.test, { compact: true }).code }),
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
        _text: createSingleBinding({ code: generate(node, { compact: true }).code }),
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
        ? generate(whenAttr.value.expression, { compact: true }).code
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
            return generate(attr.value.expression, { compact: true }).code;
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

  const { bindings, properties, slots, blocksSlots } = node.openingElement.attributes.reduce<{
    bindings: MitosisNode['bindings'];
    properties: MitosisNode['properties'];
    slots: {} & MitosisNode['slots'];
    blocksSlots: {} & MitosisNode['blocksSlots'];
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
        } else if (key.startsWith('on') && types.isArrowFunctionExpression(expression)) {
          // <Foo myProp={() => {}} />
          const args = expression.params.map((node) => (node as babel.types.Identifier)?.name);

          memo.bindings[key] = createSingleBinding({
            code: generate(expression.body, { compact: true }).code,
            async: expression.async === true ? true : undefined,
            arguments: args.length ? args : undefined,
            bindingType: 'function',
          });
        } else if (types.isJSXElement(expression) || types.isJSXFragment(expression)) {
          // <Foo myProp={<MoreMitosisNode><div /></MoreMitosisNode>} />
          // <Foo myProp={<><Node /><Node /></>} />
          const slotNode = jsxElementToJson(expression);
          if (!slotNode) return memo;

          memo.slots[key] = [slotNode];

          // Temporarily keep the slot as a binding until we migrate generators to use the slots.
          memo.bindings[key] = createSingleBinding({
            code: generate(expression, { compact: true }).code,
          });
        } else if (types.isArrayExpression(expression) || types.isObjectExpression(expression)) {
          /**
           * Find any deeply nested JSX Elements, convert them to Mitosis nodes
           * then store them in "replacements" to later do a string substitution
           * to swap out the stringified JSX with stringified Mitosis nodes.
           *
           * Object expressions need to wrapped in an expression statement (e.g. `({... })`)
           * otherwise Babel generate will fail.
           */
          const code = types.isObjectExpression(expression)
            ? generate(types.expressionStatement(expression)).code
            : generate(expression).code;
          const replacements: { start: number; end: number; node: MitosisNode }[] = [];

          babelDefaultTransform(code, {
            JSXElement(path) {
              const { start, end } = path.node;
              if (start == null || end == null) {
                return;
              }
              const node = jsxElementToJson(path.node);
              if (!node) return;

              /**
               * Perform replacements in the reverse order in which we saw them
               * otherwise start/end indices will quickly become incorrect.
               */
              replacements.unshift({
                start,
                end,
                node,
              });

              /**
               * babelTransform will keep iterating into deeper nodes. However,
               * the "jsxElementToJson" call above will handle deeper nodes.
               * Replace the path will null so we do not accidentally process
               * child nodes multiple times.
               */
              path.replaceWith(types.nullLiteral());
            },
          });

          // Replace stringified JSX (e.g. <Foo></Foo>) with stringified Mitosis JSON
          let replacedCode = code;
          replacements.forEach(({ start, end, node }) => {
            replacedCode =
              replacedCode.substring(0, start) + JSON.stringify(node) + replacedCode.substring(end);
          });

          /**
           * The result should be a valid array of objects. Use json5 to parse
           * as not every key will be wrapped in quotes, so a normal JSON.parse
           * will fail.
           */
          let finalCode = replacedCode;
          if (types.isObjectExpression(expression)) {
            /**
             * Remove the ( and ); surrounding the expression because we just want
             * a valid JS object instead.
             */
            const match = replacedCode.match(/\(([\s\S]*?)\);/);
            if (match) {
              finalCode = match[1];
            }
          }

          memo.blocksSlots[key] = json5.parse(finalCode);
        } else {
          memo.bindings[key] = createSingleBinding({
            code: generate(expression, { compact: true }).code,
          });
        }

        return memo;
      } else if (types.isJSXSpreadAttribute(item)) {
        // TODO: potentially like Vue store bindings and properties as array of key value pairs
        // too so can do this accurately when order matters. Also tempting to not support spread,
        // as some frameworks do not support it (e.g. Angular) tho Angular may be the only one

        const { code: key } = generate(item.argument, { compact: true });

        memo.bindings[key] = {
          code: types.stringLiteral(generate(item.argument, { compact: true }).code).value,
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
      blocksSlots: {},
    },
  );

  return createMitosisNode({
    name: nodeName,
    properties,
    bindings,
    children: node.children.map(jsxElementToJson).filter(checkIsDefined),
    slots: Object.keys(slots).length > 0 ? slots : undefined,
    blocksSlots,
  });
};
