import { generate } from 'astring';
import { upperFirst } from 'lodash';
import { createMitosisNode } from '../helpers/mitosis-node';
import { filterChildren, parseChildren } from '../helpers/children';
import { insertAt, uniqueName } from '../helpers/string';
import { parseAction } from './actions';

import type { TemplateNode, Element, Text, MustacheTag } from 'svelte/types/compiler/interfaces';
import type { Identifier, ArrowFunctionExpression, BaseCallExpression, Node } from 'estree';

interface AttributeShorthand {
  type: 'AttributeShorthand';
  expression: Identifier;
}

const SPECIAL_ELEMENTS = new Set(['svelte:component', 'svelte:element']);

export function parseElement(json: SveltosisComponent, node: TemplateNode) {
  const mitosisNode = createMitosisNode();
  mitosisNode.name = node.name;

  const useReference = () => {
    const nodeReference = uniqueName(Object.keys(json.refs), node.name);
    if (!Object.keys(json.refs).includes(nodeReference)) {
      json.refs[nodeReference] = { argument: '', typeParameter: '' };

      mitosisNode.bindings.ref = {
        code: nodeReference,
      };
    }

    return nodeReference;
  };

  /* 
    Parse special elements such as svelte:component and svelte:element
  */
  if (SPECIAL_ELEMENTS.has(node.name)) {
    const expression = generate(node.expression || node.tag);

    let prefix = 'state';

    if (json.props[expression]) {
      prefix = 'props';
    }

    mitosisNode.name = `${prefix}.${expression}`;
  }

  if (node.attributes?.length) {
    for (const attribute of node.attributes as Element['attributes']) {
      switch (attribute.type) {
        case 'Attribute': {
          switch (attribute.value[0]?.type) {
            case 'Text': {
              const value: Text = attribute.value[0];
              // if there are already conditional class declarations
              // add class names defined here to the bindings code as well
              if (attribute.name === 'class' && mitosisNode.bindings.class?.code?.length) {
                mitosisNode.bindings.class.code = insertAt(
                  mitosisNode.bindings.class.code,
                  ` ${value.data} `,
                  1,
                );
              } else {
                mitosisNode.properties[attribute.name] = value.data;
              }

              break;
            }
            case 'MustacheTag': {
              const value: MustacheTag = attribute.value[0];
              const expression = value.expression as Identifier;
              let code = generate(expression);

              if (attribute.name === 'class') {
                code = mitosisNode.bindings.class?.code?.length
                  ? insertAt(
                      mitosisNode.bindings.class.code,
                      ' ${' + code + '}',
                      mitosisNode.bindings.class.code.length - 1,
                    )
                  : '`${' + code + '}`';
              }

              mitosisNode.bindings[attribute.name] = {
                code,
              };

              break;
            }
            case 'AttributeShorthand': {
              // e.g. <input {value}/>
              const value: AttributeShorthand = attribute.value[0];
              const code = value.expression.name;
              mitosisNode.bindings[code] = {
                code,
              };

              break;
            }
            default: {
              const name = attribute.name;
              mitosisNode.bindings[name] = { code: attribute.value.toString() };
            }
          }

          break;
        }
        case 'Spread': {
          const expression = attribute.expression as Identifier;
          mitosisNode.bindings[expression.name] = {
            code: expression.name,
            type: 'spread',
          };

          break;
        }
        case 'EventHandler': {
          let object: { code: string; arguments: string[] } = { code: '', arguments: [] };

          if (attribute.expression?.type === 'ArrowTypeFunction') {
            const expression = attribute.expression as ArrowFunctionExpression;

            object = {
              code: generate(expression.body),
              arguments: (expression.body as BaseCallExpression)?.arguments?.map(
                (a) => (a as Identifier).name,
              ),
            };
          } else if (attribute.expression) {
            let code = generate(attribute.expression);

            if (
              !attribute.expression.arguments?.length &&
              !attribute.expression.body?.arguments?.length
            ) {
              code = code.replace(/\(\)/g, '(event)');
            }

            object = {
              code,
              arguments: ['event'],
            };
          } else {
            object = {
              code: `props.on${upperFirst(attribute.name)}(event)`,
              arguments: ['event'],
            };
          }

          mitosisNode.bindings[`on${upperFirst(attribute.name)}`] = object;

          // add event handlers as props (e.g. props.onClick)
          json.props = {
            ...json.props,
            [`on${upperFirst(attribute.name)}`]: { default: () => ({}) },
          };

          break;
        }
        case 'Binding': {
          /* 
            adding onChange handlers for bind:group and bind:property is done during post processing 
            same goes for replacing the group binding with checked
            see helpers/post-process.ts
          */

          const expression = attribute.expression as Identifier;
          const binding = expression.name;

          let name = attribute.name;

          // template ref
          if (attribute.name === 'this') {
            name = 'ref';
            json.refs[binding] = {
              argument: 'null',
              typeParameter: 'any',
            };
            if (Object.prototype.hasOwnProperty.call(json.state, binding)) {
              delete json.state[binding];
            }
          }

          if (name !== 'ref' && name !== 'group' && name !== 'this') {
            const onChangeCode = `${binding} = event.target.value`;
            mitosisNode.bindings['onChange'] = {
              code: onChangeCode,
              arguments: ['event'],
            };
          }

          mitosisNode.bindings[name] = {
            code: binding,
          };

          break;
        }
        case 'Class': {
          const expression = attribute.expression as Node;

          // conditional classes (e.g. class:disabled or class:disabled={disabled})
          const binding = `${generate(expression)} ? '${attribute.name}'  : ''`;

          let code = '';

          // if there are existing class declarations
          // add them here instead and remove them from properties
          // to avoid duplicate class declarations in certain frameworks
          if (mitosisNode.properties?.class?.length) {
            code = `${mitosisNode.properties.class} `;
            delete mitosisNode.properties.class;
          }

          // if class code is already defined (meaning there is more than 1 conditional class declaration)
          // append it to the string instead of assigning it
          if (
            mitosisNode.bindings.class &&
            Object.prototype.hasOwnProperty.call(mitosisNode.bindings.class, 'code') &&
            mitosisNode.bindings.class?.code.length
          ) {
            code = insertAt(
              mitosisNode.bindings.class.code,
              ' ${' + binding + '}',
              mitosisNode.bindings.class.code.length - 1,
            );
            mitosisNode.bindings.class = {
              code,
            };
          } else {
            // otherwise just assign
            code = '`' + code + '${' + binding + '}`';
            mitosisNode.bindings.class = {
              code,
            };
          }
          break;
        }
        case 'Action': {
          parseAction(json, useReference(), attribute);
          break;
        }
        // No default
      }
    }
  }

  let filteredChildren: TemplateNode[] = [];

  if (node.children) {
    filteredChildren = filterChildren(node.children);
  }

  if (filteredChildren.length === 1 && filteredChildren[0].type === 'RawMustacheTag') {
    const child = filteredChildren[0] as MustacheTag;

    mitosisNode.children = [];
    mitosisNode.bindings.innerHTML = {
      code: generate(child.expression),
    };
  } else {
    mitosisNode.children = parseChildren(json, node);
  }

  return mitosisNode;
}
