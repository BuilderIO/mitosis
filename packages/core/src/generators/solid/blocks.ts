import { babelTransformExpression } from '@/helpers/babel-transform';
import { filterEmptyTextNodes } from '@/helpers/filter-empty-text-nodes';
import { MitosisComponent } from '@/types/mitosis-component';
import { checkIsForNode, MitosisNode } from '@/types/mitosis-node';
import { types } from '@babel/core';
import { kebabCase } from 'lodash';
import { SELF_CLOSING_HTML_TAGS } from '../../constants/html_tags';
import { collectClassString } from './helpers/styles';
import { ToSolidOptions } from './types';

export const blockToSolid = ({
  json,
  options,
  component,
}: {
  json: MitosisNode;
  options: ToSolidOptions;
  component: MitosisComponent;
}): string => {
  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text?.code) {
    return `{${json.bindings._text.code}}`;
  }

  if (checkIsForNode(json)) {
    const needsWrapper = json.children.length !== 1;
    // The SolidJS `<For>` component has a special index() signal function.
    // https://www.solidjs.com/docs/latest#%3Cfor%3E
    return `<For each={${json.bindings.each?.code}}>
    {(${json.scope.forName}, _index) => {
      const ${json.scope.indexName || 'index'} = _index();
      return ${needsWrapper ? '<>' : ''}${json.children
        .filter(filterEmptyTextNodes)
        .map((child) => blockToSolid({ component, json: child, options }))}}}
      ${needsWrapper ? '</>' : ''}
    </For>`;
  }

  let str = '';

  if (json.name === 'Fragment') {
    str += '<';
  } else {
    str += `<${json.name} `;
  }

  if (json.name === 'Show' && json.meta.else) {
    str += `fallback={${blockToSolid({ component, json: json.meta.else as any, options })}}`;
  }

  const classString = collectClassString(json, options);
  if (classString) {
    str += ` class=${classString} `;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const { code, arguments: cusArg = ['event'], type } = json.bindings[key]!;
    if (!code) continue;

    if (type === 'spread') {
      str += ` {...(${code})} `;
    } else if (key.startsWith('on')) {
      const useKey = key === 'onChange' && json.name === 'input' ? 'onInput' : key;
      str += ` ${useKey}={(${cusArg.join(',')}) => ${code}} `;
    } else if (key === 'ref' && options.typescript) {
      str += ` ${key}={${code}!} `;
    } else {
      let useValue = code;
      if (key === 'style') {
        // Convert camelCase keys to kebab-case
        // TODO: support more than top level objects, may need
        // a runtime helper for expressions that are not a direct
        // object literal, such as ternaries and other expression
        // types
        useValue = babelTransformExpression(code, {
          ObjectExpression(path: babel.NodePath<babel.types.ObjectExpression>) {
            // TODO: limit to top level objects only
            for (const property of path.node.properties) {
              if (types.isObjectProperty(property)) {
                if (types.isIdentifier(property.key) || types.isStringLiteral(property.key)) {
                  const key = types.isIdentifier(property.key)
                    ? property.key.name
                    : property.key.value;
                  property.key = types.stringLiteral(kebabCase(key));
                }
              }
            }
          },
        });
      }
      str += ` ${key}={${useValue}} `;
    }
  }
  if (SELF_CLOSING_HTML_TAGS.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToSolid({ component, json: item, options }))
      .join('\n');
  }

  if (json.name === 'Fragment') {
    str += '</>';
  } else {
    str += `</${json.name}>`;
  }

  return str;
};
