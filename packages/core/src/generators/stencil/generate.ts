import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { getRefs } from '../../helpers/get-refs';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { renderPreComponent } from '../../helpers/render-imports';
import { selfClosingTags } from '../../parsers/jsx';
import { MitosisComponent } from '../../types/mitosis-component';
import { MitosisNode } from '../../types/mitosis-node';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { fastClone } from '../../helpers/fast-clone';
import { stripMetaProperties } from '../../helpers/strip-meta-properties';
import { BaseTranspilerOptions, Transpiler } from '../../types/config';
import { collectClassString } from './collect-class-string';
import { getProps } from '../../helpers/get-props';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { filterEmptyTextNodes } from '../../helpers/filter-empty-text-nodes';
import { dashCase } from '../../helpers/dash-case';
import { collectCss } from '../../helpers/collect-styles';
import { indent } from '../../helpers/indent';
import { mapRefs } from '../../helpers/map-refs';

export interface ToStencilOptions extends BaseTranspilerOptions {}

const blockToStencil = (
  json: MitosisNode,
  options: ToStencilOptions = {},
): string => {
  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text) {
    return `{${processBinding(json.bindings._text)}}`;
  }

  if (json.name === 'For') {
    const wrap = json.children.length !== 1;
    return `{${processBinding(json.bindings.each as string)}?.map((${
      json.properties._forName
    }, index) => (
      ${wrap ? '<>' : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToStencil(item, options))
      .join('\n')}${wrap ? '</>' : ''}
    ))}`;
  } else if (json.name === 'Show') {
    const wrap = json.children.length !== 1;
    return `{${processBinding(json.bindings.when as string)} ? (
      ${wrap ? '<>' : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToStencil(item, options))
      .join('\n')}${wrap ? '</>' : ''}
    ) : ${
      !json.meta.else ? 'null' : blockToStencil(json.meta.else as any, options)
    }}`;
  }

  let str = '';

  str += `<${json.name} `;

  const classString = collectClassString(json);
  if (classString) {
    str += ` class=${classString} `;
  }

  if (json.bindings._spread) {
    str += ` {...(${json.bindings._spread})} `;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const value = json.bindings[key] as string;
    if (key === '_spread' || key === '_forName') {
      continue;
    }

    if (key === 'ref') {
      str += ` ref={(el) => this.${value} = el} `;
    } else if (key.startsWith('on')) {
      const useKey =
        key === 'onChange' && json.name === 'input' ? 'onInput' : key;
      str += ` ${useKey}={event => ${processBinding(value)}} `;
    } else {
      str += ` ${key}={${processBinding(value)}} `;
    }
  }
  if (selfClosingTags.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children
      .map((item) => blockToStencil(item, options))
      .join('\n');
  }

  str += `</${json.name}>`;

  return str;
};

const getRefsString = (json: MitosisComponent, refs = getRefs(json)) => {
  let str = '';

  for (const ref of Array.from(refs)) {
    str += `\nconst ${ref} = useRef();`;
  }

  return str;
};

function processBinding(code: string) {
  return stripStateAndPropsRefs(code, { replaceWith: 'this.' });
}

export const componentToStencil =
  (options: ToStencilOptions = {}): Transpiler =>
  ({ component }) => {
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    const props = getProps(component);
    let css = collectCss(json, { classProperty: 'class' });

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
    ${renderPreComponent(json)}

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
            : `componentDidLoad() { ${processBinding(
                json.hooks.onMount.code,
              )} }`
        }
        ${
          !json.hooks.onUnMount?.code
            ? ''
            : `disconnectedCallback() { ${processBinding(
                json.hooks.onUnMount.code,
              )} }`
        }
        ${
          !json.hooks.onUpdate?.length
            ? ''
            : json.hooks.onUpdate.map(
                (hook) =>
                  `componentDidUpdate() { ${processBinding(hook.code)} }`,
              )
        }
    
      render() {
        return (${wrap ? '<>' : ''}
        
          ${json.children
            .map((item) => blockToStencil(item, options))
            .join('\n')}

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
