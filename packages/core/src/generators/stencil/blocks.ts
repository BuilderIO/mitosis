import { SELF_CLOSING_HTML_TAGS } from '@/constants/html_tags';
import { getTagName, isEvent } from '@/generators/stencil/helpers';
import { collectClassString } from '@/generators/stencil/helpers/collect-class-string';
import { ToStencilOptions } from '@/generators/stencil/types';
import { filterEmptyTextNodes } from '@/helpers/filter-empty-text-nodes';
import { getForArguments } from '@/helpers/nodes/for';
import { transformAttributeToJSX } from '@/parsers/jsx/helpers';
import { MitosisNode, checkIsForNode } from '@/types/mitosis-node';

export const blockToStencil = ({
  json,
  options = {},
  insideJsx,
  rootRef,
  childComponents,
}: {
  json: MitosisNode;
  options: ToStencilOptions;
  insideJsx?: boolean;
  rootRef?: string;
  childComponents: string[];
}): string => {
  let blockName = childComponents.find((impName) => impName === json.name)
    ? getTagName(json.name, options)
    : json.name;

  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text?.code) {
    if (json.bindings._text?.code === 'this.children') {
      // Replace this.children with default <slot>
      return '<slot></slot>';
    }

    let code = json.bindings._text.code;

    if (insideJsx) {
      return `{${code}}`;
    }
    return code;
  }

  if (checkIsForNode(json) && json.bindings.each?.code) {
    const wrap = json.children.length !== 1;
    const forArgs = getForArguments(json).join(', ');

    const expression = `${json.bindings.each?.code}?.map((${forArgs}) => (
      ${wrap ? '<Fragment>' : ''}
      ${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToStencil({ json: item, options, insideJsx: wrap, childComponents }))
        .join('\n')}
      ${wrap ? '</Fragment>' : ''}
    ))`;
    if (insideJsx) {
      return `{${expression}}`;
    } else {
      return expression;
    }
  } else if (blockName === 'Show' && json.bindings.when?.code) {
    const wrap = json.children.length !== 1;
    const expression = `${json.bindings.when?.code} ? (
      ${wrap ? '<Fragment>' : ''}
      ${json.children
        .filter(filterEmptyTextNodes)
        .map((item) => blockToStencil({ json: item, options, insideJsx: wrap, childComponents }))
        .join('\n')}
      ${wrap ? '</Fragment>' : ''}
    ) : ${
      !json.meta.else
        ? 'null'
        : `(${blockToStencil({
            json: json.meta.else as any,
            options,
            childComponents,
          })})`
    }`;

    if (insideJsx) {
      return `{${expression}}`;
    } else {
      return expression;
    }
  } else if (blockName === 'Slot') {
    blockName = 'slot';
  }

  let str = '';

  str += `<${blockName} `;

  const classString = collectClassString(json);
  if (classString) {
    str += ` class=${classString} `;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    // Stencil uses ´htmlFor´ (JSX) instead of ´for´ (HTML)
    str += ` ${transformAttributeToJSX(key)}="${value}" `;
  }
  for (const key in json.bindings) {
    const { code, arguments: cusArgs = [], type } = json.bindings[key]!;
    if (type === 'spread') {
      str += ` {...(${code})} `;
    } else if (key === 'ref') {
      str += ` ref={(el:any) => {
        ${rootRef ? `this.${rootRef} = el` : ''}
        ${code.startsWith('this.') ? code : `this.${code}`} = el}
      } `;
    } else if (isEvent(key)) {
      const asyncKeyword = json.bindings[key]?.async ? 'async ' : '';
      str += ` ${key}={${asyncKeyword}(${cusArgs.join(',')}) => ${code}} `;
    } else {
      str += ` ${key}={${code}} `;
    }
  }
  if (SELF_CLOSING_HTML_TAGS.has(blockName)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children
      .map((item) =>
        blockToStencil({
          json: item,
          options,
          insideJsx: true,
          childComponents,
        }),
      )
      .join('\n');
  }

  str += `</${blockName}>`;

  return str;
};
