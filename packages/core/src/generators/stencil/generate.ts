import { format } from 'prettier/standalone';
import { SELF_CLOSING_HTML_TAGS } from '../../constants/html_tags';
import { dashCase } from '../../helpers/dash-case';
import { dedent } from '../../helpers/dedent';
import { fastClone } from '../../helpers/fast-clone';
import { filterEmptyTextNodes } from '../../helpers/filter-empty-text-nodes';
import { getProps } from '../../helpers/get-props';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { indent } from '../../helpers/indent';
import { mapRefs } from '../../helpers/map-refs';
import { initializeOptions } from '../../helpers/merge-options';
import { getForArguments } from '../../helpers/nodes/for';
import { renderPreComponent } from '../../helpers/render-imports';
import { stripMetaProperties } from '../../helpers/strip-meta-properties';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { collectCss } from '../../helpers/styles/collect-css';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { MitosisNode, checkIsForNode } from '../../types/mitosis-node';
import { BaseTranspilerOptions, TranspilerGenerator } from '../../types/transpiler';
import { collectClassString } from './collect-class-string';

export interface ToStencilOptions extends BaseTranspilerOptions {}

const blockToStencil = (json: MitosisNode, options: ToStencilOptions = {}): string => {
  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text?.code) {
    return `{${processBinding(json.bindings?._text.code as string)}}`;
  }

  if (checkIsForNode(json)) {
    const wrap = json.children.length !== 1;
    const forArgs = getForArguments(json).join(', ');
    return `{${processBinding(json.bindings.each?.code as string)}?.map((${forArgs}) => (
      ${wrap ? '<>' : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToStencil(item, options))
      .join('')}${wrap ? '</>' : ''}
    ))}`;
  } else if (json.name === 'Show') {
    const wrap = json.children.length !== 1;
    return `{${processBinding(json.bindings.when?.code as string)} ? (
      ${wrap ? '<>' : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToStencil(item, options))
      .join('')}${wrap ? '</>' : ''}
    ) : ${!json.meta.else ? 'null' : blockToStencil(json.meta.else as any, options)}}`;
  }

  let str = '';

  str += `<${json.name} `;

  const classString = collectClassString(json);
  if (classString) {
    str += ` class=${classString} `;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const { code, arguments: cusArgs = ['event'], type } = json.bindings[key]!;

    if (type === 'spread') {
      str += ` {...(${code})} `;
    } else if (key === 'ref') {
      str += ` ref={(el) => this.${code} = el} `;
    } else if (key.startsWith('on')) {
      const useKey = key === 'onChange' && json.name === 'input' ? 'onInput' : key;
      str += ` ${useKey}={${cusArgs.join(',')} => ${processBinding(code as string)}} `;
    } else {
      str += ` ${key}={${processBinding(code as string)}} `;
    }
  }
  if (SELF_CLOSING_HTML_TAGS.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children.map((item) => blockToStencil(item, options)).join('');
  }

  str += `</${json.name}>`;

  return str;
};

function processBinding(code: string) {
  return stripStateAndPropsRefs(code, { replaceWith: 'this.' });
}

export const componentToStencil: TranspilerGenerator<ToStencilOptions> =
  (_options = {}) =>
  ({ component }) => {
    const options = initializeOptions({ target: 'stencil', component, defaults: _options });
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    const props = getProps(component);
    let css = collectCss(json);

    mapRefs(component, (refName) => `this.${refName}`);

    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    stripMetaProperties(json);

    const dataString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: true,
      functions: false,
      getters: false,
      keyPrefix: '@State() ',
      valueMapper: (code) => processBinding(code),
    });

    const methodsString = getStateObjectStringFromComponent(json, {
      format: 'class',
      data: false,
      functions: true,
      getters: true,
      valueMapper: (code) => processBinding(code),
    });

    const wrap = json.children.length !== 1;

    if (options.prettier !== false) {
      try {
        css = format(css, {
          parser: 'css',
          plugins: [require('prettier/parser-postcss')],
        });
      } catch (err) {
        console.warn('Could not format css', err);
      }
    }

    let str = dedent`
    ${renderPreComponent({ component: json, target: 'stencil' })}

    import { Component, Prop, h, State, Fragment } from '@stencil/core';

    @Component({
      tag: '${
        /**
         * You can set the tagName in your Mitosis component as
         *
         *    useMetadata({
         *      tagName: 'my-tag
         *    })
         *
         *    export default function ...
         */
        json.meta.useMetadata?.tagName || dashCase(json.name)
      }',
      ${
        css.length
          ? `styles: \`
        ${indent(css, 8)}\`,`
          : ''
      }
    })
    export default class ${json.name} {
    
      ${Array.from(props)
        .map((item) => `@Prop() ${item}: any`)
        .join('\n')}

        ${dataString}
        ${methodsString}
      
        ${
          !json.hooks.onMount?.code
            ? ''
            : `componentDidLoad() { ${processBinding(json.hooks.onMount.code)} }`
        }
        ${
          !json.hooks.onUnMount?.code
            ? ''
            : `disconnectedCallback() { ${processBinding(json.hooks.onUnMount.code)} }`
        }
        ${
          !json.hooks.onUpdate?.length
            ? ''
            : json.hooks.onUpdate.map(
                (hook) => `componentDidUpdate() { ${processBinding(hook.code)} }`,
              )
        }
    
      render() {
        return (${wrap ? '<>' : ''}
        
          ${json.children.map((item) => blockToStencil(item, options)).join('')}

        ${wrap ? '</>' : ''})
      }
    }
  `;

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }
    if (options.prettier !== false) {
      str = format(str, {
        parser: 'typescript',
        plugins: [require('prettier/parser-typescript')],
      });
    }
    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
    }
    return str;
  };
